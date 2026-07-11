/* ========================================================================= */
/* Proyecto: PhocuSync SaaS Portal                                           */
/* Componente: Ajustes.jsx                                                   */
/* Descripción: Layout maestro del panel de configuración. Administra la     */
/*              arquitectura de subpestañas por animación fluida, un sistema */
/*              de Toasts con barra de progreso y modales comerciales.       */
/* ========================================================================= */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAjustes } from "../hooks/useAjustes";
import ModalPlanes from "../components/Ajustes/ModalPlanes";
import SeccionPerfil from "../components/Ajustes/SeccionPerfil";
import SeccionCuenta from "../components/Ajustes/SeccionCuenta";

export default function Ajustes() {
  // Consumo centralizado del estado del formulario y el perfil persistido
  const ajustesData = useAjustes();

  const { seccionActiva, setSeccionActiva, notificacion, modalPlanesAbierto, setModalPlanesAbierto } = ajustesData;

  // Diccionario de navegación interna para modularizar las secciones
  const menuAjustes = [
    { id: "perfil", label: "Perfil & Marca" },
    { id: "cuenta", label: "Cuenta & Almacenamiento" },
  ];

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-5xl mx-auto">
      {/* ENCABEZADO PRINCIPAL DE LA SECCIÓN */}
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Ajustes</h1>
        <p className="text-sm text-gray-400 font-light mt-1">
          Gestiona la identidad de tu estudio y la configuración de tus galerías.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 pt-4">
        {/* NAVEGACIÓN DE AJUSTES (Adaptable de scroll horizontal en móviles a barra lateral en escritorio) */}
        <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 border-b lg:border-b-0 lg:border-r border-white/5 lg:w-64 shrink-0">
          {menuAjustes.map((item) => (
            <button
              key={item.id}
              onClick={() => setSeccionActiva(item.id)}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium tracking-wide transition-all duration-200 ${
                seccionActiva === item.id
                  ? "text-[#ff4d00] bg-[#ff4d00]/5 lg:border-r-2 lg:border-[#ff4d00]"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}>
              {item.label}
            </button>
          ))}
        </nav>

        {/* CONTENIDO DINÁMICO DE SUBSECCIONES */}
        {/* 'mode="wait"' asegura un desmontaje limpio antes de animar el nuevo componente */}
        <div className="flex-1 bg-[#09171d] border border-white/5 p-6 md:p-8 rounded-sm shadow-xl min-h-[400px]">
          <AnimatePresence mode="wait">
            {seccionActiva === "perfil" && <SeccionPerfil key="perfil" {...ajustesData} />}
            {seccionActiva === "cuenta" && <SeccionCuenta key="cuenta" {...ajustesData} />}
          </AnimatePresence>
        </div>
      </div>

      {/* NOTIFICACIÓN FLOTANTE AUTO-ALINEADA (TOAST SYSTEM) */}
      <AnimatePresence>
        {notificacion.mostrar && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 border shadow-2xl rounded-sm ${
              notificacion.tipo === "success"
                ? "bg-[#09171d] border-[#ff4d00]/30 text-white"
                : "bg-[#14080b] border-red-500/30 text-red-200"
            }`}>
            <span className="text-lg">{notificacion.tipo === "success" ? "✓" : "✕"}</span>
            <p className="text-xs tracking-wide font-medium">{notificacion.mensaje}</p>

            {/* BARRA DE TIEMPO VISUAL: Sincronizada con los 4 segundos de limpieza del hook */}
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 4, ease: "linear" }}
              className={`absolute bottom-0 left-0 h-[2px] ${
                notificacion.tipo === "success" ? "bg-[#ff4d00]" : "bg-red-500"
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL GLOBAL DE SELECCIÓN DE PLANES COMERCIALES */}
      <ModalPlanes isOpen={modalPlanesAbierto} onClose={() => setModalPlanesAbierto(false)} />
    </div>
  );
}
