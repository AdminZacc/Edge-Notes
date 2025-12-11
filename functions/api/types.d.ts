/// <reference types="@cloudflare/workers-types" />
export interface Env {
  NOTES_KV: KVNamespace;
  TURNSTILE_SECRET: string;
  AI: Ai;
}

export type PagesFunction = (ctx: {
  request: Request;
  env: Env;
}) => Promise<Response | void>;

export interface Ai {
  run(model: string, input: unknown): Promise<unknown>;
}
