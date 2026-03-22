import { notFound } from "next/navigation";
import { db } from "@/db/client";
import { projects, issues, gitSnapshots } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { StageBadge } from "@/components/stage-badge";
import {
  LuGithub,
  LuExternalLink,
  LuGitCommitHorizontal,
  LuCalendar,
  LuCircleAlert,
  LuTrendingUp,
  LuTag,
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

  const tags = (project.tags ?? []) as string[];

  // Static data for activity trend (8 weeks)
  const activityData = [3, 7, 5, 12, 8, 15, 10, 6];
  const maxActivity = Math.max(...activityData, 1);

  // Build SVG polyline points
  const chartW = 220;
  const chartH = 60;
  const points = activityData
    .map((v, i) => {
      const x = (i / (activityData.length - 1)) * chartW;
      const y = chartH - (v / maxActivity) * (chartH - 8);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_260px] gap-6">
      {/* ── Left Column ── */}
      <div className="space-y-5">
        {/* Project Info Card */}
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

        {/* Activity Trend Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-[#1a1a1a]/70 uppercase tracking-wide mb-3">
            Activity Trend
          </h3>
          <svg
            viewBox={`0 0 ${chartW} ${chartH}`}
            className="w-full h-16"
            preserveAspectRatio="none"
          >
            <polyline
              fill="none"
              stroke="#c6e135"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
          <p className="text-xs text-gray-400 mt-2">Commits / week (8 wks)</p>
        </div>

        {/* Tech Stack */}
        {tags.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-[#1a1a1a]/70 uppercase tracking-wide mb-3">
              Tech Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#d1ede0] text-[#1a1a1a]/80"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-2.5">
          <h3 className="text-sm font-semibold text-[#1a1a1a]/70 uppercase tracking-wide mb-1">
            Links
          </h3>
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#1a1a1a] transition-colors"
            >
              <LuGithub className="w-4 h-4" />
              GitHub Repository
            </a>
          )}
          {project.websiteUrl && (
            <a
              href={project.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#1a1a1a] transition-colors"
            >
              <LuExternalLink className="w-4 h-4" />
              Website
            </a>
          )}
          {!project.githubUrl && !project.websiteUrl && (
            <p className="text-sm text-gray-400">No links added.</p>
          )}
        </div>
      </div>

      {/* ── Center Column ── */}
      <div className="space-y-5">
        {/* About Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-[#1a1a1a] mb-3">
            About this project
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {project.description || "No description available yet. Add one via the CLI or API."}
          </p>
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
      </div>

      {/* ── Right Column ── */}
      <div className="space-y-5">
        {/* Version / Release Card */}
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

        {/* Labels / Tags Card */}
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

        {/* Downloads / Links Card */}
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
          <div className="flex items-center gap-2.5 text-sm text-gray-400">
            <LuFileText className="w-4 h-4 flex-shrink-0" />
            Docs (coming soon)
          </div>
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
