import type { APIRoute } from "astro";
import Stripe from "stripe";
import { put } from "@vercel/blob";
import { serviceCatalog, VAT_RATE } from "../../data/serviceCatalog";

// On-demand: this route runs on the server, not at build time.
export const prerender = false;

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);

type IncomingItem = {
  slug: string;
  formData?: Record<string, string>;
  files?: { field: string; url: string; filename: string; contentType: string }[];
};

export const POST: APIRoute = async ({ request }) => {
  // Return to whatever origin made the request: localhost in dev, the real
  // domain in production. No hardcoded URL to keep in sync.
  const origin = request.headers.get("origin") ?? new URL(request.url).origin;

  let items: unknown;
  try {
    ({ items } = await request.json());
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  if (!Array.isArray(items) || items.length === 0) {
    return json({ error: "No services provided" }, 400);
  }

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  const orderItems: Array<{
    slug: string;
    title: string;
    price: number;
    formData: Record<string, string>;
    files: IncomingItem["files"];
  }> = [];

  for (const raw of items as IncomingItem[]) {
    const service = serviceCatalog.find((s) => s.slug === raw?.slug);

    // Only payable cart services are accepted. Prices come from the server,
    // never from the client — this is what blocks price tampering.
    if (!service || service.paymentType !== "cart" || service.price <= 0) {
      return json({ error: `Invalid service: ${String(raw?.slug)}` }, 400);
    }

    const grossCents = Math.round(service.price * (1 + VAT_RATE) * 100);

    line_items.push({
      quantity: 1,
      price_data: {
        currency: "eur",
        unit_amount: grossCents,
        product_data: { name: `${service.title} (IVA incluido)` },
      },
    });

    orderItems.push({
      slug: service.slug,
      title: service.title,
      price: service.price,
      formData: raw.formData ?? {},
      files: raw.files ?? [],
    });
  }

  // Persist the full order (form fields + file links) to Blob. Stripe metadata
  // only carries the pointer, so we stay well within its size limits.
  let orderUrl: string;
  try {
    const orderId = crypto.randomUUID();
    const blob = await put(
      `orders/${orderId}/order.json`,
      JSON.stringify({ orderId, createdAt: new Date().toISOString(), items: orderItems }),
      { access: "public", addRandomSuffix: true, contentType: "application/json" }
    );
    orderUrl = blob.url;
  } catch (err) {
    console.error("Order persistence error:", err);
    return json({ error: "Order could not be saved" }, 500);
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      metadata: { orderUrl, site: "revo" },
      success_url: `${origin}/pedido-confirmado?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/carrito`,
    });

    return json({ url: session.url }, 200);
  } catch (err) {
    console.error("Stripe session error:", err);
    return json({ error: "Payment session could not be created" }, 500);
  }
};

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
