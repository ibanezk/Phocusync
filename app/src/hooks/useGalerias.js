import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

export function useGalerias() {
  const [galerias, setGalerias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [idCopiado, setIdCopiado] = useState(null);

  const fetchGalerias = useCallback(async () => {
    try {
      setLoading(true);

      // Traemos los proyectos y sus fotos asociadas en una sola consulta relacional
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
        .order("creado_en", { ascending: false });

      if (error) throw error;

      // Procesamos y enriquecemos la data con métricas calculadas
      const galeriasProcesadas = (data || []).map((proyecto) => {
        const listaFotos = proyecto.fotos || [];
        const totalPesoBytes = listaFotos.reduce((acc, f) => acc + (f.size || 0), 0);

        return {
          id: proyecto.id,
          nombre: proyecto.nombre,
          estado: proyecto.estado || "Borrador",
          totalFotos: listaFotos.length,
          elegidasCount: listaFotos.filter((f) => f.seleccionada).length,
          notasCount: listaFotos.filter((f) => f.comentario).length,
          pesoMB: (totalPesoBytes / (1024 * 1024)).toFixed(2),
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

  const copiarEnlace = async (id, url) => {
    try {
      await navigator.clipboard.writeText(url);
      setIdCopiado(id);
      setTimeout(() => setIdCopiado(null), 2000);
    } catch (err) {
      console.error("No se pudo copiar el enlace:", err);
    }
  };

  useEffect(() => {
    fetchGalerias();
  }, [fetchGalerias]);

  return {
    galerias,
    loading,
    idCopiado,
    copiarEnlace,
    refrescar: fetchGalerias,
  };
}
