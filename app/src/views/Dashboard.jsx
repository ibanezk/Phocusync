/* ========================================================================= */
/* Proyecto: PhocuSync SaaS Portal */
/* Nombre del Archivo: Dashboard.jsx */
/* Propósito: Panel principal de control para el fotógrafo. Gestiona métricas, */
/*            visualización de galerías, control de cuotas/límites del plan y */
/*            disparadores para la creación de nuevos proyectos. */
/* Arquitectura: React (Functional Components) + Framer Motion (Micro-interactions) */
/*               + Custom Hooks (Business Logic Layer) + Tailwind CSS. */
/* ========================================================================= */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboard } from "../hooks/useDashboard";
import StatCard from "../components/Dashboard/StatCard";
import ProjectCard from "../components/Dashboard/ProjectCard";
import NewProjectModal from "../components/Dashboard/NewProjectModal";

export default function Dashboard() {
  // =========================================================================
  // 1. CAPA DE CONTROL DE NEGOCIO (Decoupled Custom Hook)
  // =========================================================================
  const {
    proyectos, // Array: Listado de galerías fotográficas del usuario
    isLoading, // Boolean: Estado de carga asíncrona desde Supabase
    stats, // Object: Métricas consolidadas (proyectos, fotos, storage)
    isModalOpen, // Boolean: Control de visibilidad del modal de creación
    setIsModalOpen, // Setter: Abre/Cierra el modal de creación
    projectName, // String: Estado controlado para el nombre del nuevo proyecto
    setProjectName, // Setter: Actualiza el nombre en el modal
    isCreating, // Boolean: Spinner interno del modal durante el insert de DB
    handleCreateProject, // Función: Handler que ejecuta la mutación en Supabase
    navigateToProject, // Función: Enrutador dinámico hacia la vista de la galería
    haAlcanzadoElLimite, // Boolean: Regla de negocio que valida cuotas según el tier (Max 3)
  } = useDashboard();

  // =========================================================================
  // 2. ESTADOS LOCALES DE INTERFAZ (UI Exclusives)
  // =========================================================================
  const [alertaLimite, setAlertaLimite] = useState(false); // Controla el Toast flotante de bloqueo

  /**
   * Orquesta la activación del Toast de advertencia con auto-cierre incorporado.
   * UX Guardrail: Evita alertas permanentes que obstruyan el flujo visual de la app.
   */
  const dispararAlerta = () => {
    setAlertaLimite(true);
    // Auto-dimiss después de 4000ms
    setTimeout(() => setAlertaLimite(false), 4000);
  };

  return (
    <div className="p-6 md:p-10 space-y-10 relative max-w-[1600px] mx-auto">
      {/* ========================================== */}
      {/* NOVEDAD UX: TOAST DE CONTROL DE CUOTAS     */}
      {/* ========================================== */}
      {/* AnimatePresence permite animar componentes de React cuando se desmontan del DOM */}
      <AnimatePresence>
        {alertaLimite && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-6 right-6 z-50 bg-[#09171d] border border-red-500/20 p-4 rounded-sm shadow-[0_10px_30px_rgba(0,0,0,0.5)] max-w-sm flex gap-3 items-start">
            <div className="space-y-1">
              <h4 className="text-xs uppercase tracking-widest font-semibold text-white">Límite del Plan</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Has alcanzado el máximo de <strong>3 galerías activas</strong> en tu plan{" "}
                <span className="text-[#ff4d00] font-medium">Standard</span>.
              </p>
              {/* Trigger Call-To-Action para el flujo de monetización / Stripe Upgrade */}
              <button
                onClick={() => alert("Aquí abrirías tu modal de suscripciones")}
                className="text-[10px] uppercase tracking-wider font-semibold text-[#ff4d00] hover:text-[#ff6624] transition-colors pt-1 block">
                Mejorar Plan ahora →
              </button>
            </div>

            {/* Cierre manual del Toast */}
            <button
              onClick={() => setAlertaLimite(false)}
              className="text-gray-500 hover:text-white text-xs ml-3 font-mono transition-colors focus:outline-none">
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* CABECERA PRINCIPAL (Sección de bienvenida y CTA) */}
      {/* ========================================== */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Bienvenido de nuevo</h1>
          <p className="text-sm text-gray-400 font-light mt-1">
            Este es el estado actual de tus entregas fotográficas.
          </p>
        </div>

        {/* BOTÓN DISPARADOR CON LÓGICA DE NEGOCIO INTEGRADA */}
        <button
          onClick={() => {
            // Regla de Negocio: Si llegó al límite, bloqueamos la apertura y disparamos advertencia
            if (haAlcanzadoElLimite) {
              dispararAlerta();
            } else {
              setIsModalOpen(true);
            }
          }}
          // Clases dinámicas basadas en el estado del plan del fotógrafo
          className={`text-xs tracking-widest uppercase font-semibold px-5 py-3 transition-all ${
            haAlcanzadoElLimite
              ? "bg-gray-900 text-gray-500 border border-white/5 cursor-not-allowed opacity-80"
              : "bg-[#ff4d00] text-white hover:bg-[#e04400] shadow-[0_0_20px_rgba(255,77,0,0.15)]"
          }`}>
          {haAlcanzadoElLimite ? "Límite Alcanzado (3/3)" : "+ Nuevo Proyecto"}
        </button>
      </header>

      {/* ========================================== */}
      {/* SECCIÓN DE MÉTRICAS (KPI Cards)            */}
      {/* ========================================== */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard label="Galerías Activas" value={stats.proyectos} />
        <StatCard label="Fotos Almacenadas" value={stats.fotos} />
        {/* Resaltado estético para el consumo del Storage, un KPI crítico para Saas de imágenes */}
        <StatCard label="Espacio Utilizado" value={stats.almacenamiento} isHighlight={true} />
      </section>

      {/* ========================================== */}
      {/* LISTADO DE GALERÍAS CON ANIMACIONES DE ESTADO */}
      {/* ========================================== */}
      <div className="relative w-full">
        {/* mode="wait" asegura que el componente viejo termine su salida antes de que entre el nuevo */}
        <AnimatePresence mode="wait">
          {/* ESTADO A: Cargando información desde la base de datos */}
          {isLoading ? (
            <motion.section
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 w-full">
              <div className="inline-block animate-spin w-6 h-6 border-2 border-[#ff4d00] border-t-transparent rounded-full mb-2"></div>
              <p className="text-xs tracking-widest text-gray-500 uppercase font-light">Sincronizando galerías...</p>
            </motion.section>
          ) : /* ESTADO B: Carga finalizada pero el array de proyectos está vacío */
          proyectos.length === 0 ? (
            <motion.section
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[#09171d] border border-white/5 p-8 text-center py-16 space-y-4 w-full">
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mx-auto text-gray-500">
                📸
              </div>
              <div className="space-y-1">
                <h3 className="text-md font-medium text-white">No hay proyectos creados aún</h3>
                <p className="text-xs text-gray-400 font-light max-w-xs mx-auto">
                  Crea tu primera galería para empezar a compartir material fotográfico con tus clientes.
                </p>
              </div>
            </motion.section>
          ) : (
            /* ESTADO C: Renderizado exitoso del Grid de Proyectos */
            // El atributo 'layout' de framer-motion re-ubica las tarjetas suavemente si una de ellas se elimina
            <motion.section
              key="grid"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {/* popLayout mantiene la posición física de las tarjetas hermanas durante la animación de desvanecimiento */}
              <AnimatePresence mode="popLayout">
                {proyectos.map((proyecto, index) => (
                  <ProjectCard
                    key={proyecto.id}
                    proyecto={proyecto}
                    index={index} // Permite manejar animaciones escalonadas (staggered) dentro del hijo
                    onManage={() => navigateToProject(proyecto.id)}
                  />
                ))}
              </AnimatePresence>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* ========================================== */}
      {/* CAPA MODAL (Creación de Proyectos)         */}
      {/* ========================================== */}
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectName={projectName}
        setProjectName={setProjectName}
        onSubmit={handleCreateProject}
        isCreating={isCreating}
      />
    </div>
  );
}
