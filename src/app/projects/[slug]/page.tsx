import { notFound } from "next/navigation";
import { db } from "@/db/client";
import { projects, issues, gitSnapshots } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { StageBadge } from "@/components/stage-badge";
import { ActivityChart } from "@/components/activity-chart";
import {
  LuGithub,
  LuExternalLink,
  LuGitCommitHorizontal,
  LuCircleAlert,
  LuTrendingUp,
  LuPackage,
  LuFileText,
  LuUsers,
} from "react-icons/lu";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

export default async function ProjectOverviewPage({
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

  // Git stats
  const gitSnap = db
    .select()
    .from(gitSnapshots)
    .where(eq(gitSnapshots.projectId, project.id))
    .orderBy(desc(gitSnapshots.scannedAt))
    .limit(1)
    .get();

  // Open issues count
  const openIssues = db
    .select()
    .from(issues)
    .where(
      and(eq(issues.projectId, project.id), eq(issues.status, "open")),
    )
    .all();

  // Activity chart data: issues opened per day (last 30 days)
  const sqlite = db as unknown as { all: (q: string, ...p: unknown[]) => unknown[] };
  let openedData: { day: string; count: number }[] = [];
  let resolvedData: { day: string; count: number }[] = [];

  try {
    const openedRows = db.all(
      sql`SELECT date(created_at) as day, COUNT(*) as count FROM issues WHERE project_id = ${project.id} AND created_at >= date('now', '-30 days') GROUP BY day`
    ) as { day: string; count: number }[];
    openedData = openedRows;
  } catch {
    openedData = [];
  }

  try {
    const resolvedRows = db.all(
      sql`SELECT date(resolved_at) as day, COUNT(*) as count FROM issues WHERE project_id = ${project.id} AND resolved_at IS NOT NULL AND resolved_at >= date('now', '-30 days') GROUP BY day`
    ) as { day: string; count: number }[];
    resolvedData = resolvedRows;
  } catch {
    resolvedData = [];
  }

  const tags = (project.tags ?? []) as string[];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      {/* ── Left Column (Main) ── */}
      <div className="space-y-5">
        {/* Project Header */}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#1a1a1a]">
              {project.name}
            </h1>
            {project.stage && <StageBadge stage={project.stage} />}
          </div>
          {project.description && (
            <p className="text-gray-500 mt-1 line-clamp-1">
              {project.description}
            </p>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border border-gray-300 rounded-full hover:bg-gray-50 transition-colors mt-2"
            >
              <LuGithub className="w-3.5 h-3.5" />
              GitHub
            </a>
          )}
        </div>

        {/* Activity Chart Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#1a1a1a]">Activity</h2>
            <span className="text-xs text-gray-400 font-medium">
              Last 30 days
            </span>
          </div>
          <ActivityChart openedData={openedData} resolvedData={resolvedData} />
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
            <LuGitCommitHorizontal className="w-5 h-5 mx-auto text-gray-400 mb-1" />
            <p className="text-2xl font-bold text-[#1a1a1a]">
              {gitSnap?.totalCommits ?? 0}
            </p>
            <p className="text-xs text-gray-500">Commits</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
            <LuCircleAlert className="w-5 h-5 mx-auto text-gray-400 mb-1" />
            <p className="text-2xl font-bold text-[#1a1a1a]">
              {openIssues.length}
            </p>
            <p className="text-xs text-gray-500">Open Issues</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
            <LuTrendingUp className="w-5 h-5 mx-auto text-gray-400 mb-1" />
            <p className="text-2xl font-bold text-[#1a1a1a]">
              {project.progressPct ?? 0}%
            </p>
            <p className="text-xs text-gray-500">Progress</p>
          </div>
        </div>

        {/* About This Project Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-[#1a1a1a] mb-3">
            About This Project
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {project.description || "Run `/devforge:init` to auto-generate project description"}
          </p>
        </div>
      </div>

      {/* ── Right Sidebar ── */}
      <div className="space-y-5">
        {/* Project Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-[#1a1a1a]/70 uppercase tracking-wide">
            Project Info
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Stage</span>
              {project.stage && <StageBadge stage={project.stage} />}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Priority</span>
              <span className="font-medium capitalize">
                {project.priority ?? "medium"}
              </span>
            </div>
            {project.createdAt && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Created</span>
                <span className="font-medium">
                  {formatDate(project.createdAt)}
                </span>
              </div>
            )}
            {project.updatedAt && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Updated</span>
                <span className="font-medium">
                  {formatDate(project.updatedAt)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Release */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-[#1a1a1a]/70 uppercase tracking-wide mb-3">
            Release
          </h3>
          <div className="flex items-center gap-2">
            <LuPackage className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-[#1a1a1a]">
              Latest: {project.stage === "live" ? "v1.0.0" : project.stage ?? "idea"}
            </span>
          </div>
          {project.updatedAt && (
            <p className="text-xs text-gray-400 mt-1.5">
              {formatDate(project.updatedAt)}
            </p>
          )}
        </div>

        {/* Labels */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-[#1a1a1a]/70 uppercase tracking-wide mb-3">
            Labels
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {project.stage && <StageBadge stage={project.stage} />}
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200"
              >
                {tag}
              </span>
            ))}
            {tags.length === 0 && !project.stage && (
              <p className="text-sm text-gray-400">No labels.</p>
            )}
          </div>
        </div>

        {/* Resources */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-[#1a1a1a]/70 uppercase tracking-wide">
            Resources
          </h3>
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-sm text-gray-700 hover:text-[#1a1a1a] transition-colors"
            >
              <LuGithub className="w-4 h-4 flex-shrink-0" />
              GitHub
            </a>
          )}
          {project.websiteUrl && (
            <a
              href={project.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-sm text-gray-700 hover:text-[#1a1a1a] transition-colors"
            >
              <LuExternalLink className="w-4 h-4 flex-shrink-0" />
              Website
            </a>
          )}
          <div className="flex items-center gap-2.5 text-sm text-gray-400">
            <LuFileText className="w-4 h-4 flex-shrink-0" />
            Docs (coming soon)
          </div>
        </div>

        {/* Contributors */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-[#1a1a1a]/70 uppercase tracking-wide mb-3">
            Contributors
          </h3>
          <div className="flex items-center gap-2">
            <LuUsers className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">1 contributor</span>
          </div>
        </div>
      </div>
    </div>
  );
}
