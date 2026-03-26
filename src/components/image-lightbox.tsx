"use client";

import { useState } from "react";
import { LuX } from "react-icons/lu";

interface ImageLightboxProps {
  src: string;
  alt?: string;
  className?: string;
}

export function ImagePreview({ src, alt, className }: ImageLightboxProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <img
        src={src}
        alt={alt ?? ""}
        className={`cursor-zoom-in hover:opacity-90 transition-opacity rounded-lg border border-gray-200 object-cover ${className ?? "max-w-[200px] max-h-[150px]"}`}
        onClick={() => setOpen(true)}
      />

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <LuX className="w-6 h-6" />
          </button>
          <img
            src={src}
            alt={alt ?? ""}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
