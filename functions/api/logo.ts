// Cloudflare Pages Function to serve the logo image from D1
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const result = await context.env.images.prepare(
    "SELECT data, content_type FROM images WHERE id = ? LIMIT 1"
  ).bind("logo").first();
  if (!result || !result.data) {
    return new Response("Not found", { status: 404 });
  }
  // Ensure data is a Uint8Array for Response
  let binary;
  if (result.data instanceof Uint8Array) {
    binary = result.data;
  } else if (Array.isArray(result.data)) {
    binary = new Uint8Array(result.data);
  } else if (result.data?.buffer) {
    binary = new Uint8Array(result.data.buffer);
  } else {
    binary = result.data;
  }
  return new Response(binary, {
    headers: {
      "Content-Type": result.content_type || "image/png",
      "Cache-Control": "public, max-age=31536000"
    }
  });
};
