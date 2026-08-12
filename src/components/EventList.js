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

import ImpactIcon from "../../assets/pill-icons/impact.svg";
import FavoritesIcon from "../../assets/pill-icons/heart.svg";

//I want to import my EventCard component so I can use it in my EventList component so Display Cards to hold my Data from file
import EventCard from "./EventCard";

const HANDLE_HEIGHT = 24;
const HEADER_ICON_SIZE = 30;
const HEADER_ICON_CIRCLE = 44;

// label + which data each tab reads, so the same sheet can show the event tabs or a saved-only view depending on which pill opened it
const TAB_CONFIG = {
  events: { label: "Events", empty: "No upcoming events yet." },
  anytime: { label: "Drop-In", empty: "No drop-in places yet." },
  saved: { label: "Favorites", empty: "No favorites yet." },
};

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
 *
 *   `tabs` controls which tabs show - the Impacts pill opens the event tabs,
 *   the Favorites pill opens a saved-only version of the same sheet.
 *
 *   `onViewImpact` fires the green button in the header - MapScreen wires it
 *   to navigation so this component doesn't need to know how routing works.
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
  tabs = ["events", "anytime"],
  initialTab = "events",
  onToggleRsvp,
  onToggleSaved,
  onClose,
  onSelectEvent,
  onDirections,
  onViewImpact,
}) {
  const [page, setPage] = useState("planner");
  const [openModal, setOpenModal] = useState(null);

  //// options: "events", "anytime", "saved" default towards the first tab shown
  const [selectedTab, setSelectedTab] = useState(initialTab);
  const isFavorites = tabs.length === 1 && tabs[0] === "saved";

  // whichever tab is up drives both the header count and the cards below
  const visibleItems = useMemo(() => {
    if (selectedTab === "events") return events;
    if (selectedTab === "anytime") return anytimeImpacts;
    return savedItems;
  }, [selectedTab, events, anytimeImpacts, savedItems]);

  const sheetRef = useRef(null);

  const snapPoints = useMemo(() => [80 + HANDLE_HEIGHT, "50%", "90%"], []);
  
  const handleClosePress = useCallback(() => {
    sheetRef.current?.close();
  }, []);

  const handleSheetClose = useCallback(() => {
    setPage("MapScreen");
    setOpenModal(false);
    onClose?.();
  }, [onClose]);

  // reset to whichever tab this sheet opens on after closed - tab you were on won't persist
  useEffect(() => {
    if (!visible) {
      setSelectedTab(initialTab);
    }
  }, [visible, initialTab]);

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
        {/* header stays put at every snap point - icon + count on the left,
            View Impact + close on the right, matches the collapsed mockup */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* circle behind the leaf, matches the mockup's icon chip */}
            <View style={styles.headerIconCircle}>
              {/* new: heart on the favorites sheet, leaf otherwise */}
              {isFavorites ? (
                <FavoritesIcon
                  width={25}
                  height={25}
                />
              ) : (
                <ImpactIcon width={HEADER_ICON_SIZE} height={HEADER_ICON_SIZE} style={{ marginLeft: 1, marginTop: 4 }}/>
              )}
            </View>

            <View>
              {/* new: header title follows which pill opened the sheet */}
              <Text style={styles.impactLabel}>
                {isFavorites ? "Favorites" : "Impacts"}
              </Text>
              <Text style={styles.impactCount}>
                {visibleItems.length} Places
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            {!isFavorites && (
              <Pressable style={styles.viewImpactButton} onPress={onViewImpact}>
                <Text style={styles.viewImpactText}>View Impact</Text>
              </Pressable>
            )}

            <Pressable
              style={styles.closeButton}
              onPress={handleClosePress}
              hitSlop={10}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.tabRow}>
          {/* Here will start the start of my table with my categories */}
          {/* tabs come from the tabs prop so the same row renders the event tabs or just Saved
              text-only now - no underline, active tab is just bolder/darker */}
          {tabs.map((tabId) => (
            <Pressable
              key={tabId}
              style={styles.tabButton}
              onPress={() => setSelectedTab(tabId)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tabId && styles.activeTabText,
                ]}
              >
                {TAB_CONFIG[tabId].label}
              </Text>
            </Pressable>
          ))}
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
              {TAB_CONFIG[selectedTab].empty}
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
    width: 35,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D9D9D9",
  },

  header: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerIconCircle: {
    width: HEADER_ICON_CIRCLE,
    height: HEADER_ICON_CIRCLE,
    borderRadius: HEADER_ICON_CIRCLE / 2,
    backgroundColor: "#ECEDEF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  impactLabel: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111111",
  },

  impactCount: {
    marginTop: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#8A8A8A",
  },

  viewImpactButton: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 100,
    backgroundColor: "#2ECC4E",
    alignItems: "center",
    justifyContent: "center",
  },

  viewImpactText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111111",
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EBEBED",
  },

  closeButtonText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
  },

  tabRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
  },

  tabButton: {
    marginRight: 20,
  },

  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#8A8A8A",
  },

  activeTabText: {
    fontWeight: "800",
    color: "#111111",
  },

  cardContainer: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 50,
  },

  loader: {
    marginTop: 28,
  },

  emptyText: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
    color: "#777777",
  },
});
