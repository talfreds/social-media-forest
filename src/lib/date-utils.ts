import React, { useState, useEffect } from "react";

export type DateFormat = "date" | "datetime" | "time" | "relative";

interface DateFormatOptions {
  format?: DateFormat;
  locale?: string;
  timeZone?: string;
}

/**
 * Hydration-safe date formatting hook
 * Prevents hydration mismatches by ensuring consistent formatting between server and client
 */
export function useHydrationSafeDate(
  dateString: string,
  options: DateFormatOptions = {}
) {
  const { format = "date", locale = "en-US", timeZone } = options;
  const [mounted, setMounted] = useState(false);
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    setMounted(true);
    const date = new Date(dateString);
    setFormattedDate(formatDate(date, format, locale, timeZone));
  }, [dateString, format, locale, timeZone]);

  if (!mounted) {
    const date = new Date(dateString);
    return formatDate(date, format, locale, timeZone);
  }

  return formattedDate;
}

/**
 * Format a date object with consistent options
 */
function formatDate(
  date: Date,
  format: DateFormat,
  locale: string,
  timeZone?: string
): string {
  const baseOptions: Intl.DateTimeFormatOptions = {
    timeZone,
  };

  switch (format) {
    case "date":
      return date.toLocaleDateString(locale, {
        ...baseOptions,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

    case "datetime":
      const dateStr = date.toLocaleDateString(locale, {
        ...baseOptions,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      const timeStr = date.toLocaleTimeString(locale, {
        ...baseOptions,
        hour: "2-digit",
        minute: "2-digit",
      });
      return `${dateStr} • ${timeStr}`;

    case "time":
      return date.toLocaleTimeString(locale, {
        ...baseOptions,
        hour: "2-digit",
        minute: "2-digit",
      });

    case "relative":
      return getRelativeTime(date);

    default:
      return date.toLocaleDateString(locale, baseOptions);
  }
}

/**
 * Get relative time string (e.g., "2 hours ago", "3 days ago")
 */
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? "" : "s"} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? "" : "s"} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears === 1 ? "" : "s"} ago`;
}

/**
 * React component for hydration-safe date display
 * Note: This component should be imported in .tsx files only
 */
interface HydrationSafeDateProps {
  dateString: string;
  format?: DateFormat;
  locale?: string;
  timeZone?: string;
  className?: string;
  component?: React.ElementType;
}

export function HydrationSafeDate({
  dateString,
  format = "date",
  locale = "en-US",
  timeZone,
  className,
  component: Component = "span",
}: HydrationSafeDateProps) {
  const formattedDate = useHydrationSafeDate(dateString, {
    format,
    locale,
    timeZone,
  });

  // Use React.createElement to avoid JSX in .ts file
  return React.createElement(Component, { className }, formattedDate);
}

/**
 * Utility function for server-side date formatting (no hydration concerns)
 */
export function formatDateServer(
  dateString: string,
  options: DateFormatOptions = {}
): string {
  const { format = "date", locale = "en-US", timeZone } = options;
  const date = new Date(dateString);
  return formatDate(date, format, locale, timeZone);
}
