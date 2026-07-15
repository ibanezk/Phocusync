import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import LoaderCargando from "../components/GaleriaCliente/LoaderCargando";

export default function Demo() {
  const navigate = useNavigate();

  useEffect(() => {
    const iniciarSesionDemo = async () => {
      try {
        // Iniciamos sesión directamente con Supabase saltándonos el formulario
        const { error } = await supabase.auth.signInWithPassword({
          email: "demo@phocusync.com", // <-- Asegúrate de crear este usuario en Supabase
          password: "demo12345", // <-- Y de poner su contraseña real aquí
        });

        if (error) {
          console.error("Error al autenticar la demo:", error.message);
          navigate("/login"); // Si falla, lo mandamos al login normal
        } else {
          navigate("/dashboard"); // ¡Éxito! Adentro del panel del fotógrafo
        }
      } catch (err) {
        console.error("Error inesperado en el entorno de demo:", err);
        navigate("/login");
      }
    };

    iniciarSesionDemo();
  }, [navigate]);

  return (
    <LoaderCargando mensaje="Sincronizando entorno" submensaje="Preparando tu sesión de prueba sin registros..." />
  );
}
