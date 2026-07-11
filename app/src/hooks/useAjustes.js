/* ========================================================================= */
/* Proyecto: PhocuSync SaaS Portal                                           */
/* Hook: useAjustes.js                                                       */
/* Descripción: Gestión de estado y persistencia para el perfil de usuario.   */
/*              Administra formularios de marca, alertas efímeras y compone   */
/*              el estado del dashboard principal mediante composición.       */
/* ========================================================================= */

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useDashboard } from "./useDashboard";

export function useAjustes() {
  // COMPOSICIÓN: Heredamos el contexto global de navegación y datos del fotógrafo
  const dashboard = useDashboard();

  // ESTADOS DE NAVEGACIÓN LOCAL Y MODALES
  const [seccionActiva, setSeccionActiva] = useState("perfil");
  const [modalPlanesAbierto, setModalPlanesAbierto] = useState(false);

  // ESTADOS DE FORMULARIO (Datos de marca del fotógrafo)
  const [nombreEstudio, setNombreEstudio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [marcaAgua, setMarcaAgua] = useState(""); // Plantilla global de texto para la grilla de protección

  // ESTADOS DE CARGA Y SPINNING VISUAL
  const [cargandoPerfil, setCargandoPerfil] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // ESTADO DE ALERTAS / TOAST SYSTEM
  const [notificacion, setNotificacion] = useState({
    mostrar: false,
    mensaje: "",
    tipo: "success", // 'success' | 'error'
  });

  /**
   * Orquesta el ciclo de vida efímero de las notificaciones flotantes.
   */
  const dispararNotificacion = (mensaje, tipo = "success") => {
    setNotificacion({ mostrar: true, mensaje, tipo });
    setTimeout(() => {
      setNotificacion({ mostrar: false, mensaje: "", tipo: "success" });
    }, 4000); // 4 segundos de exposición óptima para lectura remota
  };

  /**
   * EFECTO DE HIDRATACIÓN: Consulta los metadatos del perfil del fotógrafo
   * tan pronto como se monta el componente de ajustes.
   */
  useEffect(() => {
    async function cargarPerfil() {
      try {
        setCargandoPerfil(true);

        // Obtención segura de la sesión JWT actual en el cliente
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from("perfiles")
            .select("nombre_estudio, instagram, marca_agua")
            .eq("id", user.id)
            .maybeSingle(); // Esperamos un objeto único relacional

          if (error) throw error;

          if (data) {
            // Mitigación de errores de inputs controlados usando fallbacks de strings vacíos
            setNombreEstudio(data.nombre_estudio || "");
            setInstagram(data.instagram || "");
            setMarcaAgua(data.marca_agua || "");
          }
        }
      } catch (error) {
        console.error("Error cargando perfil:", error.message);
      } finally {
        setCargandoPerfil(false);
      }
    }
    cargarPerfil();
  }, []);

  /**
   * Transmite y persiste los cambios del formulario en la base de datos de Supabase.
   */
  const handleGuardarPerfil = async () => {
    try {
      setGuardando(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // UPSERT: Inserta si es registro nuevo, actualiza si hay colisión de ID de usuario
      const { error } = await supabase.from("perfiles").upsert({
        id: user.id,
        nombre_estudio: nombreEstudio,
        instagram: instagram,
        marca_agua: marcaAgua,
        actualizado_en: new Date().toISOString(), // Marca de tiempo ISO estricta
      });

      if (error) throw error;

      dispararNotificacion("¡Cambios guardados con éxito!", "success");
    } catch (error) {
      dispararNotificacion(`Error: ${error.message}`, "error");
    } finally {
      setGuardando(false);
    }
  };

  // RETORNO EXTENDIDO DE LA INTERFAZ PÚBLICA DEL HOOK
  return {
    ...dashboard, // Descompone el estado heredado (evita anidamiento excesivo en componentes hijos)
    seccionActiva,
    setSeccionActiva,
    modalPlanesAbierto,
    setModalPlanesAbierto,
    nombreEstudio,
    setNombreEstudio,
    instagram,
    setInstagram,
    marcaAgua,
    setMarcaAgua,
    cargandoPerfil,
    guardando,
    handleGuardarPerfil,
    notificacion,
  };
}
