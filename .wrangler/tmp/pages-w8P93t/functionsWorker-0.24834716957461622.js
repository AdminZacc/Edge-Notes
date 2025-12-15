var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// api/cors.ts
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};
var jsonCorsHeaders = {
  "Content-Type": "application/json",
  ...corsHeaders
};
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: jsonCorsHeaders
  });
}
__name(jsonResponse, "jsonResponse");
function errorResponse(error, status = 400, details) {
  return jsonResponse({ error, ...details && { details } }, status);
}
__name(errorResponse, "errorResponse");

// api/bullets.ts
var onRequestPost = /* @__PURE__ */ __name(async ({ request, env }) => {
  try {
    const { content } = await request.json();
    if (!content || typeof content !== "string") {
      return errorResponse("Invalid content", 400);
    }
    const prompt = `Convert the following text into 5-8 clear bullet points. Use hyphens and concise language.

${content}`;
    const aiRes = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt }
      ]
    });
    const result = aiRes?.response || aiRes?.result || JSON.stringify(aiRes);
    return jsonResponse({ result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return errorResponse("AI bullets failed", 500, message);
  }
}, "onRequestPost");

// api/format.ts
function formatBulletItem(text) {
  const colonMatch = text.match(/^([A-Z][^:]+):\s*(.+)$/i);
  if (colonMatch) {
    return `<strong style="color: #1e40af;">${colonMatch[1]}:</strong> ${colonMatch[2]}`;
  }
  return text;
}
__name(formatBulletItem, "formatBulletItem");
function isHeading(line) {
  const mdMatch = line.match(/^(#{1,3})\s+(.+)$/);
  if (mdMatch) {
    return { level: mdMatch[1].length, text: mdMatch[2] };
  }
  if (line.length < 60 && !line.match(/[.!?,;:]$/) && line.length > 3) {
    return { level: 2, text: line };
  }
  return null;
}
__name(isHeading, "isHeading");
var onRequestPost2 = /* @__PURE__ */ __name(async ({ request }) => {
  try {
    const {
      content,
      title = "Edge Notes",
      subtitle = "AI-powered content created with Edge Notes",
      tags = ["Summary", "Notes", "AI Generated"]
    } = await request.json();
    if (!content || typeof content !== "string") {
      return errorResponse("Invalid content", 400);
    }
    const lines = content.split("\n");
    let htmlContent = "";
    let inList = false;
    let listBuffer = [];
    const flushList = /* @__PURE__ */ __name(() => {
      if (listBuffer.length > 0) {
        htmlContent += `<ul style="margin: 8px 0 16px 0; padding-left: 24px; list-style-type: disc;">`;
        for (const item of listBuffer) {
          htmlContent += `<li style="margin-bottom: 8px; line-height: 1.5; color: #374151;">${formatBulletItem(item)}</li>`;
        }
        htmlContent += "</ul>";
        listBuffer = [];
      }
      inList = false;
    }, "flushList");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        flushList();
        continue;
      }
      const bulletMatch = trimmed.match(/^[-•*]\s+(.+)$/) || trimmed.match(/^\d+[.)]\s+(.+)$/);
      if (bulletMatch) {
        inList = true;
        listBuffer.push(bulletMatch[1]);
        continue;
      }
      flushList();
      const heading = isHeading(trimmed);
      if (heading) {
        const fontSize = heading.level === 1 ? "1.4rem" : heading.level === 2 ? "1.2rem" : "1.05rem";
        const marginTop = heading.level === 1 ? "24px" : "20px";
        htmlContent += `<h${heading.level} style="color: #1e3a5f; margin: ${marginTop} 0 10px 0; font-size: ${fontSize}; font-weight: 600; border-bottom: ${heading.level <= 2 ? "2px solid #e5e7eb" : "none"}; padding-bottom: ${heading.level <= 2 ? "6px" : "0"};">${heading.text}</h${heading.level}>`;
      } else {
        htmlContent += `<p style="margin: 0 0 12px 0; line-height: 1.65; color: #374151;">${trimmed}</p>`;
      }
    }
    flushList();
    const tagsHtml = tags.map(
      (tag) => `<span style="display: inline-block; background: #eff6ff; color: #1e40af; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 500; border: 1px solid #bfdbfe;">${tag}</span>`
    ).join("\n        ");
    const styledHtml = `<div style="background-color: #ffffff; max-width: 700px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1f2937; line-height: 1.6;">
  
  <!-- Header Card -->
  <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px; color: white;">
    <div style="display: flex; align-items: flex-start; gap: 16px;">
      <div style="width: 50px; height: 50px; background: rgba(255,255,255,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; flex-shrink: 0;">EN</div>
      <div style="flex: 1;">
        <h1 style="margin: 0 0 6px 0; font-size: 1.4rem; font-weight: 600; color: white;">${title}</h1>
        <p style="margin: 0; font-size: 14px; opacity: 0.9; color: #e0e7ff;">${subtitle}</p>
      </div>
    </div>
    <div style="margin-top: 16px; display: flex; gap: 8px; flex-wrap: wrap;">
      ${tagsHtml}
    </div>
  </div>

  <!-- Content Section -->
  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px 24px;">
    ${htmlContent}
  </div>

  <!-- Tip/Remember Box -->
  <div style="background: #fef9c3; border-left: 4px solid #eab308; border-radius: 0 8px 8px 0; padding: 14px 18px; margin-top: 20px;">
    <p style="margin: 0; color: #713f12; font-size: 14px; line-height: 1.5;">
      <strong style="color: #854d0e;">Remember:</strong> This content was generated with AI assistance. Always review and verify important information before sharing.
    </p>
  </div>

  <!-- Footer -->
  <p style="font-size: 11px; color: #9ca3af; text-align: center; margin-top: 20px;">
    Created with <a href="https://edge-notes.pages.dev" style="color: #6b7280; text-decoration: none;">Edge Notes</a> \u2022 Powered by Cloudflare Workers AI
  </p>

</div>`;
    return jsonResponse({ result: styledHtml });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return errorResponse("HTML format failed", 500, message);
  }
}, "onRequestPost");

