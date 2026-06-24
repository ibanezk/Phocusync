import React from "react";
import { motion } from "framer-motion";

export default function ToggleDescargas({ permitirDescargas, onToggle, disabled }) {
  return (
    <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-2 px-3 rounded-lg h-10 shrink-0 select-none">
      {/* Texto indicador */}
      <div className="flex items-center gap-1.5">
        <span className="text-sm">{permitirDescargas ? "🔓" : "🔒"}</span>
        <span
          className={`text-[11px] font-bold tracking-wider uppercase transition-colors duration-200 ${permitirDescargas ? "text-[#ff4d00]" : "text-gray-400"}`}>
          {permitirDescargas ? "Descargas Permitidas" : "Descargas Bloqueadas"}
        </span>
      </div>

      {/* El Switch Deslizante */}
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 focus:outline-none disabled:opacity-40 ${
          permitirDescargas ? "bg-[#ff4d00]" : "bg-white/10"
        }`}>
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 700, damping: 30 }}
          className="bg-[#061115] w-4 h-4 rounded-full shadow-md"
          animate={{ x: permitirDescargas ? 20 : 0 }}
        />
      </button>
    </div>
  );
}
