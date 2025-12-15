// Cloudflare Pages Function to serve the logo image from D1
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const result = await context.env.images.prepare(
    "SELECT data, content_type FROM images WHERE id = ? LIMIT 1"
  ).bind("logo").first();
  if (!result || !result.data) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(result.data, {
    headers: {
      "Content-Type": result.content_type || "image/png",
      "Cache-Control": "public, max-age=31536000"
    }
  });
};
