// 📁 src/hooks/useAjustes.js
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useDashboard } from "./useDashboard";

export function useAjustes() {
  const dashboard = useDashboard();
  const [seccionActiva, setSeccionActiva] = useState("perfil");
  const [modalPlanesAbierto, setModalPlanesAbierto] = useState(false);
  const [nombreEstudio, setNombreEstudio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [marcaAgua, setMarcaAgua] = useState(""); // Se queda el texto base como plantilla global
  const [cargandoPerfil, setCargandoPerfil] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [notificacion, setNotificacion] = useState({
    mostrar: false,
    mensaje: "",
    tipo: "success",
  });

  const dispararNotificacion = (mensaje, tipo = "success") => {
    setNotificacion({ mostrar: true, mensaje, tipo });
    setTimeout(() => {
      setNotificacion({ mostrar: false, mensaje: "", tipo: "success" });
    }, 4000);
  };

  useEffect(() => {
    async function cargarPerfil() {
      try {
        setCargandoPerfil(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from("perfiles")
            .select("nombre_estudio, instagram, marca_agua")
            .eq("id", user.id)
            .single();

          if (error) throw error;
          if (data) {
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

  const handleGuardarPerfil = async () => {
    try {
      setGuardando(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase.from("perfiles").upsert({
        id: user.id,
        nombre_estudio: nombreEstudio,
        instagram: instagram,
        marca_agua: marcaAgua,
        actualizado_en: new Date().toISOString(),
      });

      if (error) throw error;

      dispararNotificacion("¡Cambios guardados con éxito!", "success");
    } catch (error) {
      dispararNotificacion(`Error: ${error.message}`, "error");
    } finally {
      setGuardando(false);
    }
  };

  return {
    ...dashboard,
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
