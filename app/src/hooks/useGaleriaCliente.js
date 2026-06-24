// 📁 src/hooks/useGaleriaCliente.js
import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function useGaleriaCliente() {
  const { id } = useParams();
  const [proyecto, setProyecto] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [perfilFotografo, setPerfilFotografo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [comentarioLocal, setComentarioLocal] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [seleccionGuardada, setSeleccionGuardada] = useState(false);
  const [mostrarExitoCliente, setMostrarExitoCliente] = useState(false);
  const [modalConfirmarEnvio, setModalConfirmarEnvio] = useState(false);
  const [enviandoDatos, setEnviandoDatos] = useState(false);
  const [avisoNuevasFotos, setAvisoNuevasFotos] = useState(false);
  const [alerta, setAlerta] = useState({ mostrar: false, mensaje: "" });

  // Estados táctiles
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const [favoritas, setFavoritas] = useState(() => {
    const guardadas = localStorage.getItem(`proy_favs_${id}`);
    return guardadas ? JSON.parse(guardadas) : [];
  });

  const lanzarAlerta = (mensaje) => {
    setAlerta({ mostrar: true, mensaje });
    setTimeout(() => setAlerta({ mostrar: false, mensaje: "" }), 4000);
  };

  useEffect(() => {
    localStorage.setItem(`proy_favs_${id}`, JSON.stringify(favoritas));
  }, [favoritas, id]);

  // Carga inicial de Datos
  useEffect(() => {
    const cargarGaleriaPublica = async () => {
      // 1. Buscamos el proyecto (el select("*") traerá automáticamente tus nuevas columnas)
      const { data: dataProyecto, error: errProy } = await supabase.from("proyectos").select("*").eq("id", id).single();

      if (errProy) {
        setLoading(false);
        return;
      }

      setProyecto(dataProyecto);

      if (dataProyecto && dataProyecto.estado === "Aprobado") {
        setSeleccionGuardada(true);
      }

      // 2. Cargamos información de marca y redes del fotógrafo
      if (dataProyecto && dataProyecto.fotógrafo_id) {
        const { data: dataPerfil, error: errPerfil } = await supabase
          .from("perfiles")
          .select("nombre_estudio, instagram, marca_agua") // 🧼 Limpio de configuraciones globales muertas
          .eq("id", dataProyecto.fotógrafo_id)
          .single();

        if (!errPerfil && dataPerfil) {
          setPerfilFotografo(dataPerfil);
        }
      }

      // 3. Cargamos el carrete de fotos
      const { data: dataFotos, error: errFotos } = await supabase
        .from("fotos")
        .select("*")
        .eq("proyecto_id", id)
        .order("creado_en", { ascending: true });

      if (!errFotos && dataFotos) {
        setFotos(dataFotos);
        if (dataFotos.length > 0) {
          setComentarioLocal(dataFotos[0].comentario || "");
        }
      }
      setLoading(false);
    };

    cargarGaleriaPublica();
  }, [id]);

  // Suscripción en Tiempo Real
  useEffect(() => {
    console.log(" [CLIENTE] Conectando a Realtime para el proyecto:", id);

    const channel = supabase
      .channel(`cliente-fotos-${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "fotos",
          filter: `proyecto_id=eq.${id}`,
        },
        (payload) => {
          console.log(" [CLIENTE] ¡Nueva foto recibida en vivo!", payload.new);

          setFotos((prev) => {
            if (prev.some((f) => f.id === payload.new.id)) return prev;

            const nuevasFotos = [...prev, payload.new];
            if (prev.length === 0) {
              setComentarioLocal(payload.new.comentario || "");
            } else {
              setAvisoNuevasFotos(true);
            }
            return nuevasFotos;
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "fotos",
        },
        (payload) => {
          console.log(" [CLIENTE] Foto eliminada por el admin:", payload.old);

          setFotos((prev) => {
            const fotosFiltradas = prev.filter((f) => f.id !== payload.old.id);

            setCurrentIndex((current) => {
              if (current >= fotosFiltradas.length) {
                return Math.max(0, fotosFiltradas.length - 1);
              }
              return current;
            });

            return fotosFiltradas;
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  // Temporizador Aviso Flotante
  useEffect(() => {
    if (!avisoNuevasFotos) return;

    const timer = setTimeout(() => {
      setAvisoNuevasFotos(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [avisoNuevasFotos]);

  // Navegación de fotos
  const navegarIzquierda = useCallback(() => {
    if (fotos.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? fotos.length - 1 : prev - 1));
  }, [fotos.length]);

  const navegarDerecha = useCallback(() => {
    if (fotos.length === 0) return;
    setCurrentIndex((prev) => (prev === fotos.length - 1 ? 0 : prev + 1));
  }, [fotos.length]);

  useEffect(() => {
    if (fotos[currentIndex]) {
      setComentarioLocal(fotos[currentIndex].comentario || "");
    }
  }, [currentIndex, fotos]);

  // Teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === "TEXTAREA") return;
      if (e.key === "ArrowLeft") navegarIzquierda();
      if (e.key === "ArrowRight") navegarDerecha();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navegarIzquierda, navegarDerecha]);

  // Control de selección de fotos
  const handleToggleFavorita = (fotoId) => {
    if (seleccionGuardada) return;

    const yaEsFavorita = favoritas.includes(fotoId);
    const limite = proyecto?.limite_selecciones;

    // Si el proyecto tiene un límite numérico establecido y el cliente intenta sumar una NUEVA foto superándolo...
    if (limite && !yaEsFavorita && favoritas.length >= limite) {
      lanzarAlerta(`¡Llegaste al límite! Tu paquete incluye un máximo de ${limite} fotos.`);
      return;
    }

    setFavoritas((prev) => (prev.includes(fotoId) ? prev.filter((item) => item !== fotoId) : [...prev, fotoId]));
  };

  const guardarComentarioEnBD = async (fotoId, texto) => {
    if (seleccionGuardada) return;
    try {
      const { error } = await supabase.from("fotos").update({ comentario: texto }).eq("id", fotoId);
      if (error) throw error;
      setFotos((prev) => prev.map((f) => (f.id === fotoId ? { ...f, comentario: texto } : f)));
    } catch (err) {
      console.error("Error al guardar comentario:", err.message);
    }
  };

  const abrirPreguntaEnvio = () => {
    if (favoritas.length === 0) {
      alert("Debes seleccionar al menos 1 foto antes de enviar.");
      return;
    }
    setModalConfirmarEnvio(true);
  };

  const handleEnviarSeleccion = async () => {
    setModalConfirmarEnvio(false);
    setEnviandoDatos(true);
    try {
      const { error: errReset } = await supabase.from("fotos").update({ seleccionada: false }).eq("proyecto_id", id);

      if (errReset) throw errReset;

      if (favoritas.length > 0) {
        const { error: errFotos } = await supabase.from("fotos").update({ seleccionada: true }).in("id", favoritas);
        if (errFotos) throw errFotos;
      }

      const { error: estadoError } = await supabase.from("proyectos").update({ estado: "Aprobado" }).eq("id", id);
      if (estadoError) throw estadoError;

      setSeleccionGuardada(true);
      setTimeout(() => {
        setEnviandoDatos(false);
        setMostrarExitoCliente(true);
      }, 800);
    } catch (error) {
      console.error("Error detallado de Supabase:", error);
      setEnviandoDatos(false);
      alert(`Error al enviar: ${error.message || error.details || JSON.stringify(error)}`);
    } finally {
      setEnviando(false);
    }
  };

  // Manejo de Swipe Táctil
  const manejarTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const manejarTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const manejarTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distancia = touchStart - touchEnd;
    const umbralMinimo = 50;

    if (distancia > umbralMinimo) {
      navegarDerecha();
    }

    if (distancia < -umbralMinimo) {
      navegarIzquierda();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  const fotoActual = fotos[currentIndex] || null;
  const esFavorita = fotoActual ? favoritas.includes(fotoActual.id) : false;

  return {
    proyecto,
    fotos,
    perfilFotografo,
    loading,
    currentIndex,
    comentarioLocal,
    enviando,
    seleccionGuardada,
    mostrarExitoCliente,
    modalConfirmarEnvio,
    enviandoDatos,
    avisoNuevasFotos,
    favoritas,
    fotoActual,
    esFavorita,
    setComentarioLocal,
    setMostrarExitoCliente,
    setModalConfirmarEnvio,
    navegarIzquierda,
    navegarDerecha,
    handleToggleFavorita,
    guardarComentarioEnBD,
    abrirPreguntaEnvio,
    handleEnviarSeleccion,
    manejarTouchStart,
    manejarTouchMove,
    manejarTouchEnd,
    alerta,
  };
}
