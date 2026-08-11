// React Imports
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

//this will allow me to use the bottom sheet component in my app
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";

//I want to import my EventCard component so I can use it in my EventList component so Display Cards to hold my Data from file
import EventCard from "./EventCard";

const HANDLE_HEIGHT = 24;

function SheetHandle() {
  return (
    <View style={styles.handleContainer}>
      <View style={styles.handleIndicator} />
    </View>
  );
}

/**
 * EventList
 *   Every tab renders from props - the parent owns the supabase fetch so the
 *   map and this sheet share one dataset instead of querying twice.
 *   `events` are the scheduled rows, `anytimeImpacts` the drop-in places, and
 *   `savedItems` is whatever the user hearted, either kind.
 *
 *   rsvp + saved ids are props too
 *   both persist to the db and the event page agrees with what the cards show.
 */
export default function EventList({
  visible,
  events = [],
  anytimeImpacts = [],
  savedItems = [],
  loading = false,
  userLocation,
  rsvpEventIds = [],
  savedPlaceIds = [],
  onToggleRsvp,
  onToggleSaved,
  onClose,
  onSelectEvent,
  onDirections,
}) {
  const [page, setPage] = useState("planner");
  const [openModal, setOpenModal] = useState(null);

  //// options: "events", "anytime", "saved" default towards events
  const [selectedTab, setSelectedTab] = useState("events");

  // whichever tab is up drives both the header count and the cards below
  const visibleItems = useMemo(() => {
    if (selectedTab === "events") return events;
    if (selectedTab === "anytime") return anytimeImpacts;
    return savedItems;
  }, [selectedTab, events, anytimeImpacts, savedItems]);

  const sheetRef = useRef(null);

  const snapPoints = useMemo(() => [100 + HANDLE_HEIGHT, "50%", "90%"], []);

  const handleClosePress = useCallback(() => {
    sheetRef.current?.close();
  }, []);

  const handleSheetClose = useCallback(() => {
    setPage("MapScreen");
    setOpenModal(false);
    onClose?.();
  }, [onClose]);

  // reset to scheduled events tab after closed - tab you were on won't persist
  useEffect(() => {
    if (!visible) {
      setSelectedTab("events");
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      sheetRef.current?.snapToIndex(1);
    } else {
      sheetRef.current?.close();
    }
  }, [visible]);

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enableHandlePanningGesture
      enableContentPanningGesture
      enablePanDownToClose={false}
      handleComponent={SheetHandle}
      backgroundStyle={styles.sheetBackground}
      style={styles.sheetShadow}
      onClose={handleSheetClose}
    >
      <View style={styles.drawer}>
        <View style={styles.header}>
          <View>
            <Text style={styles.impactLabel}>Impact</Text>

            <Text style={styles.impactCount}>{visibleItems.length}</Text>
          </View>

          <Pressable
            style={styles.closeButton}
            onPress={handleClosePress}
            hitSlop={10}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
        </View>

        <View style={styles.tabRow}>
          {/* Here will start the start of my table with my categories */}

          {/* Tab 1 */}
          <Pressable
            style={styles.tabButton}
            onPress={() => setSelectedTab("events")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "events" && styles.activeTabText,
              ]}
            >
              Events
            </Text>

            {selectedTab === "events" && (
              <View style={styles.activeTabIndicator} />
            )}
          </Pressable>
          {/* End of Tab 1 */}

          {/* Tab 2 */}
          <Pressable
            style={styles.tabButton}
            onPress={() => setSelectedTab("anytime")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "anytime" && styles.activeTabText,
              ]}
            >
              Drop- IN
            </Text>

            {selectedTab === "anytime" && (
              <View style={styles.activeTabIndicator} />
            )}
          </Pressable>
          {/* End of Tab 2 */}

          {/* Tab 3  - This will be the saved events */}
          <Pressable
            style={styles.tabButton}
            onPress={() => setSelectedTab("saved")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "saved" && styles.activeTabText,
              ]}
            >
              Saved
            </Text>

            {selectedTab === "saved" && (
              <View style={styles.activeTabIndicator} />
            )}
          </Pressable>
          {/* End of Tab 3 */}

          {/* The end of my tables */}
        </View>


        <BottomSheetScrollView
          contentContainerStyle={styles.cardContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Start here */}
          {loading && visibleItems.length === 0 ? (
            <ActivityIndicator style={styles.loader} color="#8A8A8A" />
          ) : visibleItems.length === 0 ? (
            <Text style={styles.emptyText}>
              {selectedTab === "events"
                ? "No upcoming events yet."
                : selectedTab === "anytime"
                  ? "No drop-in places yet."
                  : "No saved events yet."}
            </Text>
          ) : (
            visibleItems.map((item) => (
              <EventCard
                key={item.id}
                event={item}
                userLocation={userLocation}
                // card decides which controls to show based on the row's kind
                saved={savedPlaceIds.includes(item.id)}
                rsvped={rsvpEventIds.includes(item.id)}
                onSavePress={() => onToggleSaved?.(item)}
                onRsvpPress={() => onToggleRsvp?.(item)}
                onDirectionsPress={() => onDirections?.(item)}
                onPress={() => onSelectEvent?.(item)}
              />
            ))
          )}
        </BottomSheetScrollView>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: "#F7F7F9",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  sheetShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowRadius: 8,
    shadowOpacity: 0.15,
    elevation: 12,
  },

  drawer: {
    flex: 1,
    backgroundColor: "#F7F7F9",
  },

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

  header: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 6,
  },

  impactLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#777777",
  },

  impactCount: {
    marginTop: 2,
    fontSize: 26,
    fontWeight: "800",
    color: "#111111",
  },

  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EBEBED",
  },

  closeButtonText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000000",
  },

  tabRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E2E2",
  },

  tabButton: {
    marginRight: 28,
    paddingTop: 12,
    paddingBottom: 10,
  },

  tabText: {
    fontSize: 19,
    fontWeight: "600",
    color: "#8A8A8A",
  },

  activeTabText: {
    fontWeight: "800",
    color: "#111111",
  },

  activeTabIndicator: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    height: 3,
    borderRadius: 3,
    backgroundColor: "#111111",
  },

  cardContainer: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 50,
  },

  loader: {
    marginTop: 28,
  },

  emptyText: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#777777",
  },
});