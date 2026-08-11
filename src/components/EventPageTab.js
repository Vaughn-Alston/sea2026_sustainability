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
const HEADER_HEIGHT = 200;

function SheetHandle() {
  return (
    <View style={styles.handleContainer}>
      <View style={styles.handleIndicator} />
    </View>
  );
}

/**
 * EventPageTab
 *   index 0 — collapsed: handle + title row + button row
 *   index 1 — half screen (opens on press)
 *   index 2 — full screen, scrollable for rest of details
 */
const EventPageTab = forwardRef(function EventPageTab(
  { event, userLocation, onClose, onRsvpChange, onSavedChange },
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
    () => [HEADER_HEIGHT + HANDLE_HEIGHT, "50%", "90%"],
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

  // drop-ins have no attending rows so only scheduled events get counts
  // load whether they're already saved instead
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

  // whichever value fills in the button for this kind of row
  const actionActive = isEvent ? hasRsvp : saved;

  const when = isEvent
    ? formatEventWhen(event?.start_datetime, event?.end_datetime)
    : formatAnytimeWhen(event?.hours);

  // "In 2 Hrs · 6.9 miles · Playa del Rey, CA"
  const metaLine = useMemo(() => {
    if (!event) return null;

    const parts = [
      isEvent
        ? formatRelative(event.start_datetime)
        : formatOpenState(event.hours),
      formatDistance(distanceFromUser(userLocation, event)),
      formatPlace(event.city, event.state),
    ];

    return parts.filter(Boolean).join(" · ");
  }, [event, isEvent, userLocation]);

  // scheduled rows rsvp
  // drop-ins save
  // db trigger rejects rsvps on anytime rows so the two paths can't be shared
  const handleActionPress = useCallback(async () => {
    if (!event || busy) return;

    setBusy(true);

    if (!isEvent) {
      const previous = saved;
      setSaved(!previous);

      try {
        // the toggle returns where it landed so two fast taps can't desync
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
        <View style={styles.sheetBody}>
          {/* pinned header - stays visible at every snap point */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Pressable
                style={[
                  styles.avatarRing,
                  event.hasStory && styles.avatarRingActive,
                ]}
                onPress={() =>
                  console.log(
                    "Open story",
                    event.id,
                    "hasStory:",
                    !!event.hasStory,
                  )
                }
                hitSlop={6}
              >
                {event.thumbnail ? (
                  <Image
                    source={{ uri: event.thumbnail }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarFallback]} />
                )}
              </Pressable>

              <View style={styles.titleTextBlock}>
                <Text style={styles.title} numberOfLines={2}>
                  {event.name}
                </Text>

                {!!when && (
                  <Text style={styles.subtitle} numberOfLines={1}>
                    {when}
                  </Text>
                )}

                {!!metaLine && (
                  <Text style={styles.location} numberOfLines={1}>
                    {metaLine}
                  </Text>
                )}

                {!!event.organizationName && (
                  <Text style={styles.hostLine} numberOfLines={1}>
                    Hosted by{" "}
                    <Text style={styles.hostName}>
                      {event.organizationName}
                    </Text>
                  </Text>
                )}
              </View>

              <Pressable
                style={styles.closeButton}
                onPress={handleClose}
                hitSlop={10}
              >
                <Ionicons name="close" size={20} color="#1A1A1A" />
              </Pressable>
            </View>

            <View style={styles.buttonRow}>
              {/* scheduled events rsvp, drop-ins just save */}
              <Pressable
                style={[
                  styles.button,
                  styles.rsvpButton,
                  actionActive ? styles.buttonSelected : styles.buttonNeutral,
                ]}
                onPress={handleActionPress}
              >
                <Ionicons
                  name={actionActive ? "bookmark" : "bookmark-outline"}
                  size={18}
                  color={actionActive ? "#FFFFFF" : "#111111"}
                />
                <Text
                  style={[
                    styles.buttonLabel,
                    actionActive && styles.buttonLabelSelected,
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

              <Pressable
                style={[
                  styles.button,
                  styles.buttonNeutral,
                  styles.directionsButton,
                ]}
                onPress={handleDirectionsPress}
              >
                <Ionicons name="car" size={18} color="#111111" />
                <Text style={styles.buttonLabel}>Go</Text>
              </Pressable>

              <Pressable
                style={[styles.button, styles.buttonAccent, styles.sendButton]}
                onPress={() => console.log("Send", event.id)}
              >
                <Ionicons name="send" size={17} color="#111111" />
              </Pressable>
            </View>
          </View>

          {/* scrollable detail - only reachable once expanded */}
          <BottomSheetScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {isEvent && summary.goingCount > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  {summary.goingCount} going
                  {summary.friendCount > 0 &&
                    ` · ${summary.friendCount} friends attending`}
                </Text>
              </View>
            )}

            {!!event.description && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>About</Text>
                <Text style={styles.sectionBody}>{event.description}</Text>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Event Details</Text>

              {!!when && (
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={17} color="#7A7A7A" />
                  <Text style={styles.detailText}>{when}</Text>
                </View>
              )}

              {!!fullAddress && (
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={17} color="#7A7A7A" />
                  <Text style={styles.detailText}>{fullAddress}</Text>
                </View>
              )}

              {!!event.organizationName && (
                <View style={styles.detailRow}>
                  <Ionicons name="people-outline" size={17} color="#7A7A7A" />
                  <Text style={styles.detailText}>
                    Hosted by {event.organizationName}
                  </Text>
                </View>
              )}

              {!!event.category && (
                <View style={styles.detailRow}>
                  <Ionicons name="pricetag-outline" size={17} color="#7A7A7A" />
                  <Text style={styles.detailText}>{event.category}</Text>
                </View>
              )}
            </View>
          </BottomSheetScrollView>
        </View>
      ) : null}
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
    shadowOpacity: 0.12,
    elevation: 12,
  },
  sheetBody: {
    flex: 1,
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

  // Pinned header
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 18,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: "transparent",
    padding: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarRingActive: {
    borderColor: "#3DA9FC",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F0F0",
  },
  titleTextBlock: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111111",
  },
  subtitle: {
    marginTop: 3,
    fontSize: 15,
    fontWeight: "600",
    color: "#3A3A3A",
  },
  location: {
    marginTop: 4,
    fontSize: 15,
    color: "#7A7A7A",
  },
  hostLine: {
    marginTop: 3,
    fontSize: 14,
    color: "#7A7A7A",
  },
  hostName: {
    color: "#111111",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
  },

  // Button row
  buttonRow: {
    flexDirection: "row",
    marginTop: 20,
    gap: 10,
  },
  button: {
    height: 52,
    borderRadius: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  buttonNeutral: {
    backgroundColor: "#F0F0F0",
  },
  buttonSelected: {
    backgroundColor: "#111111",
  },
  buttonAccent: {
    backgroundColor: "#FFFC00",
  },
  rsvpButton: {
    flex: 1,
  },
  directionsButton: {
    flex: 1.3,
  },
  sendButton: {
    flex: 0.8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
  },
  buttonLabelSelected: {
    color: "#FFFFFF",
  },

  // Scrollable detail
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  section: {
    marginBottom: 22,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#9A9A9A",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  sectionBody: {
    fontSize: 16,
    lineHeight: 23,
    color: "#2A2A2A",
  },
  card: {
    backgroundColor: "#F7F7F9",
    borderRadius: 16,
    padding: 16,
    marginBottom: 22,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  detailText: {
    flex: 1,
    fontSize: 15,
    color: "#2A2A2A",
  },
});

export default EventPageTab;
