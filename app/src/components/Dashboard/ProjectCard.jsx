/* ========================================================================= */
/* Proyecto: PhocuSync SaaS Portal                                           */
/* Componente: ProjectCard.jsx                                               */
/* Propósito: Tarjeta interactiva para previsualizar y gestionar un proyecto */
/* ========================================================================= */

import { motion } from "framer-motion";

// Función auxiliar encargada de retornar las clases de Tailwind según el estado actual
const obtenerEstiloEstado = (estado) => {
  if (!estado) return "border-gray-500/20 text-gray-400 bg-gray-500/5";

  switch (estado.toLowerCase()) {
    case "aprobado":
      return "border-[#00ff88]/20 text-[#00ff88] bg-[#00ff88]/5";
    case "en revision": // Excelente control para tolerar variaciones con o sin tilde en base de datos
      return "border-amber-400/20 text-amber-400 bg-amber-400/10";
    case "borrador":
      return "border-blue-400/20 text-blue-400 bg-blue-400/5";
    default:
      return "border-gray-500/20 text-gray-400 bg-gray-500/5";
  }
};

export default function ProjectCard({ proyecto, index, onManage }) {
  return (
    <motion.div
      layout // Permite que Framer Motion anime la reubicación en el grid si cambian de orden
      initial={{ opacity: 0, y: 15 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { delay: index * 0.04 }, // Animación escalonada (staggered effect) basada en el índice
      }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3, borderColor: "rgba(255,77,0,0.3)" }} // Efecto visual sutil de elevación y color de marca al pasar el mouse
      className="bg-[#09171d] border border-white/5 p-6 flex flex-col justify-between h-44 cursor-default transition-colors duration-200 group">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          {/* Badge dinámico de Estado del Proyecto */}
          <span
            className={`inline-block text-[9px] tracking-widest uppercase px-2 py-0.5 border font-semibold ${obtenerEstiloEstado(proyecto.estado)}`}>
            {proyecto.estado || "Borrador"}
          </span>

          {/* Contador con pluralización condicional */}
          <span className="text-[11px] font-mono text-gray-500 flex items-center gap-1">
            <svg
              className="w-3.5 h-3.5 opacity-60"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {proyecto.totalFotos} {proyecto.totalFotos === 1 ? "foto" : "fotos"}
          </span>
        </div>

        {/* Título de la galería con truncado seguro para evitar desbordes de texto */}
        <h3 className="text-lg font-medium text-white group-hover:text-[#ff4d00] transition-colors truncate pt-1">
          {proyecto.nombre}
        </h3>
      </div>

      {/* Sección inferior: Fecha de creación localizada y disparador de gestión */}
      <div className="flex justify-between items-center pt-4 border-t border-white/5 text-xs text-gray-500">
        <span>{new Date(proyecto.creado_en).toLocaleDateString()}</span>
        <button
          onClick={onManage}
          className="text-white hover:text-[#ff4d00] transition-colors tracking-wider uppercase text-[10px] font-semibold">
          Gestionar →
        </button>
      </div>
    </motion.div>
  );
}
