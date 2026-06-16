import type { APIRoute } from "astro";
import { put } from "@vercel/blob";

// On-demand: runs on the server.
export const prerender = false;

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB per file
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"];

export const POST: APIRoute = async ({ request }) => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "Invalid form data" }, 400);
  }

  const batch = crypto.randomUUID();
  const uploaded: { field: string; url: string; filename: string; contentType: string }[] = [];

  for (const [field, value] of form.entries()) {
    if (!(value instanceof File) || value.size === 0) continue;

    if (value.size > MAX_BYTES) {
      return json({ error: `"${value.name}" supera i 10 MB` }, 400);
    }
    if (!ALLOWED.includes(value.type)) {
      return json({ error: `Tipo di file non ammesso: ${value.type || "sconosciuto"}` }, 400);
    }

    const safeName = value.name.replace(/[^\w.\-]/g, "_");
    try {
      const blob = await put(`orders/${batch}/${field}-${safeName}`, value, {
        access: "public",
        addRandomSuffix: true,
      });

      uploaded.push({
        field,
        url: blob.url,
        filename: value.name,
        contentType: value.type,
      });
    } catch (err) {
      console.error("Blob upload error:", err);
      return json({ error: "No se pudieron subir los archivos. Inténtalo de nuevo." }, 500);
    }
  }

  return json({ files: uploaded }, 200);
};

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
