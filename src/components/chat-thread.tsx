"use client";
import { useState } from "react";
import { LuSend } from "react-icons/lu";
import { VoteButton } from "./vote-button";
import type { FeedbackItem, Reply } from "./feedback-shell";

function getAvatarUrl(name: string) {
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[d.getMonth()]} ${d.getDate()}`;
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
  children,
}: {
  authorName: string;
  isOwner: boolean;
  content: string;
  images?: string[];
  date: string;
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
            src={getAvatarUrl(authorName)}
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
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{content}</p>
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
  const [replyName, setReplyName] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSendReply() {
    if (!replyText.trim()) return;
    setSending(true);
    await fetch(`/api/feedback/${feedback.id}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: replyText,
        author_name: replyName || "Anonymous",
      }),
    });
    setReplyText("");
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
          />
        ))}
      </div>

      {/* Reply input */}
      <div className="border-t border-gray-100 p-4">
        <div className="flex gap-2">
          <input
            value={replyName}
            onChange={(e) => setReplyName(e.target.value)}
            placeholder="Your name"
            className="w-28 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c6e135]"
          />
          <div className="flex-1 flex gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
            <input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 bg-transparent text-sm focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) handleSendReply();
              }}
            />
          </div>
          <button
            onClick={handleSendReply}
            disabled={sending || !replyText.trim()}
            className="bg-[#c6e135] text-[#1a1a1a] px-4 rounded-xl hover:bg-[#b5d025] disabled:opacity-50 transition-colors"
          >
            <LuSend className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
