"use client";
import { useState, useEffect, useCallback } from "react";
import { LuPlus, LuArrowLeft, LuSearch, LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { FeedbackList } from "@/components/feedback-list";
import { ChatThread } from "@/components/chat-thread";
import { NewFeedbackForm } from "@/components/new-feedback-form";
import { useI18n } from "@/i18n/context";

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
  avatarUrl: string | null;
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
  avatarUrl: string | null;
  createdAt: string;
}

type View = "list" | "detail" | "new";

export function FeedbackShell({ projectId }: { projectId: number }) {
  const [view, setView] = useState<View>("list");
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();

  // Search, sort, filter, pagination state
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"votes" | "newest" | "oldest">("votes");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  // Filter + sort logic
  const filtered = items
    .filter(item => {
      if (search) {
        const q = search.toLowerCase();
        return item.title.toLowerCase().includes(q) ||
               (item.authorName ?? "").toLowerCase().includes(q);
      }
      return true;
    })
    .filter(item => filterType === "all" || item.type === filterType)
    .filter(item => filterStatus === "all" || item.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === "votes") return (b.upvotes ?? 0) - (a.upvotes ?? 0);
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Reset page when filters change
  useEffect(() => setPage(1), [search, sortBy, filterType, filterStatus]);

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
    setSearch("");
    setSortBy("votes");
    setFilterType("all");
    setFilterStatus("all");
    setPage(1);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#1a1a1a]">{t("feedback.title")}</h2>
      </div>

      {/* Views */}
      {view === "list" && (
        <>
          {/* Toolbar */}
          <div className="space-y-3 mb-6">
            {/* Row 1: Search + New Feedback button */}
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("feedback.search")}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:border-[#c6e135]"
                />
              </div>
              <button
                onClick={() => setView("new")}
                className="flex items-center gap-2 bg-[#c6e135] text-[#1a1a1a] font-semibold px-4 py-2.5 rounded-xl hover:bg-[#b5d025] text-sm whitespace-nowrap"
              >
                <LuPlus className="w-4 h-4" /> {t("feedback.newFeedback")}
              </button>
            </div>

            {/* Row 2: Sort + Type filter + Status filter */}
            <div className="flex items-center gap-4 flex-wrap">
              {/* Sort */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400 mr-1">Sort:</span>
                {([{k:"votes",l:t("feedback.sortMostVoted")},{k:"newest",l:t("feedback.sortNewest")},{k:"oldest",l:t("feedback.sortOldest")}] as const).map(s => (
                  <button key={s.k} onClick={() => setSortBy(s.k as "votes" | "newest" | "oldest")}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      sortBy === s.k ? "bg-[#c6e135] text-[#1a1a1a]" : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}>{s.l}</button>
                ))}
              </div>

              {/* Type filter */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400 mr-1">Type:</span>
                {["all","bug","feature","improvement","question"].map(tp => (
                  <button key={tp} onClick={() => setFilterType(tp)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${
                      filterType === tp ? "bg-[#c6e135] text-[#1a1a1a]" : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}>{tp === "all" ? t("feedback.typeAll") : tp}</button>
                ))}
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400 mr-1">Status:</span>
                {["all","open","in-progress","resolved"].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${
                      filterStatus === s ? "bg-[#c6e135] text-[#1a1a1a]" : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}>{s === "all" ? t("feedback.typeAll") : s}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Result count */}
          <p className="text-xs text-gray-400 mb-3">{filtered.length} {t("feedback.results")}</p>

          <FeedbackList
            items={paginated}
            loading={loading}
            onSelect={openDetail}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <LuChevronLeft className="w-4 h-4" /> {t("feedback.previous")}
              </button>
              <span className="text-sm text-gray-500">
                {t("feedback.page")} <span className="font-semibold text-[#1a1a1a]">{page}</span> {t("feedback.of")} {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                {t("feedback.next")} <LuChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {view === "detail" && selectedItem && (
        <div>
          <button
            onClick={backToList}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#1a1a1a] mb-4 transition-colors"
          >
            <LuArrowLeft className="w-4 h-4" />
            {t("feedback.allFeedback")}
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
            {t("feedback.allFeedback")}
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
