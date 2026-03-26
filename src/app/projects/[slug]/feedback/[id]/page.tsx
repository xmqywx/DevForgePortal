"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { LuArrowLeft } from "react-icons/lu";
import { ChatThread } from "@/components/chat-thread";
import type { FeedbackItem } from "@/components/feedback-shell";

export default function FeedbackDetailPage() {
  const params = useParams<{ slug: string; id: string }>();
  const [feedback, setFeedback] = useState<FeedbackItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadFeedback = useCallback(async () => {
    try {
      // First get project id from slug
      const projRes = await fetch(`/api/projects/${params.slug}`);
      if (!projRes.ok) { setError(true); setLoading(false); return; }
      const project = await projRes.json();

      // Then get all feedback for the project
      const fbRes = await fetch(`/api/feedback?projectId=${project.id}`);
      if (!fbRes.ok) { setError(true); setLoading(false); return; }
      const items: FeedbackItem[] = await fbRes.json();

      // Find the specific feedback item
      const item = items.find((i) => i.id === Number(params.id));
      if (!item) { setError(true); setLoading(false); return; }

      setFeedback(item);
      setLoading(false);
    } catch {
      setError(true);
      setLoading(false);
    }
  }, [params.slug, params.id]);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  // Poll every 30s for new replies
  useEffect(() => {
    const interval = setInterval(loadFeedback, 30000);
    return () => clearInterval(interval);
  }, [loadFeedback]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-[#c6e135] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !feedback) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-500 mb-4">Feedback not found</p>
        <Link
          href={`/projects/${params.slug}/feedback`}
          className="inline-flex items-center gap-1 text-sm text-[#65a30d] hover:underline"
        >
          <LuArrowLeft className="w-4 h-4" />
          返回反馈列表
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href={`/projects/${params.slug}/feedback`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#1a1a1a] mb-4 transition-colors"
      >
        <LuArrowLeft className="w-4 h-4" />
        返回反馈列表
      </Link>

      <ChatThread feedback={feedback} onReplyAdded={loadFeedback} />
    </div>
  );
}
