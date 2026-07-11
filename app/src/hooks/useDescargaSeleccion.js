/* ========================================================================= */
/* Proyecto: PhocuSync SaaS Portal                                           */
/* Hook: useDescargarSeleccion.js                                            */
/* Descripción: Microservicio en el cliente para la descarga por lotes.     */
/*              Descarga imágenes asíncronas de forma concurrente, genera   */
/*              un contenedor binario comprimido (.ZIP) y dispara el stream. */
/* ========================================================================= */

import { useState } from "react";
import JSZip from "jszip";

export function useDescargarSeleccion() {
  const [descargando, setDescargando] = useState(false);
  const [progreso, setProgreso] = useState(""); // Expone el string de estado para la barra de UI

  const ejecutarDescargaLote = async (proyecto, favoritas, fotos) => {
    // CLÁUSULA DE RESTRICCIÓN COMERCIAL: Valida permisos de descarga y existencia de ítems
    if (!proyecto?.permitir_descarga || favoritas.length === 0) return;

    setDescargando(true);
    setProgreso("Preparando archivos...");

    const zip = new JSZip();

    // FILTRADO ROBUSTO: Mapea el cruce de IDs soportando tanto strings nativos como objetos compuestos
    const fotosADescargar = fotos.filter((foto) => favoritas.some((fav) => fav === foto.id || fav.id === foto.id));

    try {
      // PROCESAMIENTO SECUENCIAL / STREAMING DE RECURSOS
      for (let i = 0; i < fotosADescargar.length; i++) {
        const foto = fotosADescargar[i];
        setProgreso(`Comprimiendo foto ${i + 1} de ${fotosADescargar.length}...`);

        try {
          // Petición HTTP directa para transformar la URL remota de Storage en binario crudo
          const respuesta = await fetch(foto.url);
          if (!respuesta.ok) throw new Error("Error en la descarga del archivo");

          const blob = await respuesta.blob();

          // Fallback de asignación semántica para el nombre del archivo dentro del contenedor comprimido
          const nombreArchivo = foto.nombre_archivo || `foto_${i + 1}.jpg`;

          // Inyección del búfer binario en el árbol virtual del ZIP
          zip.file(nombreArchivo, blob);
        } catch (err) {
          // AISLAMIENTO DE ERRORES: Si una foto falla, el bucle continúa con las demás sin romper la descarga general
          console.error(`No se pudo agregar la foto ${foto.id} al ZIP:`, err);
        }
      }

      setProgreso("Generando archivo ZIP...");

      // COMPRESIÓN ASÍNCRONA: Compila el árbol virtual a un único Blob binario final
      const zipBlob = await zip.generateAsync({ type: "blob" });

      // DISPARADOR DE DESCARGA VIRTUAL (DOM SYNTHETIC CLICK)
      const urlBlob = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = urlBlob;

      // Sanitización de strings: Reemplaza espacios por caracteres limpios para evitar roturas de URL en SO antiguos
      const nombreZip = `${proyecto.nombre || "seleccion"}_fotos.zip`.replace(/\s+/g, "_");
      link.download = nombreZip;

      // Inyección transitoria en el árbol del DOM para simular la acción del usuario
      document.body.appendChild(link);
      link.click();

      // RECOLECCIÓN DE RESIDUOS (CLEANUP): Remueve el nodo del árbol y libera el puntero de memoria del Blob
      document.body.removeChild(link);
      URL.revokeObjectURL(urlBlob);
    } catch (error) {
      console.error("Error crítico al generar el archivo comprimido:", error);
    } finally {
      // RESET DE ESTADOS DE INTERFAZ
      setDescargando(false);
      setProgreso("");
    }
  };

  return {
    descargando,
    progreso,
    ejecutarDescargaLote,
  };
}
