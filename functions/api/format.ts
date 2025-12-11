import type { PagesFunction } from "./types";
import { jsonResponse, errorResponse } from "./cors";

interface FormatRequest {
  content?: string;
  title?: string;
}

export const onRequestPost: PagesFunction = async ({ request }) => {
  try {
    const { content, title = "AI Generated Content" } = await request.json() as FormatRequest;
    if (!content || typeof content !== "string") {
      return errorResponse("Invalid content", 400);
    }

    // Convert plain text to HTML paragraphs and lists
    const lines = content.split('\n').filter(line => line.trim());
    let htmlContent = '';
    let inList = false;

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Check if it's a bullet point
      if (trimmed.match(/^[-•*]\s/)) {
        if (!inList) {
          htmlContent += '<ul style="margin: 0 0 0 18px; padding: 0;">';
          inList = true;
        }
        htmlContent += `<li>${trimmed.replace(/^[-•*]\s/, '')}</li>`;
      } else {
        if (inList) {
          htmlContent += '</ul>';
          inList = false;
        }
        // Check if it looks like a heading (short, no punctuation at end)
        if (trimmed.length < 60 && !trimmed.match(/[.!?,;:]$/)) {
          htmlContent += `<h2 style="color: #003057; margin: 16px 0 8px 0; font-size: 1.1rem;">${trimmed}</h2>`;
        } else {
          htmlContent += `<p style="margin: 0 0 12px 0; line-height: 1.6;">${trimmed}</p>`;
        }
      }
    }
    if (inList) htmlContent += '</ul>';

    const styledHtml = `<div style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.15); padding: 2rem; max-width: 800px; margin: 2rem auto; font-family: system-ui, -apple-system, sans-serif; color: #1a1a1a; overflow-wrap: break-word; word-break: break-word; box-sizing: border-box;">
  <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
    <div style="width: 60px; height: 60px; background: #003057; color: white; display: flex; align-items: center; justify-content: center; border-radius: 10px; font-weight: bold; font-size: 20px;">EN</div>
    <div>
      <h1 style="margin: 0; color: #003057; font-size: 1.5rem;">${title}</h1>
      <div style="color: #6b7280; font-size: 14px; margin-top: 4px;">Generated with Edge AI Notes</div>
      <div style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap;">
        <span style="background: #f1f5f9; padding: 4px 10px; border-radius: 999px; font-size: 12px; color: #003057; border: 1px solid rgba(0,48,87,0.06);">AI Generated</span>
      </div>
    </div>
  </div>
  <section style="margin-bottom: 18px;">
    <div style="padding: 12px; border-radius: 8px; background: #f1f5f9; border: 1px solid #eaf3ff;">
      ${htmlContent}
    </div>
  </section>
  <div style="padding: 12px; border-radius: 8px; background: #fff9eb; border-left: 4px solid #ffb300; color: #553d07; margin-top: 12px; font-size: 13px;">
    <strong>✨ Tip:</strong> Copy this HTML to use in emails, documents, or web pages!
  </div>
  <p style="font-size: 11px; color: #6b7280; text-align: center; margin-top: 16px;">Created with Edge AI Notes • Powered by Cloudflare Workers AI</p>
</div>`;

    return jsonResponse({ result: styledHtml });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return errorResponse("HTML format failed", 500, message);
  }
};
