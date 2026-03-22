"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { IssuesBoard } from "@/components/issues-board";
import type { IssueWithVotes } from "@/components/issue-card-with-vote";

export default function IssuesPage() {
  const params = useParams<{ slug: string }>();
  const [issues, setIssues] = useState<IssueWithVotes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/issues?slug=${params.slug}`);
      if (res.ok) {
        const data = await res.json();
        setIssues(data);
      }
      setLoading(false);
    }
    load();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-[#c6e135] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <IssuesBoard issues={issues} />;
}
