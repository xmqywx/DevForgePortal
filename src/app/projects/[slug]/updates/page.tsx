import { db } from "@/db/client";
import { projects, releases } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { LuRocket, LuDownload } from "react-icons/lu";
import { MarkdownRenderer } from "@/components/markdown-renderer";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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

  const allReleases = db
    .select()
    .from(releases)
    .where(eq(releases.projectId, project.id))
    .orderBy(desc(releases.publishedAt))
    .all();

  if (allReleases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <LuRocket className="w-10 h-10 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">
          Updates & Releases
        </h2>
        <p className="text-gray-400">No releases yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#1a1a1a]">Updates & Releases</h2>

      <div className="relative space-y-6">
        {/* Timeline line */}
        <div className="absolute left-[15px] top-4 bottom-4 w-px bg-gray-200" />

        {allReleases.map((release) => (
          <div key={release.id} className="relative pl-10">
            {/* Timeline dot */}
            <div className="absolute left-[10px] top-5 w-[11px] h-[11px] rounded-full bg-[#c6e135] border-2 border-white ring-2 ring-[#c6e135]/30" />

            <div className="bg-white rounded-2xl shadow-sm p-5">
              {/* Header: version badge + title + date */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full bg-[#c6e135]/30 text-[#5a6a00]">
                    {release.version}
                  </span>
                  <h3 className="font-semibold text-[#1a1a1a] truncate">
                    {release.title}
                  </h3>
                </div>
                <span className="text-sm text-gray-400 shrink-0 tabular-nums">
                  {formatDate(release.publishedAt)}
                </span>
              </div>

              {/* Markdown content */}
              <div className="prose prose-sm max-w-none text-gray-600">
                <MarkdownRenderer content={release.content} />
              </div>

              {/* Download button */}
              {release.downloadUrl && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <a
                    href={release.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#5a6a00] hover:text-[#3d4700] transition-colors"
                  >
                    <LuDownload className="w-4 h-4" />
                    Download
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
