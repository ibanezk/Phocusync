/* ========================================================================= */
/* Proyecto: PhocuSync SaaS Portal                                           */
/* Hook: useAlmacenamiento.js                                                */
/* Descripción: Gestiona las métricas de consumo de disco del fotógrafo.      */
/*              Calcula el espacio usado en GB en función del tamaño de las   */
/*              fotos y valida los límites comerciales según el plan.        */
/* ========================================================================= */

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function useAlmacenamiento() {
  // --- ESTADOS DE CONSUMO Y PLAN ---
  const [almacenamientoUsado, setAlmacenamientoUsado] = useState(0); // Espacio consumido en GB
  const [almacenamientoMaximo, setAlmacenamientoMaximo] = useState(1.0); // Límite del plan en GB
  const [planActual, setPlanActual] = useState("Standard"); // Nombre del plan activo
  const [cargando, setCargando] = useState(true); // Estado de carga para la interfaz

  useEffect(() => {
    async function obtenerDatosAlmacenamiento() {
      try {
        setCargando(true);

        // 1. OBTENCIÓN DEL USUARIO AUTENTICADO
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // 2. CONSULTA DEL PLAN COMERCIAL Y LÍMITE DE ALMACENAMIENTO (Única consulta)
        const { data: fotografo, error: errorFotografo } = await supabase
          .from("fotografos")
          .select("plan, storage_limit")
          .eq("id", user.id)
          .maybeSingle();

        if (errorFotografo) {
          console.error("Error al traer el plan de fotografos:", errorFotografo);
        }

        const nombresPlanes = {
          standard: "Standard",
          pro: "Pro Studio",
          pro_studio: "Pro Studio",
          agency: "Agency",
        };

        const planKey = fotografo?.plan?.toLowerCase() || "standard";
        const nombrePlan = nombresPlanes[planKey] || "Standard";

        // Conversión de Bytes de la BD a GB (1 GB = 1024^3 bytes)
        const bytesEnUnGB = 1024 * 1024 * 1024;
        const limiteEnGB = fotografo?.storage_limit ? fotografo.storage_limit / bytesEnUnGB : 1.0;

        setPlanActual(nombrePlan);
        setAlmacenamientoMaximo(limiteEnGB);

        // 3. RECUPERACIÓN DE PROYECTOS ASOCIADOS
        const { data: proyectos, error: errorProyectos } = await supabase
          .from("proyectos")
          .select("id")
          .eq("fotografo_id", user.id);

        if (errorProyectos) throw errorProyectos;

        // Si el usuario no tiene proyectos, su consumo es 0
        if (!proyectos || proyectos.length === 0) {
          setAlmacenamientoUsado(0);
          return;
        }

        const proyectosIds = proyectos.map((p) => p.id);

        // 4. CÁLCULO DE TAMAÑO DE IMÁGENES
        const { data: fotos, error: errorFotos } = await supabase
          .from("fotos")
          .select("size")
          .in("proyecto_id", proyectosIds);

        if (errorFotos) throw errorFotos;

        // Sumatoria de bytes y conversión a Gigabytes
        if (fotos && fotos.length > 0) {
          const totalBytes = fotos.reduce((acc, foto) => acc + (foto.size || 0), 0);
          const totalGB = totalBytes / bytesEnUnGB;
          setAlmacenamientoUsado(totalGB); // Guardamos el valor exacto en GB
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
