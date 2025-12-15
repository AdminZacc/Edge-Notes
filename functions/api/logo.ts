// Cloudflare Pages Function to serve the logo image from KV
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const img = await context.env.NOTES_KV.get("img/rural-health-connect-logo.png", "arrayBuffer");
  if (!img) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(img, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000"
    }
  });
};
