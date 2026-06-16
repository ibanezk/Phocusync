import { useAuthForm } from "../hooks/useAuthForm";

export default function Login() {
  const {
    authMode,
    email,
    setEmail,
    password,
    setPassword,
    fullName,
    setFullName,
    loading,
    handleSwitchMode,
    handleSubmit,
  } = useAuthForm();

  return (
    <div className="min-h-screen bg-[#061115] text-[#e2e8f0] flex flex-col justify-between p-6 md:p-10 font-sans selection:bg-[#ff4d00] selection:text-white">
      <header className="w-full max-w-7xl mx-auto flex justify-between items-center">
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
        <a
          href="../"
          className="text-xs tracking-wider uppercase text-gray-400 hover:text-[#ff4d00] transition-colors duration-300">
          Volver al inicio
        </a>
      </header>

      <main className="w-full max-w-md mx-auto my-auto py-12">
        <div className="space-y-8">
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

          <form className="space-y-5" onSubmit={handleSubmit}>
            {authMode === "register" && (
              <div>
                <label className="block text-xs tracking-widest text-gray-400 uppercase mb-2">Nombre completo</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#09171d] border border-white/5 px-4 py-3.5 text-sm text-white rounded-none focus:outline-none focus:border-[#ff4d00] focus:bg-[#0c1f27] transition-all duration-300"
                />
              </div>
            )}

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

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-transparent border border-[#ff4d00] text-white font-medium text-xs tracking-widest uppercase py-4 rounded-none transition-all duration-300 hover:bg-[#ff4d00] hover:shadow-[0_0_20px_rgba(255,77,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "Procesando..." : authMode === "login" ? "Entrar" : "Registrarme gratis"}
              </button>
            </div>
          </form>

          <div className="text-center pt-2">
            <p className="text-sm text-gray-400 font-light">
              {authMode === "login" ? "¿No tienes una cuenta?" : "¿Ya formas parte?"}
              <button
                type="button"
                onClick={handleSwitchMode}
                className="ml-2 text-[#ff4d00] hover:text-white underline underline-offset-4 transition-colors duration-300 focus:outline-none">
                {authMode === "login" ? "Regístrate aquí" : "Inicia sesión"}
              </button>
            </p>
          </div>
        </div>
      </main>

      <footer className="w-full max-w-7xl mx-auto flex justify-between items-center text-[11px] tracking-wider uppercase text-gray-500 font-light">
        <span>© {new Date().getFullYear()} PhocuSync</span>
        <span className="hidden sm:inline">Portal privado para fotógrafos</span>
      </footer>
    </div>
  );
}
