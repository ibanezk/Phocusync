/* ========================================================================= */
/* Proyecto: PhocuSync SaaS Portal                                           */
/* Componente: VisorFotos.jsx                                                */
/* Descripción: Teatro de visualización principal. Administra la navegación  */
/*              por gestos, bloqueos de seguridad y el renderizado           */
/*              condicional de la grilla de marcas de agua.                  */
/* ========================================================================= */

import React from "react";
import MarcaAguaGrid from "./MarcaAguaGrid";

export default function VisorFotos({
  fotoActual,
  currentIndex,
  fotosCount,
  navegarIzquierda,
  navegarDerecha,
  manejarTouchStart,
  manejarTouchMove,
  manejarTouchEnd,
  textoMarcaAgua,
  forzar_marca_agua,
  permitirDescarga,
  esFavorita,
}) {
  return (
    // CONTENEDOR ANCLA DE EVENTOS TÁCTILES: Capta los gestos de Swipe mapeados en el hook de la galería
    <div
      onTouchStart={manejarTouchStart}
      onTouchMove={manejarTouchMove}
      onTouchEnd={manejarTouchEnd}
      className="bg-[#03090b] w-full h-[55vh] min-h-[380px] md:h-full md:flex-1 flex items-center justify-center relative px-0 sm:px-6 select-none overflow-hidden">
      {/* CONTROL DE NAVEGACIÓN ANTERIOR (Solo Desktop) */}
      <button
        onClick={navegarIzquierda}
        className="absolute left-4 z-40 text-gray-500 hover:text-[#ff4d00] transition-colors p-2 text-2xl hidden md:block"
        aria-label="Foto anterior">
        &lt;
      </button>

      {/* CONTENEDOR DE PROTECCIÓN INTELECTUAL */}
      {/* 'onContextMenu' neutraliza la descarga nativa por click derecho en navegadores de escritorio */}
      <div
        onContextMenu={(e) => e.preventDefault()}
        className="w-full h-full md:max-w-[85%] flex items-center justify-center relative z-10">
        {/* RENDERIZADO DE IMAGEN POR HARDWARE */}
        {/* 'pointer-events-none' evita el arrastre fantasma del archivo binario */}
        <img
          src={fotoActual?.url}
          alt="Fotografía de la sesión"
          className="w-full md:w-auto max-w-full max-h-full object-contain shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/5 dynamic-image pointer-events-none select-none relative z-10"
        />

        {/* INYECCIÓN DINÁMICA DE MARCA DE AGUA */}
        {/* Se ejecuta del lado del cliente mediante vectores SVG si el fotógrafo activó la restricción comercial */}
        {forzar_marca_agua && <MarcaAguaGrid texto={textoMarcaAgua} />}

        {/* =========================================================================
            INDICADOR DE ESTADO DE ENTREGA (Badge flotante UI/UX)
            ========================================================================= */}
        {permitirDescarga && (
          <div className="absolute top-4 left-4 z-30 pointer-events-none select-none">
            {esFavorita ? (
              <span className="bg-emerald-500/90 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-sm shadow-xl flex items-center gap-1.5 backdrop-blur-xs border border-emerald-400/20">
                <span className="text-xs">✓</span> Incluida en la entrega
              </span>
            ) : (
              <span className="bg-black/70 text-gray-400 text-[10px] font-medium uppercase tracking-widest px-2.5 py-1.5 rounded-sm shadow-xl border border-white/5 backdrop-blur-xs">
                🚫 No seleccionada
              </span>
            )}
          </div>
        )}
      </div>

      {/* CONTROL DE NAVEGACIÓN SIGUIENTE (Solo Desktop) */}
      <button
        onClick={navegarDerecha}
        className="absolute right-4 z-40 text-gray-500 hover:text-[#ff4d00] transition-colors p-2 text-2xl hidden md:block"
        aria-label="Siguiente foto">
        &gt;
      </button>

      {/* INDICADOR NUMÉRICO METRIC-BASED */}
      {/* 'backdrop-blur-sm' y el fondo semitransparente permiten ver la composición de la foto por detrás sin perder legibilidad */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 text-[11px] font-mono tracking-widest text-gray-500 border border-white/5 backdrop-blur-sm z-30">
        {currentIndex + 1} / {fotosCount}
      </div>
    </div>
  );
}
