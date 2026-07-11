/* ========================================================================= */
/* Proyecto: PhocuSync SaaS Portal                                           */
/* Componente: AvisoNuevasFotos.jsx                                          */
/* Descripción: Toast flotante animado de tipo píldora (Pill) que notifica    */
/*              la inserción de archivos en tiempo real vía WebSockets.     */
/* ========================================================================= */

import React from "react";

export default function AvisoNuevasFotos() {
  return (
    // POSICIONAMIENTO ABSOLUTO / CAPA SUPERIOR:
    // 'fixed z-50' asegura que flote por encima de cualquier visor, carrusel o panel lateral.
    // 'left-1/2 -translate-x-1/2' es el estándar de oro para centrar elementos flotantes con precisión decimal.
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#09171d] text-white px-4 py-2.5 rounded-full flex items-center gap-3 shadow-[0_10px_30px_rgba(255,77,0,0.4)] border border-[#ff4d00] text-xs font-mono tracking-wider uppercase animate-bounce">
      {/* INDICADOR TEXTUAL CON ESTILO EDITORIAL */}
      {/* 'font-mono' y 'tracking-wider' le dan esa estética técnica, limpia y minimalista */}
      <span>📸 ¡El fotógrafo subió fotos nuevas!</span>
    </div>
  );
}
