"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { LuChevronUp, LuSend, LuMessageCircle } from "react-icons/lu";
import type { IssueWithVotes } from "./issue-card-with-vote";

const typePillColor: Record<string, string> = {
  bug: "bg-red-100 text-red-700",
  feature: "bg-purple-100 text-purple-700",
  improvement: "bg-blue-100 text-blue-700",
  question: "bg-amber-100 text-amber-700",
  task: "bg-gray-100 text-gray-600",
  note: "bg-[#d1ede0] text-[#1a1a1a]/70",
};

const priorityPillColor: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-gray-100 text-gray-500",
};

const statusLabel: Record<string, string> = {
  open: "Open",
  "in-review": "In Review",
  "in-progress": "In Progress",
  resolved: "Resolved",
  "wont-fix": "Won't Fix",
  deferred: "Deferred",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

function getAvatarUrl(name: string) {
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const style = ["adventurer", "avataaars", "bottts", "fun-emoji", "lorelei"][
    hash % 5
  ];
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(name)}`;
}

interface Comment {
  id: number;
  authorName: string | null;
  isOwner: boolean | null;
  content: string;
  images: string[] | null;
  createdAt: string | null;
}

export function IssueDetailModal({
  issue,
  open,
  onOpenChange,
}: {
  issue: IssueWithVotes | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [votes, setVotes] = useState(0);
  const [voted, setVoted] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (issue && open) {
      setVotes(issue.votes);
      setVoted(false);
      loadComments(issue.id);
    }
  }, [issue, open]);

  async function loadComments(issueId: number) {
    setLoading(true);
    try {
      const res = await fetch(`/api/issues/${issueId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleVote() {
    if (voted || !issue) return;
    const res = await fetch(`/api/issues/${issue.id}/vote`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setVotes(data.votes);
      setVoted(true);
    }
  }

  async function handleSend() {
    if (!content.trim() || !issue || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/issues/${issue.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_name: name.trim() || undefined,
          content: content.trim(),
        }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setComments((prev) => [...prev, newComment]);
        setContent("");
        setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    } finally {
      setSending(false);
    }
  }

  if (!issue) return null;

  const type = issue.type ?? "task";
  const priority = issue.priority ?? "medium";
  const status = issue.status ?? "open";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${typePillColor[type]}`}
              >
                {type}
              </span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${priorityPillColor[priority]}`}
              >
                {priority}
              </span>
            </div>
            <DialogTitle className="text-lg font-semibold text-[#1a1a1a] leading-tight">
              {issue.title}
            </DialogTitle>
          </div>

          {/* Vote button */}
          <button
            onClick={handleVote}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl border transition-colors flex-shrink-0 ${
              voted
                ? "border-[#c6e135] bg-[#c6e135]/10 text-[#65a30d]"
                : "border-gray-200 text-gray-400 hover:text-[#65a30d] hover:border-[#c6e135]"
            }`}
          >
            <LuChevronUp className="w-4 h-4" />
            <span className="text-xs font-semibold">{votes}</span>
          </button>
        </div>

        {/* Description */}
        {issue.description && (
          <DialogDescription className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
            {issue.description}
          </DialogDescription>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-gray-400 border-t border-b border-gray-100 py-2">
          {issue.createdAt && (
            <span>Created: {formatDate(issue.createdAt)}</span>
          )}
          <span className="text-gray-200">|</span>
          <span>Status: {statusLabel[status] ?? status}</span>
        </div>

        {/* Comments */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="flex items-center gap-2 mb-3">
            <LuMessageCircle className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-[#1a1a1a]">
              Comments ({comments.length})
            </span>
          </div>

          {loading ? (
            <p className="text-xs text-gray-400 text-center py-4">Loading...</p>
          ) : comments.length === 0 ? (
            <p className="text-xs text-gray-300 text-center py-4">No comments yet</p>
          ) : (
            <div className="space-y-3">
              {comments.map((c) => {
                const authorName = c.authorName ?? "Anonymous";
                const isOwner = c.isOwner ?? false;
                return (
                  <div
                    key={c.id}
                    className={`flex gap-2.5 ${isOwner ? "flex-row-reverse" : ""}`}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {isOwner ? (
                        <div className="w-8 h-8 rounded-full bg-[#c6e135] flex items-center justify-center text-xs font-bold">
                          Y
                        </div>
                      ) : (
                        <img
                          src={getAvatarUrl(authorName)}
                          alt=""
                          className="w-8 h-8 rounded-full bg-gray-100"
                        />
                      )}
                    </div>

                    {/* Bubble */}
                    <div className={`max-w-[80%] ${isOwner ? "items-end" : ""}`}>
                      <div className={`flex items-center gap-1.5 mb-0.5 ${isOwner ? "justify-end" : ""}`}>
                        <span className={`text-xs font-medium ${isOwner ? "text-[#65a30d]" : "text-gray-600"}`}>
                          {authorName}
                        </span>
                        {isOwner && (
                          <span className="text-[9px] bg-[#c6e135] text-[#1a1a1a] px-1.5 py-0.5 rounded-full font-medium">
                            Owner
                          </span>
                        )}
                        {c.createdAt && (
                          <span className="text-[10px] text-gray-400">
                            {formatDate(c.createdAt)}
                          </span>
                        )}
                      </div>
                      <div
                        className={`rounded-2xl px-3 py-2 text-sm ${
                          isOwner
                            ? "bg-[#c6e135]/10 border border-[#c6e135]/30"
                            : "bg-gray-50 border border-gray-100"
                        }`}
                      >
                        <p className="text-gray-800 whitespace-pre-wrap">{c.content}</p>
                        {c.images && c.images.length > 0 && (
                          <div className="flex gap-2 mt-1.5">
                            {c.images.map((url, i) => (
                              <img key={i} src={url} alt="" className="max-w-[160px] rounded-lg border" />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={commentsEndRef} />
            </div>
          )}
        </div>

        {/* Comment input */}
        <div className="border-t border-gray-100 pt-3 flex items-center gap-2">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-20 text-sm px-2 py-1.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-[#c6e135]"
          />
          <input
            type="text"
            placeholder="Leave a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="flex-1 text-sm px-3 py-1.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-[#c6e135]"
          />
          <button
            onClick={handleSend}
            disabled={sending || !content.trim()}
            className="p-1.5 rounded-lg bg-[#c6e135] text-[#1a1a1a] hover:bg-[#b5d030] disabled:opacity-40 transition-colors"
          >
            <LuSend className="w-4 h-4" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
