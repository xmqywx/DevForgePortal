import { db } from "@/db/client";
import { feedback, feedbackVotes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";

export async function POST(
  _req: NextRequest,
  ctx: RouteContext<"/api/feedback/[id]/vote">,
) {
  const { id } = await ctx.params;
  const feedbackId = Number(id);

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  // Check if already voted
  const existing = db
    .select()
    .from(feedbackVotes)
    .where(eq(feedbackVotes.feedbackId, feedbackId))
    .all()
    .find((v) => v.voterIp === ip);

  if (existing) {
    return Response.json({ error: "Already voted" }, { status: 409 });
  }

  // Record vote
  db.insert(feedbackVotes)
    .values({ feedbackId, voterIp: ip })
    .run();

  // Increment upvotes
  const item = db
    .select()
    .from(feedback)
    .where(eq(feedback.id, feedbackId))
    .get();

  if (item) {
    db.update(feedback)
      .set({ upvotes: (item.upvotes ?? 0) + 1 })
      .where(eq(feedback.id, feedbackId))
      .run();
  }

  return Response.json({ success: true });
}
