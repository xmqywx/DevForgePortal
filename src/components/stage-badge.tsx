const STAGE_STYLES: Record<string, string> = {
  live: "bg-[#c6e135]/20 text-[#5a6b0a] border-[#c6e135]/40",
  dev: "bg-blue-50 text-blue-700 border-blue-200",
  beta: "bg-amber-50 text-amber-700 border-amber-200",
  idea: "bg-gray-100 text-gray-600 border-gray-200",
  paused: "bg-white text-gray-500 border-gray-300",
  archived: "bg-gray-50 text-gray-400 border-gray-200",
};

const STAGE_LABELS: Record<string, string> = {
  live: "Live",
  dev: "Active",
  beta: "Beta",
  idea: "Idea",
  paused: "Paused",
  archived: "Archived",
};

export function StageBadge({ stage }: { stage: string }) {
  const style = STAGE_STYLES[stage] ?? STAGE_STYLES.idea;
  const label = STAGE_LABELS[stage] ?? stage;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}
    >
      {label}
    </span>
  );
}
