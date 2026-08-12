import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  Pressable,
  Linking,
  Platform,
} from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import SendIcon from "../../assets/camera-icons/send.svg";

import {
  formatEventWhen,
  formatAnytimeWhen,
  formatOpenState,
  formatRelative,
} from "../../utils/datetimeUtil";
import {
  distanceFromUser,
  formatDistance,
  formatPlace,
  estimateDriveMinutes,
  formatDriveTime,
} from "../../utils/geoUtil";
import {
  cancelRsvp,
  fetchAttendanceSummary,
  fetchMyRsvp,
  fetchMySavedImpactIds,
  rsvpToEvent,
  toggleSavedImpact,
} from "../lib/eventsAPI";

const HANDLE_HEIGHT = 24;
// collapsed height lands just under the button row - everything scrolls now,
// so this only decides how much shows before the user drags or scrolls
const COLLAPSED_HEIGHT = 190;
const STORY_IMAGE_SIZE = 85;
// stack avatars on the going card - a touch bigger than the list card's
const STACK_AVATAR_SIZE = 34;
const MAX_STACK_AVATARS = 4;

function SheetHandle() {
  return (
    <View style={styles.handleContainer}>
      <View style={styles.handleIndicator} />
    </View>
  );
}

/**
 * EventPageTab
 *   index 0 — collapsed: title block + button row visible
 *   index 1 — half screen
 *   index 2 — full screen
 *
 *   everything lives in one scroll view, so the buttons scroll away with the
 *   rest of the content rather than staying pinned
 */
