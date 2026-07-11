/* ========================================================================= */
/* Proyecto: PhocuSync SaaS Portal                                           */
/* Componente: NewProjectModal.jsx                                           */
/* Propósito: Ventana modal animada con validación intermedia para la         */
/*            creación de nuevas galerías de fotos de clientes.              */
/* ========================================================================= */

import { motion, AnimatePresence } from "framer-motion";

export default function NewProjectModal({ isOpen, onClose, projectName, setProjectName, onSubmit, isCreating }) {
  return (
    /* AnimatePresence permite coordinar y asegurar que las animaciones de salida ('exit') se ejecuten por completo antes de retirar el nodo del árbol de React */
    <AnimatePresence>
      {isOpen && (
        /* CAPA DE FONDO (BACKDROP): Oscurece el entorno y genera un desenfoque por software dinámico */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          {/* CUERPO DE LA MODAL: Implementa un sutil salto de escala y un empuje en el eje Y al aparecer */}
          <motion.div
            initial={{ scale: 0.96, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 15 }}
            className="bg-[#09171d] border border-white/10 p-6 md:p-8 w-full max-w-md space-y-6 shadow-2xl">
            <div>
              <h2 className="text-xl font-semibold text-white tracking-tight">Crear nueva galería</h2>
              <p className="text-xs text-gray-400 font-light mt-1">
                Ingresa el nombre comercial o del cliente para este flujo de trabajo.
              </p>
            </div>

            {/* FORMULARIO DE CAPTURA DIRECTA */}
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="block text-xs tracking-widest text-gray-400 uppercase mb-2">
                  Nombre del Proyecto
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Boda Andrea & Carlos"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-[#061115] border border-white/5 px-4 py-3 text-sm text-white rounded-none focus:outline-none focus:border-[#ff4d00] transition-all"
                />
              </div>

              {/* SECCIÓN DE BOTONES DE ACCIÓN */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-transparent border border-white/10 text-gray-400 font-medium text-xs tracking-widest uppercase py-3.5 hover:text-white hover:border-white/20 transition-all">
                  Cancelar
                </button>

                {/* Botón de confirmación controlado por la bandera de red 'isCreating' para prevenir duplicaciones */}
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 bg-[#ff4d00] text-white font-medium text-xs tracking-widest uppercase py-3.5 hover:bg-[#e04400] transition-all disabled:opacity-50">
                  {isCreating ? "Creando..." : "Crear"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
