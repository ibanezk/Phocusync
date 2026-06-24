import React from "react";

export default function MarcaAguaGrid({ texto }) {
  const textoMarca = texto || "PROPIEDAD INTELECTUAL";

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-10 opacity-15">
      <svg className="w-full h-full">
        <defs>
          {/* Reducimos de 180 a 110 para compactar la grilla horizontal y verticalmente */}
          <pattern
            id="grid-watermark"
            width="200"
            height="60"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-30)">
            {/* Ajustamos las coordenadas x/y y bajamos un pelín el tamaño de fuente (fontSize) */}
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

        <rect width="100%" height="100%" fill="url(#grid-watermark)" />
      </svg>
    </div>
  );
}
