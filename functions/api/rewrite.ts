import type { PagesFunction } from "./types";

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  const { content } = await request.json();
  if (!content || typeof content !== "string") {
    return new Response(JSON.stringify({ error: "Invalid content" }), { status: 400 });
  }
  const prompt = `Rewrite the following text to be clearer and more concise while keeping the original intent.\n\n${content}`;
  const aiRes = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: prompt }
    ]
  }) as any;
  const result = aiRes?.response || aiRes?.result || JSON.stringify(aiRes);
  return new Response(JSON.stringify({ result }), { headers: { "Content-Type": "application/json" } });
};
