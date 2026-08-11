import { supabase } from "./supabase";
import { isPastEvent } from "../../utils/datetimeUtil";

/**
 * eventsApi
 *   scheduled events and drop-in places live in one `events` table now, split
 *   by a `type` column
 *
 *   the map, the list, and the event page all want to treat them the same way
 *
 *   Everything gets normalized here so no component has to guess what kind of row it got — they read `kind` instead.
 */

// one normalizer for both — scheduled rows carry start/end, drop-ins carry hours
function normalizeEvent(row) {
  const attendeesData = row.attending
    ?.filter((a) => a.users != null)
    ?.map((a) => a.users) ?? [];

  return {
    kind: row.type === "anytime" ? "anytime" : "event",
    type: row.type,
    id: row.id,
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
    hours: row.hours,
    category: row.category,
    organization: row.organization,
    organizationName: row.organizations?.name ?? null,
    organizationPagelink: row.organizations?.pagelink ?? null,
    attendees: attendeesData,

    // supabase returns embedded aggregates as an array of one row
    attendeeCount: row.attending?.find((a) => a.count !== undefined)?.count ?? attendeesData.length,

    // how many people saved it - number next to heart
    saveCount: row.saved_impacts?.[0]?.count ?? 0,
  };
}

// organizations is joined in so the page can show "Hosted by" without having to pull from db again
// attending(count) gives the "24 going" number, saved_impacts(count) the heart number
// one query covers both tabs — the map needs every pin regardless of which tab happens to be selected
export async function fetchImpactFeed() {
  const { data, error } = await supabase
    .from("events")
    // users(id, avatar) to the attending join to pull user avatars for the stack
    .select(
      "*, organizations(name, pagelink), attending(count, users(id, avatar)), saved_impacts(count)",
    )
    .order("start_datetime", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true });

  if (error) throw error;

  const rows = (data ?? []).map(normalizeEvent);

  return {
    // finished events drop out of the list and off the map
    // isPastEvent measures from end_datetime, so an event mid-session still counts as live
    events: rows.filter(
      (row) =>
        row.type === "scheduled" &&
        !isPastEvent(row.start_datetime, row.end_datetime),
    ),

    // drop-ins are always current, open and close on their hours instead
    anytime: rows.filter((row) => row.type === "anytime"),
  };
}

/**
 * RSVP helpers
 *   call the postgres functions rather than writing to `attending`
 *   directly, so the acting user is taken from auth.uid() server-side and the
 *   client never passes (or spoofs) a user id.
 *
 *   rsvps are scheduled-only — trigger rejects drop-ins
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

// every event the user has rsvp'd to
// list can fill in the RSVP'D labels on first load
export async function fetchMyRsvpEventIds() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("attending")
    .select("event")
    .eq("user", user.id);

  if (error) throw error;
  return (data ?? []).map((row) => row.event);
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
 * Saved places
 *   Same as RSVP helpers above take the user from auth.uid()
 *   toggle handles both directions in one call and returns the state it landed on
 *      caller doesn't have to know whether it was saved beforehand
 *
 *   saves work on both types, so anything in `events` can be bookmarked
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

  return (data ?? []).map((row) =>
    typeof row === "object" ? row.impact : row,
  );
}