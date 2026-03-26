import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { issueVotes } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ip = req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for") ?? "unknown";

  const existing = db.select().from(issueVotes)
    .where(and(eq(issueVotes.issueId, Number(id)), eq(issueVotes.voterIp, ip)))
    .get();

  if (existing) return NextResponse.json({ error: "Already voted" }, { status: 409 });

  db.insert(issueVotes).values({ issueId: Number(id), voterIp: ip }).run();

  const count = db.select().from(issueVotes).where(eq(issueVotes.issueId, Number(id))).all().length;

  // Broadcast real-time event
  import("@/lib/ws-broadcast").then(({ wsBroadcast }) => {
    wsBroadcast({ type: "new_vote", data: { issueId: Number(id) } });
  });

  return NextResponse.json({ success: true, votes: count });
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const count = db.select().from(issueVotes).where(eq(issueVotes.issueId, Number(id))).all().length;
  return NextResponse.json({ votes: count });
}
