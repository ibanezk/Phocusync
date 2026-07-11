import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export function useAuthForm() {
  const navigate = useNavigate();

  // =========================================================================
  // 1. ESTADOS LOCALES (Reactive State Management)
  // =========================================================================
  const [authMode, setAuthMode] = useState("login"); // Determina el flujo: "login" o "register"
  const [email, setEmail] = useState(""); // Almacena el correo electrónico
  const [password, setPassword] = useState(""); // Almacena la contraseña cifrada en tránsito
  const [fullName, setFullName] = useState(""); // Nombre del fotógrafo (exclusivo para registro)
  const [loading, setLoading] = useState(false); // Flag de control para bloquear interacciones durante peticiones de red

  // Estado reactivo para el manejo de alertas personalizadas e inyección de UI en el Toast
  const [notificacion, setNotificacion] = useState({
    mostrar: false,
    mensaje: "",
    tipo: "success",
  });

  /**
   * Helper interno para disparar el estado de la notificación flotante
   * y gestionar su ciclo de vida de auto-ocultado.
   */
  const lanzarNotificacion = (mensaje, tipo = "success") => {
    setNotificacion({ mostrar: true, mensaje, tipo });
    setTimeout(() => {
      setNotificacion((prev) => ({ ...prev, mostrar: false }));
    }, 4500);
  };

  // =========================================================================
  // 2. MANEJADORES DE INTERFAZ / EVENTOS (UI State Cleaners)
  // =========================================================================

  /**
   * Conmuta entre los modos de Inicio de Sesión y Registro.
   * Optimización: Limpia los campos del formulario al cambiar de modo para evitar
   * fugas de credenciales accidentales o efectos visuales extraños.
   */
  const handleSwitchMode = () => {
    setAuthMode(authMode === "login" ? "register" : "login");
    setEmail("");
    setPassword("");
    fullName && setFullName(""); // Limpieza segura de estados condicionales
  };

  // =========================================================================
  // 3. LOGICA CENTRAL ASÍNCRONA (Authentication Core & Pipeline)
  // =========================================================================

  /**
   * Orquesta el envío del formulario interceptando el comportamiento nativo del DOM.
   * @param {Event} e - Objeto del evento submit del formulario nativo.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Detiene el refresco de página clásico para mantener el estado de la SPA

    // ---------------------------------------------------------------------
    // === FASE 0: VALIDACIÓN DE FORMATO CRÍTICO (Client-Side Guardrails) ===
    // ---------------------------------------------------------------------
    // Fuerza una estructura estricta que exija un TLD válido (ej: .com, .co, .net)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
      lanzarNotificacion("Por favor, ingresa un correo electrónico válido (ejemplo: usuario@dominio.com).", "error");
      return; // Interrupción inmediata del pipeline antes de activar estados de carga o llamados API
    }

    setLoading(true); // Bloquea botones para mitigar condiciones de carrera (Race Conditions)

    if (authMode === "register") {
      // ---------------------------------------------------------------------
      // === FASE A.1: REGISTRO EN EL PROVEEDOR DE AUTH (Supabase Identity) ===
      // ---------------------------------------------------------------------
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      // Guardrail / Manejo estricto de errores de comunicación con el Identity Provider
      if (authError) {
        lanzarNotificacion(`Error al registrar cuenta: ${authError.message}`, "error");
        setLoading(false);
        return; // Interrupción inmediata del pipeline si la autenticación falla
      }

      // ---------------------------------------------------------------------
      // === FASE A.2: PERSISTENCIA EN CASCADA (Public Profile Table) ===
      // ---------------------------------------------------------------------
      // Si el usuario se creó correctamente en GoTrue (Auth), sincronizamos sus metadatos
      // dentro de la base de datos relacional PostgreSQL para el uso funcional de la app.
      if (authData?.user) {
        const { error: dbError } = await supabase.from("fotografos").insert([
          {
            id: authData.user.id, // Llave foránea (FK) vinculada directamente al ID único de la autenticación
            nombre_completo: fullName,
            email: email,
          },
        ]);

        if (dbError) {
          // El usuario existe en Auth pero falló la inserción en la tabla de negocio.
          // Alerta al administrador/usuario para diagnóstico sin romper el flujo del front.
          lanzarNotificacion(`Cuenta creada, pero hubo un error en el perfil: ${dbError.message}`, "error");
        } else {
          // Éxito absoluto: Perfil e identidad sincronizados correctamente.
          lanzarNotificacion("¡Perfil creado con éxito! ", "success");
          setAuthMode("login"); // Redirección interna hacia el formulario de acceso
        }
      }
    } else {
      // ---------------------------------------------------------------------
      // === FASE B: PROCESO DE INICIO DE SESIÓN (Sign In Session Management) ===
      // ---------------------------------------------------------------------
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        // 1. Por defecto dejamos el mensaje original por si sale un error raro
        let mensajeError = error.message;

        // 2. Filtramos los errores típicos
        if (error.message.includes("Invalid login credentials")) {
          mensajeError = "El correo o la contraseña no coinciden.";
        } else if (error.message.includes("Email not confirmed")) {
          mensajeError = "Por favor, confirma tu correo electrónico antes de ingresar.";
        } else if (error.message.includes("Rate limit exceeded")) {
          mensajeError = "Demasiados intentos. Por favor, intenta de nuevo en unos minutos.";
        }

        // 3. Lanzamos la notificación
        lanzarNotificacion(`Error al ingresar: ${mensajeError}`, "error");
      } else {
        // Establecimiento correcto de sesión de JWT. Redirección al área privada.
        navigate("/dashboard");
      }
    }

    // FASE DE LIBERACIÓN: Desbloquea la interfaz sin importar el resultado de la transacción
    setLoading(false);
  };

  // API pública expuesta por el Hook para consumo del componente presentacional Login.jsx
  return {
    authMode,
    email,
    setEmail,
    password,
    setPassword,
    fullName,
    setFullName,
    loading,
    notificacion, // Expuesto para renderizado condicional del Toast en la vista
    setNotificacion, // Expuesto para permitir el cierre manual desde la UI
    handleSwitchMode,
    handleSubmit,
  };
}
