import React from "react";

export default function PanelLateral({
  fotoActual,
  seleccionGuardada,
  esFavorita,
  handleToggleFavorita,
  comentarioLocal,
  setComentarioLocal,
  guardarComentarioEnBD,
}) {
  return (
    <div className="w-full md:w-80 bg-[#09171d] border-t md:border-t-0 md:border-l border-white/5 p-6 flex flex-col justify-between shrink-0 h-full overflow-y-auto">
      <div className="space-y-6">
        <div className="border-b border-white/5 pb-4">
          <p className="text-[10px] text-gray-400 font-mono tracking-wide truncate" title={fotoActual.nombre_archivo}>
            {fotoActual.nombre_archivo}
          </p>
        </div>

        <div className="flex flex-col items-center py-5 bg-[#061115]/50 border border-white/5 p-4">
          <button
            onClick={() => handleToggleFavorita(fotoActual.id)}
            disabled={seleccionGuardada}
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

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block">
            Notas para el fotógrafo:
          </label>
          <textarea
            value={comentarioLocal}
            disabled={seleccionGuardada}
            onChange={(e) => setComentarioLocal(e.target.value)}
            onBlur={() => guardarComentarioEnBD(fotoActual.id, comentarioLocal)}
            placeholder={seleccionGuardada ? "Sin comentarios." : "Escribe indicaciones de retoque aquí..."}
            className="w-full h-32 bg-[#061115] border border-white/10 p-3 text-xs font-light text-white placeholder-gray-600 focus:outline-none focus:border-[#ff4d00] transition-colors resize-none rounded-none"
          />
          {!seleccionGuardada && (
            <span className="text-[9px] text-gray-500 block text-right italic font-mono">
              Se guarda automáticamente al hacer clic fuera.
            </span>
          )}
        </div>
      </div>

      {seleccionGuardada && (
        <div className="bg-[#0c1f27] border border-[#00ff88]/10 p-3 text-center text-[10px] text-[#00ff88] font-mono mt-4">
          La selección está cerrada.
        </div>
      )}
    </div>
  );
}
