"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { FeedbackShell } from "@/components/feedback-shell";

export default function FeedbackPage() {
  const params = useParams<{ slug: string }>();
  const [projectId, setProjectId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${params.slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.id) setProjectId(data.id);
      })
      .catch(() => {});
  }, [params.slug]);

  if (!projectId) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-[#c6e135] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <FeedbackShell projectId={projectId} />;
}
