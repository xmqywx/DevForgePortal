import { db } from "@/db/client";
import { projects, issues, feedback } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import { LuMessageSquare, LuMap } from "react-icons/lu";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type TypeKey = "bug" | "feature" | "improvement" | "task" | "question" | "note";

const typePillColors: Record<TypeKey, string> = {
  bug: "bg-red-100 text-red-700",
  feature: "bg-[#c6e135]/30 text-[#5a6a00]",
  improvement: "bg-blue-100 text-blue-700",
  task: "bg-gray-100 text-gray-600",
  question: "bg-purple-100 text-purple-700",
  note: "bg-gray-100 text-gray-600",
};

export default async function RoadmapPage({
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

  if (!project) notFound();

  // Get all issues for this project
  const allIssues = db
    .select()
    .from(issues)
    .where(eq(issues.projectId, project.id))
    .all();

  // Get all feedback for this project (non-converted, with relevant statuses)
  const allFeedback = db
    .select()
    .from(feedback)
    .where(eq(feedback.projectId, project.id))
    .all();

  // Build a set of feedback IDs that are linked to issues
  const linkedFeedbackIds = new Set(
    allIssues.filter((i) => i.feedbackId).map((i) => i.feedbackId)
  );

  // Normalize issues and unconverted feedback into a common shape
  type RoadmapItem = {
    id: number;
    title: string;
    type: string;
    status: string;
    date: string | null;
    fromFeedback: boolean;
  };

  const items: RoadmapItem[] = [];

  for (const issue of allIssues) {
    items.push({
      id: issue.id,
      title: issue.title,
      type: issue.type ?? "task",
      status: issue.status ?? "open",
      date: issue.updatedAt ?? issue.createdAt ?? null,
      fromFeedback: issue.source === "feedback",
    });
  }

  // Include unconverted feedback that isn't already linked to an issue
  for (const fb of allFeedback) {
    if (fb.isConverted || linkedFeedbackIds.has(fb.id)) continue;
    if (fb.status === "spam" || fb.status === "wont-fix") continue;
    items.push({
      id: fb.id + 100000, // avoid id collision
      title: fb.title,
      type: fb.type ?? "feature",
      status: fb.status ?? "open",
      date: fb.updatedAt ?? fb.createdAt ?? null,
      fromFeedback: true,
    });
  }

  // Group by column
  const planned = items.filter(
    (i) => i.status === "open" || i.status === "under-review" || i.status === "in-review"
  );
  const inProgress = items.filter((i) => i.status === "in-progress");
  const completed = items.filter((i) => i.status === "resolved");

  const columns = [
    {
      title: "Planned",
      items: planned,
      borderClass: "border-gray-300",
      dotClass: "bg-gray-400",
    },
    {
      title: "In Progress",
      items: inProgress,
      borderClass: "border-[#c6e135]",
      dotClass: "bg-[#c6e135]",
    },
    {
      title: "Completed",
      items: completed,
      borderClass: "border-green-500",
      dotClass: "bg-green-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {columns.map((col) => (
        <div
          key={col.title}
          className={`bg-white rounded-2xl shadow-sm border-t-4 ${col.borderClass} p-4`}
        >
          {/* Column header */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`w-2.5 h-2.5 rounded-full ${col.dotClass}`}
            />
            <h3 className="font-semibold text-sm text-[#1a1a1a]">
              {col.title}
            </h3>
            <span className="ml-auto text-xs font-medium text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
              {col.items.length}
            </span>
          </div>

          {/* Cards */}
          {col.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <LuMap className="w-6 h-6 text-gray-200 mb-2" />
              <p className="text-xs text-gray-400">No items</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {col.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-3 shadow-sm border border-gray-100"
                >
                  <p className="font-medium text-sm text-[#1a1a1a] leading-snug">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        typePillColors[item.type as TypeKey] ??
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.type}
                    </span>
                    {item.date && (
                      <span className="text-[11px] text-gray-400">
                        {formatDate(item.date)}
                      </span>
                    )}
                    {item.fromFeedback && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                        <LuMessageSquare className="w-3 h-3" />
                        from feedback
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
