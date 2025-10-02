// src/utils/emailService.ts
// Cliente RN para enviar e-mail via sua API na Vercel (multipart/form-data)

const VERCEL_EMAIL_ENDPOINT =
  "https://securitycamapp-backend.vercel.app/api/send-email"; // <- seu endpoint
const VERCEL_API_KEY = "Neruda@1985"; // opcional: se a API exigir Bearer token, preencha aqui

type SendParams = {
  to: string;
  subject: string;
  body: string;
  fileUri?: string; // "file://..."
};

/**
 * Envia e-mail com anexo (foto) usando multipart/form-data
 * Espera que sua API aceite: to, subject, body, file (multipart)
 */
export async function sendEmailWithPhoto({
  to,
  subject,
  body,
  fileUri,
}: SendParams) {
  const form = new FormData();
  form.append("to", to);
  form.append("subject", subject);
  form.append("body", body);

  if (fileUri) {
    // Em React Native, arquivo em FormData precisa de { uri, name, type }
    // Não defina manualmente "Content-Type" no fetch — o RN cria com boundary.
    form.append("file", {
      // @ts-ignore RN FormData file
      uri: fileUri,
      name: "photo.jpg",
      type: "image/jpeg",
    });
  }

  const headers: Record<string, string> = {};
  if (VERCEL_API_KEY) headers["Authorization"] = `Bearer ${VERCEL_API_KEY}`;

  const res = await fetch(VERCEL_EMAIL_ENDPOINT, {
    method: "POST",
    headers,
    body: form,
  });

  if (!res.ok) {
    // tenta ler JSON/Texto pra depurar melhor
    let detail = "";
    try {
      const maybeJson = await res.json();
      detail = JSON.stringify(maybeJson);
    } catch {
      try {
        detail = await res.text();
      } catch {
        // ignore
      }
    }
    throw new Error(`Falha no envio (${res.status} ${res.statusText}) ${detail}`);
  }

  return true;
}
