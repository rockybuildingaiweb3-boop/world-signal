const PROJECT_TIMEZONE = 'America/Los_Angeles';

/**
 * Formats an ISO 8601 timestamp into the canonical America/Los_Angeles publication timezone.
 * Preserves explicit timezone label so publication time is never confused with event date.
 */
export function formatPublicationTimestamp(
  isoString: string | undefined | null,
  timeZone: string = PROJECT_TIMEZONE
): string {
  if (!isoString || !isoString.trim()) return 'Not specified';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZoneName: 'short',
    });
    return formatter.format(date);
  } catch {
    return isoString;
  }
}

/**
 * Formats a compact time-only or date+time string for dense tables and archive rows.
 */
export function formatCompactTimestamp(
  isoString: string | undefined | null,
  timeZone: string = PROJECT_TIMEZONE
): string {
  if (!isoString || !isoString.trim()) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZoneName: 'short',
    });
    return formatter.format(date);
  } catch {
    return isoString;
  }
}

/**
 * Formats an editorial calendar date (YYYY-MM-DD) without timezone shifting.
 */
export function formatEditionDate(dateStr: string | undefined | null): string {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr || 'Unknown Date';
  }
  const [year, month, day] = dateStr.split('-').map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'UTC',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(utcDate);
  } catch {
    return dateStr;
  }
}

/**
 * Formats an event date range cleanly, keeping event occurrence strictly separate from publication timestamps.
 */
export function formatEventDateRange(startDate?: string, endDate?: string): string {
  const start = startDate?.trim();
  const end = endDate?.trim();
  if (!start && !end) return 'Not specified';
  if (start && end && end !== start) {
    return `${start} to ${end}`;
  }
  return start || end || 'Not specified';
}

/**
 * Formats coverage window start → end in America/Los_Angeles.
 */
export function formatCoverageWindow(
  startIso?: string,
  endIso?: string,
  timeZone: string = PROJECT_TIMEZONE
): string {
  if (!startIso && !endIso) return 'Not specified';
  if (startIso && endIso) {
    return `${formatCompactTimestamp(startIso, timeZone)} → ${formatCompactTimestamp(endIso, timeZone)}`;
  }
  return formatCompactTimestamp(startIso || endIso, timeZone);
}
