import { notFound } from "next/navigation";
import { db } from "@/db/client";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ProjectTabs } from "@/components/project-tabs";

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
      {/* Tab Navigation */}
      <div className="border-b border-black/5 pb-3">
        <ProjectTabs slug={slug} />
      </div>

      {/* Tab Content */}
      {children}
    </div>
  );
}
