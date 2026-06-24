import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export function usePermitirDescarga(proyectoId, valorInicial) {
  const [permitirDescarga, setPermitirDescarga] = useState(false);
  const [guardandoDescarga, setGuardandoDescarga] = useState(false);

  // Sincroniza el estado local cuando el hook pesado termine de cargar el proyecto
  useEffect(() => {
    if (valorInicial !== undefined) {
      setPermitirDescarga(valorInicial);
    }
  }, [valorInicial]);

  const handleToggleDescarga = async () => {
    if (!proyectoId) return;

    const nuevoEstado = !permitirDescarga;
    setGuardandoDescarga(true);

    // 1. Cambio optimista (el switch se mueve en la UI de inmediato)
    setPermitirDescarga(nuevoEstado);

    try {
      // 2. Guardamos en la nueva columna de la tabla 'proyectos'
      const { error } = await supabase
        .from("proyectos")
        .update({ permitir_descarga: nuevoEstado })
        .eq("id", proyectoId);

      if (error) throw error;
    } catch (error) {
      console.error("Error al actualizar permisos de descarga:", error);

      // 3. Reversión de seguridad: Si falla la base de datos, regresamos el switch a como estaba
      setPermitirDescarga(!nuevoEstado);
      alert("No se pudo guardar el cambio. Revisa tu conexión a internet.");
    } finally {
      setGuardandoDescarga(false);
    }
  };

  return {
    permitirDescarga,
    guardandoDescarga,
    handleToggleDescarga,
  };
}
