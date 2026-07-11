/* ========================================================================= */
/* Proyecto: PhocuSync SaaS Portal                                           */
/* Hook: useGaleriaCliente.js                                                */
/* Descripción: Gestión del estado global de la galería pública:            */
/*              Persistencia, navegación por gestos, límites de selección    */
/*              y sincronización reactiva bidireccional con Supabase.        */
/* ========================================================================= */

import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function useGaleriaCliente() {
  const { id } = useParams();

  // ESTADOS ESTÁTICOS Y DE DATOS
  const [proyecto, setProyecto] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [perfilFotografo, setPerfilFotografo] = useState(null);
  const [loading, setLoading] = useState(true);

  // ESTADOS DE INTERFAZ Y NAVEGACIÓN
  const [currentIndex, setCurrentIndex] = useState(0);
  const [comentarioLocal, setComentarioLocal] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [seleccionGuardada, setSeleccionGuardada] = useState(false);

  // ESTADOS DE RETROALIMENTACIÓN (MODALES / TOASTS)
  const [mostrarExitoCliente, setMostrarExitoCliente] = useState(false);
  const [modalConfirmarEnvio, setModalConfirmarEnvio] = useState(false);
  const [enviandoDatos, setEnviandoDatos] = useState(false);
  const [avisoNuevasFotos, setAvisoNuevasFotos] = useState(false);
  const [alerta, setAlerta] = useState({ mostrar: false, mensaje: "" });

  // ESTADOS PARA INTERACCIÓN TÁCTIL (MOBILE SWIPE)
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // LAZY STATE INITIALIZATION: Evita lecturas redundantes a disco en cada ciclo de render
  const [favoritas, setFavoritas] = useState(() => {
    const guardadas = localStorage.getItem(`proy_favs_${id}`);
    return guardadas ? JSON.parse(guardadas) : [];
  });

  // DISPARADOR DE ALERTAS FLOTANTES
  const lanzarAlerta = (mensaje) => {
    setAlerta({ mostrar: true, mensaje });
    setTimeout(() => setAlerta({ mostrar: false, mensaje: "" }), 4000);
  };

  // PERSISTENCIA LOCAL: Sincroniza la selección del cliente para prevenir pérdidas por cierre accidental
  useEffect(() => {
    localStorage.setItem(`proy_favs_${id}`, JSON.stringify(favoritas));
  }, [favoritas, id]);

  // CARGA DE CONFIGURACIÓN INICIAL (DATA FETCHING)
  useEffect(() => {
    const cargarGaleriaPublica = async () => {
      // 1. Obtención de metadatos del proyecto
      const { data: dataProyecto, error: errProy } = await supabase.from("proyectos").select("*").eq("id", id).single();

      if (errProy) {
        setLoading(false);
        return;
      }

      setProyecto(dataProyecto);

      // Si el proyecto ya fue despachado y aprobado, congelamos los controles en modo lectura
      if (dataProyecto && dataProyecto.estado === "Aprobado") {
        setSeleccionGuardada(true);
      }

      // 2. Obtención del perfil de marca del fotógrafo
      if (dataProyecto && dataProyecto.fotografo_id) {
        const { data: dataPerfil, error: errPerfil } = await supabase
          .from("perfiles")
          .select("nombre_estudio, instagram, marca_agua")
          .eq("id", dataProyecto.fotografo_id)
          .single();

        if (!errPerfil && dataPerfil) {
          setPerfilFotografo(dataPerfil);
        }
      }

      // 3. Obtención del carrete fotográfico asignado
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

        // ==========================================
        // PARCHE DE SEGURIDAD: PURGA DE IDs FANTASMA
        // ==========================================
        // Mapeamos los IDs de las fotos que SÍ existen realmente en Supabase ahora mismo
        const idsExistentes = dataFotos.map((f) => f.id);

        // CASO A: Si tus "favoritas" vienen guardadas en una columna del proyecto (ej: fotos_seleccionadas)
        if (dataProyecto && dataProyecto.fotos_seleccionadas) {
          const favoritasLimpias = dataProyecto.fotos_seleccionadas.filter((fotoId) => idsExistentes.includes(fotoId));

          setFavoritas(favoritasLimpias);

          // Si el tamaño no coincide, significa que el fotógrafo borró fotos viejas.
          // Actualizamos Supabase de una vez para limpiar el registro basura definitivamente.
          if (favoritasLimpias.length !== dataProyecto.fotos_seleccionadas.length) {
            await supabase
              .from("proyectos")
              .update({ fotos_seleccionadas: favoritasLimpias }) // Asegúrate de usar el nombre real de tu columna
              .eq("id", id);
          }
        }
        // CASO B: Si manejas las favoritas por LocalStorage o un estado que se inicializa antes
        else {
          setFavoritas((prev) => prev.filter((fotoId) => idsExistentes.includes(fotoId)));

          // Si usas localStorage, descomenta la línea de abajo para limpiarlo también:
          // const storageFavs = JSON.parse(localStorage.getItem(`favoritas_${id}`)) || [];
          // const storageLimpio = storageFavs.filter(fotoId => idsExistentes.includes(fotoId));
          // localStorage.setItem(`favoritas_${id}`, JSON.stringify(storageLimpio));
        }
        // ==========================================
      }
      setLoading(false);
    };

    cargarGaleriaPublica();
  }, [id]);

  // SUSCRIPCIÓN EN TIEMPO REAL (WEBSOCKETS): Sincroniza adiciones o purgas del fotógrafo en vivo
  useEffect(() => {
    console.log(" [CLIENTE] Conectando a Realtime para el proyecto:", id);

    const channel = supabase
      .channel(`cliente-fotos-${id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "fotos", filter: `proyecto_id=eq.${id}` },
        (payload) => {
          setFotos((prev) => {
            // Protección contra duplicados en mutaciones rápidas
            if (prev.some((f) => f.id === payload.new.id)) return prev;

            const nuevasFotos = [...prev, payload.new];
            if (prev.length === 0) {
              setComentarioLocal(payload.new.comentario || "");
            } else {
              setAvisoNuevasFotos(true); // Banner de cortesía visual si está viendo otra foto
            }
            return nuevasFotos;
          });
        },
      )
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "fotos" }, (payload) => {
        setFotos((prev) => {
          const fotosFiltradas = prev.filter((f) => f.id !== payload.old.id);

          // Recalcula el index en vivo para evitar punteros huérfanos fuera de rango
          setCurrentIndex((current) => {
            if (current >= fotosFiltradas.length) {
              return Math.max(0, fotosFiltradas.length - 1);
            }
            return current;
          });

          return fotosFiltradas;
        });
      })
      .subscribe();

    // CLEANUP DISPOSAL: Previene leaks severos de sockets al cambiar de ruta
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  // TEMPORIZADOR DE NOTIFICACIONES INBOUND
  useEffect(() => {
    if (!avisoNuevasFotos) return;
    const timer = setTimeout(() => setAvisoNuevasFotos(false), 5000);
    return () => clearTimeout(timer);
  }, [avisoNuevasFotos]);

  // CONTROLES DE NAVEGACIÓN (Memorizados para evitar rotura de referencias en sub-componentes)
  const navegarIzquierda = useCallback(() => {
    if (fotos.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? fotos.length - 1 : prev - 1));
  }, [fotos.length]);

  const navegarDerecha = useCallback(() => {
    if (fotos.length === 0) return;
    setCurrentIndex((prev) => (prev === fotos.length - 1 ? 0 : prev + 1));
  }, [fotos.length]);

  // Sincroniza el text-area local al saltar entre imágenes del carrete
  useEffect(() => {
    if (fotos[currentIndex]) {
      setComentarioLocal(fotos[currentIndex].comentario || "");
    }
  }, [currentIndex, fotos]);

  // SHORTCUTS DE TECLADO: Navegación nativa por hardware
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === "TEXTAREA") return; // Frena el trigger si está redactando
      if (e.key === "ArrowLeft") navegarIzquierda();
      if (e.key === "ArrowRight") navegarDerecha();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navegarIzquierda, navegarDerecha]);

  // LÓGICA DE SELECCIÓN Y VALIDACIÓN DE LÍMITES COMERCIALES
  const handleToggleFavorita = async (fotoId) => {
    if (seleccionGuardada) return; // Bloqueo de seguridad post-aprobación

    const yaEsFavorita = favoritas.includes(fotoId);
    const limite = proyecto?.limite_selecciones;

    // Control de cuota del plan adquirido contratado con el fotógrafo
    if (limite && !yaEsFavorita && favoritas.length >= limite) {
      lanzarAlerta(`¡Llegaste al límite! Tu paquete incluye un máximo de ${limite} fotos.`);
      return;
    }

    // 1. Cambiamos el estado de la estrella de forma inmediata para que la UI sea ultra reactiva
    setFavoritas((prev) => (prev.includes(fotoId) ? prev.filter((item) => item !== fotoId) : [...prev, fotoId]));

    // Si "yaEsFavorita" es true, significa que el cliente le dio click para QUITAR la estrella.
    // Por lo tanto, procedemos a borrar el comentario en local y en Supabase.
    if (yaEsFavorita) {
      try {
        // A. Limpieza en el estado local de fotos
        setFotos((prev) => prev.map((f) => (f.id === fotoId ? { ...f, comentario: "" } : f)));

        // B. Limpieza en la base de datos de Supabase
        const { error } = await supabase
          .from("fotos")
          .update({ comentario: "" }) // Dejamos el comentario vacío en la BD
          .eq("id", fotoId);

        if (error) throw error;
        console.log(`Estrella quitada de la foto ${fotoId}: Comentario eliminado por seguridad.`);
      } catch (err) {
        console.error("Error al limpiar anotación tras desmarcar favorita:", err.message);
      }
    }
  };

  // PERSISTENCIA DE COMENTARIOS DE RETOQUE EN BD
  const guardarComentarioEnBD = async (fotoId, texto) => {
    if (seleccionGuardada) return;
    try {
      const { error } = await supabase.from("fotos").update({ comentario: texto }).eq("id", fotoId);
      if (error) throw error;

      // Mutación optimista local para mantener sincronía sin re-fetch completo
      setFotos((prev) => prev.map((f) => (f.id === fotoId ? { ...f, comentario: texto } : f)));
    } catch (err) {
      console.error("Error crítico guardando anotación:", err.message);
    }
  };

  // FLUJO DE CONFIRMACIÓN Y ENVÍO TRANSACCIONAL
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
      // Operación Atómica en Bloque:
      // 1. Limpiamos selecciones previas obsoletas del proyecto
      const { error: errReset } = await supabase.from("fotos").update({ seleccionada: false }).eq("proyecto_id", id);
      if (errReset) throw errReset;

      // 2. Marcamos el conjunto final aprobado por el cliente
      if (favoritas.length > 0) {
        const { error: errFotos } = await supabase.from("fotos").update({ seleccionada: true }).in("id", favoritas);
        if (errFotos) throw errFotos;
      }

      // 3. Clausuramos el estado comercial del proyecto a 'Aprobado'
      const { error: estadoError } = await supabase.from("proyectos").update({ estado: "Aprobado" }).eq("id", id);
      if (estadoError) throw estadoError;

      setSeleccionGuardada(true);
      setTimeout(() => {
        setEnviandoDatos(false);
        setMostrarExitoCliente(true);
      }, 800);
    } catch (error) {
      console.error("Fallo transaccional en Supabase:", error);
      setEnviandoDatos(false);
      alert(`Error al enviar: ${error.message || error.details || JSON.stringify(error)}`);
    } finally {
      setEnviando(false);
    }
  };

  // SISTEMA DE RECONOCIMIENTO DE SWIPES (PANTALLAS TÁCTILES)
  const manejarTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const manejarTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const manejarTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distancia = touchStart - touchEnd;
    const umbralMinimo = 50; // Tolerancia mínima en píxeles para validar el arrastre

    if (distancia > umbralMinimo) navegarDerecha();
    if (distancia < -umbralMinimo) navegarIzquierda();

    // Reset de coordenadas táctiles
    setTouchStart(0);
    setTouchEnd(0);
  };

  // PROPIEDADES CALCULADAS DERIVADAS
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
