import type { PagesFunction } from "./types";

// Shared middleware: Turnstile validation
export const onRequestPost: PagesFunction = async ({ request, env }) => {
  // Allow certain routes to bypass Turnstile (e.g., loading last note)
  const url = new URL(request.url);
  const path = url.pathname.toLowerCase();
  const bypass = path.endsWith('/api/load');

  // In local dev or if secret not configured, bypass validation
  const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  if (bypass || isLocal || !env.TURNSTILE_SECRET) {
    return; // proceed without Turnstile check
  }

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
