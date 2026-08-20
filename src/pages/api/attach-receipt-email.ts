import type { APIRoute } from "astro";
import Stripe from "stripe";

// On-demand: gira sul server.
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const secret = import.meta.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return json({ error: "Pago no configurado." }, 500);
  }

  let paymentIntentId: string;
  let email: string;
  let name: string | undefined;
  try {
    ({ paymentIntentId, email, name } = await request.json());
  } catch {
    return json({ error: "Solicitud no válida." }, 400);
  }

  if (!paymentIntentId || !email) {
    return json({ error: "Datos incompletos." }, 400);
  }

  try {
    const stripe = new Stripe(secret);
    // Stripe invierà la ricevuta del pagamento a questo indirizzo (in live mode).
    // Il nome del cliente va in description/metadata così è visibile nella
    // Dashboard Stripe senza dover incrociare con la mail della richiesta.
    await stripe.paymentIntents.update(paymentIntentId, {
      receipt_email: email,
      ...(name ? { description: name, metadata: { customer_name: name } } : {}),
    });
    return json({ ok: true }, 200);
  } catch (err) {
    console.error("Receipt email error:", err);
    return json({ error: "No se pudo asociar el email." }, 500);
  }
};

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
