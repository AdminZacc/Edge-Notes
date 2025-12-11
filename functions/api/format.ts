import type { PagesFunction } from "./types";
import { jsonResponse, errorResponse } from "./cors";

interface FormatRequest {
  content?: string;
  title?: string;
  subtitle?: string;
  tags?: string[];
}

// Process bullet items - detect "Label: Description" pattern
function formatBulletItem(text: string): string {
  // Match patterns like "Bold Label: rest of text" or "Label - rest of text"
  const colonMatch = text.match(/^([A-Z][^:]+):\s*(.+)$/i);
  if (colonMatch) {
    return `<strong style="color: #1e40af;">${colonMatch[1]}:</strong> ${colonMatch[2]}`;
  }
  return text;
}

// Detect if line is a heading (markdown style or short text without punctuation)
function isHeading(line: string): { level: number; text: string } | null {
  // Check for markdown-style headers
  const mdMatch = line.match(/^(#{1,3})\s+(.+)$/);
  if (mdMatch) {
    return { level: mdMatch[1].length, text: mdMatch[2] };
  }
  // Short lines without ending punctuation are likely headings
  if (line.length < 60 && !line.match(/[.!?,;:]$/) && line.length > 3) {
    return { level: 2, text: line };
  }
  return null;
}

export const onRequestPost: PagesFunction = async ({ request }) => {
  try {
    const { 
      content, 
      title = "Edge Notes", 
      subtitle = "AI-powered content created with Edge Notes",
      tags = ["Summary", "Notes", "AI Generated"]
    } = await request.json() as FormatRequest;
    
    if (!content || typeof content !== "string") {
      return errorResponse("Invalid content", 400);
    }

    // Convert plain text to styled HTML
    const lines = content.split('\n');
    let htmlContent = '';
    let inList = false;
    let listBuffer: string[] = [];

    const flushList = () => {
      if (listBuffer.length > 0) {
        htmlContent += `<ul style="margin: 8px 0 16px 0; padding-left: 24px; list-style-type: disc;">`;
        for (const item of listBuffer) {
          htmlContent += `<li style="margin-bottom: 8px; line-height: 1.5; color: #374151;">${formatBulletItem(item)}</li>`;
        }
        htmlContent += '</ul>';
        listBuffer = [];
      }
      inList = false;
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        flushList();
        continue;
      }

      // Check if it's a bullet point (-, *, •, or numbered)
      const bulletMatch = trimmed.match(/^[-•*]\s+(.+)$/) || trimmed.match(/^\d+[.)]\s+(.+)$/);
      if (bulletMatch) {
        inList = true;
        listBuffer.push(bulletMatch[1]);
        continue;
      }

      // Not a bullet - flush any pending list
      flushList();

      // Check for headings
      const heading = isHeading(trimmed);
      if (heading) {
        const fontSize = heading.level === 1 ? '1.4rem' : heading.level === 2 ? '1.2rem' : '1.05rem';
        const marginTop = heading.level === 1 ? '24px' : '20px';
        htmlContent += `<h${heading.level} style="color: #1e3a5f; margin: ${marginTop} 0 10px 0; font-size: ${fontSize}; font-weight: 600; border-bottom: ${heading.level <= 2 ? '2px solid #e5e7eb' : 'none'}; padding-bottom: ${heading.level <= 2 ? '6px' : '0'};">${heading.text}</h${heading.level}>`;
      } else {
        // Regular paragraph
        htmlContent += `<p style="margin: 0 0 12px 0; line-height: 1.65; color: #374151;">${trimmed}</p>`;
      }
    }
    flushList();

    // Build tags HTML
    const tagsHtml = tags.map(tag => 
      `<span style="display: inline-block; background: #eff6ff; color: #1e40af; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 500; border: 1px solid #bfdbfe;">${tag}</span>`
    ).join('\n        ');

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
    Created with <a href="https://edge-notes.pages.dev" style="color: #6b7280; text-decoration: none;">Edge Notes</a> • Powered by Cloudflare Workers AI
  </p>

</div>`;

    return jsonResponse({ result: styledHtml });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return errorResponse("HTML format failed", 500, message);
  }
};
