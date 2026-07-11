/* ========================================================================= */
/* Proyecto: PhocuSync SaaS Portal                                           */
/* Hook: usePermitirDescarga.js                                              */
/* Descripción: Mini-hook especializado en la gestión estacional de permisos */
/*              de descarga masiva para los clientes. Implementa la estrategia*/
/*              de "Optimistic Update" para una UI de alta velocidad.        */
/* ========================================================================= */

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export function usePermitirDescarga(proyectoId, valorInicial) {
  // --- ESTADOS LOCALES DE INTERFAZ ---
  const [permitirDescarga, setPermitirDescarga] = useState(false); // Bandera reactiva del estado del switch
  const [guardandoDescarga, setGuardandoDescarga] = useState(false); // Estado de carga síncrono para mutaciones de red

  // EFECTO DE SINCRONIZACIÓN ASÍNCRONA
  // Escucha cuando el hook pesado de la vista padre termina de traer los datos desde Supabase
  // e iguala el estado local con la columna real de la base de datos.
  useEffect(() => {
    if (valorInicial !== undefined) {
      setPermitirDescarga(valorInicial);
    }
  }, [valorInicial]);

  // MUTACIÓN OPTIMISTA (Optimistic UI Update)
  // Cambia el estado en pantalla inmediatamente y procesa la petición en segundo plano.
  const handleToggleDescarga = async () => {
    if (!proyectoId) return;

    const nuevoEstado = !permitirDescarga;
    setGuardandoDescarga(true);

    // 1. CAMBIO OPTIMISTA: El switch se mueve en la UI de inmediato para dar sensación de velocidad instantánea
    setPermitirDescarga(nuevoEstado);

    try {
      // 2. Persistencia en la columna dedicada dentro de la tabla 'proyectos'
      const { error } = await supabase
        .from("proyectos")
        .update({ permitir_descarga: nuevoEstado })
        .eq("id", proyectoId);

      if (error) throw error;
    } catch (error) {
      console.error("Error al actualizar permisos de descarga:", error);

      // 3. REVERSIÓN DE SEGURIDAD (Rollback): Si la base de datos falla, regresamos el switch al estado anterior
      setPermitirDescarga(!nuevoEstado);
      alert("No se pudo guardar el cambio. Revisa tu conexión a internet.");
    } finally {
      setGuardandoDescarga(false);
    }
  };

  // Exposición limpia de la API del hook
  return {
    permitirDescarga,
    guardandoDescarga,
    handleToggleDescarga,
  };
}
