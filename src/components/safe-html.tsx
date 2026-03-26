"use client";

import { useRef, useEffect, useState } from "react";

function isHtml(str: string) {
  return /<[a-z][\s\S]*>/i.test(str);
}

function fixImagePaths(html: string): string {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  return html.replace(/src="\/uploads\//g, `src="${baseUrl}/uploads/`);
}

export function SafeHtml({ content, className }: { content: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const imgs = ref.current.querySelectorAll("img");
    imgs.forEach((img) => {
      img.style.cursor = "zoom-in";
      img.addEventListener("click", () => {
        setLightboxSrc(img.src);
      });
    });
  }, [content]);

  if (isHtml(content)) {
    const fixed = fixImagePaths(content);
    return (
      <>
        <div
          ref={ref}
          className={`rendered-html ${className ?? ""}`}
          dangerouslySetInnerHTML={{ __html: fixed }}
        />
        {lightboxSrc && (
          <div
            className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
            onClick={() => setLightboxSrc(null)}
          >
            <button
              onClick={() => setLightboxSrc(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              &#10005;
            </button>
            <img
              src={lightboxSrc}
              alt=""
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </>
    );
  }
  return <div className={`${className ?? ""} whitespace-pre-wrap`}>{content}</div>;
}
