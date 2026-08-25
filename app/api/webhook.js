import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Constantes de almacenamiento expresadas en Bytes
const ONE_GB_BYTES = 1 * 1024 * 1024 * 1024; // 1,073,741,824 bytes (Plan Standard)
const FIFTY_GB_BYTES = 50 * 1024 * 1024 * 1024; // 53,687,091,200 bytes (Plan Pro / Agency)

export const config = {
  api: {
    bodyParser: false,
  },
};

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", (err) => reject(err));
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  // Comprobación de variable de entorno
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("❌ Falta la variable STRIPE_SECRET_KEY en .env.local");
    return res.status(500).json({ error: "Falta STRIPE_SECRET_KEY en el servidor" });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  let event;

  try {
    const rawBody = await getRawBody(req);
    const sig = req.headers["stripe-signature"];

    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("❌ Error de firma en Webhook:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // 1. EVENTO: PAGO O SUSCRIPCIÓN EXITOSA
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.userId || session.client_reference_id;

      if (userId) {
        // Obtenemos el producto/precio que compró el usuario en la sesión
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        const priceId = lineItems.data[0]?.price?.id;

        // Determinamos el plan según el Price ID
        let planNombre = "pro"; // Valor por defecto

        if (priceId === process.env.STRIPE_PRICE_AGENCY) {
          planNombre = "agency";
        } else if (priceId === process.env.STRIPE_PRICE_PRO_STUDIO) {
          planNombre = "pro";
        } else if (session.metadata?.plan) {
          planNombre = session.metadata.plan;
        }

        // Actualizamos en Supabase con el plan y los 50 GB de almacenamiento
        const { error } = await supabase
          .from("fotografos")
          .update({
            plan: planNombre,
            stripe_customer_id: session.customer,
            storage_limit: FIFTY_GB_BYTES, // Asigna 53,687,091,200 bytes
          })
          .eq("id", userId);

        if (error) {
          console.error("❌ Error en Supabase:", error);
          return res.status(500).json({ error: "Error al actualizar Supabase" });
        }
      }
    }

    // 2. EVENTO: CANCELACIÓN DE SUSCRIPCIÓN
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      // Restablece al plan Standard con 1 GB al cancelar
      const { error } = await supabase
        .from("fotografos")
        .update({
          plan: "standard",
          storage_limit: ONE_GB_BYTES, // Restablece a 1,073,741,824 bytes
        })
        .eq("stripe_customer_id", customerId);

      if (error) {
        console.error("❌ Error al degradar plan en Supabase:", error);
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("❌ Error procesando el evento:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
