/* ========================================================================= */
/* Proyecto: PhocuSync SaaS Portal                                           */
/* Componente: ModalExito.jsx                                                */
/* Descripción: Ventana modal de cierre y éxito comercial.                  */
/*              Entrega feedback positivo e irreversible tras la aprobación  */
/*              correcta del carrete de fotos en Supabase.                   */
/* ========================================================================= */

import React from "react";

export default function ModalExito({ mostrar, onClose }) {
  // CLÁUSULA DE ESCAPE: Aborta el renderizado inmediatamente si el estado es inactivo
  if (!mostrar) return null;

  return (
    // CONTENEDOR FLOTANTE CON DESENFOQUE CINEMÁTICO
    // 'animate-fadeIn' suaviza la entrada para que la tarjeta no aparezca de golpe en la pantalla
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fadeIn">
      {/* TARJETA CENTRAL DE FEEDBACK */}
      <div className="bg-[#121214] border border-white/10 rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl relative overflow-hidden">
        {/* Línea de acento superior: Degradado en verde neón de éxito */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00ff88] to-transparent" />

        {/* Contenedor circular con aura de luz esmeralda */}
        <div className="w-16 h-16 bg-[#00ff88]/10 text-[#00ff88] rounded-full flex items-center justify-center text-2xl mx-auto mb-5 border border-[#00ff88]/20">
          ✨
        </div>

        {/* CONTENIDO TEXTUAL */}
        <h3 className="text-sm font-bold tracking-widest uppercase text-white mb-2">¡Selección Enviada!</h3>

        {/* Copia informativa de cortesía: Explica de forma clara el siguiente paso del proceso comercial */}
        <p className="text-[13px] text-gray-400 normal-case tracking-normal leading-relaxed mb-6">
          Tu fotógrafo ha sido notificado con las fotos que elegiste. Ya puede empezar a trabajar en la edición de tus
          capturas. ¡Gracias!
        </p>

        {/* ACCIÓN DE CIERRE (SAFE LAYOUT BUTTON) */}
        {/* Diseñado con alta tolerancia táctil y transiciones suaves para pantallas móviles */}
        <button
          onClick={onClose}
          className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 text-[10px] uppercase font-bold tracking-widest transition-all">
          Entendido
        </button>
      </div>
    </div>
  );
}
