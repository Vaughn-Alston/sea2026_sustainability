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

// compact version for the event card - day + date + start time only
// no end time, so it fits on one line next to the distance
// "Sun, May 27, 9:00 AM"
export function formatEventShort(startValue) {
  const datePart = formatDate(startValue);
  if (!datePart) return null;

  const startTime = formatTime(startValue);
  return startTime ? `${datePart}, ${startTime}` : datePart;
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

/**
 * Opening-hours helpers for `anytime_impacts.hours`.
 *
 * Drop-in places aren't scheduled, so instead of a timestamp they carry a
 * jsonb blob keyed by weekday — {"mon": ["09:00","17:00"], "sun": null} — and
 * the UI shows Open Now / Closed rather than a date. Same contract as above:
 * `null` back when there's nothing usable to show.
 */

const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

// "09:00" -> minutes since midnight, so ranges are easy to compare
function toMinutes(clockValue) {
  if (typeof clockValue !== "string") return null;
  const [hour, minute] = clockValue.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  return hour * 60 + minute;
}

// today's [open, close] pair, or null when closed / no hours recorded
export function todaysHours(hours, referenceDate = new Date()) {
  if (!hours) return null;
  const range = hours[WEEKDAY_KEYS[referenceDate.getDay()]];
  return Array.isArray(range) && range.length === 2 ? range : null;
}

// true only if the place is open at this exact moment
export function isOpenNow(hours, referenceDate = new Date()) {
  const range = todaysHours(hours, referenceDate);
  if (!range) return false;

  const open = toMinutes(range[0]);
  const close = toMinutes(range[1]);
  if (open == null || close == null) return false;

  const now = referenceDate.getHours() * 60 + referenceDate.getMinutes();
  return now >= open && now < close;
}

// "Open Now" / "Closed" for the badge on drop-in cards
export function formatOpenState(hours, referenceDate = new Date()) {
  if (!hours) return null;
  return isOpenNow(hours, referenceDate) ? "Open Now" : "Closed";
}

// "Open today 9:00 AM – 5:00 PM" for the detail sheet
export function formatAnytimeWhen(hours, referenceDate = new Date()) {
  const range = todaysHours(hours, referenceDate);
  if (!range) return "Closed today";

  const label = (clockValue) => {
    const minutes = toMinutes(clockValue);
    if (minutes == null) return clockValue;
    const date = new Date(referenceDate);
    date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
    return formatTime(date.toISOString());
  };

  return `Open today ${label(range[0])} – ${label(range[1])}`;
}