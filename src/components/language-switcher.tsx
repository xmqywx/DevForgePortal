"use client";

import { useI18n } from "@/i18n/context";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-full p-0.5">
      <button
        onClick={() => setLocale("en")}
        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
          locale === "en" ? "bg-[#c6e135] text-[#1a1a1a]" : "text-gray-400 hover:text-gray-600"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLocale("zh")}
        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
          locale === "zh" ? "bg-[#c6e135] text-[#1a1a1a]" : "text-gray-400 hover:text-gray-600"
        }`}
      >
        中文
      </button>
    </div>
  );
}
