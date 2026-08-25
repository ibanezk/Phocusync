import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  try {
    // Verificar que la clave exista antes de instanciar
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      console.error("ERROR: STRIPE_SECRET_KEY no está definida en el entorno.");
      return res.status(500).json({ error: "Falta configurar STRIPE_SECRET_KEY en el backend." });
    }

    const stripe = new Stripe(secretKey);

    // Parsear body con fallback por seguridad
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { priceId, userId, userEmail } = body;

    if (!priceId) {
      console.error("ERROR: No se recibió priceId en el body:", body);
      return res.status(400).json({ error: "El parametro priceId es requerido." });
    }

    // Asegurar un origen válido si el header origin falta en el proxy
    const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, "") || "http://localhost:3003";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: userEmail || undefined,
      client_reference_id: userId || undefined,
      success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#pricing`,
    });

    return res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Error en Stripe Checkout:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
