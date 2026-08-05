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
import BottomSheet, {
  BottomSheetView,
} from "@gorhom/bottom-sheet";

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
  onClose,
}) {
  const [page, setPage] = useState("planner");

  // Keeping your existing state variable
  const [openModal, setOpenModal] = useState(null);

  const sheetRef = useRef(null);

  // Collapsed, halfway, and almost full-screen
  const snapPoints = useMemo(
    () => [100 + HANDLE_HEIGHT, "50%", "90%"],
    [],
  );



  // The X closes the physical bottom sheet
  const handleClosePress = useCallback(() => {
    sheetRef.current?.close();
  }, []);

  // Runs after the bottom sheet finishes closing
  const handleSheetClose = useCallback(() => {
    setPage("MapScreen");
    setOpenModal(false);
    onClose?.();
  }, [onClose]);

  // Open or close based on the parent's visible prop
  useEffect(() => {
    if (visible) {
      // Open at the halfway snap point
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
    <BottomSheetView style={styles.drawer}>
      <Pressable
        style={styles.closeButton}
        onPress={handleClosePress}
        hitSlop={10}
      >
        <Text style={styles.closeButtonText}>✕</Text>
      </Pressable>

      <View style={styles.cardContainer}>
     
     

        {/* Here I will have a event card that will hold the event information */}
        <EventCard
          title="Dockweiler Clean-Up"
          dateTime="Sep 12 • 9:00 AM"
          distance="3.7 mi"
          tag="⭐ Beach Cleanup"
          image= ""
          attendees={[
            {
              id: "1",
              image: ""
            },
            {
              id: "2",
              image:""
            },
          ]}
          attendeeCount={2}
          onPress={() => console.log("Event selected")}
          onActionPress={() =>
            console.log("Directions selected")
          }
        />




        

      </View>
    </BottomSheetView>
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

  cardContainer: {
    paddingTop: 60,
    paddingHorizontal: 12,
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

  closeButton: {
    position: "absolute",
    top: 12,
    right: 20,
    zIndex: 10,
    padding: 8,
  },

  closeButtonText: {
    fontSize: 28,
    fontWeight: "600",
    color: "#000",
  },
});