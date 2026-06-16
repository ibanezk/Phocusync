import React from "react";

export default function HeaderGaleria({
  proyecto,
  favoritasCount,
  fotosCount,
  seleccionGuardada,
  enviando,
  abrirPreguntaEnvio,
}) {
  return (
    <header className="h-20 border-b border-white/5 px-6 flex items-center justify-between bg-[#09171d] shrink-0 z-10">
      <div className="space-y-0.5">
        <span className="text-[9px] tracking-widest text-[#ff4d00] uppercase font-bold block">
          Galería de Revisión Privada
        </span>
        <h1 className="text-xl font-bold text-white tracking-tight truncate max-w-xs sm:max-w-xl">{proyecto.nombre}</h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right hidden sm:block border-r border-white/5 pr-6">
          <p className="text-[9px] uppercase tracking-widest text-gray-400 font-light">Elegidas</p>
          <p className="text-sm font-mono font-bold text-white mt-0.5">
            ⭐ {favoritasCount} <span className="text-xs text-gray-500">/ {fotosCount}</span>
          </p>
        </div>

        {!seleccionGuardada ? (
          <button
            onClick={abrirPreguntaEnvio}
            disabled={enviando || favoritasCount === 0}
            className={`px-5 py-2 text-xs tracking-widest uppercase font-bold border transition-all ${
              favoritasCount > 0
                ? "bg-[#ff4d00] border-[#ff4d00] text-white hover:bg-white hover:text-black hover:border-white"
                : "border-white/5 text-gray-600 cursor-not-allowed"
            }`}>
            {enviando ? "Enviando..." : "Enviar al Fotógrafo"}
          </button>
        ) : (
          <span className="px-4 py-2 text-xs tracking-widest uppercase bg-[#0c1f27] text-[#00ff88] font-bold border border-[#00ff88]/20">
            ✓ Selección Enviada
          </span>
        )}
      </div>
    </header>
  );
}
