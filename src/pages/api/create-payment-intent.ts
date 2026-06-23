import type { APIRoute } from "astro";
import Stripe from "stripe";
import { serviceCatalog } from "../../data/serviceCatalog";

// On-demand: gira sul server, non al build.
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const secret = import.meta.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return json({ error: "Pago no configurado." }, 500);
  }

  let slug: string;
  try {
    ({ slug } = await request.json());
  } catch {
    return json({ error: "Solicitud no válida." }, 400);
  }

  const service = serviceCatalog.find((s) => s.slug === slug);

  // L'importo è deciso QUI dal catalogo, mai dal client: niente manomissioni.
  if (!service || service.paymentType !== "cart" || service.price <= 0) {
    return json({ error: "Servicio no válido." }, 400);
  }

  const amount = Math.round(service.price * 100); // centesimi: il prezzo è già IVA inclusa

  try {
    const stripe = new Stripe(secret);
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      description: service.title,
      automatic_payment_methods: { enabled: true },
      metadata: { slug: service.slug },
    });
    return json({ clientSecret: intent.client_secret }, 200);
  } catch (err) {
    console.error("PaymentIntent error:", err);
    return json({ error: "No se pudo iniciar el pago." }, 500);
  }
};

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
