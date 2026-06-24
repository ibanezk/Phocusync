import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

export function useAjustesProyecto(proyectoId, proyectoData) {
  const [limiteSelecciones, setLimiteSelecciones] = useState(15);
  const [forzarMarcaAgua, setForzarMarcaAgua] = useState(true);
  const [guardandoAjustes, setGuardandoAjustes] = useState(false);

  const inicializadoRef = useRef(false);

  useEffect(() => {
    if (proyectoData?.id && !inicializadoRef.current) {
      setLimiteSelecciones(proyectoData.limite_selecciones ?? 15);
      setForzarMarcaAgua(proyectoData.forzar_marca_agua ?? false);

      inicializadoRef.current = true;
    }
  }, [proyectoData?.id]);

  // Función genérica para guardar cambios en tiempo real
  const actualizarAjuste = async (columna, valor) => {
    setGuardandoAjustes(true);
    try {
      const { error } = await supabase
        .from("proyectos")
        .update({ [columna]: valor })
        .eq("id", proyectoId);

      if (error) throw error;

      // Actualizamos el estado local optimistamente si la BD responde bien
      if (columna === "limite_selecciones") setLimiteSelecciones(valor);
      if (columna === "forzar_marca_agua") setForzarMarcaAgua(valor);
    } catch (err) {
      console.error(`Error al actualizar ${columna}:`, err.message);
      alert("No se pudieron guardar los ajustes. Inténtalo de nuevo.");
    } finally {
      setGuardandoAjustes(false);
    }
  };

  return {
    limiteSelecciones,
    forzarMarcaAgua,
    guardandoAjustes,
    actualizarAjuste,
  };
}
