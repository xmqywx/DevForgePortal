import { notFound } from "next/navigation";
import { db } from "@/db/client";
import { projects, issues, feedback, gitSnapshots } from "@/db/schema";
import { eq, desc, ne, and, inArray } from "drizzle-orm";
import { StageBadge } from "@/components/stage-badge";
import { RoadmapTimeline } from "@/components/roadmap-timeline";
import { ChatFeedback } from "@/components/chat-feedback";
import {
  LuGithub,
  LuExternalLink,
  LuGitCommitHorizontal,
  LuGitBranch,
  LuCalendar,
} from "react-icons/lu";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

export default async function ProjectDetailPage({
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

  // Roadmap items: feedback/issues with relevant statuses
  const roadmapItems = db
    .select()
    .from(feedback)
    .where(
      and(
        eq(feedback.projectId, project.id),
        inArray(feedback.status, ["under-review", "in-progress", "resolved"]),
      ),
    )
    .orderBy(desc(feedback.createdAt))
    .all();

  // Recent updates: resolved issues
  const recentUpdates = db
    .select()
    .from(issues)
    .where(
      and(
        eq(issues.projectId, project.id),
        eq(issues.status, "resolved"),
      ),
    )
    .orderBy(desc(issues.resolvedAt))
    .limit(5)
    .all();

  const tags = (project.tags ?? []) as string[];

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 space-y-10">
      {/* Hero Section */}
      <section>
        <h1 className="text-3xl font-bold text-[#1a1a1a]">{project.name}</h1>
        {project.description && (
          <p className="text-lg text-gray-500 mt-2">{project.description}</p>
        )}

        {/* Links row */}
        <div className="flex items-center gap-3 mt-4">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
            >
              <LuGithub className="w-4 h-4" />
              GitHub
            </a>
          )}
          {project.websiteUrl && (
            <a
              href={project.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
            >
              <LuExternalLink className="w-4 h-4" />
              Website
            </a>
          )}
        </div>

        {/* Stage + tags */}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          {project.stage && <StageBadge stage={project.stage} />}
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section>
        <h2 className="text-xl font-bold text-[#1a1a1a] mb-4">About</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-gray-600 leading-relaxed">
            {project.description || "No description available."}
          </p>
        </div>

        {/* Git stats card */}
        {gitSnap && (
          <div className="mt-4 bg-[#d1ede0] rounded-2xl p-5">
            <div className="flex items-center gap-6 flex-wrap text-sm text-gray-700">
              <div className="flex items-center gap-1.5">
                <LuGitCommitHorizontal className="w-4 h-4" />
                <span className="font-medium">{gitSnap.totalCommits ?? 0}</span>
                <span className="text-gray-500">commits</span>
              </div>
              <div className="flex items-center gap-1.5">
                <LuGitBranch className="w-4 h-4" />
                <span className="font-medium">{gitSnap.branch ?? "main"}</span>
              </div>
              {gitSnap.lastCommitDate && (
                <div className="flex items-center gap-1.5">
                  <LuCalendar className="w-4 h-4" />
                  <span className="text-gray-500">Last update</span>
                  <span className="font-medium">
                    {formatDate(gitSnap.lastCommitDate)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Roadmap Section */}
      <section>
        <h2 className="text-xl font-bold text-[#1a1a1a] mb-4">Roadmap</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <RoadmapTimeline
            items={roadmapItems.map((item) => ({
              id: item.id,
              title: item.title,
              description: item.description ?? "",
              status: item.status ?? "under-review",
              createdAt: item.createdAt ?? "",
            }))}
          />
        </div>
      </section>

      {/* Recent Updates Section */}
      <section>
        <h2 className="text-xl font-bold text-[#1a1a1a] mb-4">
          Recent Updates
        </h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
          {recentUpdates.length === 0 ? (
            <p className="text-gray-400 text-sm p-6">No updates yet.</p>
          ) : (
            recentUpdates.map((issue) => (
              <div key={issue.id} className="flex items-center gap-4 px-6 py-4">
                <span className="text-xs text-gray-400 w-14 flex-shrink-0">
                  {issue.resolvedAt ? formatDate(issue.resolvedAt) : ""}
                </span>
                <span className="text-sm text-gray-800 flex-1">
                  {issue.title}
                </span>
                <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {issue.type}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Feedback Section */}
      <section>
        <h2 className="text-xl font-bold text-[#1a1a1a] mb-4">
          Feedback & Discussion
        </h2>
        <ChatFeedback projectId={project.id} />
      </section>
    </div>
  );
}
