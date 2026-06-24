import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboard } from "../hooks/useDashboard";
import StatCard from "../components/Dashboard/StatCard";
import ProjectCard from "../components/Dashboard/ProjectCard";
import NewProjectModal from "../components/Dashboard/NewProjectModal";

export default function Dashboard() {
  const {
    proyectos,
    isLoading,
    stats,
    isModalOpen,
    setIsModalOpen,
    projectName,
    setProjectName,
    isCreating,
    handleCreateProject,
    navigateToProject,
    haAlcanzadoElLimite,
  } = useDashboard();

  const [alertaLimite, setAlertaLimite] = useState(false);

  const dispararAlerta = () => {
    setAlertaLimite(true);
    setTimeout(() => setAlertaLimite(false), 4000);
  };

  return (
    <div className="p-6 md:p-10 space-y-10 relative max-w-[1600px] mx-auto">
      {/* ALERTA DE LÍMITE (TOAST) */}
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
              <button
                onClick={() => alert("Aquí abrirías tu modal de suscripciones")}
                className="text-[10px] uppercase tracking-wider font-semibold text-[#ff4d00] hover:text-[#ff6624] transition-colors pt-1 block">
                Mejorar Plan ahora →
              </button>
            </div>
            <button
              onClick={() => setAlertaLimite(false)}
              className="text-gray-500 hover:text-white text-xs ml-3 font-mono transition-colors focus:outline-none">
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CABECERA */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Bienvenido de nuevo</h1>
          <p className="text-sm text-gray-400 font-light mt-1">
            Este es el estado actual de tus entregas fotográficas.
          </p>
        </div>
        <button
          onClick={() => {
            if (haAlcanzadoElLimite) {
              dispararAlerta();
            } else {
              setIsModalOpen(true);
            }
          }}
          className={`text-xs tracking-widest uppercase font-semibold px-5 py-3 transition-all ${
            haAlcanzadoElLimite
              ? "bg-gray-900 text-gray-500 border border-white/5 cursor-not-allowed opacity-80"
              : "bg-[#ff4d00] text-white hover:bg-[#e04400] shadow-[0_0_20px_rgba(255,77,0,0.15)]"
          }`}>
          {haAlcanzadoElLimite ? "Límite Alcanzado (3/3)" : "+ Nuevo Proyecto"}
        </button>
      </header>

      {/* SECCIÓN DE MÉTRICAS */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard label="Galerías Activas" value={stats.proyectos} />
        <StatCard label="Fotos Almacenadas" value={stats.fotos} />
        <StatCard label="Espacio Utilizado" value={stats.almacenamiento} isHighlight={true} />
      </section>

      {/* LISTADO CONDICIONAL ANIMADO */}
      <div className="relative w-full">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.section key="loading" className="text-center py-20 w-full">
              <div className="inline-block animate-spin w-6 h-6 border-2 border-[#ff4d00] border-t-transparent rounded-full mb-2"></div>
              <p className="text-xs tracking-widest text-gray-500 uppercase font-light">Sincronizando galerías...</p>
            </motion.section>
          ) : proyectos.length === 0 ? (
            <motion.section
              key="empty"
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
            <motion.section key="grid" layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              <AnimatePresence mode="popLayout">
                {proyectos.map((proyecto, index) => (
                  <ProjectCard
                    key={proyecto.id}
                    proyecto={proyecto}
                    index={index}
                    onManage={() => navigateToProject(proyecto.id)}
                  />
                ))}
              </AnimatePresence>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* MODAL DE NUEVO PROYECTO */}
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
