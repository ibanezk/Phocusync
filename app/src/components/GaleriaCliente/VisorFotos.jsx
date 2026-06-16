import React from "react";

export default function VisorFotos({
  fotoActual,
  currentIndex,
  fotosCount,
  navegarIzquierda,
  navegarDerecha,
  manejarTouchStart,
  manejarTouchMove,
  manejarTouchEnd,
}) {
  return (
    <div
      onTouchStart={manejarTouchStart}
      onTouchMove={manejarTouchMove}
      onTouchEnd={manejarTouchEnd}
      className="bg-[#03090b] w-full h-[55vh] min-h-[380px] md:h-full md:flex-1 flex items-center justify-center relative p-4 select-none overflow-hidden">
      {/* ◀️ FLECHA ANTERIOR */}
      <button
        onClick={navegarIzquierda}
        className="absolute left-4 z-20 text-gray-500 hover:text-[#ff4d00] transition-colors p-2 text-2xl hidden md:block"
        aria-label="Foto anterior">
        &lt;
      </button>

      {/* 📸 CONTENEDOR DE LA IMAGEN */}
      <div className="w-full h-full max-w-[80%] md:max-w-[85%] flex items-center justify-center">
        <img
          src={fotoActual.url}
          alt="Fotografía de la sesión"
          className="max-w-full max-h-full object-contain shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/5 dynamic-image"
        />
      </div>

      {/* ➡️ FLECHA SIGUIENTE */}
      <button
        onClick={navegarDerecha}
        className="absolute right-4 z-20 text-gray-500 hover:text-[#ff4d00] transition-colors p-2 text-2xl hidden md:block"
        aria-label="Siguiente foto">
        &gt;
      </button>

      {/* 🔢 CONTADOR NUMÉRICO DISCRETO */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 text-[11px] font-mono tracking-widest text-gray-500 border border-white/5 backdrop-blur-sm">
        {currentIndex + 1} / {fotosCount}
      </div>
    </div>
  );
}
