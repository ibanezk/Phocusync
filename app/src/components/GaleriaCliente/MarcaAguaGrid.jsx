/* ========================================================================= */
/* Proyecto: PhocuSync SaaS Portal                                           */
/* Componente: MarcaAguaGrid.jsx                                             */
/* Descripción: Malla de protección de propiedad intelectual mediante SVG.     */
/*              Genera un patrón repetitivo e inclinado sobre el visor de    */
/*              fotos con resistencia a fondos de alta luminosidad.          */
/* ========================================================================= */

import React from "react";

export default function MarcaAguaGrid({ texto }) {
  // FALLBACK SEMÁNTICO: Si el perfil del fotógrafo no define un string explícito,
  // se utiliza una advertencia legal estándar de protección.
  const textoMarca = texto || "PROPIEDAD INTELECTUAL";

  return (
    // CAPA DE SEGURIDAD ABSOLUTA:
    // 'pointer-events-none' es vital para no romper los listeners de Swipe/Touch del Visor.
    // 'select-none' evita que el usuario pueda arrastrar o seleccionar el texto de protección.
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-10 opacity-15">
      <svg className="w-full h-full">
        <defs>
          {/* DEFINICIÓN DEL PATRÓN MURAL:
              'userSpaceOnUse' fija las dimensiones en píxeles absolutos.
              'patternTransform' genera la inclinación angular óptima de la grilla. */}
          <pattern
            id="grid-watermark"
            width="200"
            height="60"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-30)">
            {/* ELEMENTO TEXTUAL RENDERIZADO POR HARDWARE */}
            {/* 'drop-shadow' inyecta un contraste oscuro indispensable para superficies blancas */}
            <text
              x="10"
              y="55"
              fill="#ffffff"
              fontSize="11"
              fontWeight="600"
              letterSpacing="1"
              className="fill-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
              {textoMarca.toUpperCase()}
            </text>
          </pattern>
        </defs>

        {/* RECTÁNGULO DE COBERTURA: Renderiza el patrón infinito rellenando el 100% del contenedor */}
        <rect width="100%" height="100%" fill="url(#grid-watermark)" />
      </svg>
    </div>
  );
}
