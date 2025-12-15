// functions/api/upload-logo.ts
export const onRequestPost: PagesFunction = async (context) => {
  const formData = await context.request.formData();
  const file = formData.get("file");
  if (!file || typeof file !== "object" || typeof (file as any).arrayBuffer !== "function") {
    return new Response("No file uploaded", { status: 400 });
  }
  const typedFile = file as Blob;

  const buffer = await (file as any).arrayBuffer();
  // Store the file in ASSETS (Fetch-compatible binding) using the fetch method
  await context.env.ASSETS.fetch("logo", {
    method: "PUT",
    body: buffer,
    headers: {
      "Content-Type": typedFile.type
    }
  });

  return new Response("Logo uploaded!");
};