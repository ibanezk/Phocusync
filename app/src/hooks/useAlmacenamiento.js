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
  const [almacenamientoUsado, setAlmacenamientoUsado] = useState(0); // Espacio consumido acumulado (en Gigabytes)
  const [almacenamientoMaximo, setAlmacenamientoMaximo] = useState(1.0); // Límite del plan asignado (en Gigabytes)
  const [planActual, setPlanActual] = useState("Standard"); // Etiqueta comercial del plan activo
  const [cargando, setCargando] = useState(true); // Bloqueo de UI mientras se resuelven las consultas

  useEffect(() => {
    async function obtenerDatosAlmacenamiento() {
      try {
        setCargando(true);

        // 1. OBTENCIÓN DEL USUARIO AUTENTICADO
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // 2. CONSULTA DEL PLAN COMERCIAL
        // Busca el perfil del fotógrafo para identificar su nivel de suscripción
        const { data: fotografo, error: errorFotografo } = await supabase
          .from("fotografos")
          .select("plan")
          .eq("id", user.id)
          .maybeSingle(); // Evita lanzar excepciones si no se encuentra una fila exacta

        if (errorFotografo) {
          console.error("Error al traer el plan de fotografos:", errorFotografo);
        }

        // Diccionario estricto de configuración de cuotas del SaaS
        const configPlanes = {
          standard: { nombre: "Standard", max: 1.0 },
          pro_studio: { nombre: "Pro Studio", max: 50.0 },
          agency: { nombre: "Agency", max: 50.0 },
        };

        // Normalización de la cadena de texto para prevenir fallos por mayúsculas/minúsculas
        const planKey = fotografo?.plan?.toLowerCase() || "standard";
        const config = configPlanes[planKey] || configPlanes.standard;

        setPlanActual(config.nombre);
        setAlmacenamientoMaximo(config.max);

        // 3. RECUPERACIÓN DE PROYECTOS ASOCIADOS
        // Extrae los IDs de todos los proyectos creados por este fotógrafo
        const { data: proyectos, error: errorProyectos } = await supabase
          .from("proyectos")
          .select("id")
          .eq("fotografo_id", user.id);

        if (errorProyectos) throw errorProyectos;

        // Si el usuario no tiene proyectos, su consumo es automáticamente cero
        if (!proyectos || proyectos.length === 0) {
          setAlmacenamientoUsado(0);
          return;
        }

        const proyectosIds = proyectos.map((p) => p.id);

        // 4. CÁLCULO MÁSICO DE TAMAÑO DE IMÁGENES
        // Consulta los bytes de todas las fotos vinculadas a la lista de proyectos mediante el operador IN
        const { data: fotos, error: errorFotos } = await supabase
          .from("fotos")
          .select("size")
          .in("proyecto_id", proyectosIds);

        if (errorFotos) throw errorFotos;

        // Sumatoria de bytes y conversión matemática a Gigabytes
        if (fotos && fotos.length > 0) {
          const totalBytes = fotos.reduce((acc, foto) => acc + (foto.size || 0), 0);
          const totalGB = totalBytes / 1024 ** 3; // Conversión directa a base 1024 (Bytes -> KB -> MB -> GB)
          setAlmacenamientoUsado(Number(totalGB.toFixed(2))); // Redondeo a dos decimales flotantes
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

  // Exposición de métricas listas para componentes de analíticas o barras de progreso
  return { almacenamientoUsado, almacenamientoMaximo, planActual, cargando };
}
