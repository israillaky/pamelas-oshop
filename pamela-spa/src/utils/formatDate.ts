export type FormatDateOptions = {
  dateOnly?: boolean;
  timeOnly?: boolean;
  locale?: string;
};

export function formatDate(
  value?: string | Date | null,
  options?: FormatDateOptions
): string | null {
  if (!value) return null;

  const date = typeof value === "string" ? new Date(value) : value;
  if (isNaN(date.getTime())) return null;

  const locale = options?.locale ?? undefined;

  if (options?.timeOnly) {
    return date.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
  }

  const dateOpts: Intl.DateTimeFormatOptions = options?.dateOnly
    ? { year: "numeric", month: "short", day: "numeric" }
    : { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" };

  return date.toLocaleString(locale, dateOpts);
}

export default formatDate;
