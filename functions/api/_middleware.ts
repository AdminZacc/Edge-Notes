import type { PagesFunction } from "./types";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle CORS preflight requests
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
};

// Helper to add CORS headers to responses
function addCorsHeaders(response: Response): Response {
  const newHeaders = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

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

  const body = await request.json().catch(() => ({})) as { turnstileToken?: string };
  const token = body?.turnstileToken;
  if (!token) {
    return addCorsHeaders(new Response(JSON.stringify({ error: "Missing Turnstile token" }), { status: 400, headers: { "Content-Type": "application/json" } }));
  }
  const form = new URLSearchParams();
  form.append("secret", env.TURNSTILE_SECRET);
  form.append("response", token);
  const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  }).then((r) => r.json()) as { success: boolean };
  if (!verify.success) {
    return addCorsHeaders(new Response(JSON.stringify({ error: "Turnstile failed" }), { status: 403, headers: { "Content-Type": "application/json" } }));
  }
};