// api/health.ts
var onRequestPost3 = /* @__PURE__ */ __name(async ({ env }) => {
  const aiBound = !!env.AI;
  const kvBound = !!env.NOTES_KV;
  const turnstileSecret = !!env.TURNSTILE_SECRET;
  const siteKey = env.TURNSTILE_SITE_KEY || null;
  let kvCheck = null;
  try {
    if (kvBound) {
      kvCheck = await env.NOTES_KV.get("__health_check__");
    }
  } catch (_) {
  }
  const result = {
    ok: true,
    ai: aiBound,
    kv: kvBound,
    kvReadable: kvCheck !== null || kvCheck === null,
    // readable or empty
    turnstileSecret,
    siteKeyPresent: !!siteKey
  };
  return jsonResponse(result);
}, "onRequestPost");

// api/load.ts
var onRequestPost4 = /* @__PURE__ */ __name(async ({ request, env }) => {
  const { key, sessionId } = await request.json();
  let noteKey = key;
  if (!noteKey && sessionId) {
    noteKey = await env.NOTES_KV.get(`session:${sessionId}:last`);
  }
  if (!noteKey) {
    return errorResponse("No key or session known", 400);
  }
  const content = await env.NOTES_KV.get(`note:${noteKey}`);
  if (content == null) {
    return errorResponse("Note not found", 404);
  }
  return jsonResponse({ key: noteKey, content });
}, "onRequestPost");

// api/rewrite.ts
var onRequestPost5 = /* @__PURE__ */ __name(async ({ request, env }) => {
  try {
    const { content } = await request.json();
    if (!content || typeof content !== "string") {
      return errorResponse("Invalid content", 400);
    }
    const prompt = `Rewrite the following text to be clearer and more concise while keeping the original intent.

${content}`;
    const aiRes = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt }
      ]
    });
    const result = aiRes?.response || aiRes?.result || JSON.stringify(aiRes);
    return jsonResponse({ result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return errorResponse("AI rewrite failed", 500, message);
  }
}, "onRequestPost");

