import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { issueComments } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const comments = db.select().from(issueComments)
    .where(eq(issueComments.issueId, Number(id)))
    .orderBy(asc(issueComments.createdAt)).all();
  return NextResponse.json(comments);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const ip = req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for") ?? "unknown";
  const isOwner = req.headers.get("x-owner-secret") === process.env.OWNER_SECRET;

  const result = db.insert(issueComments).values({
    issueId: Number(id),
    authorName: body.author_name || "匿名",
    authorIp: ip,
    isOwner,
    content: body.content,
    images: body.images ?? [],
  }).returning().get();

  return NextResponse.json(result, { status: 201 });
}
