import { db } from "@/db/client";
import { feedback, feedbackReplies, projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  ctx: RouteContext<"/api/feedback/[id]/reply">,
) {
  const { id } = await ctx.params;
  const feedbackId = Number(id);

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const isOwner =
    req.headers.get("x-owner-secret") === process.env.OWNER_SECRET;

  const body = await req.json();
  const { content, author_name, images, avatar_url } = body;

  if (!content) {
    return Response.json({ error: "content is required" }, { status: 400 });
  }

  const result = db
    .insert(feedbackReplies)
    .values({
      feedbackId,
      authorName: isOwner ? "Kris" : (author_name ?? "匿名"),
      authorIp: ip,
      isOwner,
      content,
      images: images ?? [],
      avatarUrl: avatar_url ?? null,
    })
    .returning()
    .get();

  // Look up feedback for notifications + broadcast
  const fb = db.select().from(feedback).where(eq(feedback.id, feedbackId)).get();

  // Send notification for non-owner replies
  if (!isOwner && fb) {
    const project = db.select().from(projects).where(eq(projects.id, fb.projectId)).get();
    if (project) {
      import("@/lib/notify").then(({ notifyNewReply }) => {
        notifyNewReply(
          fb.title,
          author_name ?? "匿名",
          content,
          project.slug,
          feedbackId,
        ).catch(console.error);
      });
    }
  }

  // Broadcast real-time event
  import("@/lib/ws-broadcast").then(({ wsBroadcast }) => {
    wsBroadcast({ type: "new_reply", data: { feedbackId, authorName: isOwner ? "Kris" : (author_name ?? "匿名"), feedbackTitle: fb?.title } });
  });

  return Response.json(result, { status: 201 });
}
