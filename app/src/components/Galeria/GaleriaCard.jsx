import { motion } from "framer-motion";
import { obtenerEstiloEstado } from "../../utils/helpers"; // Importación de tu helper centralizado

export function GaleriaCard({ galeria, idCopiado, onCopiar, onNavigate }) {
  const { id, nombre, estado, totalFotos, elegidasCount, notasCount, pesoMB, urlPublica } = galeria;
  const esCopiado = idCopiado === id;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={onNavigate}
      className="bg-[#09171d] border border-white/5 p-6 flex flex-col justify-between gap-6 transition-all hover:border-white/10 group rounded-sm shadow-xl cursor-pointer">
      {/* Cabecera de la Tarjeta */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          {/* Título del proyecto (text-lg) */}
          <h3 className="text-lg font-semibold text-white tracking-tight group-hover:text-[#ff4d00] transition-colors line-clamp-1">
            {nombre}
          </h3>

          {/* Badge con estilos centralizados */}
          <span
            className={`text-[10px] tracking-widest uppercase font-bold px-2.5 py-1 border shrink-0 ${obtenerEstiloEstado(estado)}`}>
            {estado}
          </span>
        </div>

        {/* Metadatos globales (text-sm) */}
        <p className="text-sm text-gray-400 font-mono uppercase">
          {totalFotos} imágenes • {pesoMB} MB
        </p>
      </div>

      {/* Grid de Métricas de Interacción (Cliente) */}
      <div className="grid grid-cols-2 gap-3 bg-[#061115]/50 border border-white/[0.03] p-4 rounded">
        <div className="flex flex-col space-y-1">
          <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">Seleccionadas</span>
          <div className="flex items-center gap-2">
            <span className="text-sm">⭐</span>
            <span className={`text-sm font-bold font-mono ${elegidasCount > 0 ? "text-[#ff4d00]" : "text-gray-400"}`}>
              {elegidasCount} <span className="text-xs text-gray-600 font-light">/ {totalFotos}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col border-l border-white/5 pl-4 space-y-1">
          <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">Con Notas</span>
          <div className="flex items-center gap-2">
            <span className="text-sm">💬</span>
            <span className={`text-sm font-bold font-mono ${notasCount > 0 ? "text-amber-400" : "text-gray-400"}`}>
              {notasCount}
            </span>
          </div>
        </div>
      </div>

      {/* Acciones y Enlaces de Control */}
      <div className="flex items-center gap-3 pt-3 border-t border-white/5">
        <button
          onClick={() => onCopiar(id, urlPublica)}
          className={`flex-1 h-10 text-sm font-bold tracking-widest uppercase transition-all border rounded-sm flex items-center justify-center gap-2 ${
            esCopiado
              ? "bg-[#00ff88] border-[#00ff88] text-black"
              : "border-white/10 bg-white/[0.02] text-gray-200 hover:bg-white/5 hover:text-white"
          }`}>
          <span>{esCopiado ? "✓" : "🔗"}</span> {esCopiado ? "¡Copiado!" : "Copiar Enlace"}
        </button>

        <a
          href={urlPublica}
          target="_blank"
          rel="noreferrer"
          className="px-4 h-10 text-sm font-bold tracking-widest uppercase rounded-sm border border-[#ff4d00]/20 bg-[#ff4d00]/5 text-[#ff4d00] hover:bg-[#ff4d00] hover:text-white transition-all flex items-center justify-center gap-1.5">
          Ver
        </a>
      </div>
    </motion.div>
  );
}
