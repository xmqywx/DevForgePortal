import { db } from "@/db/client";
import { projects } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { ProjectCard } from "@/components/project-card";
import { T } from "@/components/t-text";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const allProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.isPublic, true))
    .orderBy(desc(projects.updatedAt));

  return (
    <div className="py-12">
      <div className="flex items-baseline gap-3 mb-10">
        <h1 className="text-3xl font-bold"><T k="projects.title" /></h1>
        <span className="text-lg text-[#1a1a1a]/40 font-medium">
          {allProjects.length}
        </span>
      </div>

      {allProjects.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-[#1a1a1a]/40">
          <T k="projects.noProjects" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {allProjects.map((p) => (
            <ProjectCard
              key={p.id}
              slug={p.slug}
              name={p.name}
              description={p.description ?? ""}
              stage={p.stage ?? "idea"}
              tags={(p.tags as string[]) ?? []}
              progressPct={p.progressPct ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
