import type { APIRoute } from "astro";
import Stripe from "stripe";
import { del } from "@vercel/blob";
import { Resend } from "resend";

// On-demand: this route runs on the server, not at build time.
export const prerender = false;

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);
const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;
const resend = new Resend(import.meta.env.RESEND_API_KEY);

const EMAIL_TO = import.meta.env.ORDER_EMAIL_TO;
const EMAIL_FROM = import.meta.env.ORDER_EMAIL_FROM;

type OrderFile = { field: string; url: string; filename: string; contentType: string };
type OrderItem = {
  slug: string;
  title: string;
  price: number;
  formData: Record<string, string>;
  files: OrderFile[];
};
type Order = { orderId: string; createdAt: string; items: OrderItem[] };

export const POST: APIRoute = async ({ request }) => {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  // The raw body is required for signature verification — do not parse it.
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  // This is the ONLY place an order counts as paid. Never trust the redirect.
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderUrl = session.metadata?.orderUrl;

    if (!orderUrl) {
      console.warn("Paid session without orderUrl:", session.id);
      return new Response("ok", { status: 200 });
    }

    try {
      await fulfillOrder(orderUrl, session);
    } catch (err) {
      // Returning non-2xx makes Stripe retry the webhook later.
      console.error("Fulfilment failed:", err);
      return new Response("Fulfilment error", { status: 500 });
    }
  }

  return new Response("ok", { status: 200 });
};

async function fulfillOrder(orderUrl: string, session: Stripe.Checkout.Session) {
  // Fetch the stored order. If it's already gone, a previous delivery handled
  // this event — acts as natural idempotency against duplicate webhooks.
  const orderRes = await fetch(orderUrl);
  if (orderRes.status === 404) {
    console.log("Order already processed:", session.id);
    return;
  }
  if (!orderRes.ok) throw new Error(`Order fetch failed: ${orderRes.status}`);

  const order = (await orderRes.json()) as Order;

  // Collect every uploaded file as an email attachment.
  const attachments: { filename: string; content: string }[] = [];
  const allFileUrls: string[] = [];

  for (const item of order.items) {
    for (const file of item.files ?? []) {
      allFileUrls.push(file.url);
      const fileRes = await fetch(file.url);
      if (!fileRes.ok) continue;
      const buf = Buffer.from(await fileRes.arrayBuffer());
      attachments.push({ filename: file.filename, content: buf.toString("base64") });
    }
  }

  const amount = session.amount_total != null ? (session.amount_total / 100).toFixed(2) + " €" : "—";

  await resend.emails.send({
    from: EMAIL_FROM,
    to: EMAIL_TO,
    subject: `Nuevo pedido pagado — ${order.orderId}`,
    html: buildEmailHtml(order, amount, session.customer_details?.email ?? null),
    attachments,
  });

  // Clean up Blob: order record + every uploaded file.
  await Promise.allSettled([del(orderUrl), ...allFileUrls.map((u) => del(u))]);

  console.log("✅ Order delivered & cleaned up:", order.orderId);
}

function esc(value: string) {
  return String(value).replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]!));
}

function buildEmailHtml(order: Order, amount: string, customerEmail: string | null) {
  const blocks = order.items
    .map((item) => {
      const rows = Object.entries(item.formData)
        .map(
          ([key, val]) =>
            `<tr><td style="padding:4px 12px 4px 0;font-weight:700">${esc(key)}</td><td style="padding:4px 0">${esc(val)}</td></tr>`
        )
        .join("");
      const fileList = (item.files ?? [])
        .map((f) => `<li>${esc(f.filename)}</li>`)
        .join("");

      return `
        <h3 style="margin:20px 0 8px">${esc(item.title)} — ${item.price.toFixed(2)} € + IVA</h3>
        <table style="border-collapse:collapse;font-size:14px">${rows}</table>
        ${fileList ? `<p style="margin:10px 0 0;font-weight:700">Archivos adjuntos:</p><ul>${fileList}</ul>` : ""}
      `;
    })
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;color:#111">
      <h2>Nuevo pedido pagado</h2>
      <p><strong>ID:</strong> ${esc(order.orderId)}<br>
         <strong>Total pagado:</strong> ${esc(amount)}<br>
         <strong>Email cliente:</strong> ${esc(customerEmail ?? "—")}</p>
      ${blocks}
    </div>
  `;
}
