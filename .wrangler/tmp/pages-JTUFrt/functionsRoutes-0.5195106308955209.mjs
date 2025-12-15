import { onRequestPost as __api_bullets_ts_onRequestPost } from "C:\\Users\\elliotze\\OneDrive - Old Dominion University\\Desktop\\web\\Edge Notes\\functions\\api\\bullets.ts"
import { onRequestPost as __api_format_ts_onRequestPost } from "C:\\Users\\elliotze\\OneDrive - Old Dominion University\\Desktop\\web\\Edge Notes\\functions\\api\\format.ts"
import { onRequestPost as __api_health_ts_onRequestPost } from "C:\\Users\\elliotze\\OneDrive - Old Dominion University\\Desktop\\web\\Edge Notes\\functions\\api\\health.ts"
import { onRequestPost as __api_load_ts_onRequestPost } from "C:\\Users\\elliotze\\OneDrive - Old Dominion University\\Desktop\\web\\Edge Notes\\functions\\api\\load.ts"
import { onRequestPost as __api_rewrite_ts_onRequestPost } from "C:\\Users\\elliotze\\OneDrive - Old Dominion University\\Desktop\\web\\Edge Notes\\functions\\api\\rewrite.ts"
import { onRequestPost as __api_save_ts_onRequestPost } from "C:\\Users\\elliotze\\OneDrive - Old Dominion University\\Desktop\\web\\Edge Notes\\functions\\api\\save.ts"
import { onRequestPost as __api_style_ts_onRequestPost } from "C:\\Users\\elliotze\\OneDrive - Old Dominion University\\Desktop\\web\\Edge Notes\\functions\\api\\style.ts"
import { onRequestPost as __api_summarize_ts_onRequestPost } from "C:\\Users\\elliotze\\OneDrive - Old Dominion University\\Desktop\\web\\Edge Notes\\functions\\api\\summarize.ts"
import { onRequestPost as __api_translate_ts_onRequestPost } from "C:\\Users\\elliotze\\OneDrive - Old Dominion University\\Desktop\\web\\Edge Notes\\functions\\api\\translate.ts"
import { onRequestOptions as __api__middleware_ts_onRequestOptions } from "C:\\Users\\elliotze\\OneDrive - Old Dominion University\\Desktop\\web\\Edge Notes\\functions\\api\\_middleware.ts"
import { onRequestPost as __api__middleware_ts_onRequestPost } from "C:\\Users\\elliotze\\OneDrive - Old Dominion University\\Desktop\\web\\Edge Notes\\functions\\api\\_middleware.ts"

export const routes = [
    {
      routePath: "/api/bullets",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_bullets_ts_onRequestPost],
    },
  {
      routePath: "/api/format",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_format_ts_onRequestPost],
    },
  {
      routePath: "/api/health",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_health_ts_onRequestPost],
    },
  {
      routePath: "/api/load",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_load_ts_onRequestPost],
    },
  {
      routePath: "/api/rewrite",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_rewrite_ts_onRequestPost],
    },
  {
      routePath: "/api/save",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_save_ts_onRequestPost],
    },
  {
      routePath: "/api/style",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_style_ts_onRequestPost],
    },
  {
      routePath: "/api/summarize",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_summarize_ts_onRequestPost],
    },
  {
      routePath: "/api/translate",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_translate_ts_onRequestPost],
    },
  {
      routePath: "/api",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [__api__middleware_ts_onRequestOptions],
      modules: [],
    },
  {
      routePath: "/api",
      mountPath: "/api",
      method: "POST",
      middlewares: [__api__middleware_ts_onRequestPost],
      modules: [],
    },
  ]