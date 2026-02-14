type SendParams = { to: string; subject: string; html: string; };
/**
 * Minimal Resend sender (no dependency) via fetch.
 */
export async function sendEmail(params: SendParams) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL || "No Catch <hello@nocatch.ai>";
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set; skipping email send.");
    return { skipped: true };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: params.subject,
      html: params.html
    })
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Resend error: ${res.status} ${txt}`);
  }
  return res.json();
}
