/* ========================================================================= */
/* Proyecto: PhocuSync SaaS Portal                                           */
/* Hook: useAjustesProyecto.js                                               */
/* Descripción: Módulo administrativo encargado de gestionar los límites    */
/*              comerciales (selecciones) y restricciones visuales (marca de */
/*              agua) de la galería. Implementa persistencia dinámica.      */
/* ========================================================================= */

import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

export function useAjustesProyecto(proyectoId, proyectoData) {
  // --- ESTADOS LOCALES ADMINISTRATIVOS ---
  const [limiteSelecciones, setLimiteSelecciones] = useState(15); // Techo máximo de fotos que el cliente puede elegir
  const [forzarMarcaAgua, setForzarMarcaAgua] = useState(true); // Flag para activar la superposición de branding protector
  const [guardandoAjustes, setGuardandoAjustes] = useState(false); // Spinner/loader para deshabilitar inputs durante la red

  // CONTROL DE CICLO DE VIDA (Hydration Guard)
  // Previene ciclos infinitos o reescrituras no deseadas del estado local
  const inicializadoRef = useRef(false);

  // EFECTO DE HIDRATACIÓN INICIAL
  // Se ejecuta únicamente cuando los datos remotos del proyecto base se resuelven
  useEffect(() => {
    // Si el proyecto tiene ID y la guardia está apagada, absorbe los valores reales de la BD
    if (proyectoData?.id && !inicializadoRef.current) {
      setLimiteSelecciones(proyectoData.limite_selecciones ?? 15); // Fallback seguro a 15 si viene nulo
      setForzarMarcaAgua(proyectoData.forzar_marca_agua ?? false); // Fallback seguro a falso

      // Cierra la compuerta. No se volverá a sobreescribir este estado local en este montaje
      inicializadoRef.current = true;
    }
  }, [proyectoData?.id]);

  // MUTACIÓN POLIMÓRFICA EN TIEMPO REAL
  // Recibe de forma dinámica la columna de Postgres y el valor genérico a guardar
  const actualizarAjuste = async (columna, valor) => {
    setGuardandoAjustes(true);
    try {
      // Actualización directa usando sintaxis de clave computada de ES6
      const { error } = await supabase
        .from("proyectos")
        .update({ [columna]: valor })
        .eq("id", proyectoId);

      if (error) throw error;

      // Sincronización optimista condicionada tras éxito garantizado en el servidor
      if (columna === "limite_selecciones") setLimiteSelecciones(valor);
      if (columna === "forzar_marca_agua") setForzarMarcaAgua(valor);
    } catch (err) {
      console.error(`Error al actualizar ${columna}:`, err.message);
      alert("No se pudieron guardar los ajustes. Inténtalo de nuevo.");
    } finally {
      setGuardandoAjustes(false);
    }
  };

  // API expuesta para los componentes de interfaz de usuario
  return {
    limiteSelecciones,
    forzarMarcaAgua,
    guardandoAjustes,
    actualizarAjuste,
  };
}
