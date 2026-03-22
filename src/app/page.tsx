import Link from "next/link";
import {
  LuBot,
  LuWrench,
  LuShoppingCart,
  LuGamepad2,
  LuArrowRight,
} from "react-icons/lu";
import { db } from "@/db/client";
import { projects } from "@/db/schema";
import { inArray, desc } from "drizzle-orm";
import { ProjectCard } from "@/components/project-card";

const AREAS = [
  {
    icon: LuBot,
    title: "AI & Agent Systems",
    desc: "Building intelligent agents, self-reporting systems, and AI-powered development tools.",
  },
  {
    icon: LuWrench,
    title: "Developer Tools",
    desc: "CLIs, dashboards, and project management utilities for productive development.",
  },
  {
    icon: LuShoppingCart,
    title: "E-Commerce",
    desc: "Cross-border e-commerce solutions, automation, and logistics integrations.",
  },
  {
    icon: LuGamepad2,
    title: "Game Automation",
    desc: "Scripting engines, reverse engineering tools, and monitoring dashboards.",
  },
];

const TECH = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "Python",
  "Tailwind",
  "PostgreSQL",
  "Redis",
  "Docker",
  "Claude AI",
];

export default async function Home() {
  const featured = await db
    .select()
    .from(projects)
    .where(inArray(projects.stage, ["dev", "beta", "live"]))
    .orderBy(desc(projects.updatedAt))
    .limit(3);

  return (
    <div className="mx-auto max-w-6xl px-6">
      {/* Hero */}
      <section className="py-20 md:py-28">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-4">
          Hi, I&apos;m Ying
        </h1>
        <p className="text-lg md:text-xl text-[#1a1a1a]/60 max-w-2xl mb-8">
          Full-stack developer building AI tools, developer utilities, and
          cross-border e-commerce solutions.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#c6e135] text-[#1a1a1a] font-semibold hover:bg-[#b8d42a] transition-colors"
          >
            View Projects
            <LuArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="https://github.com/xmqywx"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#1a1a1a]/15 font-semibold hover:border-[#1a1a1a]/30 transition-colors"
          >
            GitHub
          </a>
        </div>
      </section>

      {/* Current Projects */}
      {featured.length > 0 && (
        <section className="pb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Current Projects</h2>
            <Link
              href="/projects"
              className="text-sm font-medium text-[#1a1a1a]/50 hover:text-[#1a1a1a] transition-colors flex items-center gap-1"
            >
              View all projects
              <LuArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featured.map((p) => (
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
        </section>
      )}

      {/* Areas of Focus */}
      <section className="pb-16">
        <h2 className="text-2xl font-bold mb-8">Areas of Focus</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {AREAS.map((area) => (
            <div
              key={area.title}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#c6e135]/20 mb-4">
                <area.icon className="w-5 h-5 text-[#5a6b0a]" />
              </span>
              <h3 className="font-bold text-base mb-1.5">{area.title}</h3>
              <p className="text-sm text-[#1a1a1a]/50 leading-relaxed">
                {area.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="pb-20">
        <h2 className="text-2xl font-bold mb-8">Tech Stack</h2>
        <div className="flex flex-wrap gap-2.5">
          {TECH.map((t) => (
            <span
              key={t}
              className="px-4 py-2 bg-white rounded-full text-sm font-medium shadow-sm border border-black/5"
            >
              {t}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
