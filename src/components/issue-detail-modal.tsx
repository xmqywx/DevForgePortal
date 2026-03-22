"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { LuChevronUp, LuSend, LuMessageCircle, LuChevronDown, LuPaperclip, LuX } from "react-icons/lu";
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
  const parts = dateStr.split(/[-T ]/);
  if (parts.length < 3) return dateStr;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return `${months[month] ?? "?"} ${day}`;
}

function getAvatarUrl(name: string) {
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const style = ["adventurer", "avataaars", "bottts", "fun-emoji", "lorelei"][hash % 5];
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(name)}`;
}

// Render description: parse \n as newline, basic markdown-like rendering
function renderDescription(text: string) {
  // Replace literal \n with actual newlines
  const normalized = text.replace(/\\n/g, "\n");
  return normalized.split("\n").map((line, i) => {
    if (!line.trim()) return <br key={i} />;
    // Bold: **text**
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <p key={i} className="mb-1">
        {parts.map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={j}>{part.slice(2, -2)}</strong>;
          }
          return <span key={j}>{part}</span>;
        })}
      </p>
    );
  });
}

interface Comment {
  id: number;
  authorName: string | null;
  isOwner: boolean | null;
  content: string;
  images: string[] | null;
  createdAt: string | null;
}

const AVATAR_STYLES = ["adventurer", "avataaars", "bottts", "fun-emoji", "lorelei", "micah", "miniavs", "personas"];

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
  const [avatarSeed, setAvatarSeed] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const currentStyle = AVATAR_STYLES[avatarSeed % AVATAR_STYLES.length];
  const avatarUrl = `https://api.dicebear.com/7.x/${currentStyle}/svg?seed=${encodeURIComponent(name || "anon")}-${avatarSeed}`;

  function shuffleAvatar() {
    setAvatarSeed((prev) => prev + 1);
  }

  useEffect(() => {
    if (issue && open) {
      setVotes(issue.votes);
      setVoted(false);
      setExpanded(false);
      setImages([]);
      setContent("");
      loadComments(issue.id);
    }
  }, [issue, open]);

  async function loadComments(issueId: number) {
    setLoading(true);
    try {
      const res = await fetch(`/api/issues/${issueId}/comments`);
      if (res.ok) setComments(await res.json());
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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("files", f));
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.urls) setImages((prev) => [...prev, ...data.urls]);
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
          images,
        }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setComments((prev) => [...prev, newComment]);
        setContent("");
        setImages([]);
        setExpanded(false);
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col overflow-hidden p-0">
        {/* Header */}
        <div className="p-6 pb-0">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${typePillColor[type]}`}>
              {type}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${priorityPillColor[priority]}`}>
              {priority}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              status === "resolved" ? "bg-green-100 text-green-700" :
              status === "in-progress" ? "bg-[#c6e135]/20 text-[#65a30d]" :
              "bg-gray-100 text-gray-500"
            }`}>
              {statusLabel[status] ?? status}
            </span>
            {issue.createdAt && (
              <span className="text-xs text-gray-400 ml-auto">{formatDate(issue.createdAt)}</span>
            )}
          </div>

          <DialogTitle className="text-xl font-bold text-[#1a1a1a] leading-tight mb-3">
            {issue.title}
          </DialogTitle>

          {/* Vote */}
          <button
            onClick={handleVote}
            className={`mb-4 flex items-center gap-2 px-4 py-2 rounded-full border transition-colors text-sm ${
              voted
                ? "bg-[#c6e135]/20 border-[#c6e135] text-[#65a30d]"
                : "border-gray-200 hover:border-[#c6e135] hover:bg-[#c6e135]/10"
            }`}
          >
            <LuChevronUp className="w-4 h-4" />
            <span className="font-semibold">{votes}</span>
            <span className="text-gray-400 text-xs">Vote to prioritize</span>
          </button>
        </div>

        {/* Description */}
        {issue.description && (
          <div className="px-6 pb-4">
            <DialogDescription asChild>
              <div className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-100">
                {renderDescription(issue.description)}
              </div>
            </DialogDescription>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Comments */}
        <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4">
          <div className="flex items-center gap-2 mb-4">
            <LuMessageCircle className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-semibold text-[#1a1a1a]">
              Comments ({comments.length})
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-[#c6e135] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-gray-300 text-center py-8">No comments yet. Be the first to comment!</p>
          ) : (
            <div className="space-y-4">
              {comments.map((c) => {
                const authorName = c.authorName ?? "Anonymous";
                const isOwner = c.isOwner ?? false;
                return (
                  <div key={c.id} className={`flex gap-3 ${isOwner ? "flex-row-reverse" : ""}`}>
                    <div className="flex-shrink-0">
                      {isOwner ? (
                        <div className="w-9 h-9 rounded-full bg-[#c6e135] flex items-center justify-center text-sm font-bold">Y</div>
                      ) : (
                        <img src={getAvatarUrl(authorName)} alt="" className="w-9 h-9 rounded-full bg-gray-100" />
                      )}
                    </div>
                    <div className={`max-w-[80%] ${isOwner ? "items-end" : ""}`}>
                      <div className={`flex items-center gap-1.5 mb-1 ${isOwner ? "justify-end" : ""}`}>
                        <span className={`text-xs font-medium ${isOwner ? "text-[#65a30d]" : "text-gray-600"}`}>{authorName}</span>
                        {isOwner && <span className="text-[9px] bg-[#c6e135] text-[#1a1a1a] px-1.5 py-0.5 rounded-full font-medium">Owner</span>}
                        {c.createdAt && <span className="text-[10px] text-gray-400">{formatDate(c.createdAt)}</span>}
                      </div>
                      <div className={`rounded-2xl px-4 py-3 text-sm ${
                        isOwner ? "bg-[#c6e135]/10 border border-[#c6e135]/30" : "bg-gray-50 border border-gray-100"
                      }`}>
                        <p className="text-gray-800 whitespace-pre-wrap">{c.content}</p>
                        {c.images && c.images.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {c.images.map((url, i) => (
                              <img key={i} src={url} alt="" className="max-w-[200px] rounded-lg border" />
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

        {/* Comment Input — Expandable */}
        <div className="border-t border-gray-100 p-4">
          {!expanded ? (
            /* Collapsed: simple row */
            <div className="flex items-center gap-2">
              <img
                src={avatarUrl}
                alt=""
                title="Click to change avatar"
                onClick={shuffleAvatar}
                className="w-9 h-9 rounded-full bg-gray-100 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-[#c6e135] transition-all"
              />
              <button
                onClick={() => setExpanded(true)}
                className="flex-1 text-left text-sm text-gray-400 px-4 py-2.5 border border-gray-200 rounded-xl bg-white hover:border-[#c6e135] transition-colors"
              >
                Leave a comment...
              </button>
            </div>
          ) : (
            /* Expanded: full editor */
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <img
                  src={avatarUrl}
                  alt=""
                  title="Click to change avatar"
                  onClick={shuffleAvatar}
                  className="w-9 h-9 rounded-full bg-gray-100 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-[#c6e135] transition-all"
                />
                <input
                  type="text"
                  placeholder="Your name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#c6e135]"
                />
                <button
                  onClick={() => { setExpanded(false); setContent(""); setImages([]); }}
                  className="p-1.5 text-gray-400 hover:text-gray-600"
                >
                  <LuX className="w-4 h-4" />
                </button>
              </div>

              <textarea
                autoFocus
                rows={4}
                placeholder="Write your comment... (Markdown supported)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full text-sm px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#c6e135] resize-none"
              />

              {/* Image previews */}
              {images.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {images.map((url, i) => (
                    <div key={i} className="relative">
                      <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg border" />
                      <button
                        onClick={() => setImages((imgs) => imgs.filter((_, j) => j !== i))}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center shadow-sm"
                      >
                        <LuX className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
                  <LuPaperclip className="w-4 h-4" />
                  <span>Attach images</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                <button
                  onClick={handleSend}
                  disabled={sending || !content.trim()}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#c6e135] text-[#1a1a1a] font-medium text-sm hover:bg-[#b5d030] disabled:opacity-40 transition-colors"
                >
                  <LuSend className="w-4 h-4" />
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