const EventPageTab = forwardRef(function EventPageTab(
  { event, userLocation, navigation, onClose, onRsvpChange, onSavedChange },
  ref,
) {
  const sheetRef = useRef(null);

  // rsvp + attendance live here because they're per-event and refetched
  // whenever the caller swaps which row is showing
  const [rsvpStatus, setRsvpStatus] = useState(null);
  const [summary, setSummary] = useState({ goingCount: 0, friendCount: 0 });
  const [busy, setBusy] = useState(false);

  // drop-ins can't be rsvp'd, so they track saved state instead
  const [saved, setSaved] = useState(false);

  const snapPoints = useMemo(
    () => [COLLAPSED_HEIGHT + HANDLE_HEIGHT, "50%", "90%"],
    [],
  );

  useImperativeHandle(
    ref,
    () => ({
      open: () => sheetRef.current?.snapToIndex(1),
      expand: () => sheetRef.current?.snapToIndex(2),
      collapse: () => sheetRef.current?.snapToIndex(0),
      close: () => sheetRef.current?.close(),
    }),
    [],
  );

  const handleClose = useCallback(() => {
    sheetRef.current?.close();
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (event) {
      sheetRef.current?.snapToIndex(1);
    } else {
      sheetRef.current?.close();
    }
  }, [event]);

  // scheduled rows load rsvp + counts, drop-ins load whether they're saved
  useEffect(() => {
    let cancelled = false;

    if (!event) {
      setRsvpStatus(null);
      setSaved(false);
      setSummary({ goingCount: 0, friendCount: 0 });
      return;
    }

    (async () => {
      try {
        if (event.kind === "event") {
          const [status, counts] = await Promise.all([
            fetchMyRsvp(event.id),
            fetchAttendanceSummary(event.id),
          ]);

          if (cancelled) return;
          setRsvpStatus(status);
          setSummary(counts);
          setSaved(false);
        } else {
          const savedIds = await fetchMySavedImpactIds();

          if (cancelled) return;
          setSaved(savedIds.includes(event.id));
          setRsvpStatus(null);
          setSummary({ goingCount: 0, friendCount: 0 });
        }
      } catch (error) {
        console.log("Event state load failed", error.message);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [event]);

  const isEvent = event?.kind === "event";
  const hasRsvp = rsvpStatus != null;

  // whichever value fills in the primary button for this kind of row
  const actionActive = isEvent ? hasRsvp : saved;

  const when = isEvent
    ? formatEventWhen(event?.start_datetime, event?.end_datetime)
    : formatAnytimeWhen(event?.hours);

  // relative time gets its own color, so it's separate from the rest
  // "in 1 month" on events, "Open Now" / "Closed" on drop-ins
  const relativeText = isEvent
    ? formatRelative(event?.start_datetime)
    : formatOpenState(event?.hours);

  // closed drop-ins go red, everything else green
  const isClosed = !isEvent && relativeText === "Closed";

  // "340 mi · Santa Monica, CA" - everything after the relative time
  const metaLine = useMemo(() => {
    if (!event) return null;

    const parts = [
      formatDistance(distanceFromUser(userLocation, event)),
      formatPlace(event.city, event.state),
    ];

    return parts.filter(Boolean).join(" · ");
  }, [event, userLocation]);

  // "8.5 hr" for the drive-time button
  const driveTime = formatDriveTime(estimateDriveMinutes(userLocation, event));

  // friends attending, for the stack on the going card
  const stackAttendees = (event?.attendees ?? []).slice(0, MAX_STACK_AVATARS);

  // scheduled rows rsvp, drop-ins save - a db trigger rejects rsvps on
  // anytime rows, so the two paths can't be shared
  const handleActionPress = useCallback(async () => {
    if (!event || busy) return;

    setBusy(true);

    if (!isEvent) {
      const previous = saved;
      setSaved(!previous);

      try {
        const nowSaved = await toggleSavedImpact(event.id);
        setSaved(nowSaved);
        onSavedChange?.(event, nowSaved);
      } catch (error) {
        console.log("Save failed", error.message);
        setSaved(previous);
      } finally {
        setBusy(false);
      }
      return;
    }

    const next = hasRsvp ? null : "going";

    // the counts snap back if the call throws
    setRsvpStatus(next);
    setSummary((current) => ({
      ...current,
      goingCount: current.goingCount + (hasRsvp ? -1 : 1),
    }));

    try {
      if (hasRsvp) {
        await cancelRsvp(event.id);
      } else {
        await rsvpToEvent(event.id);
      }
      onRsvpChange?.(event, next);
    } catch (error) {
      console.log("RSVP failed", error.message);
      setRsvpStatus(hasRsvp ? rsvpStatus : null);
      setSummary((current) => ({
        ...current,
        goingCount: current.goingCount + (hasRsvp ? 1 : -1),
      }));
    } finally {
      setBusy(false);
    }
  }, [
    event,
    isEvent,
    busy,
    saved,
    hasRsvp,
    rsvpStatus,
    onRsvpChange,
    onSavedChange,
  ]);

  // lat/long opens a precise pin - the old location string made maps guess
  const handleDirectionsPress = useCallback(() => {
    if (!event) return;

    const label = encodeURIComponent(event.name ?? "");
    const url =
      event.latitude != null && event.longitude != null
        ? Platform.select({
            ios: `maps://?daddr=${event.latitude},${event.longitude}&q=${label}`,
            android: `geo:${event.latitude},${event.longitude}?q=${event.latitude},${event.longitude}(${label})`,
          })
        : `https://maps.google.com/?q=${encodeURIComponent(
            [event.location, event.city, event.state]
              .filter(Boolean)
              .join(", "),
          )}`;

    Linking.openURL(url).catch(() =>
      console.log("Could not open directions for", event.id),
    );
  }, [event]);

  // send button hands off to the SendTo screen
  const handleSendPress = useCallback(() => {
    if (!event) return;
    navigation?.navigate("SendTo", {
      eventId: event.id,
      eventName: event.name,
    });
  }, [event, navigation]);

  // full street line for the details block
  const fullAddress = event
    ? [event.location, event.city, event.state].filter(Boolean).join(", ")
    : null;

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={false}
      handleComponent={SheetHandle}
      backgroundStyle={styles.sheetBackground}
      style={styles.sheetShadow}
    >
      {/* show nothing until caller sets event */}
      {event ? (
        <BottomSheetScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.titleRow}>
            {/* story thumbnail */}
            <Pressable
              style={styles.storyRing}
              onPress={() => console.log("Open story", event.id)}
              hitSlop={6}
            >
              {event.thumbnail ? (
                <Image
                  source={{ uri: event.thumbnail }}
                  style={styles.storyImage}
                />
              ) : (
                <View style={[styles.storyImage, styles.storyFallback]} />
              )}
            </Pressable>

            <View style={styles.rightColumn}>
              {/* title left, close button pinned top right */}
              <View style={styles.titleHeaderRow}>
                <Text style={styles.title} numberOfLines={2}>
                  {event.name}
                </Text>

                <Pressable
                  style={styles.closeButton}
                  onPress={handleClose}
                  hitSlop={10}
                >
                  <Ionicons name="close" size={20} color="#1A1A1A" />
                </Pressable>
              </View>

              {/* details span the full width of this column */}
              <View style={styles.detailsBlock}>
                {!!when && <Text style={styles.subtitle}>{when}</Text>}

                {(!!relativeText || !!metaLine) && (
                  <Text style={styles.metaText}>
                    {!!relativeText && (
                      <Text
                        style={
                          isClosed ? styles.closedText : styles.relativeText
                        }
                      >
                        {relativeText}
                      </Text>
                    )}
                    {!!relativeText && !!metaLine && " · "}
                    {metaLine}
                  </Text>
                )}

                {!!event.organizationName && (
                  <View style={styles.hostRow}>
                    <Text style={styles.hostLine}>
                      Hosted by{" "}
                      <Text style={styles.hostNameTitle}>
                        {event.organizationName}
                      </Text>
                    </Text>
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color="#3E7A4E"
                    />
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.buttonRow}>
            {/* primary: rsvp for events (black when RSVP'D), save for drop-ins */}
            <Pressable
              style={[
                styles.button,
                styles.primaryButton,
                actionActive ? styles.buttonBlack : styles.buttonNeutral,
              ]}
              onPress={handleActionPress}
            >
              <Ionicons
                name={actionActive ? "bookmark" : "bookmark-outline"}
                size={15}
                color={actionActive ? "#FFFFFF" : "#111111"}
              />
              <Text
                style={[
                  styles.buttonLabel,
                  actionActive && styles.buttonLabelLight,
                ]}
              >
                {isEvent
                  ? hasRsvp
                    ? "RSVP'D"
                    : "RSVP"
                  : saved
                    ? "Saved"
                    : "Save"}
              </Text>
            </Pressable>

            {/* drive time */}
            <Pressable
              style={[styles.button, styles.buttonNeutral, styles.driveButton]}
            >
              <Ionicons name="car" size={21} color="#000000" />
              <Text style={styles.buttonLabel}>{driveTime ?? "Go"}</Text>
            </Pressable>

            {/* send - hands off to SendTo */}
            {/* send - hands off to SendTo */}
            <Pressable
              style={[styles.button, styles.buttonAccent, styles.sendButton]}
              onPress={handleSendPress}
            >
              {/* Replaced Ionicons with your custom SVG */}
              <SendIcon width={19} height={19} />
            </Pressable>
          </View>

          {/* each section is its own white card on the grey sheet */}
          {isEvent && summary.goingCount > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                {summary.goingCount} going
                {summary.friendCount > 0 &&
                  ` · ${summary.friendCount} friends attending`}
              </Text>

              {/* same stack as the list card - friends only, grey when no avatar */}
              {stackAttendees.length > 0 && (
                <View style={styles.avatarGroup}>
                  {stackAttendees.map((attendee, index) =>
                    attendee.image ? (
                      <Image
                        key={attendee.id ?? index}
                        source={{ uri: attendee.image }}
                        style={[
                          styles.attendeeAvatar,
                          index > 0 && styles.overlappingAvatar,
                        ]}
                      />
                    ) : (
                      <View
                        key={attendee.id ?? index}
                        style={[
                          styles.attendeeAvatar,
                          styles.attendeeAvatarEmpty,
                          index > 0 && styles.overlappingAvatar,
                        ]}
                      />
                    ),
                  )}
                </View>
              )}
            </View>
          )}

          {!!event.description && (
            <View style={styles.card}>
              <Text style={styles.cardHeading}>About</Text>
              <Text style={styles.cardBody}>{event.description}</Text>
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.cardHeading}>Event Details</Text>

            {!!when && (
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={17} color="#000000" />
                <Text style={styles.detailText}>{when}</Text>
              </View>
            )}

            {!!fullAddress && (
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={17} color="#000000" />
                <Text style={styles.detailText}>{fullAddress}</Text>
              </View>
            )}

            {!!event.organizationName && (
              <View style={styles.detailRow}>
                <Ionicons name="people-outline" size={17} color="#000000" />

                <Text style={styles.detailText}>
                  Hosted by{" "}
                  <Text style={styles.hostNameDetails}>
                    {event.organizationName}
                  </Text>{" "}
                  <Ionicons name="checkmark-circle" size={13} color="#3E7A4E" />
                </Text>
              </View>
            )}
          </View>
        </BottomSheetScrollView>
      ) : null}
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  // grey sheet so the white section cards read as cards
  sheetBackground: {
    backgroundColor: "#F7F7F9",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  sheetShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
    shadowOpacity: 0.12,
    elevation: 12,
  },

  // Handle
  handleContainer: {
    height: HANDLE_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  handleIndicator: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D9D9D9",
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 48,
  },

  // Title block
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 4,
    width: "100%",
  },
  storyRing: {
    borderRadius: (STORY_IMAGE_SIZE + 8) / 2,
    borderWidth: 2,
    borderColor: "#3DA9FC",
    padding: 2,
  },
  storyImage: {
    width: STORY_IMAGE_SIZE,
    height: STORY_IMAGE_SIZE,
    borderRadius: STORY_IMAGE_SIZE / 2,
    resizeMode: "cover",
  },
  storyFallback: {
    backgroundColor: "#E8E8E8",
  },
  rightColumn: {
    flex: 1,
    minWidth: 0,
    marginLeft: 14,
  },
  titleHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    minWidth: 0,
  },
  title: {
    flex: 1,
    minWidth: 0,
    fontSize: 18,
    fontWeight: "600",
    color: "#111111",
    marginRight: 8,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EBEBED",
  },
  detailsBlock: {
    marginTop: 1,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "400",
    color: "#111111",
  },
  metaText: {
    marginTop: 4,
    fontSize: 12,
    color: "#8A8A8A",
  },
  relativeText: {
    color: "#018850",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  closedText: {
    color: "#FD2646",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  hostRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 2,
  },
  hostLine: {
    fontSize: 12,
    color: "#8A8A8A",
  },
  hostNameTitle: {
    color: "#111111",
    textDecorationLine: "underline",
  },
  hostNameDetails: {
    color: "#646567",
  },

  // Button row
  buttonRow: {
    flexDirection: "row",
    marginTop: 18,
    marginBottom: 18,
    paddingHorizontal: 4,
    gap: 10,
  },
  button: {
    paddingVertical: 10,
    borderRadius: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  buttonNeutral: {
    backgroundColor: "#EBEBED",
  },
  buttonBlack: {
    backgroundColor: "#111111",
  },
  buttonAccent: {
    backgroundColor: "#FFFC00",
  },
  primaryButton: {
    flex: 1,
  },
  driveButton: {
    flex: 1,
  },
  sendButton: {
    flex: 0.8,
  },
  buttonLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111111",
  },
  buttonLabelLight: {
    color: "#FFFFFF",
  },

  // white section cards - same treatment as EventCard
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,

    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111111",
  },
  cardHeading: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111111",
    marginBottom: 2,
  },
  cardBody: {
    fontSize: 15,
    lineHeight: 22,
    color: "#2A2A2A",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  detailText: {
    flex: 1,
    fontSize: 14,
    color: "#000000",
  },

  // avatar stack on the going card - mirrors the list card's stack
  avatarGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  attendeeAvatar: {
    width: STACK_AVATAR_SIZE,
    height: STACK_AVATAR_SIZE,
    borderRadius: STACK_AVATAR_SIZE / 2,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    backgroundColor: "#EFEFEF",
  },
  attendeeAvatarEmpty: {
    backgroundColor: "#D9D9D9",
  },
  overlappingAvatar: {
    marginLeft: -15,
  },
});

export default EventPageTab;
