"use client";
import { useState, useRef } from "react";
import { LuSend, LuPaperclip, LuChevronDown, LuX } from "react-icons/lu";
import { VoteButton } from "./vote-button";
import { SafeHtml } from "./safe-html";
import { RichTextEditor } from "./rich-text-editor";
import type { FeedbackItem, Reply } from "./feedback-shell";

const AVATAR_STYLES = ["adventurer", "avataaars", "bottts", "fun-emoji", "lorelei", "micah", "miniavs", "personas"];

function getAvatarUrl(name: string) {
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`;
}

function formatDate(dateStr: string) {
  const parts = dateStr.split(/[-T ]/);  
  if (parts.length < 3) return dateStr;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return `${months[month] ?? "?"} ${day}`;
}

const statusPillColor: Record<string, string> = {
  open: "bg-amber-100 text-amber-700",
  "under-review": "bg-blue-100 text-blue-700",
  "in-progress": "bg-[#c6e135]/20 text-[#65a30d]",
  resolved: "bg-green-100 text-green-700",
  "wont-fix": "bg-gray-100 text-gray-500",
};

const typePillColor: Record<string, string> = {
  bug: "bg-red-100 text-red-700",
  feature: "bg-purple-100 text-purple-700",
  improvement: "bg-blue-100 text-blue-700",
  question: "bg-amber-100 text-amber-700",
};

function MessageBubble({
  authorName,
  isOwner,
  content,
  images,
  date,
  avatarUrl: storedAvatarUrl,
  children,
}: {
  authorName: string;
  isOwner: boolean;
  content: string;
  images?: string[];
  date: string;
  avatarUrl?: string | null;
  children?: React.ReactNode;
}) {
  return (
    <div className={`flex gap-3 ${isOwner ? "flex-row-reverse" : ""} mb-4`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isOwner ? (
          <div className="w-10 h-10 rounded-full bg-[#c6e135] flex items-center justify-center text-sm font-bold text-[#1a1a1a]">
            Y
          </div>
        ) : (
          <img
            src={storedAvatarUrl || getAvatarUrl(authorName)}
            alt=""
            className="w-10 h-10 rounded-full bg-gray-100"
          />
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] ${isOwner ? "text-right" : ""}`}>
        <div className={`flex items-center gap-2 mb-1 ${isOwner ? "justify-end" : ""}`}>
          <span
            className={`text-sm font-medium ${isOwner ? "text-[#65a30d]" : "text-gray-700"}`}
          >
            {authorName}
          </span>
          {isOwner && (
            <span className="text-[10px] bg-[#c6e135] text-[#1a1a1a] px-1.5 py-0.5 rounded-full font-medium">
              Owner
            </span>
          )}
          <span className="text-xs text-gray-400">{formatDate(date)}</span>
        </div>

        <div
          className={`rounded-2xl px-4 py-3 ${isOwner ? "text-left" : ""} ${
            isOwner
              ? "bg-[#c6e135]/10 border border-[#c6e135]/30"
              : "bg-gray-50 border border-gray-100"
          }`}
        >
          <SafeHtml content={content} className="text-sm text-gray-800 leading-relaxed prose prose-sm max-w-none" />
          {images && images.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {images.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  className="max-w-[200px] rounded-lg border"
                />
              ))}
            </div>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

