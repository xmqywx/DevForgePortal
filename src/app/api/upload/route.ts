import { handleUpload } from "@/lib/upload";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const urls = await handleUpload(formData);
    return Response.json({ urls });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return Response.json({ error: message }, { status: 400 });
  }
}
