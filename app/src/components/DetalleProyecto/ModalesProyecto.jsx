/* ========================================================================= */
/* Proyecto: PhocuSync SaaS Portal                                           */
/* Componente: ModalesProyecto.jsx                                           */
/* Descripción: Hub centralizado y estandarizado de ventanas emergentes.    */
/*              Todos los estados de control consumen una estructura homogénea*/
/*              de objeto { isOpen: boolean } para garantizar escalabilidad. */
/* ========================================================================= */

import { motion, AnimatePresence } from "framer-motion";

export default function ModalesProyecto({
  modalEliminar,
  setModalEliminar,
  ejecutarEliminarFoto,
  modalEliminarMasivo,
  setModalEliminarMasivo,
  ejecutarEliminarMasivo,
  modalEliminarProyecto, // Estandarizado: Ahora se evalúa como objeto { isOpen: boolean }
  setModalEliminarProyecto,
  ejecutarEliminarProyecto,
  proyecto,
  selectedFotos,
  modalComentario,
  setModalComentario,
  modalCompartir, // Estandarizado: Ahora se evalúa como objeto { isOpen: boolean }
  setModalCompartir,
  urlPublica,
  enlaceCopiado,
  handleCopiarEnlaceCompartir,
}) {
  return (
    // AnimatePresence habilita la detección de desmontaje en el DOM para ejecutar los efectos 'exit'
    <AnimatePresence>
      {/* ─── MODAL 1: ELIMINAR FOTOGRAFÍA INDIVIDUAL ─── */}
      {/* Controla la destrucción de un único recurso multimedia en el Storage/BD */}
      {modalEliminar.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            className="bg-[#09171d] border border-white/10 p-6 max-w-sm w-full space-y-6 text-center shadow-2xl">
            <h3 className="text-sm font-medium text-white uppercase tracking-wider">¿Eliminar fotografía?</h3>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setModalEliminar({ isOpen: false, fotoId: null, fotoUrl: null })}
                className="flex-1 bg-white/5 text-gray-300 text-[10px] py-2.5 border border-white/5">
                Cancelar
              </button>
              <button
                onClick={ejecutarEliminarFoto}
                className="flex-1 bg-red-900/40 text-white text-[10px] py-2.5 border border-red-500/30">
                Confirmar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ─── MODAL 2: ELIMINAR SELECCIÓN EN LOTE (MASIVO) ─── */}
      {/* Advierte al fotógrafo la cantidad exacta de archivos indexados en el array de selección masiva */}
      {modalEliminarMasivo.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            className="bg-[#09171d] border border-white/10 p-6 max-w-sm w-full space-y-6 text-center shadow-2xl">
            <h3 className="text-sm font-medium text-white uppercase tracking-wider">
              ¿Eliminar {selectedFotos.length} fotografías?
            </h3>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setModalEliminarMasivo({ isOpen: false })}
                className="flex-1 bg-white/5 text-gray-300 text-[10px] py-2.5 border border-white/5">
                Cancelar
              </button>
              <button
                onClick={ejecutarEliminarMasivo}
                className="flex-1 bg-red-900/40 text-white text-[10px] py-2.5 border border-red-500/30">
                Confirmar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ─── MODAL 3: ELIMINACIÓN DE PROYECTO COMPLETO (ZONA CRÍTICA) ─── */}
      {/* CORRECCIÓN ARQUITECTÓNICA: Evalúa la propiedad '.isOpen' del estado estructurado */}
      {modalEliminarProyecto.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            className="bg-[#09171d] border border-red-500/20 p-6 max-w-sm w-full space-y-6 text-center shadow-2xl">
            <h3 className="text-sm font-medium text-white uppercase tracking-wider">
              ¿Seguro que quiere borrar el proyecto "{proyecto?.nombre}"?
            </h3>
            <div className="flex gap-3 justify-center">
              {/* Resetea el estado pasando un objeto con bandera false */}
              <button
                onClick={() => setModalEliminarProyecto({ isOpen: false })}
                className="flex-1 bg-white/5 text-gray-300 text-[10px] py-2.5 border border-white/5">
                Cancelar
              </button>
              <button onClick={ejecutarEliminarProyecto} className="flex-1 bg-red-600 text-white text-[10px] py-2.5">
                Eliminar todo
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ─── MODAL 4: VISUALIZADOR DE NOTAS DE RETOQUE ─── */}
      {/* Caja de lectura para comentarios extensos del cliente con soporte para saltos de línea (whitespace-pre-wrap) */}
      {modalComentario.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            className="bg-[#09171d] border border-white/10 max-w-md w-full p-6 relative flex flex-col space-y-4">
            <button
              onClick={() => setModalComentario({ isOpen: false, text: "", fotoUrl: "" })}
              className="absolute top-4 right-4 text-gray-400 hover:text-white font-mono">
              ✕
            </button>
            <h3 className="text-sm font-medium text-gray-400">Indicaciones de retoque solicitadas:</h3>
            <div className="bg-[#061115] border border-white/5 p-4 max-h-48 overflow-y-auto">
              <p className="text-sm text-slate-200 font-light italic whitespace-pre-wrap">"{modalComentario.text}"</p>
            </div>
            <button
              onClick={() => setModalComentario({ isOpen: false, text: "", fotoUrl: "" })}
              className="w-full py-2.5 bg-white/5 border border-white/10 text-[10px] font-bold text-white">
              Cerrar Nota
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* ─── MODAL 5: PANEL DE COMPARTICIÓN COMERCIAL ─── */}
      {modalCompartir.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            className="bg-[#121214] border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
              <h3 className="text-xs font-bold tracking-widest uppercase text-white">🔗 Compartir Galería</h3>
              {/* Cierre seguro mutando el estado hacia un objeto limpio */}
              <button
                onClick={() => setModalCompartir({ isOpen: false })}
                className="text-gray-500 hover:text-white text-sm p-1">
                ✕
              </button>
            </div>
            <div className="flex bg-white/[0.02] border border-white/10 rounded-lg p-1.5 items-center gap-2">
              <input
                type="text"
                readOnly
                value={urlPublica}
                className="bg-transparent text-[11px] text-gray-300 px-2 flex-1 outline-none font-mono"
              />
              <button
                onClick={handleCopiarEnlaceCompartir}
                className={`text-[10px] uppercase font-bold tracking-wider px-4 py-2 rounded-md ${enlaceCopiado ? "bg-[#00ff88] text-black" : "bg-white/5 text-white"}`}>
                {enlaceCopiado ? "¡Copiado!" : "Copiar"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
