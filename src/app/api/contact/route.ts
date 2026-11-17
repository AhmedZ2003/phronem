import { NextResponse } from "next/server";
import { validateContact, type ContactInput } from "@/lib/contact";

/**
 * POST /api/contact: receives the contact form (src/components/contact/ContactForm.tsx).
 *
 * Validates with the same rules as the form, drops bot submissions (the hidden "website" field),
 * limits each address to a few sends, then delivers the message by the first method configured
 * in the environment (see .env.example):
 *
 *   CONTACT_WEBHOOK_URL                                   POST the submission as JSON to a webhook
 *                                                         (Zapier, Make, Slack, a CRM, Formspree…)
 *   RESEND_API_KEY + CONTACT_TO_EMAIL + CONTACT_FROM_EMAIL  send an email through Resend
 *
 * With neither set, development logs the submission to the server console and reports success;
 * production refuses with 503, so nobody is told their message arrived when it went nowhere.
 */

const MAX_BYTES = 20_000;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const recent = new Map<string, number[]>();

function rateLimited(key: string) {
  const now = Date.now();
  const hits = (recent.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(key, hits);
  if (recent.size > 5000) recent.clear();
  return hits.length > MAX_PER_WINDOW;
}

const audienceLabel: Record<ContactInput["audience"], string> = { clients: "Client", experts: "Expert", "learn-more": "Learn more" };

function asText(v: ContactInput) {
  return [`Type: ${audienceLabel[v.audience]}`, `Name: ${v.name}`, `Email: ${v.email}`, `Phone: ${v.phone}`, "", v.enquiry].join("\n");
}

async function deliver(v: ContactInput): Promise<"sent" | "logged" | "unconfigured"> {
  const subject = `${audienceLabel[v.audience]} enquiry from ${v.name} - Phronem website`;

  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (webhook) {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, ...v, receivedAt: new Date().toISOString() }),
    });
    if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
    return "sent";
  }

  const { RESEND_API_KEY: key, CONTACT_TO_EMAIL: to, CONTACT_FROM_EMAIL: from } = process.env;
  if (key && to && from) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: to.split(",").map((s) => s.trim()), reply_to: v.email, subject, text: asText(v) }),
    });
    if (!res.ok) throw new Error(`Resend responded ${res.status}`);
    return "sent";
  }

  if (process.env.NODE_ENV !== "production") {
    console.info(`[contact] No delivery configured; logging instead.\n${subject}\n${asText(v)}`);
    return "logged";
  }
  return "unconfigured";
}

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BYTES) return NextResponse.json({ error: "too_large" }, { status: 413 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Honeypot: people never fill this in. Answer as if it worked so bots learn nothing.
  if (typeof body.website === "string" && body.website.trim() !== "") return NextResponse.json({ ok: true });

  const result = validateContact(body);
  if (!result.ok) return NextResponse.json({ errors: result.errors }, { status: 400 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  if (rateLimited(ip)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  try {
    const outcome = await deliver(result.value);
    if (outcome === "unconfigured") {
      console.error("[contact] Submission refused: set CONTACT_WEBHOOK_URL or the RESEND_* variables (see .env.example).");
      return NextResponse.json({ error: "not_configured" }, { status: 503 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] Delivery failed:", err);
    return NextResponse.json({ error: "delivery_failed" }, { status: 502 });
  }
}
