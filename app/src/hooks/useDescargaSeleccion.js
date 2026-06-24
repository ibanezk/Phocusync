import { useState } from "react";
import JSZip from "jszip";

export function useDescargarSeleccion() {
  const [descargando, setDescargando] = useState(false);
  const [progreso, setProgreso] = useState(""); // Opcional: Para mostrar qué está haciendo

  const ejecutarDescargaLote = async (proyecto, favoritas, fotos) => {
    if (!proyecto?.permitir_descarga || favoritas.length === 0) return;

    setDescargando(true);
    setProgreso("Preparando archivos...");

    const zip = new JSZip();

    // Filtramos las fotos seleccionadas por el cliente
    const fotosADescargar = fotos.filter((foto) => favoritas.some((fav) => fav === foto.id || fav.id === foto.id));

    try {
      // Descargamos los archivos y los añadimos al ZIP
      for (let i = 0; i < fotosADescargar.length; i++) {
        const foto = fotosADescargar[i];
        setProgreso(`Comprimiendo foto ${i + 1} de ${fotosADescargar.length}...`);

        try {
          const respuesta = await fetch(foto.url);
          if (!respuesta.ok) throw new Error("Error en la descarga del archivo");

          const blob = await respuesta.blob();

          // Definimos el nombre que tendrá el archivo DENTRO del zip
          const nombreArchivo = foto.nombre_archivo || `foto_${i + 1}.jpg`;

          // Metemos el blob al zip
          zip.file(nombreArchivo, blob);
        } catch (err) {
          console.error(`No se pudo agregar la foto ${foto.id} al ZIP:`, err);
        }
      }

      setProgreso("Generando archivo ZIP...");

      // Generamos el archivo comprimido final como un Blob
      const zipBlob = await zip.generateAsync({ type: "blob" });

      // Creamos el enlace de descarga único para el ZIP
      const urlBlob = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = urlBlob;

      // Nombre del archivo comprimido que se descargará en la PC
      const nombreZip = `${proyecto.nombre || "seleccion"}_fotos.zip`.replace(/\s+/g, "_");
      link.download = nombreZip;

      document.body.appendChild(link);
      link.click();

      // Limpieza de memoria
      document.body.removeChild(link);
      URL.revokeObjectURL(urlBlob);
    } catch (error) {
      console.error("Error al generar el archivo comprimido:", error);
    } finally {
      setDescargando(false);
      setProgreso("");
    }
  };

  return {
    descargando,
    progreso, // Puedes usar este string en tu interfaz para decirle al usuario qué pasa
    ejecutarDescargaLote,
  };
}
