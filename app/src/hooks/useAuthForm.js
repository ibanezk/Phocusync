import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export function useAuthForm() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSwitchMode = () => {
    setAuthMode(authMode === "login" ? "register" : "login");
    setEmail("");
    setPassword("");
    setFullName("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (authMode === "register") {
      // === PROCESO DE REGISTRO ===
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (authError) {
        alert(`Error al registrar cuenta: ${authError.message}`);
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
          alert(`Cuenta creada, pero hubo un error en el perfil: ${dbError.message}`);
        } else {
          alert("¡Registro exitoso! Ya puedes iniciar sesión.");
          setAuthMode("login");
        }
      }
    } else {
      // === PROCESO DE INICIO DE SESIÓN ===
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        alert(`Error al ingresar: ${error.message}`);
      } else {
        navigate("/dashboard");
      }
    }

    setLoading(false);
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
    handleSwitchMode,
    handleSubmit,
  };
}
