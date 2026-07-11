/* ========================================================================= */
/* Proyecto: PhocuSync SaaS Portal                                           */
/* Componente: LoaderCargando.jsx                                            */
/* Descripción: Pantalla y overlay transaccional de carga.                  */
/*              Administra de manera polimórfica (vía props) la espera de    */
/*              datos mediante animaciones fluidas y desenfoque de fondo.   */
/* ========================================================================= */

import React from "react";

export default function LoaderCargando({ mensaje, submensaje, isOverlay = false }) {
  // 1. Configuramos las clases del contenedor según el caso
  const containerClasses = isOverlay
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn"
    : "min-h-screen bg-[#061115] flex flex-col items-center justify-center p-4";

  // 2. RETORNAMOS EL DISEÑO COMPLETO (Sin el "if" que cortaba el SVG)
  return (
    <div className={containerClasses}>
      {/* CONTENEDOR DE ICONOGRAFÍA ANIMADA */}
      <div className="relative flex items-center justify-center w-24 h-24 mb-3">
        {/* Aura de Iluminación Ambiental (Glowing Effect) */}
        <div className="absolute w-16 h-16 bg-[#FF4D00]/10 rounded-full blur-xl animate-pulse duration-1000" />

        {/* Gráfico SVG Dinámico */}
        <div className="w-12 h-12 flex-shrink-0 animate-bounce" style={{ animationDuration: "2s" }}>
          <svg width="100%" height="100%" viewBox="0 0 28 28" fill="none">
            <path
              d="M4 14.5C7 11 9 8 14 8C19 8 21 11 24 14.5"
              stroke="#FF4D00"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M4 20C7.5 16.2 10 14 14 14C18 14 20.5 16.5 24 20"
              stroke="#FF4D00"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeOpacity="0.7"
            />
            <path
              d="M6 8.5C8.5 5.5 11 4 14 4C17 4 19.5 6 22 8.5"
              stroke="#FF4D00"
              strokeWidth="2"
              strokeLinecap="round"
              strokeOpacity="0.5"
            />
          </svg>
        </div>
      </div>

      {/* TEXTO DE ESTADO PRINCIPAL */}
      <p className="text-[10px] uppercase font-bold tracking-widest text-gray-200 font-mono mt-2">{mensaje}</p>

      {/* SUBTEXTUALIZACIÓN INFORMATIVA CORTEZ */}
      {submensaje && <span className="text-[9px] text-gray-500 mt-1 normal-case tracking-normal">{submensaje}</span>}
    </div>
  );
}
