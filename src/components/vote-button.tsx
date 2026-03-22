"use client";
import { useState } from "react";
import { LuThumbsUp } from "react-icons/lu";

export function VoteButton({
  feedbackId,
  initialVotes,
}: {
  feedbackId: number;
  initialVotes: number;
}) {
  const [votes, setVotes] = useState(initialVotes);
  const [voted, setVoted] = useState(false);

  async function handleVote() {
    if (voted) return;
    const res = await fetch(`/api/feedback/${feedbackId}/vote`, {
      method: "POST",
    });
    if (res.ok) {
      setVotes((v) => v + 1);
      setVoted(true);
    }
  }

  return (
    <button
      onClick={handleVote}
      disabled={voted}
      className={`flex items-center gap-1 text-xs transition-colors ${
        voted
          ? "text-[#65a30d]"
          : "text-gray-400 hover:text-[#65a30d]"
      }`}
    >
      <LuThumbsUp className="w-3.5 h-3.5" />
      <span>{votes}</span>
    </button>
  );
}
