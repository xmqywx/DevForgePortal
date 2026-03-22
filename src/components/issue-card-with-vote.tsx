"use client";

import { useState } from "react";
import { LuChevronUp, LuMessageSquare } from "react-icons/lu";

const priorityDot: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-400",
  low: "bg-gray-300",
};

const typePillColor: Record<string, string> = {
  bug: "bg-red-100 text-red-700",
  feature: "bg-purple-100 text-purple-700",
  improvement: "bg-blue-100 text-blue-700",
  question: "bg-amber-100 text-amber-700",
  task: "bg-gray-100 text-gray-600",
  note: "bg-[#d1ede0] text-[#1a1a1a]/70",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

export interface IssueWithVotes {
  id: number;
  title: string;
  description: string | null;
  type: string | null;
  status: string | null;
  priority: string | null;
  source: string | null;
  feedbackId: number | null;
  createdAt: string | null;
  votes: number;
}

export function IssueCardWithVote({
  issue,
  onClick,
}: {
  issue: IssueWithVotes;
  onClick: () => void;
}) {
  const [votes, setVotes] = useState(issue.votes);
  const [voted, setVoted] = useState(false);

  const prio = issue.priority ?? "medium";
  const type = issue.type ?? "task";

  async function handleVote(e: React.MouseEvent) {
    e.stopPropagation();
    if (voted) return;
    const res = await fetch(`/api/issues/${issue.id}/vote`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setVotes(data.votes);
      setVoted(true);
    }
  }

  return (
    <div
      className="rounded-xl p-3 border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex gap-2">
        {/* Vote column */}
        <button
          onClick={handleVote}
          className={`flex flex-col items-center gap-0.5 px-1 pt-0.5 rounded-lg transition-colors flex-shrink-0 ${
            voted
              ? "text-[#65a30d]"
              : "text-gray-300 hover:text-[#65a30d] hover:bg-[#c6e135]/10"
          }`}
        >
          <LuChevronUp className="w-4 h-4" />
          <span className="text-xs font-medium">{votes}</span>
          <span className="text-[10px] text-gray-400">votes</span>
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <span
              className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${priorityDot[prio] ?? "bg-gray-300"}`}
            />
            <span className="font-medium text-sm text-[#1a1a1a] leading-tight line-clamp-2">
              {issue.title}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2 ml-4">
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typePillColor[type] ?? "bg-gray-100 text-gray-600"}`}
            >
              {type}
            </span>
            {issue.createdAt && (
              <span className="text-[11px] text-gray-400">
                {formatDate(issue.createdAt)}
              </span>
            )}
            {issue.source === "feedback" && (
              <span className="flex items-center gap-1 text-[10px] text-gray-400">
                <LuMessageSquare className="w-3 h-3" />
                Feedback
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
