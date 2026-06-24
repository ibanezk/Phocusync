// 📁 Tu nuevo src/views/PanelGalerias.jsx (Ultra limpio)
import { useGalerias } from "../hooks/useGalerias";
import { GaleriaCard } from "../components/Galeria/GaleriaCard";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function PanelGalerias() {
  const { galerias, loading, idCopiado, copiarEnlace } = useGalerias();
  const navigate = useNavigate();

  return (
    // 🎯 Reemplazamos el layout viejo por este div que se inyecta directo en el <Outlet />
    <div className="p-6 sm:p-10 space-y-8 max-w-[1600px] mx-auto">
      {/* Cabecera del Panel */}
      <div className="border-b border-white/5 pb-6 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div className="space-y-1.5">
          <motion.h2
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[10px] font-bold tracking-widest uppercase text-[#ff4d00]">
            Entregas Públicas
          </motion.h2>
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Monitoreo de Galerías
          </motion.h1>
        </div>

        {/* Contador de enlaces */}
        {!loading && (
          <motion.p
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[10px] text-gray-400 font-mono uppercase bg-white/[0.02] px-3 py-1.5 border border-white/5 rounded self-start sm:self-auto">
            {galerias.length} Enlaces Activos
          </motion.p>
        )}
      </div>

      {/* Zona de Contenido Dinámico (Loading / Empty / Grid) */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
          <div className="w-6 h-6 border-2 border-[#ff4d00]/20 border-t-[#ff4d00] rounded-full animate-spin" />
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-mono animate-pulse">
            Sincronizando entregas con Supabase...
          </p>
        </div>
      ) : galerias.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-28 border border-dashed border-white/5 bg-[#09171d]/20 rounded p-6 max-w-xl mx-auto">
          <span className="text-2xl block mb-3">📸</span>
          <h3 className="text-sm font-medium text-white mb-1">No hay galerías activas</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto font-light leading-relaxed">
            Ve a la sección de tus proyectos y genera un enlace público para que tus clientes puedan seleccionar sus
            fotos.
          </p>
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {galerias.map((galeria) => (
              <GaleriaCard
                key={galeria.id}
                galeria={galeria}
                idCopiado={idCopiado}
                onCopiar={copiarEnlace}
                onNavigate={() => navigate(`/dashboard/proyecto/${galeria.id}`)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
