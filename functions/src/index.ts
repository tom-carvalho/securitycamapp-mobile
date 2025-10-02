// functions/src/index.ts
import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2/options";
import corsLib from "cors";
import { Resend } from "resend";
import { z } from "zod";

setGlobalOptions({
  region: "us-central1",
  maxInstances: 10,
  memory: "512MiB",
  timeoutSeconds: 30
});

const cors = corsLib({ origin: true });

const CaptureSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  fromName: z.string().optional().default("App Security Cam"),
  subject: z.string().optional().default("Nova captura do App Security Cam"),
  createdAt: z.string().datetime().optional(),
  path: z.string().optional(),
  location: z
    .object({
      lat: z.number(),
      lon: z.number(),
      accuracy: z.number().optional()
    })
    .nullable()
    .optional(),
  imageBase64: z.string().min(10),
  filename: z.string().min(1).default(() => `capture_${Date.now()}.jpg`),
  token: z.string().min(10)
});

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const API_TOKEN = process.env.API_TOKEN || "";
const MAIL_DOMAIN = process.env.MAIL_DOMAIN || "example.com";

const resend = new Resend(RESEND_API_KEY);

export const sendCaptureEmail = onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        res.status(405).json({ error: "Method Not Allowed" });
        return;
      }

      const parsed = CaptureSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid payload", details: parsed.error.errors });
        return;
      }
      const payload = parsed.data;

      if (!API_TOKEN || payload.token !== API_TOKEN) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      if (!RESEND_API_KEY) {
        res.status(500).json({ error: "Missing RESEND_API_KEY" });
        return;
      }

      const toList = Array.isArray(payload.to) ? payload.to : [payload.to];
      const when = payload.createdAt
        ? new Date(payload.createdAt).toLocaleString()
        : new Date().toLocaleString();

      const locStr = payload.location
        ? `Lat ${payload.location.lat.toFixed(5)}, Lon ${payload.location.lon.toFixed(5)}${
            payload.location.accuracy ? ` · ±${Math.round(payload.location.accuracy)}m` : ""
          }`
        : "Sem localização";

      const html = `
        <div style="font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif">
          <h2 style="margin-bottom:8px">📸 Nova captura</h2>
          <p style="margin:6px 0"><b>Data:</b> ${when}</p>
          <p style="margin:6px 0"><b>Localização:</b> ${locStr}</p>
          ${payload.path ? `<p style="margin:6px 0"><b>Origem (path):</b> ${payload.path}</p>` : ""}
          <p style="margin-top:16px">Imagem em anexo.</p>
        </div>
      `;

      const { data, error } = await resend.emails.send({
        from: `${payload.fromName} <no-reply@${MAIL_DOMAIN}>`,
        to: toList,
        subject: payload.subject!,
        html,
        attachments: [
          {
            filename: payload.filename,
            content: payload.imageBase64,
            contentType: "image/jpeg"
          }
        ]
      });

      if (error) {
        console.error("Resend error:", error);
        res.status(502).json({ error: "Email provider error", details: error });
        return;
      }

      res.status(200).json({ ok: true, id: data?.id });
    } catch (err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(err);
  res.status(500).json({ error: "Internal error", details: message });
}

  });
});
