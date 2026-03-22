import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = db.select().from(projects).where(eq(projects.slug, slug)).get();
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(project);
}
