import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { issues, issueVotes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const issue = db.select().from(issues).where(eq(issues.id, Number(id))).get();
  if (!issue) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const votes = db.select().from(issueVotes).where(eq(issueVotes.issueId, Number(id))).all().length;
  return NextResponse.json({ ...issue, votes });
}
