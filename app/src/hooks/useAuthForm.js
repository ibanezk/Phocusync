import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export function useAuthForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan");

  // =========================================================================
  // 1. ESTADOS LOCALES (Reactive State Management)
  // =========================================================================
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const [notificacion, setNotificacion] = useState({
    mostrar: false,
    mensaje: "",
    tipo: "success",
  });

  const lanzarNotificacion = (mensaje, tipo = "success") => {
    setNotificacion({ mostrar: true, mensaje, tipo });
    setTimeout(() => {
      setNotificacion((prev) => ({ ...prev, mostrar: false }));
    }, 4500);
  };

  // =========================================================================
  // HELPER: REDIRECCIÓN A STRIPE (Servicio Serverless API)
  // =========================================================================
  const procesarPagoStripe = async (user) => {
    try {
      lanzarNotificacion("Redirigiendo a la pasarela de pago...", "success");

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: plan,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url; // Redirección exitosa a Stripe
      } else {
        lanzarNotificacion(`Error en el checkout: ${data.error || "No se pudo generar el pago"}`, "error");
        setLoading(false);
      }
    } catch (error) {
      lanzarNotificacion(`Error de red: ${error.message}`, "error");
      setLoading(false);
    }
  };

  // Auto-redirección si el usuario YA tenía la sesión iniciada en el navegador
  useEffect(() => {
    const verificarSesionExistente = async () => {
      if (!plan) return;

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setLoading(true);
          await procesarPagoStripe(user);
        }
      } catch (err) {
        console.error("Error verificando sesión:", err);
        setLoading(false);
      }
    };

    verificarSesionExistente();
  }, [plan]);

  // =========================================================================
  // 2. MANEJADORES DE INTERFAZ / EVENTOS (UI State Cleaners)
  // =========================================================================
  const handleSwitchMode = () => {
    setAuthMode(authMode === "login" ? "register" : "login");
    setEmail("");
    setPassword("");
    if (fullName) setFullName("");
  };

  // =========================================================================
  // 3. LÓGICA CENTRAL ASÍNCRONA (Authentication Core & Pipeline)
  // =========================================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
      lanzarNotificacion("Por favor, ingresa un correo electrónico válido (ejemplo: usuario@dominio.com).", "error");
      return;
    }

    setLoading(true);

    if (authMode === "register") {
      // --- MODO REGISTRO ---
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (authError) {
        lanzarNotificacion(`Error al registrar cuenta: ${authError.message}`, "error");
        setLoading(false);
        return;
      }

      if (authData?.user) {
        const { error: dbError } = await supabase.from("fotografos").insert([
          {
            id: authData.user.id,
            nombre_completo: fullName,
            email: email,
          },
        ]);

        if (dbError) {
          lanzarNotificacion(`Cuenta creada, pero hubo un error en el perfil: ${dbError.message}`, "error");
          setLoading(false);
        } else {
          // Si venía con un plan seleccionado y la sesión fue creada automáticamente:
          if (plan && authData.session) {
            await procesarPagoStripe(authData.user);
          } else {
            lanzarNotificacion("¡Perfil creado con éxito!", "success");
            setAuthMode("login");
            setLoading(false);
          }
        }
      }
    } else {
      // --- MODO LOGIN ---
      const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        let mensajeError = error.message;

        if (error.message.includes("Invalid login credentials")) {
          mensajeError = "El correo o la contraseña no coinciden.";
        } else if (error.message.includes("Email not confirmed")) {
          mensajeError = "Por favor, confirma tu correo electrónico antes de ingresar.";
        } else if (error.message.includes("Rate limit exceeded")) {
          mensajeError = "Demasiados intentos. Por favor, intenta de nuevo en unos minutos.";
        }

        lanzarNotificacion(`Error al ingresar: ${mensajeError}`, "error");
        setLoading(false);
      } else {
        // Redirección condicional: Stripe si hay plan en la URL, Dashboard si no.
        if (plan && signInData?.user) {
          await procesarPagoStripe(signInData.user);
        } else {
          navigate("/dashboard");
          setLoading(false);
        }
      }
    }
  };

  return {
    authMode,
    email,
    setEmail,
    password,
    setPassword,
    fullName,
    setFullName,
    loading,
    notificacion,
    setNotificacion,
    handleSwitchMode,
    handleSubmit,
  };
}
