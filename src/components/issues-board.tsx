"use client";

import { useState } from "react";
import { IssueCardWithVote, type IssueWithVotes } from "./issue-card-with-vote";
import { IssueDetailModal } from "./issue-detail-modal";
import { useI18n } from "@/i18n/context";

export function IssuesBoard({ issues }: { issues: IssueWithVotes[] }) {
  const [selectedIssue, setSelectedIssue] = useState<IssueWithVotes | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { t } = useI18n();

  const columns = [
    {
      key: "open",
      title: t("issues.open"),
      border: "border-t-4 border-amber-400",
      filter: (i: IssueWithVotes) => i.status === "open",
    },
    {
      key: "in-progress",
      title: t("issues.inProgress"),
      border: "border-t-4 border-[#c6e135]",
      filter: (i: IssueWithVotes) => i.status === "in-progress",
    },
    {
      key: "done",
      title: t("issues.done"),
      border: "border-t-4 border-green-500",
      filter: (i: IssueWithVotes) => i.status === "resolved",
    },
    {
      key: "closed",
      title: t("issues.closed"),
      border: "border-t-4 border-gray-400",
      filter: (i: IssueWithVotes) =>
        i.status === "wont-fix" || i.status === "deferred" || i.status === "closed",
    },
  ];

  function openIssue(issue: IssueWithVotes) {
    setSelectedIssue(issue);
    setModalOpen(true);
  }

  return (
    <>
      <div className="grid grid-cols-4 gap-4">
        {columns.map((col) => {
          let colIssues = issues.filter(col.filter);
          // Sort by votes DESC within each column
          colIssues.sort((a, b) => b.votes - a.votes);
          // Done column: only last 10
          if (col.key === "done") {
            colIssues = colIssues.slice(0, 10);
          }
          return (
            <div
              key={col.key}
              className={`${col.border} rounded-2xl shadow-sm bg-white p-3`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#1a1a1a]">
                  {col.title}
                </h3>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {colIssues.length}
                </span>
              </div>
              <div className="space-y-2">
                {colIssues.map((issue) => (
                  <IssueCardWithVote
                    key={issue.id}
                    issue={issue}
                    onClick={() => openIssue(issue)}
                  />
                ))}
                {colIssues.length === 0 && (
                  <p className="text-xs text-gray-300 text-center py-4">
                    {t("issues.noIssues")}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <IssueDetailModal
        issue={selectedIssue}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}
