"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/context";

const TABS = [
  { key: "tabs.overview", href: "" },
  { key: "tabs.roadmap", href: "/roadmap" },
  { key: "tabs.updates", href: "/updates" },
  { key: "tabs.issues", href: "/issues" },
  { key: "tabs.feedback", href: "/feedback" },
];

export function ProjectTabs({ slug }: { slug: string }) {
  const pathname = usePathname();
  const basePath = `/projects/${slug}`;
  const { t } = useI18n();

  return (
    <nav className="flex items-center gap-1.5 overflow-x-auto pb-1">
      {TABS.map((tab) => {
        const href = `${basePath}${tab.href}`;
        const isActive =
          tab.href === ""
            ? pathname === basePath
            : pathname.startsWith(href);

        return (
          <Link
            key={tab.key}
            href={href}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              isActive
                ? "bg-[#c6e135] text-[#1a1a1a]"
                : "text-[#1a1a1a]/60 hover:text-[#1a1a1a] hover:bg-black/5"
            }`}
          >
            {t(tab.key)}
          </Link>
        );
      })}
    </nav>
  );
}
