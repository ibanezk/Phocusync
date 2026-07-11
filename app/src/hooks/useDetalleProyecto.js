/* ========================================================================= */
/* Proyecto: PhocuSync SaaS Portal                                           */
/* Hook: useDetalleProyecto.js                                               */
/* Descripción: Cerebro lógico del módulo de administración de galerías.      */
/*              Centraliza estados, optimización de binarios en el cliente,   */
/*              paginación por scroll infinito y sockets en tiempo real.     */
/* ========================================================================= */

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

export default function useDetalleProyecto(id, navigate) {
  // -------------------------------------------------------------------------
  // 1. ESTADOS PRINCIPALES DE DATOS (Core Data State)
  // -------------------------------------------------------------------------
  const [proyecto, setProyecto] = useState(null); // Almacena el registro maestro de la tabla 'proyectos'
  const [fotos, setFotos] = useState([]); // Colección completa de imágenes indexadas para esta galería
  const [loading, setLoading] = useState(true); // Bloqueo de UI global mientras se realiza el fetch inicial
  const [uploading, setUploading] = useState(false); // Flag para animaciones de carga durante subidas o borrados masivos
  const [isDragActive, setIsDragActive] = useState(false); // UI toggle para el efecto de arrastre (Drag & Drop)
  const [selectedFotos, setSelectedFotos] = useState([]); // Array de IDs elegidos para operaciones masivas (ej. borrar)

  // -------------------------------------------------------------------------
  // 2. ESTADOS DE CONTROL DE MODALES (UI Dialogs State)
  // -------------------------------------------------------------------------
  const [modalEliminarProyecto, setModalEliminarProyecto] = useState({ isOpen: false });
  const [modalCompartir, setModalCompartir] = useState({ isOpen: false });
  const [modalEliminar, setModalEliminar] = useState({ isOpen: false, fotoId: null, fotoUrl: null });
  const [modalEliminarMasivo, setModalEliminarMasivo] = useState({ isOpen: false });
  const [modalComentario, setModalComentario] = useState({ isOpen: false, text: "", fotoUrl: "" });

  // -------------------------------------------------------------------------
  // 3. FILTRADO Y PAGINACIÓN POR DEMANDA (Performance & Pagination)
  // -------------------------------------------------------------------------
  const [filtroElegidas, setFiltroElegidas] = useState("todas"); // Criterio de segmentación: 'todas' | 'seleccionadas' | 'con_nota'
  const [fotosVisibles, setFotosVisibles] = useState(12); // Paginación: controla cuántos nodos se inyectan al DOM inicialmente
  const observerRef = useRef(null); // Referencia mutable para instanciar y limpiar el IntersectionObserver sin disparar renders

  // -------------------------------------------------------------------------
  // 4. PORTAPAPELES Y RUTAS PÚBLICAS (Clipboard Shared Links)
  // -------------------------------------------------------------------------
  const [copiado, setCopiado] = useState(false); // Feedback visual temporal para el copiado de nombres en Lightroom
  const [enlaceCopiado, setEnlaceCopiado] = useState(false); // Feedback visual para el enlace público de la galería
  const urlPublica = `${window.location.origin}/galeria/${id}`; // URL que usará el cliente final para seleccionar sus fotos

  // -------------------------------------------------------------------------
  // 5. CONSULTAS DIRECTAS A BASE DE DATOS (Supabase Fetching)
  // -------------------------------------------------------------------------
  // Obtiene de forma asíncrona todas las fotos ligadas al id del proyecto ordenadas por fecha decreciente
  const fetchFotos = useCallback(async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from("fotos")
      .select("*")
      .eq("proyecto_id", id)
      .order("creado_en", { ascending: false });

    if (!error && data) setFotos(data);
  }, [id]);

  // Carga el registro del proyecto. Si no existe o falla, redirige al Dashboard de forma segura
  const cargarDatos = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const { data: proyectoData, error: projError } = await supabase
        .from("proyectos")
        .select("*")
        .eq("id", id)
        .single(); // Espera una fila única para evitar colisiones

      if (projError) throw projError;
      setProyecto(proyectoData);
      await fetchFotos();
    } catch (error) {
      console.error("Error crítico:", error.message);
      navigate("/dashboard"); // Evita pantallas rotas enviando al usuario al panel general
    } finally {
      setLoading(false);
    }
  }, [id, navigate, fetchFotos]);

  // Disparador del ciclo de vida para la carga inicial de información
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // -------------------------------------------------------------------------
  // 6. CANAL REMOTO EN TIEMPO REAL (PostgreSQL Realtime WebSockets)
  // -------------------------------------------------------------------------
  // Sincroniza la UI del fotógrafo si ocurren cambios concurrentes (ej. subidas desde otra pestaña o cliente interactuando)
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`admin-fotos-${id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "fotos", filter: `proyecto_id=eq.${id}` },
        (payload) => {
          setFotos((prev) => {
            if (prev.some((f) => f.id === payload.new.id)) return prev; // Previene duplicados en condiciones de carrera
            return [...prev, payload.new];
          });
        },
      )
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "fotos" }, (payload) => {
        setFotos((prev) => prev.filter((f) => f.id !== payload.old.id)); // Remueve instantáneamente del estado local
      })
      .subscribe();

    // Desuscripción obligatoria para limpiar el socket del navegador al cambiar de ruta
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  // Resetea el scroll de renderizado a 12 elementos cada vez que el usuario altera los filtros superiores
  useEffect(() => {
    setFotosVisibles(12);
  }, [filtroElegidas]);

  // -------------------------------------------------------------------------
  // 7. PROCESAMIENTO LOGICO EN MEMORIA (In-Memory Processing)
  // -------------------------------------------------------------------------
  // Filtra la colección completa sin mutar el origen de datos ni requerir peticiones HTTP extras a la base de datos
  const fotosFiltradas = fotos.filter((foto) => {
    if (filtroElegidas === "seleccionadas" && !foto.seleccionada) return false;
    if (filtroElegidas === "con_nota" && !foto.comentario) return false;
    return true;
  });

  // Chunks final de renderizado para evitar la degradación del DOM (Lag visual)
  const fotosMostradas = fotosFiltradas.slice(0, fotosVisibles);

  // -------------------------------------------------------------------------
  // 8. OBSERVADOR DE SCROLL INFINITO (Intersection Observer)
  // -------------------------------------------------------------------------
  // Evalúa si el usuario llegó al final de la cuadrícula y anexa dinámicamente un nuevo bloque de imágenes
  const ultimaFotoRef = useCallback(
    (node) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect(); // Desconecta observadores previos para evitar fugas

      observerRef.current = new IntersectionObserver(
        (entries) => {
          // Si el nodo actual cruza el umbral de pantalla y quedan elementos en cola, incrementa el rango visible
          if (entries[0].isIntersecting && fotosVisibles < fotosFiltradas.length) {
            setFotosVisibles((prev) => prev + 12);
          }
        },
        { threshold: 0.1 }, // Dispara cuando el 10% del nodo objetivo es visible
      );

      if (node) observerRef.current.observe(node);
    },
    [loading, fotosVisibles, fotosFiltradas.length],
  );

  // -------------------------------------------------------------------------
  // 9. FLUJOS DE OPTIMIZACIÓN Y COMPRESIÓN (Client-Side Image Processing)
  // -------------------------------------------------------------------------
  // Toma la imagen original, la redimensiona a un máximo seguro de 2000px y la exporta a formato WebP al 80%
  const comprimirImagenNativa = (file) => {
    return new Promise((resolve) => {
      if (!file.type.startsWith("image/")) return resolve(file); // Si no es imagen, continúa el flujo regular
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 2000;
          let width = img.width;
          let height = img.height;

          // Escalado proporcional geométrico
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // Conversión binaria de alta velocidad
          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                type: "image/webp",
              });
              resolve(compressedFile); // Devuelve el nuevo archivo optimizado listo para la red
            },
            "image/webp",
            0.8, // Calidad web óptima balanceada
          );
        };
      };
    });
  };

  // Procesa secuencialmente una lista de archivos, limpia sus nombres y los aloja en Storage y Database
  const procesarYSubirArchivos = async (listaArchivos) => {
    if (!listaArchivos || listaArchivos.length === 0) return;
    setUploading(true);

    for (let file of listaArchivos) {
      try {
        const archivoOptimizado = await comprimirImagenNativa(file);
        const fileExt = archivoOptimizado.name.split(".").pop();
        const nameOriginal = archivoOptimizado.name.substring(0, archivoOptimizado.name.lastIndexOf("."));

        // PROCESO INTELIGENTE DE EMPAREJAMIENTO
        const fotoExistente = fotos.find((f) => {
          // Quitamos las extensiones (.jpg, .png, etc.) y pasamos a minúsculas para comparar seguro
          const baseBD = f.nombre_archivo.replace(/\.[^/.]+$/, "").toLowerCase();
          const baseNueva = file.name.replace(/\.[^/.]+$/, "").toLowerCase();

          // Regla 1: Si los nombres base son exactamente iguales
          if (baseNueva === baseBD) return true;

          // Regla 2: Si el fotógrafo le agregó un sufijo común al final
          const sufijos = ["_editada", "-editada", "_final", "-final", "_edit", "-edit", "_retocada", "_arreglada"];

          // Verifica si el nombre nuevo es igual al de la BD + el sufijo
          return sufijos.some((sufijo) => baseNueva === `${baseBD}${sufijo}`);
        });

        // Saneamiento estricto de caracteres y acentos para evitar URLs rotas
        const nameClean = nameOriginal
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-zA-Z0-9]/g, "_")
          .replace(/__+/g, "_");

        // Generamos un nuevo archivo en Storage (con timestamp nuevo para romper la caché del navegador)
        const fileName = `${nameClean}_${Date.now()}.${fileExt}`;
        const filePath = `${id}/${fileName}`;

        // Subida del archivo comprimido al Bucket de Supabase Storage
        const { error: uploadError } = await supabase.storage.from("galerias").upload(filePath, archivoOptimizado);
        if (uploadError) throw uploadError;

        // Recuperación de la URL de distribución pública
        const {
          data: { publicUrl },
        } = supabase.storage.from("galerias").getPublicUrl(filePath);

        // BIFURCACIÓN DE LÓGICA DE NEGOCIO
        if (fotoExistente) {
          // CASO A: LA FOTO YA EXISTÍA (Es una edición)
          // Hacemos un UPDATE usando su ID. La fila original mantiene su selección y comentarios intactos.
          console.log(`Emparejado con éxito: ${file.name} ➡️ Reemplaza a: ${fotoExistente.nombre_archivo}`);
          const { error: dbError } = await supabase
            .from("fotos")
            .update({
              url: publicUrl, // Apuntamos a la nueva URL de la imagen editada
              size: archivoOptimizado.size,
            })
            .eq("id", fotoExistente.id); // Filtro crucial para actualizar la fila correcta

          if (dbError) throw dbError;
        } else {
          // CASO B: LA FOTO ES NUEVA (Carga inicial del proyecto)
          console.log(`Insertando nueva fotografía: ${file.name}`);
          const { error: dbError } = await supabase.from("fotos").insert([
            {
              proyecto_id: id,
              url: publicUrl,
              nombre_archivo: file.name,
              size: archivoOptimizado.size,
            },
          ]);

          if (dbError) throw dbError;
        }
      } catch (error) {
        console.error("Error en flujo de carga:", error.message);
      }
    }
    await fetchFotos(); // Refresco local al concluir todo el lote completo
    setUploading(false);
  };

  // -------------------------------------------------------------------------
  // 10. ACCIONES DE BORRADO Y MUTACIÓN (Database Mutations)
  // -------------------------------------------------------------------------
  // Remueve un binario del almacenamiento y borra su registro correspondiente en Postgres
  const ejecutarEliminarFoto = async () => {
    const { fotoId, fotoUrl } = modalEliminar;
    try {
      const urlParts = fotoUrl.split("/storage/v1/object/public/galerias/");
      if (urlParts.length < 2) throw new Error("URL corrupta");
      const filePath = urlParts[1];

      await supabase.storage.from("galerias").remove([filePath]);
      await supabase.from("fotos").delete().eq("id", fotoId);
      await fetchFotos();
    } catch (error) {
      console.error("Fallo de eliminación:", error.message);
    } finally {
      setModalEliminar({ isOpen: false, fotoId: null, fotoUrl: null });
    }
  };

  // Validación de seguridad antes de procesar eliminaciones masivas
  const abrirConfirmacionMasiva = () => {
    if (selectedFotos.length === 0) return;
    setModalEliminarMasivo({ isOpen: true });
  };

  // Ejecuta borrado síncrono por lotes tanto en storage como en registros ID mapeados
  const ejecutarEliminarMasivo = async () => {
    setModalEliminarMasivo({ isOpen: false });
    setUploading(true);
    try {
      const fotosABorrar = fotos.filter((f) => selectedFotos.includes(f.id));
      const filePaths = fotosABorrar
        .map((foto) => (foto?.url ? foto.url.split("/storage/v1/object/public/galerias/")[1] : null))
        .filter(Boolean);

      await supabase.storage.from("galerias").remove(filePaths); // Borrado masivo en Storage
      await supabase.from("fotos").delete().in("id", selectedFotos); // Borrado masivo relacional
      await fetchFotos();
      setSelectedFotos([]); // Resetea el array de selecciones múltiples
    } catch (error) {
      console.error("Error en borrado masivo:", error.message);
    } finally {
      setUploading(false);
    }
  };

  // Pone la galería en estado de eliminación completa de cascada: borra fotos de storage, registros de fotos y el proyecto base
  const ejecutarEliminarProyecto = async () => {
    setModalEliminarProyecto(false);
    setLoading(true);
    try {
      if (fotos.length > 0) {
        const filePaths = fotos.map((foto) => foto.url.split("/storage/v1/object/public/galerias/")[1]);
        await supabase.storage.from("galerias").remove(filePaths);
      }
      await supabase.from("fotos").delete().eq("proyecto_id", id);
      await supabase.from("proyectos").delete().eq("id", id);
      navigate("/dashboard"); // Salida segura al panel general al concluir la destrucción del proyecto
    } catch (error) {
      console.error("Error al eliminar proyecto:", error.message);
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // 11. INTERACCIONES CON EL PORTAPAPELES (Clipboard & Shared Events)
  // -------------------------------------------------------------------------
  // Actualiza el estado comercial de la galería a 'En revisión' y copia la ruta de acceso al portapapeles
  const handleCopiarEnlaceCompartir = async () => {
    try {
      await supabase.from("proyectos").update({ estado: "En revisión" }).eq("id", id);
      setProyecto((prev) => (prev ? { ...prev, estado: "En revisión" } : null));
      await navigator.clipboard.writeText(urlPublica);
      setEnlaceCopiado(true);
      setTimeout(() => setEnlaceCopiado(false), 2000);
    } catch (error) {
      console.error("Error al compartir:", error);
    }
  };

  // Filtra las fotos marcadas por el cliente final y genera una cadena separada por comas para Lightroom
  const handleCopiarNombres = () => {
    const elegidasPorCliente = fotos.filter((foto) => foto.seleccionada);
    if (elegidasPorCliente.length === 0) return;
    const listaNombres = elegidasPorCliente.map((foto) => foto.nombre_archivo).join(", ");
    navigator.clipboard.writeText(listaNombres).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };

  // Manejo manual de selección individual para borrados masivos
  const handleSelectFoto = (fotoId) => {
    setSelectedFotos((prevSelected) =>
      prevSelected.includes(fotoId) ? prevSelected.filter((id) => id !== fotoId) : [...prevSelected, fotoId],
    );
  };

  // --- CONTROLADORES DE EVENTOS DRAG & DROP ---
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragActive(true);
    else if (e.type === "dragleave") setIsDragActive(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const archivosSubidos = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"));
      await procesarYSubirArchivos(archivosSubidos);
    }
  };

  // -------------------------------------------------------------------------
  // 12. EXPOSICIÓN MAESTRA DEL HOOK (API Interface)
  // -------------------------------------------------------------------------
  return {
    state: {
      proyecto,
      fotos,
      loading,
      uploading,
      isDragActive,
      selectedFotos,
      modalEliminarProyecto,
      modalEliminar,
      modalEliminarMasivo,
      modalComentario,
      modalCompartir,
      filtroElegidas,
      fotosVisibles,
      copiado,
      enlaceCopiado,
      urlPublica,
      fotosFiltradas,
      fotosMostradas,
    },
    actions: {
      setModalEliminarProyecto,
      setModalEliminar,
      setModalEliminarMasivo,
      setModalComentario,
      setModalCompartir,
      setFiltroElegidas,
      setSelectedFotos,
      procesarYSubirArchivos,
      ejecutarEliminarFoto,
      abrirConfirmacionMasiva,
      ejecutarEliminarMasivo,
      ejecutarEliminarProyecto,
      handleCopiarEnlaceCompartir,
      handleCopiarNombres,
      handleSelectFoto,
      handleDrag,
      handleDrop,
    },
    refs: {
      ultimaFotoRef,
    },
  };
}
