/* ========================================================================= */
/* Proyecto: PhocuSync SaaS Portal                                           */
/* Componente: SeccionPerfil.jsx                                             */
/* Descripción: Subpanel de personalización estética y branding comercial.   */
/*              Maneja campos de identidad de marca, protección visual y    */
/*              control de firmas asíncronas para el fotógrafo.              */
/* ========================================================================= */

import React from "react";
import { motion } from "framer-motion";

export default function SeccionPerfil({
  cargandoPerfil,
  nombreEstudio,
  setNombreEstudio,
  instagram,
  setInstagram,
  marcaAgua,
  setMarcaAgua,
  guardando,
  handleGuardarPerfil,
}) {
  // RETORNO TEMPRANO: Evita destellos de inputs vacíos mientras se hidrata el estado desde Supabase
  if (cargandoPerfil) {
    return (
      <p className="text-xs text-gray-500 animate-pulse uppercase tracking-wider font-mono">Sincronizando perfil...</p>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="space-y-6">
      {/* CABECERA INFORMATIVA DE LA SECCIÓN */}
      <div>
        <h3 className="text-lg font-medium text-white">Perfil del Fotógrafo</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Esta información será visible en el portafolio y en el pie de página de tus entregas.
        </p>
      </div>

      {/* REJILLA DE IDENTIDAD COMERCIAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Campo: Nombre del Estudio */}
        <div className="flex flex-col space-y-2">
          <label className="text-xs uppercase tracking-widest font-semibold text-gray-400">Nombre del Estudio</label>
          <input
            type="text"
            value={nombreEstudio}
            onChange={(e) => setNombreEstudio(e.target.value)}
            placeholder="Ej. Phocus Studio"
            className="bg-[#061115] border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff4d00] transition-colors rounded-sm"
          />
        </div>

        {/* Campo: Instagram */}
        <div className="flex flex-col space-y-2">
          <label className="text-xs uppercase tracking-widest font-semibold text-gray-400">Instagram Comercial</label>
          <input
            type="text"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="@tuusuario"
            className="bg-[#061115] border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff4d00] transition-colors rounded-sm"
          />
        </div>
      </div>

      {/* BLOQUE DE PROTECCIÓN VISUAL (Marca de agua global) */}
      <div className="flex flex-col space-y-2">
        <label className="text-xs uppercase tracking-widest font-semibold text-gray-400">Marca de Agua (Texto)</label>
        <input
          type="text"
          value={marcaAgua}
          onChange={(e) => setMarcaAgua(e.target.value)}
          placeholder="© Phocusync 2026 - Todos los derechos reservados"
          className="bg-[#061115] border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff4d00] transition-colors rounded-sm"
        />
      </div>

      {/* CONTROL DE PERSISTENCIA Y ACCIONES */}
      <div className="pt-4 border-t border-white/5">
        <button
          onClick={handleGuardarPerfil}
          disabled={guardando}
          className="bg-[#ff4d00] text-white text-xs tracking-widest uppercase font-semibold px-6 py-3 hover:bg-[#e04400] transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-sm shadow-md">
          {guardando ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </motion.div>
  );
}
