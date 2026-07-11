/* ========================================================================= */
/* Proyecto: PhocuSync SaaS Portal                                           */
/* Hook: useGalerias.js                                                      */
/* Descripción: Estado global y lógica para el Dashboard del Fotógrafo.      */
/*              Orquesta consultas relacionales, agregación de métricas de   */
/*              almacenamiento y utilitarios de portapapeles.                */
/* ========================================================================= */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

export function useGalerias() {
  const [galerias, setGalerias] = useState([]);
  const [loading, setLoading] = useState(true);

  // ID transitorio para dar feedback visual efímero cuando se copia un enlace al portapapeles
  const [idCopiado, setIdCopiado] = useState(null);

  /**
   * Obtiene los proyectos del fotógrafo y calcula métricas en tiempo real.
   * Envuelto en useCallback para evitar recreación de firmas de función en cada render.
   */
  const fetchGalerias = useCallback(async () => {
    try {
      setLoading(true);

      // CONSULTA RELACIONAL OPTIMIZADA:
      // PostgreSQL une las tablas internamente y nos devuelve un JSON anidado limpio.
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("proyectos")
        .select(
          `
          id,
          nombre,
          estado,
          creado_en,
          fotos (id, seleccionada, comentario, size)
        `,
        )
        .eq("fotografo_id", user.id) // Filtrado por el fotógrafo dueño de la cuenta
        .order("creado_en", { ascending: false }); // Muestra siempre lo más reciente primero

      if (error) throw error;

      // PIPELINE DE PROCESAMIENTO Y ENRIQUECIMIENTO:
      // Transformamos la estructura de la base de datos a un modelo óptimo para UI del Dashboard.
      const galeriasProcesadas = (data || []).map((proyecto) => {
        const listaFotos = proyecto.fotos || [];

        // Sumatoria del peso total de la galería en bytes
        const totalPesoBytes = listaFotos.reduce((acc, f) => acc + (f.size || 0), 0);

        return {
          id: proyecto.id,
          nombre: proyecto.nombre,
          estado: proyecto.estado || "Borrador",
          totalFotos: listaFotos.length,
          // Métricas operativas que el fotógrafo necesita ver a primera vista:
          elegidasCount: listaFotos.filter((f) => f.seleccionada).length,
          notasCount: listaFotos.filter((f) => f.comentario).length,
          // Conversión matemática precisa de Bytes a Megabytes con 2 decimales
          pesoMB: (totalPesoBytes / (1024 * 1024)).toFixed(2),
          // Construcción dinámica del enlace de revisión del cliente según el dominio actual
          urlPublica: `${window.location.origin}/galeria/${proyecto.id}`,
        };
      });

      setGalerias(galeriasProcesadas);
    } catch (err) {
      console.error("Error al cargar el panel de galerías:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Copia la URL pública de la galería al portapapeles del sistema.
   * Maneja un estado de feedback de 2 segundos.
   */
  const copiarEnlace = async (id, url) => {
    try {
      await navigator.clipboard.writeText(url);
      setIdCopiado(id); // Almacena el ID activo para mutar el botón de esa tarjeta específica

      // Limpieza del estado (Debounce visual)
      setTimeout(() => setIdCopiado(null), 2000);
    } catch (err) {
      console.error("No se pudo copiar el enlace:", err);
    }
  };

  // DISPARADOR DE CARGA INICIAL (Efecto de montaje)
  useEffect(() => {
    fetchGalerias();
  }, [fetchGalerias]);

  // INTERFAZ PÚBLICA DEL HOOK
  return {
    galerias,
    loading,
    idCopiado,
    copiarEnlace,
    refrescar: fetchGalerias, // Alias semántico para llamados manuales desde la UI
  };
}
