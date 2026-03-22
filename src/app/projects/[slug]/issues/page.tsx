import { db } from "@/db/client";
import { projects, issues, issueVotes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { IssuesBoard } from "@/components/issues-board";

export default async function IssuesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const project = db
    .select()
    .from(projects)
    .where(eq(projects.slug, slug))
    .get();

  if (!project) return null;

  const allIssues = db
    .select()
    .from(issues)
    .where(eq(issues.projectId, project.id))
    .orderBy(desc(issues.createdAt))
    .all();

  // Attach vote counts
  const issuesWithVotes = allIssues.map((issue) => {
    const votes = db
      .select()
      .from(issueVotes)
      .where(eq(issueVotes.issueId, issue.id))
      .all().length;
    return { ...issue, votes };
  });

  return <IssuesBoard issues={issuesWithVotes} />;
}
