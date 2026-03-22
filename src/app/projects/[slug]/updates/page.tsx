import { db } from "@/db/client";
import { projects, issues } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { LuRefreshCw } from "react-icons/lu";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type TypeKey = "bug" | "feature" | "improvement" | "task" | "question" | "note";
type PriorityKey = "high" | "medium" | "low";

const typePillColors: Record<TypeKey, string> = {
  bug: "bg-red-100 text-red-700",
  feature: "bg-[#c6e135]/30 text-[#5a6a00]",
  improvement: "bg-blue-100 text-blue-700",
  task: "bg-gray-100 text-gray-600",
  question: "bg-purple-100 text-purple-700",
  note: "bg-gray-100 text-gray-600",
};

const priorityPillColors: Record<PriorityKey, string> = {
  high: "bg-red-50 text-red-600",
  medium: "bg-amber-50 text-amber-600",
  low: "bg-gray-100 text-gray-500",
};

type StatusCategory = "Completed" | "In Progress" | "Abandoned" | "Open";

const sectionConfig: Record<
  StatusCategory,
  { dotClass: string; borderClass: string }
> = {
  Completed: { dotClass: "bg-green-500", borderClass: "border-green-500" },
  "In Progress": { dotClass: "bg-[#c6e135]", borderClass: "border-[#c6e135]" },
  Abandoned: { dotClass: "bg-gray-400", borderClass: "border-gray-400" },
  Open: { dotClass: "bg-gray-300", borderClass: "border-gray-300" },
};

function categorize(status: string): StatusCategory {
  switch (status) {
    case "resolved":
      return "Completed";
    case "in-progress":
      return "In Progress";
    case "wont-fix":
    case "deferred":
      return "Abandoned";
    default:
      return "Open";
  }
}

export default async function UpdatesPage({
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

  const allIssues = db
    .select()
    .from(issues)
    .where(eq(issues.projectId, project.id))
    .orderBy(desc(issues.updatedAt))
    .all();

  // Group by status category, preserving order within each group
  const grouped: Record<StatusCategory, typeof allIssues> = {
    Completed: [],
    "In Progress": [],
    Abandoned: [],
    Open: [],
  };

  for (const issue of allIssues) {
    const cat = categorize(issue.status ?? "open");
    grouped[cat].push(issue);
  }

  const sectionOrder: StatusCategory[] = [
    "Completed",
    "In Progress",
    "Abandoned",
    "Open",
  ];

  const hasAny = allIssues.length > 0;

  if (!hasAny) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <LuRefreshCw className="w-10 h-10 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">Updates</h2>
        <p className="text-gray-400">No updates yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sectionOrder.map((cat) => {
        const items = grouped[cat];
        if (items.length === 0) return null;
        const cfg = sectionConfig[cat];

        return (
          <div key={cat} className="bg-white rounded-2xl shadow-sm p-5">
            {/* Section header */}
            <div className="flex items-center gap-2.5 mb-4">
              <span
                className={`w-2.5 h-2.5 rounded-full ${cfg.dotClass}`}
              />
              <h3 className="font-semibold text-sm text-[#1a1a1a]">
                {cat}
              </h3>
              <span className="text-xs font-medium text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                {items.length}
              </span>
            </div>

            <div className={`border-t ${cfg.borderClass} pt-3`}>
              <div className="space-y-1">
                {items.map((issue) => (
                  <div
                    key={issue.id}
                    className="flex items-center gap-3 py-2 px-1 rounded-lg hover:bg-gray-50/60 transition-colors"
                  >
                    {/* Date */}
                    <span className="text-xs text-gray-400 w-16 shrink-0 tabular-nums">
                      {formatDate(issue.updatedAt ?? issue.createdAt ?? null)}
                    </span>

                    {/* Status dot */}
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${cfg.dotClass}`}
                    />

                    {/* Title */}
                    <span className="text-sm text-[#1a1a1a] font-medium truncate flex-1">
                      {issue.title}
                    </span>

                    {/* Type pill */}
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                        typePillColors[(issue.type as TypeKey) ?? "task"] ??
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {issue.type}
                    </span>

                    {/* Priority pill */}
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                        priorityPillColors[
                          (issue.priority as PriorityKey) ?? "medium"
                        ] ?? "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {issue.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
