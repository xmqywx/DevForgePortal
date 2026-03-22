"use client";
import { useState, useEffect, useCallback } from "react";
import { LuPlus, LuArrowLeft } from "react-icons/lu";
import { FeedbackList } from "@/components/feedback-list";
import { ChatThread } from "@/components/chat-thread";
import { NewFeedbackForm } from "@/components/new-feedback-form";

export interface FeedbackItem {
  id: number;
  projectId: number;
  title: string;
  description: string;
  authorName: string;
  type: string;
  status: string;
  upvotes: number;
  images: string[];
  createdAt: string;
  replies: Reply[];
}

export interface Reply {
  id: number;
  feedbackId: number;
  authorName: string;
  isOwner: boolean;
  content: string;
  images: string[];
  createdAt: string;
}

type View = "list" | "detail" | "new";

export function FeedbackShell({ projectId }: { projectId: number }) {
  const [view, setView] = useState<View>("list");
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const loadFeedback = useCallback(async () => {
    const res = await fetch(`/api/feedback?projectId=${projectId}`);
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  // Poll every 30s
  useEffect(() => {
    const interval = setInterval(loadFeedback, 30000);
    return () => clearInterval(interval);
  }, [loadFeedback]);

  const selectedItem = items.find((i) => i.id === selectedId) ?? null;

  function openDetail(id: number) {
    setSelectedId(id);
    setView("detail");
  }

  function backToList() {
    setView("list");
    setSelectedId(null);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#1a1a1a]">Feedback</h2>
        {view === "list" && (
          <button
            onClick={() => setView("new")}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-[#c6e135] text-[#1a1a1a] rounded-xl hover:bg-[#b5d025] transition-colors"
          >
            <LuPlus className="w-4 h-4" />
            New Feedback
          </button>
        )}
      </div>

      {/* Views */}
      {view === "list" && (
        <FeedbackList
          items={items}
          loading={loading}
          onSelect={openDetail}
        />
      )}

      {view === "detail" && selectedItem && (
        <div>
          <button
            onClick={backToList}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#1a1a1a] mb-4 transition-colors"
          >
            <LuArrowLeft className="w-4 h-4" />
            All Feedback
          </button>
          <ChatThread
            feedback={selectedItem}
            onReplyAdded={loadFeedback}
          />
        </div>
      )}

      {view === "new" && (
        <div>
          <button
            onClick={backToList}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#1a1a1a] mb-4 transition-colors"
          >
            <LuArrowLeft className="w-4 h-4" />
            All Feedback
          </button>
          <NewFeedbackForm
            projectId={projectId}
            onSubmitted={() => {
              loadFeedback();
              backToList();
            }}
          />
        </div>
      )}
    </div>
  );
}
