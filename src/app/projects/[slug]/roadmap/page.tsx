import { db } from "@/db/client";
import { projects, milestones } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import {
  LuLightbulb,
  LuRocket,
  LuPlug,
  LuFlag,
  LuRefreshCw,
} from "react-icons/lu";

function formatDate(dateStr: string) {
  // "2026-Q2" → "Q2 2026"
  const qMatch = dateStr.match(/^(\d{4})-Q(\d)$/);
  if (qMatch) return `Q${qMatch[2]} ${qMatch[1]}`;

  // "2026-03-22" or "2026-03" → "Mar 2026"
  const parts = dateStr.split("-");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  if (parts.length >= 2) {
    const monthIdx = parseInt(parts[1], 10) - 1;
    return `${months[monthIdx]} ${parts[0]}`;
  }
  return dateStr;
}

function StatusIcon({
  status,
  icon,
}: {
  status: string | null;
  icon: string | null;
}) {
  const color =
    status === "completed"
      ? "#65a30d"
      : status === "current"
        ? "#3b82f6"
        : "#9ca3af";

  const className = "w-4 h-4";
  const style = { color };

  switch (icon) {
    case "idea":
      return <LuLightbulb className={className} style={style} />;
    case "launch":
      return <LuRocket className={className} style={style} />;
    case "integration":
      return <LuPlug className={className} style={style} />;
    case "pivot":
      return <LuRefreshCw className={className} style={style} />;
    default:
      return <LuFlag className={className} style={style} />;
  }
}

export default async function RoadmapPage({
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

  const items = db
    .select()
    .from(milestones)
    .where(eq(milestones.projectId, project.id))
    .orderBy(asc(milestones.date))
    .all();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Roadmap</h1>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical center line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2" />

        {items.map((item, i) => {
          const isLeft = i % 2 === 0;
          const statusColor =
            item.status === "completed"
              ? "#c6e135"
              : item.status === "current"
                ? "#3b82f6"
                : "#d1d5db";

          return (
            <div key={item.id} className="relative flex items-center mb-12">
              {/* Center dot */}
              <div className="absolute left-1/2 -translate-x-1/2 z-10">
                <div
                  className="w-4 h-4 rounded-full border-4 border-white shadow-sm"
                  style={{ backgroundColor: statusColor }}
                />
              </div>

              {/* Date badge - centered above dot */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-8">
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium text-white whitespace-nowrap"
                  style={{ backgroundColor: statusColor }}
                >
                  {formatDate(item.date)}
                </span>
              </div>

              {/* Content card */}
              <div className={`w-[45%] ${isLeft ? "pr-8" : "ml-auto pl-8"}`}>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusIcon status={item.status} icon={item.icon} />
                    <h3 className="font-bold text-[#1a1a1a]">{item.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                  <div className="mt-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        item.status === "completed"
                          ? "bg-[#c6e135]/20 text-[#65a30d]"
                          : item.status === "current"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {item.status === "completed"
                        ? "Completed"
                        : item.status === "current"
                          ? "In Progress"
                          : "Planned"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <p className="text-center text-gray-400 py-16">
            No milestones yet.
          </p>
        )}
      </div>
    </div>
  );
}
