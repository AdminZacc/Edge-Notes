/// <reference types="@cloudflare/workers-types" />
export interface Env {
  NOTES_KV: KVNamespace;
  TURNSTILE_SECRET: string;
  AI: Ai;
  images: D1Database;
}

export type PagesFunction = (ctx: {
  request: Request;
  env: Env;
  next: () => Promise<Response>;
}) => Promise<Response | void>;

export interface Ai {
  run(model: string, input: unknown): Promise<unknown>;
}
