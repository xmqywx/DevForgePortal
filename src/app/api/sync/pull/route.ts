import { db } from "@/db/client";
import {
  feedback,
  feedbackReplies,
  feedbackVotes,
  issueVotes,
  issueComments,
  issues,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const syncSecret = request.headers.get("x-sync-secret");
  if (syncSecret !== process.env.SYNC_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allFeedback = db.select().from(feedback).all();
    const allReplies = db.select().from(feedbackReplies).all();
    const allFeedbackVotes = db.select().from(feedbackVotes).all();
    const allIssueVotes = db.select().from(issueVotes).all();
    const allIssueComments = db.select().from(issueComments).all();
    // Include issues created from feedback on the server
    const feedbackIssues = db.select().from(issues).where(eq(issues.source, "feedback")).all();

    return Response.json({
      feedback: allFeedback,
      feedback_replies: allReplies,
      feedback_votes: allFeedbackVotes,
      issue_votes: allIssueVotes,
      issue_comments: allIssueComments,
      feedback_issues: feedbackIssues,
    });
  } catch (error: any) {
    console.error("Sync pull error:", error);
    return Response.json(
      { error: "Sync pull failed", details: error.message },
      { status: 500 },
    );
  }
}
