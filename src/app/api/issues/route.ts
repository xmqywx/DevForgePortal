import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { projects, issues, issueVotes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }

  const project = db
    .select()
    .from(projects)
    .where(eq(projects.slug, slug))
    .get();

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const allIssues = db
    .select()
    .from(issues)
    .where(eq(issues.projectId, project.id))
    .orderBy(desc(issues.createdAt))
    .all();

  const issuesWithVotes = allIssues.map((issue) => {
    const votes = db
      .select()
      .from(issueVotes)
      .where(eq(issueVotes.issueId, issue.id))
      .all().length;
    return { ...issue, votes };
  });

  return NextResponse.json(issuesWithVotes);
}
