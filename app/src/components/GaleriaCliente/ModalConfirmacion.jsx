import React from "react";

export default function ModalConfirmacion({ mostrar, favoritasCount, onClose, onConfirm }) {
  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="bg-[#121214] border border-white/10 rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
        <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center text-lg mx-auto mb-4 border border-amber-500/20">
          ⚠️
        </div>
        <h3 className="text-xs font-bold tracking-widest uppercase text-white mb-2">¿Confirmar Selección?</h3>
        <p className="text-[13px] text-gray-400 normal-case tracking-normal leading-relaxed mb-6">
          ¿Estás seguro de enviar tu selección de <span className="text-white font-bold">{favoritasCount}</span>{" "}
          {favoritasCount === 1 ? "foto" : "fotos"}?{" "}
          <span className="text-amber-400 block mt-1 font-mono text-[12px]">
            Se cerrará la edición y no podrás hacer cambios.
          </span>
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-9 rounded-lg bg-white/5 border border-white/5 text-gray-400 hover:text-white text-[10px] uppercase font-bold tracking-widest transition-all">
            Cancelar
          </button>
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
