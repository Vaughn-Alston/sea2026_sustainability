
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
} from "react-native";



//this will allow me to use the bottom sheet component in my app
import BottomSheet, {
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";



//This line of code I will be importing my data from my data files
import { anytimeEvents } from "../data/anytimeEvents";
import { scheduledEvents } from "../data/ascheduledevents";

//I want to import my EventCard component so I can use it in my EventList component so Display Cards to hold my Data from file
import EventCard from "./EventCard";
import { formatDate, formatTime } from "../../utils/datetimeUtil";




const HANDLE_HEIGHT = 24;

function SheetHandle() {
  return (
    <View style={styles.handleContainer}>
      <View style={styles.handleIndicator} />
    </View>
  );
}

export default function EventList({
  visible,
  events = [],
  onClose,
  onSelectEvent,
}) {
  const [page, setPage] = useState("planner");
  const [openModal, setOpenModal] = useState(null);

  const [selectedTab, setSelectedTab] =
    useState("events");

  const [rsvpEventIds, setRsvpEventIds] =
    useState([]);

  const [savedPlaceIds, setSavedPlaceIds] =
    useState([]);

  const toggleRsvp = (eventId) => {
    setRsvpEventIds((currentIds) => {
      const hasRsvped =
        currentIds.includes(eventId);

      if (hasRsvped) {
        return currentIds.filter(
          (id) => id !== eventId,
        );
      }

      return [...currentIds, eventId];
    });
  };

  const toggleSavedPlace = (placeId) => {
    setSavedPlaceIds((currentIds) => {
      const isSaved =
        currentIds.includes(placeId);

      if (isSaved) {
        return currentIds.filter(
          (id) => id !== placeId,
        );
      }

      return [...currentIds, placeId];
    });
  };

  const sheetRef = useRef(null);

  const snapPoints = useMemo(
    () => [100 + HANDLE_HEIGHT, "50%", "90%"],
    [],
  );

  const handleClosePress = useCallback(() => {
    sheetRef.current?.close();
  }, []);

  const handleSheetClose = useCallback(() => {
    setPage("MapScreen");
    setOpenModal(false);
    onClose?.();
  }, [onClose]);

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
            <Text style={styles.impactLabel}>
              Impact
            </Text>

            <Text style={styles.impactCount}>
              {selectedTab === "events"
                ? anytimeEvents.length
                : scheduledEvents.length}
            </Text>
          </View>

          <Pressable
            style={styles.closeButton}
            onPress={handleClosePress}
            hitSlop={10}
          >
            <Text style={styles.closeButtonText}>
              ✕
            </Text>
          </Pressable>
        </View>

        <View style={styles.tabRow}>
          <Pressable
            style={styles.tabButton}
            onPress={() =>
              setSelectedTab("events")
            }
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "events" &&
                  styles.activeTabText,
              ]}
            >
              Events
            </Text>

            {selectedTab === "events" && (
              <View
                style={styles.activeTabIndicator}
              />
            )}
          </Pressable>

          <Pressable
            style={styles.tabButton}
            onPress={() =>
              setSelectedTab("anytime")
            }
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "anytime" &&
                  styles.activeTabText,
              ]}
            >
              Anytime
            </Text>

            {selectedTab === "anytime" && (
              <View
                style={styles.activeTabIndicator}
              />
            )}
          </Pressable>
        </View>

        <BottomSheetScrollView
          contentContainerStyle={
            styles.cardContainer
          }
          showsVerticalScrollIndicator={false}
        >

          {/* Start here */}
          {selectedTab === "events"
  ? anytimeEvents.map((event) => (
      <EventCard
        key={event.id}
        event={event}
        actionType="rsvp"
        selected={rsvpEventIds.includes(event.id)}
        onActionPress={() =>
          toggleRsvp(event.id)
        }
        onPress={() => onSelectEvent?.(event)}
      />
    ))
  : scheduledEvents.map((event) => (
      <EventCard
        key={event.id}
        event={event}
        actionType="bookmark"
        selected={savedPlaceIds.includes(event.id)}
        onActionPress={() =>
          toggleSavedPlace(event.id)
        }
        onPress={() => onSelectEvent?.(event)}
      />
    ))}
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
});