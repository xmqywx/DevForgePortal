import { db } from "@/db/client";
import { feedbackReplies } from "@/db/schema";
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
  const { content, author_name, images } = body;

  if (!content) {
    return Response.json({ error: "content is required" }, { status: 400 });
  }

  const result = db
    .insert(feedbackReplies)
    .values({
      feedbackId,
      authorName: isOwner ? "Ying" : (author_name ?? "匿名"),
      authorIp: ip,
      isOwner,
      content,
      images: images ?? [],
    })
    .returning()
    .get();

  return Response.json(result, { status: 201 });
}
