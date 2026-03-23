import { db } from "@/db/client";
import {
  projects,
  issues,
  notes,
  releases,
  milestones,
  gitSnapshots,
} from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function POST(request: Request) {
  const syncSecret = request.headers.get("x-sync-secret");
  if (syncSecret !== process.env.SYNC_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const stats = {
      projects: 0,
      issues: 0,
      notes: 0,
      releases: 0,
      milestones: 0,
      git_snapshots: 0,
    };

    // Only sync public projects
    const incomingProjects = (body.projects ?? []).filter(
      (p: any) => p.isPublic || p.is_public,
    );

    if (incomingProjects.length === 0) {
      return Response.json({
        success: true,
        message: "No public projects to sync",
        stats,
      });
    }

    const projectIds = incomingProjects.map((p: any) => p.id);

    // Delete existing data for these projects, then re-insert
    // Process in order: dependent tables first, then parent tables

    // Delete dependents
    const existingProjects = db
      .select({ id: projects.id })
      .from(projects)
      .where(inArray(projects.id, projectIds))
      .all();
    const existingIds = existingProjects.map((p) => p.id);

    if (existingIds.length > 0) {
      db.delete(gitSnapshots)
        .where(inArray(gitSnapshots.projectId, existingIds))
        .run();
      db.delete(milestones)
        .where(inArray(milestones.projectId, existingIds))
        .run();
      db.delete(releases)
        .where(inArray(releases.projectId, existingIds))
        .run();
      db.delete(notes).where(inArray(notes.projectId, existingIds)).run();
      db.delete(issues).where(inArray(issues.projectId, existingIds)).run();
      db.delete(projects).where(inArray(projects.id, existingIds)).run();
    }

    // Insert projects
    for (const p of incomingProjects) {
      db.insert(projects)
        .values({
          id: p.id,
          slug: p.slug,
          name: p.name,
          description: p.description ?? "",
          icon: p.icon ?? "📦",
          stage: p.stage ?? "idea",
          progressPct: p.progressPct ?? p.progress_pct ?? 0,
          progressPhase: p.progressPhase ?? p.progress_phase ?? "",
          priority: p.priority ?? "medium",
          tags: p.tags ?? [],
          repoPath: p.repoPath ?? p.repo_path ?? null,
          githubUrl: p.githubUrl ?? p.github_url ?? null,
          websiteUrl: p.websiteUrl ?? p.website_url ?? null,
          isPublic: true,
          autoRecordIssues:
            p.autoRecordIssues ?? p.auto_record_issues ?? "default",
          autoRecordNotes:
            p.autoRecordNotes ?? p.auto_record_notes ?? "default",
          autoSessionSummary:
            p.autoSessionSummary ?? p.auto_session_summary ?? "default",
          autoLoadContext:
            p.autoLoadContext ?? p.auto_load_context ?? "default",
          autoUpdateProgress:
            p.autoUpdateProgress ?? p.auto_update_progress ?? "default",
          readme: p.readme ?? "",
          createdAt: p.createdAt ?? p.created_at,
          updatedAt: p.updatedAt ?? p.updated_at,
        })
        .run();
      stats.projects++;
    }

    // Insert issues
    for (const i of body.issues ?? []) {
      if (!projectIds.includes(i.projectId ?? i.project_id)) continue;
      db.insert(issues)
        .values({
          id: i.id,
          projectId: i.projectId ?? i.project_id,
          title: i.title,
          description: i.description ?? "",
          type: i.type ?? "task",
          status: i.status ?? "open",
          priority: i.priority ?? "medium",
          source: i.source ?? "manual",
          feedbackId: i.feedbackId ?? i.feedback_id ?? null,
          dependsOn: i.dependsOn ?? i.depends_on ?? [],
          createdAt: i.createdAt ?? i.created_at,
          updatedAt: i.updatedAt ?? i.updated_at,
          resolvedAt: i.resolvedAt ?? i.resolved_at ?? null,
        })
        .run();
      stats.issues++;
    }

    // Insert notes
    for (const n of body.notes ?? []) {
      if (!projectIds.includes(n.projectId ?? n.project_id)) continue;
      db.insert(notes)
        .values({
          id: n.id,
          projectId: n.projectId ?? n.project_id,
          title: n.title,
          content: n.content ?? "",
          source: n.source ?? "manual",
          sessionId: n.sessionId ?? n.session_id ?? null,
          createdAt: n.createdAt ?? n.created_at,
        })
        .run();
      stats.notes++;
    }

    // Insert releases
    for (const r of body.releases ?? []) {
      if (!projectIds.includes(r.projectId ?? r.project_id)) continue;
      db.insert(releases)
        .values({
          id: r.id,
          projectId: r.projectId ?? r.project_id,
          version: r.version,
          title: r.title,
          content: r.content,
          downloadUrl: r.downloadUrl ?? r.download_url ?? null,
          publishedAt: r.publishedAt ?? r.published_at,
          createdAt: r.createdAt ?? r.created_at,
        })
        .run();
      stats.releases++;
    }

    // Insert milestones
    for (const m of body.milestones ?? []) {
      if (!projectIds.includes(m.projectId ?? m.project_id)) continue;
      db.insert(milestones)
        .values({
          id: m.id,
          projectId: m.projectId ?? m.project_id,
          title: m.title,
          description: m.description ?? "",
          status: m.status ?? "planned",
          date: m.date,
          icon: m.icon ?? "milestone",
          createdAt: m.createdAt ?? m.created_at,
        })
        .run();
      stats.milestones++;
    }

    // Insert git snapshots
    for (const g of body.git_snapshots ?? []) {
      if (!projectIds.includes(g.projectId ?? g.project_id)) continue;
      db.insert(gitSnapshots)
        .values({
          id: g.id,
          projectId: g.projectId ?? g.project_id,
          branch: g.branch ?? null,
          lastCommitHash: g.lastCommitHash ?? g.last_commit_hash ?? null,
          lastCommitMsg: g.lastCommitMsg ?? g.last_commit_msg ?? null,
          lastCommitDate: g.lastCommitDate ?? g.last_commit_date ?? null,
          isDirty: g.isDirty ?? g.is_dirty ?? false,
          ahead: g.ahead ?? 0,
          behind: g.behind ?? 0,
          totalCommits: g.totalCommits ?? g.total_commits ?? 0,
          scannedAt: g.scannedAt ?? g.scanned_at,
        })
        .run();
      stats.git_snapshots++;
    }

    return Response.json({ success: true, stats });
  } catch (error: any) {
    console.error("Sync push error:", error);
    return Response.json(
      { error: "Sync push failed", details: error.message },
      { status: 500 },
    );
  }
}
