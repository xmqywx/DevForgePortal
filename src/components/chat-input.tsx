"use client";
import { useState } from "react";
import { LuSend, LuPaperclip } from "react-icons/lu";

interface Props {
  onSubmit: (
    title: string,
    description: string,
    authorName: string,
    images: string[],
  ) => void;
}

export function ChatInput({ onSubmit }: Props) {
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("files", f));
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.urls) setImages((prev) => [...prev, ...data.urls]);
  }

  async function handleSend() {
    if (!message.trim()) return;
    setSending(true);
    const lines = message.split("\n");
    const title = lines[0];
    const description = lines.slice(1).join("\n").trim();
    await onSubmit(title, description, name || "匿名", images);
    setMessage("");
    setImages([]);
    setSending(false);
  }

  return (
    <div className="border-t border-gray-100 p-4">
      {images.length > 0 && (
        <div className="flex gap-2 mb-2">
          {images.map((url, i) => (
            <div key={i} className="relative">
              <img
                src={url}
                alt=""
                className="w-12 h-12 object-cover rounded-lg border"
              />
              <button
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
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-28 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c6e135]"
        />
        <div className="flex-1 flex gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Leave feedback..."
            className="flex-1 bg-transparent text-sm focus:outline-none"
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          />
          <label className="cursor-pointer text-gray-400 hover:text-gray-600">
            <LuPaperclip className="w-4 h-4" />
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
        <button
          onClick={handleSend}
          disabled={sending || !message.trim()}
          className="bg-[#c6e135] text-[#1a1a1a] px-4 rounded-xl hover:bg-[#b5d025] disabled:opacity-50 transition-colors"
        >
          <LuSend className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
