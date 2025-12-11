import type { PagesFunction } from "./types";

// Shared middleware: Turnstile validation
export const onRequestPost: PagesFunction = async ({ request, env }) => {
  const body = await request.json().catch(() => ({}));
  const token = body?.turnstileToken;
  if (!token) {
    return new Response(JSON.stringify({ error: "Missing Turnstile token" }), { status: 400 });
  }
  const form = new URLSearchParams();
  form.append("secret", env.TURNSTILE_SECRET);
  form.append("response", token);
  const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  }).then((r) => r.json());
  if (!verify.success) {
    return new Response(JSON.stringify({ error: "Turnstile failed" }), { status: 403 });
  }
};
