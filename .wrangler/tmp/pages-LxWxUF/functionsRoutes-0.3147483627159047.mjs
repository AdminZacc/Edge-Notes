import { onRequestPost as __api_bullets_ts_onRequestPost } from "C:\\Users\\elliotze\\OneDrive - Old Dominion University\\Desktop\\web\\Edge Notes\\functions\\api\\bullets.ts"
import { onRequestPost as __api_load_ts_onRequestPost } from "C:\\Users\\elliotze\\OneDrive - Old Dominion University\\Desktop\\web\\Edge Notes\\functions\\api\\load.ts"
import { onRequestPost as __api_rewrite_ts_onRequestPost } from "C:\\Users\\elliotze\\OneDrive - Old Dominion University\\Desktop\\web\\Edge Notes\\functions\\api\\rewrite.ts"
import { onRequestPost as __api_save_ts_onRequestPost } from "C:\\Users\\elliotze\\OneDrive - Old Dominion University\\Desktop\\web\\Edge Notes\\functions\\api\\save.ts"
import { onRequestPost as __api_summarize_ts_onRequestPost } from "C:\\Users\\elliotze\\OneDrive - Old Dominion University\\Desktop\\web\\Edge Notes\\functions\\api\\summarize.ts"
import { onRequestPost as __api_translate_ts_onRequestPost } from "C:\\Users\\elliotze\\OneDrive - Old Dominion University\\Desktop\\web\\Edge Notes\\functions\\api\\translate.ts"
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
      method: "POST",
      middlewares: [__api__middleware_ts_onRequestPost],
      modules: [],
    },
  ]