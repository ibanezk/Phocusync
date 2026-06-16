import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

export default function useDetalleProyecto(id, navigate) {
  const [proyecto, setProyecto] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFotos, setSelectedFotos] = useState([]);

  const [modalEliminarProyecto, setModalEliminarProyecto] = useState(false);
  const [modalEliminar, setModalEliminar] = useState({ isOpen: false, fotoId: null, fotoUrl: null });
  const [modalEliminarMasivo, setModalEliminarMasivo] = useState({ isOpen: false });
  const [modalComentario, setModalComentario] = useState({ isOpen: false, text: "", fotoUrl: "" });
  const [modalCompartir, setModalCompartir] = useState(false);

  const [filtroElegidas, setFiltroElegidas] = useState("todas");
  const [fotosVisibles, setFotosVisibles] = useState(12);
  const observerRef = useRef(null);

  const [copiado, setCopiado] = useState(false);
  const [enlaceCopiado, setEnlaceCopiado] = useState(false);
  const urlPublica = `${window.location.origin}/galeria/${id}`;

  const fetchFotos = useCallback(async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from("fotos")
      .select("*")
      .eq("proyecto_id", id)
      .order("creado_en", { ascending: false });

    if (!error && data) setFotos(data);
  }, [id]);

  const cargarDatos = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const { data: proyectoData, error: projError } = await supabase
        .from("proyectos")
        .select("*")
        .eq("id", id)
        .single();

      if (projError) throw projError;
      setProyecto(proyectoData);
      await fetchFotos();
    } catch (error) {
      console.error("Error crítico:", error.message);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, fetchFotos]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`admin-fotos-${id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "fotos", filter: `proyecto_id=eq.${id}` },
        (payload) => {
          setFotos((prev) => {
            if (prev.some((f) => f.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        },
      )
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "fotos" }, (payload) => {
        setFotos((prev) => prev.filter((f) => f.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  useEffect(() => {
    setFotosVisibles(12);
  }, [filtroElegidas]);

  const fotosFiltradas = fotos.filter((foto) => {
    if (filtroElegidas === "seleccionadas" && !foto.seleccionada) return false;
    if (filtroElegidas === "con_nota" && !foto.comentario) return false;
    return true;
  });

  const fotosMostradas = fotosFiltradas.slice(0, fotosVisibles);

  const ultimaFotoRef = useCallback(
    (node) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && fotosVisibles < fotosFiltradas.length) {
            setFotosVisibles((prev) => prev + 12);
          }
        },
        { threshold: 0.1 },
      );

      if (node) observerRef.current.observe(node);
    },
    [loading, fotosVisibles, fotosFiltradas.length],
  );

  const comprimirImagenNativa = (file) => {
    return new Promise((resolve) => {
      if (!file.type.startsWith("image/")) return resolve(file);
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

          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                type: "image/webp",
              });
              resolve(compressedFile);
            },
            "image/webp",
            0.8,
          );
        };
      };
    });
  };

  const procesarYSubirArchivos = async (listaArchivos) => {
    if (!listaArchivos || listaArchivos.length === 0) return;
    setUploading(true);

    for (let file of listaArchivos) {
      try {
        const archivoOptimizado = await comprimirImagenNativa(file);
        const fileExt = archivoOptimizado.name.split(".").pop();
        const nameOriginal = archivoOptimizado.name.substring(0, archivoOptimizado.name.lastIndexOf("."));
        const nameClean = nameOriginal
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-zA-Z0-9]/g, "_")
          .replace(/__+/g, "_");

        const fileName = `${nameClean}_${Date.now()}.${fileExt}`;
        const filePath = `${id}/${fileName}`;

        const { error: uploadError } = await supabase.storage.from("galerias").upload(filePath, archivoOptimizado);
        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("galerias").getPublicUrl(filePath);

        const { error: dbError } = await supabase
          .from("fotos")
          .insert([{ proyecto_id: id, url: publicUrl, nombre_archivo: file.name, size: archivoOptimizado.size }]);

        if (dbError) throw dbError;
      } catch (error) {
        console.error("Error en flujo de carga:", error.message);
      }
    }
    await fetchFotos();
    setUploading(false);
  };

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

  const abrirConfirmacionMasiva = () => {
    if (selectedFotos.length === 0) return;
    setModalEliminarMasivo({ isOpen: true });
  };

  const ejecutarEliminarMasivo = async () => {
    setModalEliminarMasivo({ isOpen: false });
    setUploading(true);
    try {
      const fotosABorrar = fotos.filter((f) => selectedFotos.includes(f.id));
      const filePaths = fotosABorrar
        .map((foto) => (foto?.url ? foto.url.split("/storage/v1/object/public/galerias/")[1] : null))
        .filter(Boolean);

      await supabase.storage.from("galerias").remove(filePaths);
      await supabase.from("fotos").delete().in("id", selectedFotos);
      await fetchFotos();
      setSelectedFotos([]);
    } catch (error) {
      console.error("Error en borrado masivo:", error.message);
    } finally {
      setUploading(false);
    }
  };

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
      navigate("/dashboard");
    } catch (error) {
      console.error("Error al eliminar proyecto:", error.message);
      setLoading(false);
    }
  };

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

  const handleCopiarNombres = () => {
    const elegidasPorCliente = fotos.filter((foto) => foto.seleccionada);
    if (elegidasPorCliente.length === 0) return;
    const listaNombres = elegidasPorCliente.map((foto) => foto.nombre_archivo).join(", ");
    navigator.clipboard.writeText(listaNombres).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };

  const handleSelectFoto = (fotoId) => {
    setSelectedFotos((prevSelected) =>
      prevSelected.includes(fotoId) ? prevSelected.filter((id) => id !== fotoId) : [...prevSelected, fotoId],
    );
  };

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
