import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Importa tu función de login o el hook que uses para iniciar sesión
import { useAuthForm } from "../hooks/useAuthForm";

export default function Demo() {
  const navigate = useNavigate();
  const { login } = useAuthForm();

  useEffect(() => {
    // Iniciamos sesión automáticamente con la cuenta de prueba
    login("demo@phocusync.com", "demo12345")
      .then(() => {
        navigate("/dashboard"); // ¡Adentro!
      })
      .catch((err) => {
        console.error("Error en la demo", err);
        navigate("/login"); // Si algo falla, al login normal
      });
  }, [login, navigate]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-white">
      <div className="text-center">
        {/* Un spinner simple de Tailwind para que parezca que está cargando algo genial */}
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg font-medium animate-pulse">Preparando tu entorno de prueba...</p>
      </div>
    </div>
  );
}
