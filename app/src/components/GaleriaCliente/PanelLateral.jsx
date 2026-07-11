/* ========================================================================= */
/* Proyecto: PhocuSync SaaS Portal                                           */
/* Componente: PanelLateral.jsx                                              */
/* Descripción: Panel interactivo de control de metadatos, selección de       */
/*              favoritas y redacción de notas de retoque automatizadas.    */
/* ========================================================================= */

import React from "react";

export default function PanelLateral({
  fotoActual,
  seleccionGuardada,
  esFavorita,
  handleToggleFavorita,
  comentarioLocal,
  setComentarioLocal,
  guardarComentarioEnBD,
  permitirDescarga,
}) {
  // Manejo defensivo: Si el carrete de fotos está vacío o cargando, evitamos excepciones en tiempo de ejecución
  if (!fotoActual) return null;

  return (
    // CONTENEDOR RESPONSIVO GLOBAL: Cambia de orientación de flujo y bordes dinámicamente según el viewport
    <div className="w-full md:w-80 bg-[#09171d] border-t md:border-t-0 md:border-l border-white/5 p-6 flex flex-col justify-between shrink-0 h-full overflow-y-auto">
      <div className="space-y-6">
        {/* IDENTIFICADOR METADATO DEL ARCHIVO */}
        <div className="border-b border-white/5 pb-4">
          {/* El atributo 'title' nativo funciona como tooltip de respaldo si el nombre excede el espacio */}
          <p className="text-[10px] text-gray-400 font-mono tracking-wide truncate" title={fotoActual.nombre_archivo}>
            {fotoActual.nombre_archivo}
          </p>
        </div>

        {/* MÓDULO INTERACTIVO DE SELECCIÓN (FAVORITO) */}
        <div className="flex flex-col items-center py-5 bg-[#061115]/50 border border-white/5 p-4">
          <button
            onClick={() => handleToggleFavorita(fotoActual.id)}
            disabled={seleccionGuardada} // Congela el control post-aprobación final
            className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-200 border transform active:scale-95 ${
              esFavorita
                ? "bg-[#ff4d00]/10 border-[#ff4d00] text-[#ff4d00] shadow-[0_0_20px_rgba(255,77,0,0.2)]"
                : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/30"
            }`}>
            {esFavorita ? "⭐" : "☆"}
          </button>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-2.5 font-semibold">
            {esFavorita ? "Fotografía Seleccionada" : "Elegir esta foto"}
          </p>
        </div>

        {/* ÁREA DE ANOTACIONES DE RETOQUE */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block">
            Notas para el fotógrafo:
          </label>
          <textarea
            // Si no es favorita, forzamos que se vea vacío visualmente en lo que se limpia el estado
            value={esFavorita ? comentarioLocal : ""}
            // DOBLE CANDADO: Se bloquea si la selección global se cerró O si esta foto no está elegida
            disabled={seleccionGuardada || !esFavorita}
            onChange={(e) => setComentarioLocal(e.target.value)} // Mutación de UI reactiva e inmediata
            onBlur={() => guardarComentarioEnBD(fotoActual.id, comentarioLocal)} // Sincronización asíncrona optimizada en pérdida de foco
            placeholder={
              seleccionGuardada
                ? "Sin comentarios."
                : !esFavorita
                  ? "Selecciona la foto con la estrella para poder comentar 🔒"
                  : "Escribe indicaciones de retoque aquí..."
            }
            // ESTILOS DINÁMICOS: Cambia el fondo, bordes, texto y cursor si está bloqueado
            className={`w-full h-32 p-3 text-xs font-light transition-all resize-none rounded-none focus:outline-none ${
              seleccionGuardada || !esFavorita
                ? "bg-[#061115]/20 border-white/5 text-gray-600 cursor-not-allowed placeholder-gray-600 select-none"
                : "bg-[#061115] border border-white/10 text-white placeholder-gray-600 focus:border-[#ff4d00]"
            }`}
          />
          {/* Feedback implícito: Solo se muestra si el text-area está realmente activo para no confundir */}
          {!seleccionGuardada && esFavorita && (
            <span className="text-[9px] text-gray-500 block text-right italic font-mono">
              Se guarda automáticamente al hacer clic fuera.
            </span>
          )}
        </div>
      </div>

      {/* BLOQUEO VISUAL DE SEGURIDAD INTERFAZ (READ-ONLY BANNER) */}
      {seleccionGuardada && (
        <div className="bg-[#0c1f27] border border-[#00ff88]/10 p-3 text-center text-[10px] text-[#00ff88] font-mono mt-4">
          La selección está cerrada.
        </div>
      )}
    </div>
  );
}
