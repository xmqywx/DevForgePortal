"use client";
import { LuThumbsUp } from "react-icons/lu";
import { VoteButton } from "./vote-button";
import type { FeedbackItem } from "./feedback-shell";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

const typePillColor: Record<string, string> = {
  bug: "bg-red-100 text-red-700",
  feature: "bg-purple-100 text-purple-700",
  improvement: "bg-blue-100 text-blue-700",
  question: "bg-amber-100 text-amber-700",
};

const statusPillColor: Record<string, string> = {
  open: "bg-amber-100 text-amber-700",
  "under-review": "bg-blue-100 text-blue-700",
  "in-progress": "bg-[#c6e135]/20 text-[#65a30d]",
  resolved: "bg-green-100 text-green-700",
  "wont-fix": "bg-gray-100 text-gray-500",
};

export function FeedbackList({
  items,
  loading,
  onSelect,
}: {
  items: FeedbackItem[];
  loading: boolean;
  onSelect: (id: number) => void;
}) {
  // Sort by upvotes desc
  const sorted = [...items].sort((a, b) => (b.upvotes ?? 0) - (a.upvotes ?? 0));

  if (loading) {
    return (
      <div className="text-center text-gray-400 py-12">Loading...</div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="text-center text-gray-400 py-12">
        No feedback yet. Be the first to share!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map((item) => (
        <div
          key={item.id}
          onClick={() => onSelect(item.id)}
          className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition cursor-pointer border border-gray-100"
        >
          <div className="flex items-start justify-between gap-4">
            {/* Left */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typePillColor[item.type] ?? "bg-gray-100 text-gray-600"}`}
                >
                  {item.type}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusPillColor[item.status] ?? "bg-gray-100 text-gray-600"}`}
                >
                  {item.status}
                </span>
              </div>
              <h3 className="font-bold text-sm text-[#1a1a1a] mb-1">
                {item.title}
              </h3>
              {item.description && (
                <p className="text-xs text-gray-500 line-clamp-2">
                  {item.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2 text-[11px] text-gray-400">
                <span>{item.authorName ?? "Anonymous"}</span>
                {item.createdAt && (
                  <>
                    <span>-</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </>
                )}
                {item.replies && item.replies.length > 0 && (
                  <span className="text-gray-300">
                    {item.replies.length} {item.replies.length === 1 ? "reply" : "replies"}
                  </span>
                )}
              </div>
            </div>

            {/* Right: vote */}
            <div
              className="flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <VoteButton
                feedbackId={item.id}
                initialVotes={item.upvotes ?? 0}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
