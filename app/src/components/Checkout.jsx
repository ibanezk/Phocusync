import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const planId = searchParams.get("plan");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // Redirige al login guardando la intención de compra
        navigate(`/login?plan=${planId}`);
        return;
      }

      setUser(session.user);
      setLoading(false);
    };

    checkUser();
  }, [planId, navigate]);

  const handleStripeRedirect = async () => {
    setProcessing(true);
    setErrorMessage("");

    // Validar que el planId esté presente en la URL
    if (!planId) {
      setErrorMessage("No se encontró el ID del plan en la URL. Regresa a la landing y selecciona un plan.");
      setProcessing(false);
      return;
    }

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: planId,
          userId: user?.id,
          userEmail: user?.email,
        }),
      });

      const textData = await res.text();
      let data = {};

      try {
        data = textData ? JSON.parse(textData) : {};
      } catch (e) {
        throw new Error(
          `El servidor respondió con un error no estructurado (${res.status}): ${textData || "Sin respuesta"}`,
        );
      }

      if (!res.ok) {
        throw new Error(data.error || `Error del servidor (${res.status})`);
      }

      if (data.url) {
        // Redirección exitosa a Stripe
        window.location.href = data.url;
      } else {
        throw new Error("El servidor no devolvió una URL válida de Stripe.");
      }
    } catch (err) {
      console.error("Error en handleStripeRedirect:", err);
      setErrorMessage(err.message || "Ocurrió un error al intentar conectar con la pasarela de pagos.");
      setProcessing(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate(`/login?plan=${planId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#041E15] text-white flex items-center justify-center">
        Cargando información...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#041E15] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#042419] border border-gray-800 p-8 rounded-lg text-center shadow-xl">
        <h2 className="text-2xl font-bold uppercase mb-2">Confirmar Suscripción</h2>
        <p className="text-gray-400 text-sm mb-6">Estás a punto de suscribirte utilizando la siguiente cuenta:</p>

        <div className="bg-[#02150E] p-4 rounded border border-gray-800 mb-6">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Cuenta activa</p>
          <p className="text-white font-medium">{user.email}</p>
        </div>

        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded text-xs mb-4 text-center">
            {errorMessage}
          </div>
        )}

        <button
          onClick={handleStripeRedirect}
          disabled={processing}
          className="w-full py-3.5 bg-[#FF4D00] text-white font-bold text-xs uppercase tracking-widest hover:bg-[#e04400] transition-colors mb-4 disabled:opacity-50">
          {processing ? "Redirigiendo a Stripe..." : "Continuar con tu compra"}
        </button>

        <button onClick={handleSignOut} className="text-xs text-gray-400 hover:text-white underline transition-colors">
          ¿No es tu cuenta? Cerrar sesión
        </button>
      </div>
    </div>
  );
}
