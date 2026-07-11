/* ========================================================================= */
/* Proyecto: PhocuSync SaaS Portal */
/* Nombre del Archivo: Login.jsx / Login.tsx */
/* Propósito: Vista unificada e interactiva de Autenticación (Login / Registro). */
/* Arquitectura: React (Functional Components) + Custom Hooks (Logic Abstraction) + Tailwind CSS. */
/* Autor: [Karen Ibañez] */
/* ========================================================================= */

import { useAuthForm } from "../hooks/useAuthForm";
import { motion, AnimatePresence } from "framer-motion";

export default function Login() {
  // PATRÓN COUPLING / DESACOPLAMIENTO:
  // Abstracción completa del estado local y efectos colaterales delegados al Custom Hook.
  // Mantiene este componente estrictamente "Presentacional" (UI layer).
  const {
    authMode, // Estado: "login" | "register"
    email, // Estado controlado del campo email
    setEmail,
    password, // Estado controlado del campo password
    setPassword,
    fullName, // Estado controlado del campo nombre (exclusivo registro)
    setFullName,
    loading, // Bandera de estado de carga asíncrona (submitting flag)
    notificacion, // Estado: Manejo de alertas e inyección de UI en el Toast
    setNotificacion, // Actualizador: Permite cerrar el Toast manualmente desde la UI presentacional
    handleSwitchMode, // Manejador: Intercambia el flujo visual de auth
    handleSubmit, // Manejador: Despacha la petición al proveedor de Auth
  } = useAuthForm();

  return (
    // CONTENEDOR PRINCIPAL: Flexbox vertical con distribución 'between' para anclar el footer al fondo
    <div className="min-h-screen bg-[#061115] text-[#e2e8f0] flex flex-col justify-between p-6 md:p-10 font-sans selection:bg-[#ff4d00] selection:text-white">
      {/* ========================================== */}
      {/* NAVEGACIÓN / CABECERA DE MARCA            */}
      {/* ========================================== */}
      <header className="w-full max-w-7xl mx-auto flex justify-between items-center">
        {/* Identidad Visual Integrada (SVG de Marca Oficial) */}
        <div className="flex items-center gap-2">
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
          <span className="text-lg font-medium tracking-wide text-white">
            Phocu<span className="text-[#ff4d00]">Sync</span>
          </span>
        </div>

        {/* Enlace de Retorno Seguro a la Landing Page */}
        <a
          href="/"
          className="text-xs tracking-wider uppercase text-gray-400 hover:text-[#ff4d00] transition-colors duration-300">
          Volver al inicio
        </a>
      </header>

      {/* ========================================== */}
      {/* PORTAL DE AUTENTICACIÓN (FORMULARIO CAJA)  */}
      {/* ========================================== */}
      <main className="w-full max-w-md mx-auto my-auto py-12">
        <div className="space-y-8">
          {/* ENCABEZADO DINÁMICO: Cambia copys basándose en el estado de authMode */}
          <div>
            <h2 className="text-3xl font-sans font-semibold tracking-tight text-white mb-3">
              {authMode === "login" ? "Inicia Sesión" : "Crea una cuenta"}
            </h2>
            <p className="text-sm text-gray-400 font-light leading-relaxed">
              {authMode === "login"
                ? "Gestiona tus flujos de trabajo visuales y entregas."
                : "Sincroniza tu talento y simplifica las revisiones con tus clientes."}
            </p>
          </div>

          {/* FORMULARIO DE ACCESO COMPUESTO */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* RENDERIZADO CONDICIONAL: Inserta el campo de Nombre Completo solo si está en modo registro */}
            {authMode === "register" && (
              <div>
                <label className="block text-xs tracking-widest text-gray-400 uppercase mb-2">Nombre completo</label>
                {/* COMPONENTE CONTROLADO: Sincronización bidireccional mediante value y onChange */}
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#09171d] border border-white/5 px-4 py-3.5 text-sm text-white rounded-none focus:outline-none focus:border-[#ff4d00] focus:bg-[#0c1f27] transition-all duration-300"
                />
              </div>
            )}

            {/* CAMPO: EMAIL */}
            <div>
              <label className="block text-xs tracking-widest text-gray-400 uppercase mb-2">Correo electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#09171d] border border-white/5 px-4 py-3.5 text-sm text-white rounded-none focus:outline-none focus:border-[#ff4d00] focus:bg-[#0c1f27] transition-all duration-300"
              />
            </div>

            {/* CAMPO: PASSWORD */}
            <div>
              <label className="block text-xs tracking-widest text-gray-400 uppercase mb-2">Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#09171d] border border-white/5 px-4 py-3.5 text-sm text-white rounded-none focus:outline-none focus:border-[#ff4d00] focus:bg-[#0c1f27] transition-all duration-300"
              />
            </div>

            {/* ACCIÓN PRINCIPAL / SUBMIT TRIGGER */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading} // Protección UX: Deshabilita el botón para evitar doble llamadas API paralelas (Debounce nativo)
                className="w-full bg-transparent border border-[#ff4d00] text-white font-medium text-xs tracking-widest uppercase py-4 rounded-none transition-all duration-300 hover:bg-[#ff4d00] hover:shadow-[0_0_20px_rgba(255,77,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "Procesando..." : authMode === "login" ? "Entrar" : "Registrarme gratis"}
              </button>
            </div>
          </form>

          {/* INTERRUPTOR DE ESTADOS (TOGGLE AUTH MODE) */}
          <div className="text-center pt-2">
            <p className="text-sm text-gray-400 font-light">
              {authMode === "login" ? "¿No tienes una cuenta?" : "¿Ya formas parte?"}
              <button
                type="button"
                onClick={handleSwitchMode} // Al hacer click permuta el layout sin recargar la página (SPA Workflow)
                className="ml-2 text-[#ff4d00] hover:text-white underline underline-offset-4 transition-colors duration-300 focus:outline-none">
                {authMode === "login" ? "Regístrate aquí" : "Inicia sesión"}
              </button>
            </p>
          </div>
        </div>
      </main>

      {/* ========================================== */}
      {/* PIE DE PÁGINA (LEGAL & TRADEMARK)          */}
      {/* ========================================== */}
      <footer className="w-full max-w-7xl mx-auto flex justify-between items-center text-[11px] tracking-wider uppercase text-gray-500 font-light">
        {/* Generación dinámica de fecha para evitar mantenimiento manual de año */}
        <span>© {new Date().getFullYear()} PhocuSync</span>
        <span className="hidden sm:inline">Portal privado para fotógrafos</span>
      </footer>

      {/* ========================================== */}
      {/* NOTIFICACIÓN FLOTANTE (TOAST DE SISTEMA)   */}
      {/* ========================================== */}
      <AnimatePresence>
        {notificacion.mostrar && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#0c1f27] border px-5 py-4 rounded-xl shadow-2xl shadow-black/80 backdrop-blur-md max-w-sm transition-colors duration-300
              ${notificacion.tipo === "success" ? "border-emerald-500/30" : "border-red-500/30"}`}>
            {/* ICONO DINÁMICO SEGÚN TIPO */}
            <div
              className={`w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center border text-[10px] font-bold
              ${
                notificacion.tipo === "success"
                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                  : "text-red-400 bg-red-500/10 border-red-500/20"
              }`}>
              {notificacion.tipo === "success" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                  stroke="currentColor"
                  className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              ) : (
                "!"
              )}
            </div>

            {/* CONTENIDO DEL MENSAJE */}
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
                {notificacion.tipo === "success" ? "PhocuSync Info" : "Error de Sistema"}
              </span>
              <p className="text-[13px] font-medium text-white/90 leading-snug mt-0.5 break-words">
                {notificacion.mensaje}
              </p>
            </div>

            {/* BOTÓN DE CERRAR MANUAL */}
            <button
              onClick={() => setNotificacion((prev) => ({ ...prev, mostrar: false }))}
              className="ml-auto text-gray-500 hover:text-white transition-colors text-lg self-start leading-none pl-2">
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
