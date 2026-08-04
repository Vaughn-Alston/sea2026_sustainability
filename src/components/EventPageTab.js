import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { StyleSheet, View, Text, Image, Pressable } from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";

import { formatEventWhen } from "../../utils/datetimeUtil";

const HANDLE_HEIGHT = 24;
const FALLBACK_HEADER_HEIGHT = 220;

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
const EventPageTab = forwardRef(function EventPageTab({ event, onClose }, ref) {
  const sheetRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(null);

  const snapPoints = useMemo(() => {
    const collapsed = (headerHeight ?? FALLBACK_HEADER_HEIGHT) + HANDLE_HEIGHT;
    return [collapsed, "50%", "90%"];
  }, [headerHeight]);

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

  const handleHeaderLayout = useCallback((e) => {
    const next = Math.round(e.nativeEvent.layout.height);
    setHeaderHeight((prev) => (prev === next ? prev : next));
  }, []);

  const handleClose = useCallback(() => {
    sheetRef.current?.close();
    onClose?.();
  }, [onClose]);

  const when = formatEventWhen(event?.start_datetime, event?.end_datetime);

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={false}
      handleComponent={SheetHandle}
      backgroundStyle={styles.sheetBackground}
      style={styles.sheetShadow}
    >
      {event ? (
        <View style={styles.sheetBody}>
          {/* pinned header - stays visible at every snapping position */}
          <View style={styles.header} onLayout={handleHeaderLayout}>
            <View style={styles.titleRow}>
              {event.image ? (
                <Image source={{ uri: event.image }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]} />
              )}

              <View style={styles.titleTextBlock}>
                <Text style={styles.title} numberOfLines={2}>
                  {event.name}
                </Text>
                {!!event.location && (
                  <Text style={styles.location} numberOfLines={1}>
                    {event.location}
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
              <Pressable
                style={[styles.button, styles.buttonNeutral, styles.rsvpButton]}
                onPress={() => console.log("RSVP", event.id)}
              />

              <Pressable
                style={[
                  styles.button,
                  styles.buttonNeutral,
                  styles.directionsButton,
                ]}
                onPress={() => console.log("Directions", event.location)}
              />

              <Pressable
                style={[styles.button, styles.buttonAccent, styles.sendButton]}
                onPress={() => console.log("Send", event.id)}
              />
            </View>
          </View>

          {/* scrollable - only once expanded */}
          <BottomSheetScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {!!when && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>When</Text>
                <Text style={styles.sectionBody}>{when}</Text>
              </View>
            )}

            {!!event.description && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>About</Text>
                <Text style={styles.sectionBody}>{event.description}</Text>
              </View>
            )}

            {!!event.location && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Where</Text>
                <Text style={styles.sectionBody}>{event.location}</Text>
              </View>
            )}

            {/* placeholder until organizations are joined in on the query form events list */}
            {event.organization != null && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Hosted by</Text>
                <Text style={styles.sectionBody}>
                  {event.organizationName ??
                    `Organization #${event.organization}`}
                </Text>
              </View>
            )}
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
  avatar: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 3,
    borderColor: "#3DA9FC",
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
  location: {
    marginTop: 4,
    fontSize: 15,
    color: "#7A7A7A",
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
    alignItems: "center",
    justifyContent: "center",
  },
  buttonNeutral: {
    backgroundColor: "#F0F0F0",
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
  avatarFallback: {
  backgroundColor: "#F0F0F0",
},
});

export default EventPageTab;
