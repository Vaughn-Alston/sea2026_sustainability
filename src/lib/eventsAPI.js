import { supabase } from "./supabase";

/**
 * eventsApi
 *   `events` and `anytime_impacts` are different tables with different column sets
 *    map, the list, and the event page all want to treat them the same way
 *    
 *    Everything gets normalized here so no component has to guess which query a row came from — they read `kind` instead.
 */

// ids collide across the two tables (both start at 1), so the display id is
// prefixed for React keys while `rawId` keeps the real value for RPC calls
function makeKey(kind, id) {
  return `${kind}-${id}`;
}

// scheduled events — has start/end, an org host, and rsvp counts
function normalizeEvent(row) {
  return {
    kind: "event",
    id: makeKey("event", row.id),
    rawId: row.id,
    name: row.name,
    description: row.description,
    location: row.location,
    city: row.city,
    state: row.state,
    country: row.country,
    latitude: row.latitude,
    longitude: row.longitude,
    thumbnail: row.thumbnail,
    start_datetime: row.start_datetime,
    end_datetime: row.end_datetime,
    hours: null,
    category: row.category,
    organization: row.organization,
    organizationName: row.organizations?.name ?? null,
    organizationPagelink: row.organizations?.pagelink ?? null,

    // supabase returns embedded aggregates as an array of one row
    attendeeCount: row.attending?.[0]?.count ?? 0,
  };
}

// drop-in places — open by hours rather than scheduled, so no start/end
function normalizeAnytime(row) {
  return {
    kind: "anytime",
    id: makeKey("anytime", row.id),
    rawId: row.id,
    name: row.name,
    description: row.description,
    location: row.location,
    city: row.city,
    state: row.state,
    country: row.country,
    latitude: row.latitude,
    longitude: row.longitude,
    thumbnail: row.thumbnail,
    start_datetime: null,
    end_datetime: null,
    hours: row.hours,
    category: row.category,
    organization: row.organization,
    organizationName: row.organizations?.name ?? null,
    organizationPagelink: row.organizations?.pagelink ?? null,
    attendeeCount: 0,
  };
}

// organizations is joined in so the page can show "Hosted by" without having to pull from db again
// attending(count) gives the "24 going" number
export async function fetchEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*, organizations(name, pagelink), attending(count)")
    .order("start_datetime", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(normalizeEvent);
}

export async function fetchAnytimeImpacts() {
  const { data, error } = await supabase
    .from("anytime_impacts")
    .select("*, organizations(name, pagelink)")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(normalizeAnytime);
}

// both tabs load together — the map needs every pin regardless of which tab happens to be selected
export async function fetchImpactFeed() {
  const [events, anytime] = await Promise.all([
    fetchEvents(),
    fetchAnytimeImpacts(),
  ]);

  return { events, anytime };
}

/**
 * RSVP helpers
 *   call the postgres functions rather than writing to `attending`
 *   directly, so the acting user is taken from auth.uid() server-side and the
 *   client never passes (or spoofs) a user id.
 */
export async function rsvpToEvent(eventId, status = "going") {
  const { data, error } = await supabase.rpc("rsvp_to_event", {
    p_event: eventId,
    p_status: status,
  });

  if (error) throw error;
  return data;
}

export async function cancelRsvp(eventId) {
  const { error } = await supabase.rpc("cancel_rsvp", { p_event: eventId });
  if (error) throw error;
}

// has the signed-in user already rsvp'd? drives the RSVP / RSVP'D toggle
export async function fetchMyRsvp(eventId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("attending")
    .select("status")
    .eq("event", eventId)
    .eq("user", user.id)
    .maybeSingle();

  if (error) throw error;
  return data?.status ?? null;
}

// "24 going · 4 friends attending" — friends comes from the friends table
//  stores the pair in either column order
export async function fetchAttendanceSummary(eventId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { count: goingCount } = await supabase
    .from("attending")
    .select("user", { count: "exact", head: true })
    .eq("event", eventId);

  if (!user) return { goingCount: goingCount ?? 0, friendCount: 0 };

  const { data: friendRows } = await supabase
    .from("friends")
    .select("user_id, friend_id")
    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

  const friendIds = (friendRows ?? []).map((row) =>
    row.user_id === user.id ? row.friend_id : row.user_id,
  );

  if (friendIds.length === 0) {
    return { goingCount: goingCount ?? 0, friendCount: 0 };
  }

  const { count: friendCount } = await supabase
    .from("attending")
    .select("user", { count: "exact", head: true })
    .eq("event", eventId)
    .in("user", friendIds);

  return { goingCount: goingCount ?? 0, friendCount: friendCount ?? 0 };
}

/**
 * Saved drop-ins
 *   Same as RSVP helpers above
 *   take the user from auth.uid() 
 *   toggle handles both directions in one call and returns the state it landed on
 *      caller doesn't have to know whether it was saved beforehand
 */
export async function toggleSavedImpact(impactId) {
  const { data, error } = await supabase.rpc("toggle_saved_impact", {
    p_impact: impactId,
  });

  if (error) throw error;
  return data;
}

// every saved id at once, so the list can render filled bookmarks on first
// paint instead of one lookup per card
export async function fetchMySavedImpactIds() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase.rpc("my_saved_impact_ids");
  if (error) throw error;

  return (data ?? []).map((row) => (typeof row === "object" ? row.impact : row));
}