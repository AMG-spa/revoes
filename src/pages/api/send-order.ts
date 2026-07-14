import type { APIRoute } from "astro";
import { Resend } from "resend";
import { serviceCatalog } from "../../data/serviceCatalog";

// On-demand: gira sul server, non al build.
export const prerender = false;

const EMAIL_TO = import.meta.env.ORDER_EMAIL_TO;
const EMAIL_FROM = import.meta.env.ORDER_EMAIL_FROM || "onboarding@resend.dev";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB per file immagine (comunque compressa dal client)
const MAX_DOCUMENT_BYTES = 8 * 1024 * 1024; // 8 MB per documenti non-immagine (es. PDF, mai compressi)
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"];

export const POST: APIRoute = async ({ request }) => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "Solicitud no válida." }, 400);
  }

  const service = serviceCatalog.find((s) => s.slug === String(form.get("slug") || ""));
  if (!service) {
    return json({ error: "Servicio no válido." }, 400);
  }

  const rows: { label: string; value: string }[] = [];
  const attachments: { filename: string; content: string }[] = [];

  // Validazione per campo: ritorna un messaggio preciso su cosa manca / è errato.
  for (const field of service.fields) {
    const raw = form.get(field.name);

    if (field.type === "file") {
      const file = raw instanceof File && raw.size > 0 ? raw : null;
      if (!file) {
        if (field.required) return json({ error: `Falta el archivo: ${field.label}` }, 422);
        continue;
      }
      const isImage = file.type.startsWith("image/");
      const sizeLimit = isImage ? MAX_BYTES : MAX_DOCUMENT_BYTES;
      if (file.size > sizeLimit) {
        const limitMb = sizeLimit / 1024 / 1024;
        return json({ error: `El archivo "${field.label}" supera los ${limitMb} MB.` }, 422);
      }
      if (!ALLOWED.includes(file.type)) {
        return json({ error: `Formato no admitido en: ${field.label} (usa imagen o PDF).` }, 422);
      }
      const buf = Buffer.from(await file.arrayBuffer());
      attachments.push({ filename: file.name, content: buf.toString("base64") });
      rows.push({ label: field.label, value: `📎 ${file.name}` });
    } else if (field.type === "choice") {
      const value = typeof raw === "string" ? raw.trim() : "";
      const option = field.options?.find((o) => o.value === value);
      if (!option && field.required) {
        return json({ error: `Falta el campo: ${field.label}` }, 422);
      }
      rows.push({
        label: field.label,
        value: option
          ? `${option.label} (${option.price.toLocaleString("es-ES", { style: "currency", currency: "EUR" })} orientativo)`
          : "—",
      });
    } else {
      const value = typeof raw === "string" ? raw.trim() : "";
      if (!value && field.required) {
        return json({ error: `Falta el campo: ${field.label}` }, 422);
      }
      rows.push({ label: field.label, value: value || "—" });
    }
  }

  // Oggetto unico per richiesta -> Gmail non raggruppa più.
  const clientName = rows.find((r) => /nombre/i.test(r.label))?.value ?? "";
  const stamp = new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" });
  const subject = `Nueva solicitud · ${service.title}${clientName ? ` · ${clientName}` : ""} · ${stamp}`;

  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) {
    return json({ error: "Servicio de email no configurado." }, 500);
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: EMAIL_TO,
      subject,
      html: buildHtml(service.title, stamp, rows),
      attachments,
    });
    if (error) throw error;
  } catch (err) {
    console.error("Resend error:", err);
    return json({ error: "No se pudo enviar la solicitud. Inténtalo de nuevo." }, 500);
  }

  return json({ ok: true }, 200);
};

function esc(v: string) {
  return String(v).replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]!));
}

function buildHtml(title: string, stamp: string, rows: { label: string; value: string }[]) {
  const body = rows
    .map(
      (r) =>
        `<tr><td style="padding:8px 16px 8px 0;font-weight:700;vertical-align:top;white-space:nowrap">${esc(
          r.label
        )}</td><td style="padding:8px 0">${esc(r.value)}</td></tr>`
    )
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;color:#111;max-width:640px">
      <h2 style="margin:0 0 4px">${esc(title)}</h2>
      <p style="margin:0 0 16px;color:#666">Solicitud recibida el ${esc(stamp)}</p>
      <table style="border-collapse:collapse;font-size:15px;width:100%">${body}</table>
    </div>
  `;
}

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
