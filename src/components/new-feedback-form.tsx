"use client";
import { useState } from "react";
import { LuPaperclip, LuSend } from "react-icons/lu";

const AVATAR_STYLES = ["adventurer", "avataaars", "bottts", "fun-emoji", "lorelei", "micah", "miniavs", "personas"];

export function NewFeedbackForm({
  projectId,
  onSubmitted,
}: {
  projectId: number;
  onSubmitted: () => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [avatarSeed, setAvatarSeed] = useState(0);

  const currentStyle = AVATAR_STYLES[avatarSeed % AVATAR_STYLES.length];
  const avatarUrl = `https://api.dicebear.com/7.x/${currentStyle}/svg?seed=${encodeURIComponent(name || "anon")}-${avatarSeed}`;

  function shuffleAvatar() {
    setAvatarSeed((prev) => prev + 1);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("files", f));
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.urls) setImages((prev) => [...prev, ...data.urls]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        title,
        description: content,
        author_name: name || "Anonymous",
        images,
      }),
    });
    setSubmitting(false);
    onSubmitted();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5"
    >
      <h3 className="font-bold text-lg text-[#1a1a1a]">New Feedback</h3>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-400">*</span>
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Brief summary of your feedback"
          required
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c6e135]"
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Content <span className="text-red-400">*</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Describe in detail... Supports Markdown"
          required
          rows={5}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c6e135] resize-y"
        />
      </div>

      {/* Image upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Images
        </label>
        {images.length > 0 && (
          <div className="flex gap-2 mb-2 flex-wrap">
            {images.map((url, i) => (
              <div key={i} className="relative">
                <img
                  src={url}
                  alt=""
                  className="w-16 h-16 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() =>
                    setImages((imgs) => imgs.filter((_, j) => j !== i))
                  }
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}
        <label className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 cursor-pointer transition-colors">
          <LuPaperclip className="w-4 h-4" />
          Attach images
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Bottom row: name + avatar + submit */}
      <div className="flex items-center gap-3 pt-2">
        <img
          src={avatarUrl}
          alt=""
          title="Click to change avatar"
          onClick={shuffleAvatar}
          className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-[#c6e135] transition-all"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Anonymous"
          className="w-36 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c6e135]"
        />
        <div className="flex-1" />
        <button
          type="submit"
          disabled={submitting || !title.trim()}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium bg-[#c6e135] text-[#1a1a1a] rounded-xl hover:bg-[#b5d025] disabled:opacity-50 transition-colors"
        >
          <LuSend className="w-4 h-4" />
          Submit Feedback
        </button>
      </div>
    </form>
  );
}
