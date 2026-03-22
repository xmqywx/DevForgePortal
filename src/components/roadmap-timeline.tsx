import { LuCheck } from "react-icons/lu";

interface RoadmapItem {
  id: number;
  title: string;
  description: string;
  status: string;
  createdAt: string;
}

function formatDate(dateStr: string) {
  const parts = dateStr.split(/[-T ]/);  
  if (parts.length < 3) return dateStr;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return `${months[month] ?? "?"} ${day}`;
}

function groupByStatus(items: RoadmapItem[]) {
  const completed: RoadmapItem[] = [];
  const inProgress: RoadmapItem[] = [];
  const planned: RoadmapItem[] = [];

  for (const item of items) {
    if (item.status === "resolved") completed.push(item);
    else if (item.status === "in-progress") inProgress.push(item);
    else planned.push(item);
  }

  return [
    ...inProgress.map((i) => ({ ...i, category: "in-progress" as const })),
    ...planned.map((i) => ({ ...i, category: "planned" as const })),
    ...completed.map((i) => ({ ...i, category: "completed" as const })),
  ];
}

export function RoadmapTimeline({ items }: { items: RoadmapItem[] }) {
  const grouped = groupByStatus(items);

  if (grouped.length === 0) {
    return (
      <p className="text-gray-400 text-sm py-4">No roadmap items yet.</p>
    );
  }

  return (
    <div className="relative pl-8">
      {/* Vertical line */}
      <div className="absolute left-3 top-2 bottom-2 w-px bg-gray-200" />

      {grouped.map((item) => (
        <div key={item.id} className="relative mb-6 last:mb-0">
          {/* Dot */}
          <div className="absolute -left-5 top-1.5">
            {item.category === "completed" ? (
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <LuCheck className="w-3 h-3 text-white" />
              </div>
            ) : item.category === "in-progress" ? (
              <div className="relative w-5 h-5">
                <div className="absolute inset-0 rounded-full bg-[#c6e135] animate-ping opacity-30" />
                <div className="relative w-5 h-5 rounded-full bg-[#c6e135] border-2 border-white" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-gray-300 border-2 border-white" />
            )}
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className={`text-sm font-medium ${
                  item.category === "completed"
                    ? "line-through text-gray-400"
                    : "text-gray-800"
                }`}
              >
                {item.title}
              </span>
              <span className="text-xs text-gray-400">
                {formatDate(item.createdAt)}
              </span>
            </div>
            {item.description && (
              <p className="text-sm text-gray-500 leading-relaxed">
                {item.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
