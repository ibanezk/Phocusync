import { motion, AnimatePresence } from "framer-motion";
import { useDashboard } from "../hooks/useDashboard";
import Sidebar from "../components/Dashboard/Sidebar";
import StatCard from "../components/Dashboard/StatCard";
import ProjectCard from "../components/Dashboard/ProjectCard";
import NewProjectModal from "../components/Dashboard/NewProjectModal";

export default function Dashboard() {
  const {
    userEmail,
    proyectos,
    isLoading,
    stats,
    menuAbierto,
    setMenuAbierto,
    isModalOpen,
    setIsModalOpen,
    projectName,
    setProjectName,
    isCreating,
    handleCreateProject,
    handleLogout,
    navigateToProject,
  } = useDashboard();

  return (
    <div className="min-h-screen bg-[#061115] text-[#e2e8f0] font-sans flex flex-col md:flex-row relative">
      {/* SIDEBAR RESPONSIVO Y HAMBURGUESA */}
      <Sidebar
        menuAbierto={menuAbierto}
        setMenuAbierto={setMenuAbierto}
        userEmail={userEmail}
        handleLogout={handleLogout}
      />

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-6 md:p-10 space-y-10">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">Bienvenido de nuevo</h1>
            <p className="text-sm text-gray-400 font-light mt-1">
              Este es el estado actual de tus entregas fotográficas.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#ff4d00] text-white text-xs tracking-widest uppercase font-semibold px-5 py-3 hover:bg-[#e04400] transition-colors shadow-[0_0_20px_rgba(255,77,0,0.15)]">
            + Nuevo Proyecto
          </button>
        </header>

        {/* SECCIÓN DE MÉTRICAS */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard label="Galerías Activas" value={stats.proyectos} />
          <StatCard label="Fotos Almacenadas" value={stats.fotos} />
          <StatCard label="Espacio Utilizado" value={stats.almacenamiento} isHighlight={true} />
        </section>

        {/* LISTADO CONDICIONAL ANIMADO CON ANIMATEPRESENCE */}
        <div className="relative w-full">
          <AnimatePresence mode="wait">
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
            ) : proyectos.length === 0 ? (
              <motion.section
                key="empty"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
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
              /* Cuadrícula animada de los proyectos */
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
      </main>

      {/* MODAL DE NUEVO PROYECTO CON ANIMACIÓN AISLADA */}
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
