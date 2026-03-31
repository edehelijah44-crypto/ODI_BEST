import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number | string | null | undefined): string {
  if (num == null) return "0";

  const value = typeof num === "number" ? num : Number(num);

  if (!Number.isFinite(value)) return "0";
  if (value >= 1000000) return (value / 1000000).toFixed(1) + "M";
  if (value >= 1000) return (value / 1000).toFixed(1) + "k";
  return value.toString();
}
