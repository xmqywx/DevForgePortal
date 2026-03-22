"use client";
import { useState, useEffect } from "react";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";

interface Reply {
  id: number;
  authorName: string;
  isOwner: boolean;
  content: string;
  images: string[];
  createdAt: string;
}

interface FeedbackItem {
  id: number;
  title: string;
  description: string;
  authorName: string;
  authorIp: string;
  type: string;
  status: string;
  upvotes: number;
  images: string[];
  createdAt: string;
  replies: Reply[];
}

export function ChatFeedback({ projectId }: { projectId: number }) {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadFeedback() {
    const res = await fetch(`/api/feedback?projectId=${projectId}`);
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    loadFeedback();
  }, [projectId]);

  // Poll every 30s for new messages
  useEffect(() => {
    const interval = setInterval(loadFeedback, 30000);
    return () => clearInterval(interval);
  }, [projectId]);

  async function handleSubmit(
    title: string,
    description: string,
    authorName: string,
    images: string[],
  ) {
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        title,
        description,
        author_name: authorName,
        images,
      }),
    });
    loadFeedback();
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-semibold">Feedback & Discussion</h3>
        <p className="text-sm text-gray-500">{items.length} messages</p>
      </div>

      <div className="max-h-[600px] overflow-y-auto p-4 space-y-6">
        {items.map((item) => (
          <div key={item.id}>
            {/* Main feedback message */}
            <ChatMessage
              authorName={item.authorName ?? "匿名"}
              isOwner={false}
              content={
                item.title +
                (item.description ? "\n\n" + item.description : "")
              }
              images={item.images}
              date={item.createdAt}
              type={item.type}
              status={item.status}
              upvotes={item.upvotes}
              feedbackId={item.id}
            />
            {/* Replies */}
            {item.replies?.map((reply) => (
              <ChatMessage
                key={reply.id}
                authorName={reply.authorName}
                isOwner={reply.isOwner}
                content={reply.content}
                images={reply.images}
                date={reply.createdAt}
              />
            ))}
          </div>
        ))}
        {!loading && items.length === 0 && (
          <p className="text-center text-gray-400 py-8">
            No feedback yet. Be the first!
          </p>
        )}
      </div>

      <ChatInput onSubmit={handleSubmit} />
    </div>
  );
}
