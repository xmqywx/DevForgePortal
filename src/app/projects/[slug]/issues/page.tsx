import { db } from "@/db/client";
import { projects, issues } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { LuMessageSquare } from "react-icons/lu";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

const priorityDot: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-400",
  low: "bg-gray-300",
};

const typePillColor: Record<string, string> = {
  bug: "bg-red-100 text-red-700",
  feature: "bg-purple-100 text-purple-700",
  improvement: "bg-blue-100 text-blue-700",
  question: "bg-amber-100 text-amber-700",
  task: "bg-gray-100 text-gray-600",
  note: "bg-[#d1ede0] text-[#1a1a1a]/70",
};

interface IssueRow {
  id: number;
  title: string;
  type: string | null;
  status: string | null;
  priority: string | null;
  source: string | null;
  createdAt: string | null;
}

function IssueCard({ issue }: { issue: IssueRow }) {
  const prio = issue.priority ?? "medium";
  const type = issue.type ?? "task";
  return (
    <div className="rounded-xl p-3 border border-gray-100 bg-white">
      <div className="flex items-start gap-2">
        <span
          className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${priorityDot[prio] ?? "bg-gray-300"}`}
        />
        <span className="font-medium text-sm text-[#1a1a1a] leading-tight">
          {issue.title}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-2 ml-4">
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typePillColor[type] ?? "bg-gray-100 text-gray-600"}`}
        >
          {type}
        </span>
        {issue.createdAt && (
          <span className="text-[11px] text-gray-400">
            {formatDate(issue.createdAt)}
          </span>
        )}
        {issue.source === "feedback" && (
          <span className="flex items-center gap-1 text-[10px] text-gray-400">
            <LuMessageSquare className="w-3 h-3" />
            Feedback
          </span>
        )}
      </div>
    </div>
  );
}

const columns = [
  {
    key: "open",
    title: "Open",
    border: "border-t-4 border-amber-400",
    filter: (i: IssueRow) => i.status === "open",
  },
  {
    key: "in-review",
    title: "In Review",
    border: "border-t-4 border-blue-400",
    filter: (i: IssueRow) => i.status === "in-review",
  },
  {
    key: "in-progress",
    title: "In Progress",
    border: "border-t-4 border-[#c6e135]",
    filter: (i: IssueRow) => i.status === "in-progress",
  },
  {
    key: "done",
    title: "Done",
    border: "border-t-4 border-green-500",
    filter: (i: IssueRow) =>
      i.status === "resolved" || i.status === "wont-fix",
  },
] as const;

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

  return (
    <div className="grid grid-cols-4 gap-4">
      {columns.map((col) => {
        let colIssues = allIssues.filter(col.filter);
        // Done column: only last 10
        if (col.key === "done") {
          colIssues = colIssues.slice(0, 10);
        }
        return (
          <div key={col.key} className={`${col.border} rounded-2xl shadow-sm bg-white p-3`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#1a1a1a]">
                {col.title}
              </h3>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {colIssues.length}
              </span>
            </div>
            <div className="space-y-2">
              {colIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
              {colIssues.length === 0 && (
                <p className="text-xs text-gray-300 text-center py-4">
                  No issues
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
