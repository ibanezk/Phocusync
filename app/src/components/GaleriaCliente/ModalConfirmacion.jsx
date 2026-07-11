/* ========================================================================= */
/* Proyecto: PhocuSync SaaS Portal                                           */
/* Componente: ModalConfirmacion.jsx                                         */
/* Descripción: Ventana modal de confirmación crítica e irreversible.         */
/*              Inyecta fricción visual y lógica para asegurar la aprobación */
/*              final de la selección del carrete fotográfico.               */
/* ========================================================================= */

import React from "react";

export default function ModalConfirmacion({ mostrar, favoritasCount, onClose, onConfirm }) {
  // CLÁUSULA DE ESCAPE: Si el estado global del hook no lo requiere, abortamos renderizado
  if (!mostrar) return null;

  return (
    // CONTENEDOR MURAL (OVERLAY GLASSMORPHISM)
    // Coincide simétricamente con el lenguaje visual de desenfoque de los cargadores del sistema
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      {/* TARJETA DE DIÁLOGO */}
      <div className="bg-[#121214] border border-white/10 rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl relative overflow-hidden">
        {/* Detalle visual superior: Línea de acento estilo Neon Amber */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

        {/* Ícono de advertencia con contenedor de bajo contraste */}
        <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center text-lg mx-auto mb-4 border border-amber-500/20">
          ⚠️
        </div>

        {/* TEXTOS INFORMATIVOS Y CONTROL DE COPIAS */}
        <h3 className="text-xs font-bold tracking-widest uppercase text-white mb-2">¿Confirmar Selección?</h3>

        <p className="text-[13px] text-gray-400 normal-case tracking-normal leading-relaxed mb-6">
          ¿Estás seguro de enviar tu selección de <span className="text-white font-bold">{favoritasCount}</span>{" "}
          {/* Interpolación limpia para gramática exacta en español */}
          {favoritasCount === 1 ? "foto" : "fotos"}?{" "}
          <span className="text-amber-400 block mt-1 font-mono text-[12px]">
            Se cerrará la edición y no podrás hacer cambios.
          </span>
        </p>

        {/* GRILLA DE ACCIONES TRANSACCIONALES */}
        <div className="flex gap-3">
          {/* BOTÓN NEGATIVO / CANCELAR */}
          <button
            onClick={onClose}
            className="flex-1 h-9 rounded-lg bg-white/5 border border-white/5 text-gray-400 hover:text-white text-[10px] uppercase font-bold tracking-widest transition-all">
            Cancelar
          </button>

          {/* BOTÓN POSITIVO / EJECUTAR TRANSMISIÓN */}
          <button
            onClick={onConfirm}
            className="flex-1 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-[10px] uppercase font-bold tracking-widest transition-all">
            Sí, Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
