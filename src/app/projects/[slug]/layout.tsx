import { notFound } from "next/navigation";
import { db } from "@/db/client";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { StageBadge } from "@/components/stage-badge";
import { ProjectTabs } from "@/components/project-tabs";
import { LuGithub, LuExternalLink } from "react-icons/lu";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const project = db
    .select()
    .from(projects)
    .where(eq(projects.slug, slug))
    .get();

  if (!project) notFound();

  return (
    <div className="py-10 space-y-6">
      {/* Project Header */}
      <section>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1a1a1a]">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-lg text-gray-500 mt-1.5">
                {project.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4 flex-wrap">
          {project.stage && <StageBadge stage={project.stage} />}
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
      </section>

      {/* Tab Navigation */}
      <div className="border-b border-black/5 pb-3">
        <ProjectTabs slug={slug} />
      </div>

      {/* Tab Content */}
      {children}
    </div>
  );
}