export function ChatThread({
  feedback,
  onReplyAdded,
}: {
  feedback: FeedbackItem;
  onReplyAdded: () => void;
}) {
  const [replyText, setReplyText] = useState("");
  const [replyName, setReplyName] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("devforge_name") || "";
    return "";
  });
  const [sending, setSending] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarSeed, setAvatarSeed] = useState(() => {
    if (typeof window !== "undefined") return parseInt(localStorage.getItem("devforge_avatar_seed") || "0", 10);
    return 0;
  });

  const currentStyle = AVATAR_STYLES[avatarSeed % AVATAR_STYLES.length];
  const replyAvatarUrl = `https://api.dicebear.com/7.x/${currentStyle}/svg?seed=${encodeURIComponent(replyName || "anon")}-${avatarSeed}`;

  function shuffleAvatar() {
    setAvatarSeed((prev) => {
      const next = prev + 1;
      localStorage.setItem("devforge_avatar_seed", String(next));
      return next;
    });
  }

  function updateReplyName(val: string) {
    setReplyName(val);
    localStorage.setItem("devforge_name", val);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("files", f));
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.urls) setImages((prev: string[]) => [...prev, ...data.urls]);
  }

  async function handleSendReply() {
    if (!replyText.trim()) return;
    setSending(true);
    await fetch(`/api/feedback/${feedback.id}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: replyText,
        author_name: replyName || "Anonymous",
        avatar_url: replyAvatarUrl,
        images,
      }),
    });
    setReplyText("");
    setImages([]);
    setExpanded(false);
    setSending(false);
    onReplyAdded();
  }

  const originalContent =
    feedback.title +
    (feedback.description ? "\n\n" + feedback.description : "");

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typePillColor[feedback.type] ?? "bg-gray-100 text-gray-600"}`}
          >
            {feedback.type}
          </span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusPillColor[feedback.status] ?? "bg-gray-100 text-gray-600"}`}
          >
            {feedback.status}
          </span>
        </div>
        <h3 className="font-bold text-[#1a1a1a]">{feedback.title}</h3>
      </div>

      {/* Messages */}
      <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto">
        {/* Original feedback as first message */}
        <MessageBubble
          authorName={feedback.authorName ?? "Anonymous"}
          isOwner={false}
          content={originalContent}
          images={feedback.images}
          date={feedback.createdAt}
          avatarUrl={feedback.avatarUrl}
        >
          <div className="mt-1.5">
            <VoteButton feedbackId={feedback.id} initialVotes={feedback.upvotes ?? 0} />
          </div>
        </MessageBubble>

        {/* Replies */}
        {feedback.replies?.map((reply) => (
          <MessageBubble
            key={reply.id}
            authorName={reply.authorName ?? "Anonymous"}
            isOwner={reply.isOwner}
            content={reply.content}
            images={reply.images}
            date={reply.createdAt}
            avatarUrl={reply.avatarUrl}
          />
        ))}
      </div>

      {/* Reply input */}
      <div className="border-t border-gray-100 p-4">
        {!expanded ? (
          <div className="flex items-center gap-3">
            <img
              src={replyAvatarUrl}
              alt=""
              title="Click to change avatar"
              onClick={shuffleAvatar}
              className="w-9 h-9 rounded-full bg-gray-100 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-[#c6e135] transition-all"
            />
            <button
              onClick={() => setExpanded(true)}
              className="flex-1 text-left text-sm text-gray-400 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 hover:border-[#c6e135] transition-colors"
            >
              Write a reply...
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <img
                src={replyAvatarUrl}
                alt=""
                title="Click to change avatar"
                onClick={shuffleAvatar}
                className="w-9 h-9 rounded-full bg-gray-100 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-[#c6e135] transition-all"
              />
              <input
                value={replyName}
                onChange={(e) => updateReplyName(e.target.value)}
                placeholder="Your name (optional)"
                className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#c6e135]"
              />
              <button onClick={() => { setExpanded(false); setReplyText(""); setImages([]); }} className="p-1.5 text-gray-400 hover:text-gray-600">
                <LuChevronDown className="w-4 h-4" />
              </button>
            </div>

            <RichTextEditor
              compact
              placeholder="Write a reply..."
              onChange={(html) => setReplyText(html)}
            />

            {images.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {images.map((url, i) => (
                  <div key={i} className="relative">
                    <img src={url} alt="" className="w-14 h-14 object-cover rounded-lg border" />
                    <button onClick={() => setImages((imgs) => imgs.filter((_, j) => j !== i))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                      <LuX className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
                <LuPaperclip className="w-4 h-4" />
                <span>Attach</span>
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              <button
                onClick={handleSendReply}
                disabled={sending || !replyText.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c6e135] text-[#1a1a1a] font-medium text-sm hover:bg-[#b5d030] disabled:opacity-40 transition-colors"
              >
                <LuSend className="w-4 h-4" />
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
