import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar({ menuAbierto, setMenuAbierto, userEmail, handleLogout }) {
  return (
    <>
      {/* 🍔 BOTÓN HAMBURGUESA */}
      <button
        onClick={() => setMenuAbierto(!menuAbierto)}
        className="fixed top-4 right-4 z-50 p-1.5 bg-[#0c1f27] border border-white/10 text-white md:hidden hover:text-[#ff4d00] transition-colors"
        aria-label="Abrir menú">
        {menuAbierto ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        )}
      </button>

      {/* 🖤 OVERLAY OSCURO ANIMADO PARA MÓVIL */}
      <AnimatePresence>
        {menuAbierto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenuAbierto(false)}
            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* 📂 ESTRUCTURA DEL ASIDE RESPONSIVO */}
      <aside
        className={`bg-[#09171d] border-r border-white/5 p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out z-40
          fixed top-0 bottom-0 left-0 w-64
          ${menuAbierto ? "translate-x-0" : "-translate-x-full"} 
          md:relative md:translate-x-0 md:w-64`}>
        <div className="space-y-8 pt-12 md:pt-0">
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium tracking-wide text-white">
              Phocu<span className="text-[#ff4d00]">Sync</span>
            </span>
            <div className="w-7 h-7 flex-shrink-0" id="logoIcon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path
                  d="M4 14.5C7 11 9 8 14 8C19 8 21 11 24 14.5"
                  stroke="#FF4D00"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <path
                  d="M4 20C7.5 16.2 10 14 14 14C18 14 20.5 16.5 24 20"
                  stroke="#FF4D00"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeOpacity="0.7"
                />
                <path
                  d="M6 8.5C8.5 5.5 11 4 14 4C17 4 19.5 6 22 8.5"
                  stroke="#FF4D00"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeOpacity="0.5"
                />
              </svg>
            </div>
          </div>

          <nav className="space-y-2">
            <a
              href="#"
              onClick={() => setMenuAbierto(false)}
              className="block px-4 py-2.5 text-xs tracking-widest uppercase font-medium text-[#ff4d00] bg-[#0c1f27]">
              Panel General
            </a>
            <a
              href="#"
              onClick={() => setMenuAbierto(false)}
              className="block px-4 py-2.5 text-xs tracking-widest uppercase font-medium text-gray-400 hover:text-white transition-colors">
              Galerías
            </a>
            <a
              href="#"
              onClick={() => setMenuAbierto(false)}
              className="block px-4 py-2.5 text-xs tracking-widest uppercase font-medium text-gray-400 hover:text-white transition-colors">
              Ajustes
            </a>
          </nav>
        </div>

        <div className="pt-6 border-t border-white/5 space-y-3">
          <div className="text-xs text-gray-400 truncate">{userEmail || "Cargando..."}</div>
          <button
            onClick={handleLogout}
            className="w-full text-left text-[11px] tracking-wider uppercase text-red-400 hover:text-red-300 font-medium transition-colors">
            Cerrar Sesión ×
          </button>
        </div>
      </aside>
    </>
  );
}
