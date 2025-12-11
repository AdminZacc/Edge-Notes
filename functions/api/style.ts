import type { PagesFunction } from "./types";
import { jsonResponse, errorResponse } from "./cors";

interface StyleRequest {
  content?: string;
  style?: string;
}

const stylePrompts: Record<string, string> = {
  formal: "Rewrite the following text in a formal, professional tone suitable for business communication",
  casual: "Rewrite the following text in a casual, friendly, conversational tone",
  creative: "Rewrite the following text in a creative, engaging, and expressive style",
  academic: "Rewrite the following text in an academic, scholarly tone with precise language",
  persuasive: "Rewrite the following text in a persuasive, compelling tone to convince the reader",
  humorous: "Rewrite the following text with humor and wit while keeping the core message",
  poetic: "Rewrite the following text in a poetic, lyrical style with vivid imagery",
  simple: "Rewrite the following text in simple, easy-to-understand language for a general audience",
};

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  try {
    const { content, style = "formal" } = await request.json() as StyleRequest;
    if (!content || typeof content !== "string") {
      return errorResponse("Invalid content", 400);
    }
    
    const styleKey = style.toLowerCase();
    const styleInstruction = stylePrompts[styleKey] || stylePrompts.formal;
    const prompt = `${styleInstruction}. Preserve the original meaning.\n\n${content}`;
    
    const aiRes = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        { role: "system", content: "You are a helpful writing assistant." },
        { role: "user", content: prompt }
      ]
    }) as { response?: string; result?: string };
    
    const result = aiRes?.response || aiRes?.result || JSON.stringify(aiRes);
    return jsonResponse({ result, style: styleKey });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return errorResponse("AI style failed", 500, message);
  }
};
