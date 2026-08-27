import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatDuration(seconds?: number): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}m ${s}s`;
}

export const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "bg-green-100 text-green-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  NOT_STARTED: "bg-gray-100 text-gray-600",
  NOT_CONNECTED: "bg-red-100 text-red-800",
  FAILED: "bg-red-100 text-red-800",
  CANCELLED: "bg-orange-100 text-orange-800",
  ACTIVE: "bg-green-100 text-green-800",
  DRAFT: "bg-yellow-100 text-yellow-800",
  PENDING: "bg-yellow-100 text-yellow-800",
};

export const LANGUAGE_LABELS: Record<string, string> = {
  ENGLISH: "English",
  HINDI: "Hindi",
  TAMIL: "Tamil",
  TELUGU: "Telugu",
  KANNADA: "Kannada",
  MARATHI: "Marathi",
  MALAYALAM: "Malayalam",
  GUJARATI: "Gujarati",
  BENGALI: "Bengali",
  TURKISH: "Turkish",
  ARABIC: "Arabic",
  SPANISH: "Spanish",
};

/** Parse Hunar API JSON error strings into human-readable messages. */
export function parseApiError(e: unknown): string {
  const raw = (e as Error).message || String(e);
  try {
    const parsed = JSON.parse(raw);
    const detail = parsed?.detail;
    if (typeof detail === "string") return detail;
    if (detail?.message) return detail.message;
    if (parsed?.message) return parsed.message;
    const details = detail?.details || parsed?.details;
    if (Array.isArray(details) && details.length > 0) {
      return details.map((d: { field_name?: string; error_msg?: string }) => `${d.field_name}: ${d.error_msg}`).join(", ");
    }
  } catch {
    // not JSON — return as-is
  }
  return raw;
}

export const PERSONA_COLORS: Record<string, string> = {
  NEHA: "from-pink-500 to-rose-500",
  ROY: "from-blue-500 to-indigo-500",
  ZOE: "from-purple-500 to-violet-500",
  SAM: "from-green-500 to-emerald-500",
  MIRA: "from-orange-500 to-amber-500",
  EESHA: "from-teal-500 to-cyan-500",
};
