// functions/api/upload-logo.ts
import { Env } from "./types";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const formData = await context.request.formData();
  const file = formData.get("file");
  if (!file || typeof file !== "object" || typeof (file as any).arrayBuffer !== "function") {
    return new Response("No file uploaded", { status: 400 });
  }
  const typedFile = file as Blob;
  const buffer = await (typedFile as any).arrayBuffer();
  const contentType = typedFile.type || "application/octet-stream";

  // Store the logo in D1 (images table, id = 'logo')
  await context.env.images.prepare(
    `INSERT OR REPLACE INTO images (id, data, content_type) VALUES (?, ?, ?)`
  ).bind(
    "logo",
    new Uint8Array(buffer),
    contentType
  ).run();

  return new Response("Logo uploaded to D1!");
};
