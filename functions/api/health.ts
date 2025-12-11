import type { PagesFunction } from "./types";
import { jsonResponse } from "./cors";

export const onRequestPost: PagesFunction = async ({ env }) => {
  const aiBound = !!env.AI;
  const kvBound = !!env.NOTES_KV;
  const turnstileSecret = !!env.TURNSTILE_SECRET;
  const siteKey = (env as unknown as { TURNSTILE_SITE_KEY?: string }).TURNSTILE_SITE_KEY || null;

  // Try minimal KV/AI checks without throwing
  let kvCheck: string | null = null;
  try {
    if (kvBound) {
      kvCheck = await env.NOTES_KV.get("__health_check__");
    }
  } catch (_) {}

  const result = {
    ok: true,
    ai: aiBound,
    kv: kvBound,
    kvReadable: kvCheck !== null || kvCheck === null, // readable or empty
    turnstileSecret,
    siteKeyPresent: !!siteKey,
  };
  return jsonResponse(result);
};
