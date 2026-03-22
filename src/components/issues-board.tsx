"use client";

import { useState } from "react";
import { IssueCardWithVote, type IssueWithVotes } from "./issue-card-with-vote";
import { IssueDetailModal } from "./issue-detail-modal";

const columns = [
  {
    key: "open",
    title: "Open",
    border: "border-t-4 border-amber-400",
    filter: (i: IssueWithVotes) => i.status === "open",
  },
  {
    key: "in-review",
    title: "In Review",
    border: "border-t-4 border-blue-400",
    filter: (i: IssueWithVotes) => i.status === "in-review",
  },
  {
    key: "in-progress",
    title: "In Progress",
    border: "border-t-4 border-[#c6e135]",
    filter: (i: IssueWithVotes) => i.status === "in-progress",
  },
  {
    key: "done",
    title: "Done",
    border: "border-t-4 border-green-500",
    filter: (i: IssueWithVotes) =>
      i.status === "resolved" || i.status === "wont-fix",
  },
] as const;

export function IssuesBoard({ issues }: { issues: IssueWithVotes[] }) {
  const [selectedIssue, setSelectedIssue] = useState<IssueWithVotes | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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
                    No issues
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
