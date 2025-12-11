import type { PagesFunction } from "./types";
import { jsonResponse, errorResponse } from "./cors";

interface ContentRequest {
  content?: string;
}

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  try {
    const { content } = await request.json() as ContentRequest;
    if (!content || typeof content !== "string") {
      return errorResponse("Invalid content", 400);
    }
    const prompt = `Convert the following text into 5-8 clear bullet points. Use hyphens and concise language.\n\n${content}`;
    const aiRes = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt }
      ]
    }) as { response?: string; result?: string };
    const result = aiRes?.response || aiRes?.result || JSON.stringify(aiRes);
    return jsonResponse({ result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return errorResponse("AI bullets failed", 500, message);
  }
};
