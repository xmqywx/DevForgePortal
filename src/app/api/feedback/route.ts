import { db } from "@/db/client";
import { feedback, feedbackReplies } from "@/db/schema";
import { eq, ne, desc, and } from "drizzle-orm";
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/anti-spam";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = Number(searchParams.get("projectId"));

  if (!projectId) {
    return Response.json({ error: "projectId required" }, { status: 400 });
  }

  const items = db
    .select()
    .from(feedback)
    .where(and(eq(feedback.projectId, projectId), ne(feedback.status, "spam")))
    .orderBy(desc(feedback.createdAt))
    .all();

  const result = items.map((item) => ({
    ...item,
    replies: db
      .select()
      .from(feedbackReplies)
      .where(eq(feedbackReplies.feedbackId, item.id))
      .orderBy(feedbackReplies.createdAt)
      .all(),
  }));

  return Response.json(result);
}

export async function POST(request: Request) {
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (checkRateLimit(ip)) {
    return Response.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const body = await request.json();
  const { projectId, title, description, author_name, images } = body;

  if (!projectId || !title) {
    return Response.json(
      { error: "projectId and title are required" },
      { status: 400 },
    );
  }

  const result = db
    .insert(feedback)
    .values({
      projectId,
      title,
      description: description ?? "",
      authorName: author_name ?? "匿名",
      authorIp: ip,
      images: images ?? [],
    })
    .returning()
    .get();

  return Response.json(result, { status: 201 });
}
