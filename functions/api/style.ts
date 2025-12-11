import type { PagesFunction } from "./types";
import { jsonResponse, errorResponse } from "./cors";

interface StyleRequest {
  content?: string;
  style?: string;
}

// Hierarchical style categories with detailed prompts
const stylePrompts: Record<string, { category: string; prompt: string }> = {
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

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  try {
    const { content, style = "formal" } = await request.json() as StyleRequest;
    if (!content || typeof content !== "string") {
      return errorResponse("Invalid content", 400);
    }
    
    const styleKey = style.toLowerCase();
    const styleConfig = stylePrompts[styleKey] || stylePrompts.formal;
    const prompt = `${styleConfig.prompt}. Preserve the original meaning.\n\n${content}`;
    
    const aiRes = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        { role: "system", content: "You are a helpful writing assistant skilled in adapting text to different styles and tones." },
        { role: "user", content: prompt }
      ]
    }) as { response?: string; result?: string };
    
    const result = aiRes?.response || aiRes?.result || JSON.stringify(aiRes);
    return jsonResponse({ result, style: styleKey, category: styleConfig.category });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return errorResponse("AI style failed", 500, message);
  }
};
