import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ModalPlanes({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* 🛠️ FIJADO: Cambiado items-center por items-start md:items-center y añadido un padding vertical consistente */}
      <div className="fixed inset-0 z-50 flex justify-center items-start md:items-center p-4 md:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto py-12 md:py-6">
        {/* Fondo del modal interactivo para cerrar */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Contenedor Principal del Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-5xl bg-[#061115] border border-white/10 rounded-sm p-6 md:p-8 space-y-8 shadow-2xl z-10 my-auto">
          {/* Botón Cerrar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-white text-xs tracking-widest uppercase font-semibold transition-colors">
            [ Cerrar ]
          </button>

          {/* Encabezado */}
          <div className="text-center space-y-1">
            <h3 className="text-2xl font-semibold text-white tracking-tight">Mejorar tu Plan</h3>
            <p className="text-xs text-gray-400">Escala las capacidades de almacenamiento y gestión de PhocuSync.</p>
          </div>

          {/* Grid de Tres Columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch pt-2">
            {/* 1. PLAN STANDARD */}
            <div className="p-6 border border-white/5 bg-white/[0.01] rounded-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <p className="text-[11px] tracking-widest uppercase font-bold text-gray-400">Standard</p>
                  <div className="text-3xl font-mono font-medium text-white">$0</div>
                </div>

                <div className="text-xs space-y-3 pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Proyectos activos</span>
                    <span className="font-semibold text-white">Hasta 3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Almacenamiento</span>
                    <span className="font-semibold text-white">1 GB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Feedback visual</span>
                    <span className="font-semibold text-white">Ilimitado</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Soporte</span>
                    <span className="font-semibold text-white">Comunidad</span>
                  </div>
                </div>
              </div>

              <button className="w-full border border-white/10 hover:bg-white/5 text-white text-[10px] tracking-widest uppercase font-semibold py-3 transition-colors rounded-sm">
                Comenzar Gratis
              </button>
            </div>

            {/* 2. PLAN PRO STUDIO (Destacado en Naranja) */}
            {/* 🛠️ FIJADO: scale-105 ahora es md:scale-105 para evitar desbordes en layouts verticales de móvil */}
            <div className="p-6 border border-[#ff4d00]/40 bg-[#ff4d00]/5 rounded-sm flex flex-col justify-between space-y-6 relative shadow-lg shadow-[#ff4d00]/5 scale-100 md:scale-105 z-10">
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <p className="text-[11px] tracking-widest uppercase font-bold text-[#ff4d00]">Pro Studio</p>
                  <div className="text-3xl font-mono font-medium text-white">
                    $19<span className="text-xs font-sans text-gray-400">/mo</span>
                  </div>
                </div>

                <div className="text-xs space-y-3 pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Proyectos activos</span>
                    <span className="font-semibold text-white">Ilimitados</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Almacenamiento</span>
                    <span className="font-semibold text-white">50 GB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Historial versiones</span>
                    <span className="font-semibold text-white">30 días</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Soporte</span>
                    <span className="font-semibold text-white">Prioritario</span>
                  </div>
                </div>
              </div>

              <button className="w-full bg-transparent hover:bg-[#ff4d00]/10 border border-[#ff4d00] text-[#ff4d00] text-[10px] tracking-widest uppercase font-bold py-3 transition-all rounded-sm">
                Obtener Pro Studio
              </button>
            </div>

            {/* 3. PLAN AGENCY */}
            <div className="p-6 border border-white/5 bg-white/[0.01] rounded-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <p className="text-[11px] tracking-widest uppercase font-bold text-gray-400">Agency</p>
                  <div className="text-3xl font-mono font-medium text-white">
                    $49<span className="text-xs font-sans text-gray-400">/mo</span>
                  </div>
                </div>

                <div className="text-xs space-y-3 pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Todo de Pro Studio</span>
                    <span className="font-semibold text-white">Included</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Miembros de equipo</span>
                    <span className="font-semibold text-white">Hasta 5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Marca blanca</span>
                    <span className="font-semibold text-white text-right">Dominio propio</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Soporte</span>
                    <span className="font-semibold text-white">Dedicado 24/7</span>
                  </div>
                </div>
              </div>

              <button className="w-full border border-white/10 hover:bg-white/5 text-white text-[10px] tracking-widest uppercase font-semibold py-3 transition-colors rounded-sm">
                Contactar Ventas
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
