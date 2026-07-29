import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();
// Inicializamos Stripe con la Secret Key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  try {
    const { priceId, userId, userEmail } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: userEmail,
      client_reference_id: userId,
      success_url: `${req.headers.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/pricing`,
    });

    return res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error) {
    // 💡 ESTO IMPRIMIRÁ EL ERROR REAL EN LA TERMINAL Y EN LA CONSOLA
    console.error("Error en Stripe Checkout:", error);
    return res.status(500).json({ error: error.message });
  }
}
