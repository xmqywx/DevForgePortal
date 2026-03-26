import { VoteButton } from "./vote-button";
import { ImagePreview } from "./image-lightbox";

function getAvatarUrl(name: string) {
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const style = ["adventurer", "avataaars", "bottts", "fun-emoji", "lorelei"][
    hash % 5
  ];
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(name)}`;
}

function formatDate(dateStr: string) {
  const parts = dateStr.split(/[-T ]/);  
  if (parts.length < 3) return dateStr;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return `${months[month] ?? "?"} ${day}`;
}

interface Props {
  authorName: string;
  isOwner: boolean;
  content: string;
  images?: string[];
  date: string;
  type?: string;
  status?: string;
  upvotes?: number;
  feedbackId?: number;
}

export function ChatMessage({
  authorName,
  isOwner,
  content,
  images,
  date,
  type,
  status,
  upvotes,
  feedbackId,
}: Props) {
  return (
    <div className={`flex gap-3 ${isOwner ? "flex-row-reverse" : ""} mb-4`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isOwner ? (
          <div className="w-10 h-10 rounded-full bg-[#c6e135] flex items-center justify-center text-sm font-bold">
            Y
          </div>
        ) : (
          <img
            src={getAvatarUrl(authorName)}
            alt=""
            className="w-10 h-10 rounded-full bg-gray-100"
          />
        )}
      </div>

      {/* Message bubble */}
      <div className={`max-w-[75%] ${isOwner ? "items-end" : ""}`}>
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-sm font-medium ${
              isOwner ? "text-[#65a30d]" : "text-gray-700"
            }`}
          >
            {authorName}
          </span>
          {isOwner && (
            <span className="text-[10px] bg-[#c6e135] text-[#1a1a1a] px-1.5 py-0.5 rounded-full font-medium">
              Owner
            </span>
          )}
          <span className="text-xs text-gray-400">{formatDate(date)}</span>
          {type && (
            <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
              {type}
            </span>
          )}
        </div>

        <div
          className={`rounded-2xl px-4 py-3 ${
            isOwner
              ? "bg-[#c6e135]/10 border border-[#c6e135]/30"
              : "bg-gray-50 border border-gray-100"
          }`}
        >
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{content}</p>
          {images && images.length > 0 && (
            <div className="flex gap-2 mt-2">
              {images.map((url, i) => (
                <ImagePreview
                  key={i}
                  src={url}
                  className="max-w-[200px] max-h-[150px]"
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer: vote + status */}
        {feedbackId && (
          <div className="flex items-center gap-3 mt-1.5">
            <VoteButton feedbackId={feedbackId} initialVotes={upvotes ?? 0} />
            {status && status !== "open" && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  status === "resolved"
                    ? "bg-green-100 text-green-700"
                    : status === "in-progress"
                      ? "bg-[#c6e135]/20 text-[#65a30d]"
                      : "bg-gray-100 text-gray-600"
                }`}
              >
                {status}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
