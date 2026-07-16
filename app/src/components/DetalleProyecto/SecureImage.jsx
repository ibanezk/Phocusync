import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function SecureImage({ fotoUrl, alt, className }) {
  const [secureUrl, setSecureUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const obtenerUrlSegura = async () => {
      if (!fotoUrl) return;

      try {
        // Extraemos la ruta del bucket
        const urlParts = fotoUrl.split("/storage/v1/object/public/galerias/");
        if (urlParts.length < 2) {
          setError(true);
          return;
        }
        const filePath = urlParts[1];

        // Pedimos la URL firmada por 15 minutos (900 segundos)
        const { data, error: storageError } = await supabase.storage.from("galerias").createSignedUrl(filePath, 10);

        if (storageError || !data) {
          setError(true);
        } else {
          setSecureUrl(data.signedUrl);
        }
      } catch (err) {
        console.error("Error al firmar la URL:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    obtenerUrlSegura();
  }, [fotoUrl]);

  // 1. Mientras firma, muestra un esqueleto de carga elegante
  if (loading) {
    return <div className={`${className} animate-pulse bg-gradient-to-br from-purple-900/20 to-[#09171d]`} />;
  }

  // 2. Si falla la firma, mostramos tu imagen de Unsplash de respaldo
  if (error) {
    return (
      <img
        src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop"
        alt="Error de carga"
        className={`${className} opacity-20`}
      />
    );
  }

  // 3. Todo salió bien: renderiza la imagen real con la URL segura
  return <img src={secureUrl} alt={alt} className={className} loading="lazy" />;
}
