"use client";
import { useI18n } from "@/i18n/context";

export function T({ k, fallback }: { k: string; fallback?: string }) {
  const { t } = useI18n();
  return <>{t(k) || fallback || k}</>;
}