// api/save.ts
var onRequestPost6 = /* @__PURE__ */ __name(async ({ request, env }) => {
  const { content, sessionId } = await request.json();
  if (!content || typeof content !== "string") {
    return errorResponse("Invalid content", 400);
  }
  const key = crypto.randomUUID();
  await env.NOTES_KV.put(`note:${key}`, content, { metadata: { created: Date.now() } });
  if (sessionId && typeof sessionId === "string") {
    await env.NOTES_KV.put(`session:${sessionId}:last`, key);
  }
  return jsonResponse({ key });
}, "onRequestPost");

// api/style.ts
var stylePrompts = {
  // Professional
  formal: {
    category: "Professional",
    prompt: "Rewrite the following text in a formal, professional tone suitable for business communication. Use proper grammar, avoid contractions, and maintain a respectful, authoritative voice"
  },
  business: {
    category: "Professional",
    prompt: "Rewrite the following text for a business audience. Be clear, concise, action-oriented, and focus on value propositions and outcomes"
  },
  academic: {
    category: "Professional",
    prompt: "Rewrite the following text in an academic, scholarly tone. Use precise language, formal structure, objective voice, and cite-worthy phrasing"
  },
  technical: {
    category: "Professional",
    prompt: "Rewrite the following text in a technical style. Be precise, use appropriate terminology, structure information logically, and assume a knowledgeable audience"
  },
  // Conversational
  casual: {
    category: "Conversational",
    prompt: "Rewrite the following text in a casual, relaxed tone. Use everyday language, contractions, and a friendly approach as if talking to a friend"
  },
  friendly: {
    category: "Conversational",
    prompt: "Rewrite the following text in a warm, friendly, approachable tone. Be personable, use inclusive language, and create a welcoming feel"
  },
  simple: {
    category: "Conversational",
    prompt: "Rewrite the following text in simple, easy-to-understand language. Use short sentences, common words, and avoid jargon. Aim for a 6th-grade reading level"
  },
  // Creative
  creative: {
    category: "Creative",
    prompt: "Rewrite the following text in a creative, engaging, and expressive style. Use vivid descriptions, varied sentence structures, and captivating language"
  },
  poetic: {
    category: "Creative",
    prompt: "Rewrite the following text in a poetic, lyrical style. Use metaphors, imagery, rhythm, and evocative language to create an emotional impact"
  },
  storytelling: {
    category: "Creative",
    prompt: "Rewrite the following text as a narrative story. Add scene-setting, character perspective, dramatic tension, and a compelling flow"
  },
  humorous: {
    category: "Creative",
    prompt: "Rewrite the following text with humor and wit. Add clever wordplay, light jokes, or amusing observations while keeping the core message intact"
  },
  // Persuasive
  persuasive: {
    category: "Persuasive",
    prompt: "Rewrite the following text in a persuasive, compelling tone. Use rhetorical techniques, emotional appeals, and strong calls to action to convince the reader"
  },
  motivational: {
    category: "Persuasive",
    prompt: "Rewrite the following text in an inspiring, motivational tone. Use empowering language, positive framing, and encourage action and belief"
  },
  sales: {
    category: "Persuasive",
    prompt: "Rewrite the following text as a sales pitch. Highlight benefits, create urgency, address objections, and include a compelling call to action"
  },
  // Content
  journalistic: {
    category: "Content",
    prompt: "Rewrite the following text in a journalistic style. Use the inverted pyramid structure, lead with key facts, be objective, and attribute information clearly"
  },
  social: {
    category: "Content",
    prompt: "Rewrite the following text for social media. Be concise, engaging, use hooks, include relevant emojis, and optimize for shareability"
  },
  seo: {
    category: "Content",
    prompt: "Rewrite the following text optimized for SEO. Use natural keyword integration, clear headings, readable structure, and engaging meta-friendly language"
  }
};
var onRequestPost7 = /* @__PURE__ */ __name(async ({ request, env }) => {
  try {
    const { content, style = "formal" } = await request.json();
    if (!content || typeof content !== "string") {
      return errorResponse("Invalid content", 400);
    }
    const styleKey = style.toLowerCase();
    const styleConfig = stylePrompts[styleKey] || stylePrompts.formal;
    const prompt = `${styleConfig.prompt}. Preserve the original meaning.

${content}`;
    const aiRes = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        { role: "system", content: "You are a helpful writing assistant skilled in adapting text to different styles and tones." },
        { role: "user", content: prompt }
      ]
    });
    const result = aiRes?.response || aiRes?.result || JSON.stringify(aiRes);
    return jsonResponse({ result, style: styleKey, category: styleConfig.category });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return errorResponse("AI style failed", 500, message);
  }
}, "onRequestPost");

