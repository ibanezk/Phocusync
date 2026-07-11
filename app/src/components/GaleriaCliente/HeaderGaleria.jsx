/* ========================================================================= */
/* Proyecto: PhocuSync SaaS Portal                                           */
/* Componente: HeaderGaleria.jsx                                             */
/* Descripción: Barra superior interactiva de la galería de clientes.        */
/*              Muestra metadatos del proyecto, métricas en tiempo real y    */
/*              orquesta el flujo transaccional de aprobación final.         */
/* ========================================================================= */

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
    // ESTRATEGIA DE CONTENEDOR: 'shrink-0' congela la altura fija en layouts flex verticales
    // y el 'z-10' asegura que los banners animados se deslicen por debajo sin colisiones ópticas.
    <header className="h-20 border-b border-white/5 px-6 flex items-center justify-between bg-[#09171d] shrink-0 z-10">
      {/* SECCIÓN IZQUIERDA: Identidad Contextual de la Galería */}
      <div className="space-y-0.5">
        <span className="text-[9px] tracking-widest text-[#ff4d00] uppercase font-bold block">
          Galería de Revisión Privada
        </span>
        {/* CONTROL DE TRUNCADO: Evita roturas de layout si el nombre del proyecto es muy extenso */}
        <h1 className="text-xl font-bold text-white tracking-tight truncate max-w-xs sm:max-w-xl">{proyecto.nombre}</h1>
      </div>

      {/* SECCIÓN DERECHA: Métricas de Selección y Triggers de Envío */}
      <div className="flex items-center gap-6">
        {/* CONTADOR DE FAVORITOS RESPONSIVO: Se oculta en móviles para resguardar la limpieza visual */}
        <div className="text-right hidden sm:block border-r border-white/5 pr-6">
          <p className="text-[9px] uppercase tracking-widest text-gray-400 font-light">Elegidas</p>
          <p className="text-sm font-mono font-bold text-white mt-0.5">
            ⭐ {favoritasCount} <span className="text-xs text-gray-500">/ {fotosCount}</span>
          </p>
        </div>

        {/* MÁQUINA DE ESTADOS VISUAL: Alterna dinámicamente entre acción y confirmación inmutable */}
        {!proyecto?.permitir_descarga &&
          (!seleccionGuardada ? (
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
          ))}
      </div>
    </header>
  );
}
