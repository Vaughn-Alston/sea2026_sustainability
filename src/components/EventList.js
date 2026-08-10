
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


//// options: "events", "dropIn", "saved" defult towards events
const [selectedTab, setSelectedTab] = useState("events");

const [rsvpEventIds, setRsvpEventIds] =
    useState([]);

//This will create a empty array for my saved events that I want to hold
const [savedEvents, setSavedEvents] =
  useState([]);

const visibleEvents =
  selectedTab === "events"
    ? scheduledEvents
    : selectedTab === "anytime"
      ? anytimeEvents
      : savedEvents;

const impactCount = visibleEvents.length;




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




//Here I implemented a function that will toggle the saved events
//Take in event obct and eventType, so events, dropIn, Saved
 const toggleSavedEvent = (event, eventType) => {

  setSavedEvents((currentEvents) => {

    //Look through the Saved event array, if event in array then already saved
    const isSaved = currentEvents.some(

      //.some() will return true if one of the elements matches
      //else false
      (savedEvent) => savedEvent.id === event.id
    );

    //If true this line will run - >  the event is already saved, remove it from the array
    if (isSaved) {
      return currentEvents.filter(
        (savedEvent) =>
          //Keep every saved event except the one with the same id that is being liked
          savedEvent.id !== event.id
      );
    }
    //else if false the event is not saved
    return [
      //Keep all current events
      ...currentEvents,
      {
        //add the event the user just clicked and its type
        ...event,
        eventType,
      },
    ];
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
              {impactCount}
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
          {/* Here will start the start of my table with my categories */}

          {/* Tab 1 */}
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
          {/* End of Tab 1 */}

          {/* Tab 2 */}
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
              Drop- IN
            </Text>

            {selectedTab === "anytime" && (
              <View
                style={styles.activeTabIndicator}
              />
            )}
          </Pressable>
          {/* End of Tab 2 */}


          {/* Here I created the seperate tab */}
          {/* Tab 3  - This will be the saved events*/}
          <Pressable
            style={styles.tabButton}
            onPress={() =>
              setSelectedTab("saved")
            }
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "saved" &&
                  styles.activeTabText,
              ]}
            >
              Saved
            </Text>

            {selectedTab === "saved" && (
              <View
                style={styles.activeTabIndicator}
              />
            )}
          </Pressable>
          {/* End of Tab 3 */}




{/* The end of my tables */}
        </View>


        <BottomSheetScrollView
          contentContainerStyle={
            styles.cardContainer
          }
          showsVerticalScrollIndicator={false}
        >

          {/* Start here */}
          {visibleEvents.length === 0 ? (
            <Text style={styles.emptyText}>
              No saved events yet.
            </Text>
          ) : (
            visibleEvents.map((event) => {
              const eventType =
                event.eventType ??
                (selectedTab === "anytime"
                  ? "dropIn"
                  : "events");
              const isSaved = savedEvents.some(
                (savedEvent) =>
                  savedEvent.id === event.id,
              );

              return (
                <EventCard
                  key={event.id}
                  event={event}
                  liked={isSaved}
                  selected={rsvpEventIds.includes(event.id)}
                  onLikePress={() =>
                    toggleSavedEvent(event, eventType)
                  }
                  onActionPress={() =>
                    toggleRsvp(event.id)
                  }
                  onPress={() =>
                    onSelectEvent?.(event)
                  }
                />
              );
            })
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

  emptyText: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#777777",
  },
});