// api/summarize.ts
var onRequestPost8 = /* @__PURE__ */ __name(async ({ request, env }) => {
  try {
    const { content } = await request.json();
    if (!content || typeof content !== "string") {
      return errorResponse("Invalid content", 400);
    }
    const prompt = `Summarize the following text in 3-5 concise sentences:

${content}`;
    const aiRes = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt }
      ]
    });
    const result = aiRes?.response || aiRes?.result || JSON.stringify(aiRes);
    return jsonResponse({ result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return errorResponse("AI summarize failed", 500, message);
  }
}, "onRequestPost");

// api/translate.ts
var onRequestPost9 = /* @__PURE__ */ __name(async ({ request, env }) => {
  try {
    const { content, target = "es" } = await request.json();
    if (!content || typeof content !== "string") {
      return errorResponse("Invalid content", 400);
    }
    const prompt = `Translate the following text into ${target}. Preserve meaning and tone.

${content}`;
    const aiRes = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt }
      ]
    });
    const result = aiRes?.response || aiRes?.result || JSON.stringify(aiRes);
    return jsonResponse({ result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return errorResponse("AI translate failed", 500, message);
  }
}, "onRequestPost");

// api/_middleware.ts
var corsHeaders2 = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};
var onRequestOptions = /* @__PURE__ */ __name(async () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders2
  });
}, "onRequestOptions");
function addCorsHeaders(response) {
  const newHeaders = new Headers(response.headers);
  Object.entries(corsHeaders2).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}
__name(addCorsHeaders, "addCorsHeaders");
var onRequestPost10 = /* @__PURE__ */ __name(async ({ request, env, next }) => {
  const url = new URL(request.url);
  const path = url.pathname.toLowerCase();
  const bypass = path.endsWith("/api/load") || path.endsWith("/api/health");
  const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (bypass || isLocal || !env.TURNSTILE_SECRET) {
    const response2 = await next();
    return addCorsHeaders(response2);
  }
  const clonedRequest = request.clone();
  const body = await clonedRequest.json().catch(() => ({}));
  const token = body?.turnstileToken;
  if (!token) {
    return addCorsHeaders(new Response(JSON.stringify({ error: "Missing Turnstile token" }), { status: 400, headers: { "Content-Type": "application/json" } }));
  }
  const form = new URLSearchParams();
  form.append("secret", env.TURNSTILE_SECRET);
  form.append("response", token);
  const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form
  }).then((r) => r.json());
  if (!verify.success) {
    return addCorsHeaders(new Response(JSON.stringify({ error: "Turnstile failed" }), { status: 403, headers: { "Content-Type": "application/json" } }));
  }
  const response = await next();
  return addCorsHeaders(response);
}, "onRequestPost");

// ../.wrangler/tmp/pages-w8P93t/functionsRoutes-0.5106659783585994.mjs
var routes = [
  {
    routePath: "/api/bullets",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/format",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/health",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  },
  {
    routePath: "/api/load",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost4]
  },
  {
    routePath: "/api/rewrite",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost5]
  },
  {
    routePath: "/api/save",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost6]
  },
  {
    routePath: "/api/style",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost7]
  },
  {
    routePath: "/api/summarize",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost8]
  },
  {
    routePath: "/api/translate",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost9]
  },
  {
    routePath: "/api",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [onRequestOptions],
    modules: []
  },
  {
    routePath: "/api",
    mountPath: "/api",
    method: "POST",
    middlewares: [onRequestPost10],
    modules: []
  }
];

// ../../../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../../../../AppData/Roaming/npm/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
export {
  pages_template_worker_default as default
};
