import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function useAlmacenamiento() {
  const [almacenamientoUsado, setAlmacenamientoUsado] = useState(0);
  const [almacenamientoMaximo, setAlmacenamientoMaximo] = useState(1.0);
  const [planActual, setPlanActual] = useState("Standard");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function obtenerDatosAlmacenamiento() {
      try {
        setCargando(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Consulta del Plan en 'fotografos'
        const { data: fotografo, error: errorFotografo } = await supabase
          .from("fotografos")
          .select("plan")
          .eq("id", user.id)
          .maybeSingle();

        if (errorFotografo) {
          console.error("Error al traer el plan de fotografos:", errorFotografo);
        }

        // Configuración con los nombres de marca reales
        const configPlanes = {
          standard: { nombre: "Standard", max: 1.0 }, // 🎯 Corregido aquí
          pro_studio: { nombre: "Pro Studio", max: 50.0 },
          agency: { nombre: "Agency", max: 50.0 },
        };

        const planKey = fotografo?.plan?.toLowerCase() || "standard";
        const config = configPlanes[planKey] || configPlanes.standard;

        setPlanActual(config.nombre);
        setAlmacenamientoMaximo(config.max);

        // Consulta de Proyectos
        const { data: proyectos, error: errorProyectos } = await supabase
          .from("proyectos")
          .select("id")
          .eq("fotografo_id", user.id);

        if (errorProyectos) throw errorProyectos;
        if (!proyectos || proyectos.length === 0) {
          setAlmacenamientoUsado(0);
          return;
        }

        const proyectosIds = proyectos.map((p) => p.id);

        // Consulta del Tamaño de las Fotos
        const { data: fotos, error: errorFotos } = await supabase
          .from("fotos")
          .select("size")
          .in("proyecto_id", proyectosIds);

        if (errorFotos) throw errorFotos;

        if (fotos && fotos.length > 0) {
          const totalBytes = fotos.reduce((acc, foto) => acc + (foto.size || 0), 0);
          const totalGB = totalBytes / 1024 ** 3;
          setAlmacenamientoUsado(Number(totalGB.toFixed(2)));
        } else {
          setAlmacenamientoUsado(0);
        }
      } catch (error) {
        console.error("Error en useAlmacenamiento:", error.message);
      } finally {
        setCargando(false);
      }
    }
    obtenerDatosAlmacenamiento();
  }, []);

  return { almacenamientoUsado, almacenamientoMaximo, planActual, cargando };
}
