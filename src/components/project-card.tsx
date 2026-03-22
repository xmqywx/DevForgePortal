import Link from "next/link";
import { StageBadge } from "./stage-badge";
import { ProgressBar } from "./progress-bar";

interface ProjectCardProps {
  slug: string;
  name: string;
  description: string;
  stage: string;
  tags: string[];
  progressPct: number;
}

export function ProjectCard({
  slug,
  name,
  description,
  stage,
  tags,
  progressPct,
}: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${slug}`}
      className="block bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-bold text-lg text-[#1a1a1a] leading-tight">
          {name}
        </h3>
        <StageBadge stage={stage} />
      </div>

      <p className="text-sm text-[#1a1a1a]/60 line-clamp-2 mb-4">
        {description}
      </p>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs rounded-full border border-[#1a1a1a]/10 text-[#1a1a1a]/50"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <ProgressBar value={progressPct} />
        </div>
        <span className="text-xs font-medium text-[#1a1a1a]/40">
          {progressPct}%
        </span>
      </div>
    </Link>
  );
}
