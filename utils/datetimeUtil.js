/**
 * Date + time helpers for event timestamps.
 *
 * Every function here takes a Postgres `timestamptz` string (what Supabase
 * returns for `events.start_datetime` / `events.end_datetime`) and returns a
 * display string, or `null` when the input is missing or unparseable — so
 * callers can guard with a simple falsy check instead of try/catch.
 */

/** Parses an ISO/timestamptz string, returning null instead of Invalid Date. */
function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "Fri, Sep 12" */
export function formatDate(value) {
  const date = parseDate(value);
  if (!date) return null;
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// "9:00 AM" 
export function formatTime(value) {
  const date = parseDate(value);
  if (!date) return null;
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

// "Fri, Sep 12 · 9:00 AM – 12:00 PM"
// or without the end time if there isn't one

export function formatEventWhen(startValue, endValue) {
  const datePart = formatDate(startValue);
  if (!datePart) return null;

  const startTime = formatTime(startValue);
  const endTime = formatTime(endValue);

  if (!startTime) return datePart;
  return endTime
    ? `${datePart} · ${startTime} – ${endTime}`
    : `${datePart} · ${startTime}`;
}

// true if the event's end (or start, if no end) is before today
export function isPastEvent(startValue, endValue) {
  const reference = parseDate(endValue) ?? parseDate(startValue);
  if (!reference) return false;
  return reference.getTime() < Date.now();
}

// true if the event starts today, in device's local timezone
export function isToday(value) {
  const date = parseDate(value);
  if (!date) return false;
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

// "in 3 days" / "in 2 hours" / "5 days ago" —  for list rows
export function formatRelative(value) {
  const date = parseDate(value);
  if (!date) return null;

  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);
  const abs = Math.abs(diffMinutes);

  const units = [
    { limit: 60, amount: 1, name: "minute" },
    { limit: 1440, amount: 60, name: "hour" },
    { limit: 10080, amount: 1440, name: "day" },
    { limit: 43200, amount: 10080, name: "week" },
    { limit: Infinity, amount: 43200, name: "month" },
  ];

  const unit = units.find((u) => abs < u.limit);
  const count = Math.max(1, Math.round(abs / unit.amount));
  const plural = count === 1 ? unit.name : `${unit.name}s`;

  return diffMs >= 0 ? `in ${count} ${plural}` : `${count} ${plural} ago`;
}