import React, { useState, useEffect, useRef } from "react";
import MapView from "react-native-maps";
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";

//Here Im importing the event drawer modal
import EventList from "../components/EventList";

import * as Location from "expo-location";

import { Ionicons } from "@expo/vector-icons";
import EventPageTab from "../components/EventPageTab";
import MapPillBar from "../components/MapPillBar";

// Stands in for the events query until the list pulls from supabase
const SAMPLE_EVENTS = [
  {
    id: 1,
    name: "Beach Cleanup & Coastal Care Day",
    description:
      "Join fellow volunteers for a morning of cleaning up the shoreline. Gloves, bags, and grabbers are provided — just bring water, sunscreen, and closed-toe shoes. We'll wrap up with a short debrief on what we collected and where it came from.",
    location: "Santa Monica Beach, Santa Monica, CA",
    start_datetime: "2026-09-12T16:00:00+00:00",
    end_datetime: "2026-09-12T19:00:00+00:00",
    organization: 1,
    image: null,
  },
  {
    id: 2,
    name: "Urban Garden & Composting Workshop",
    description:
      "Hands-on session covering composting basics, soil health, and what to do with kitchen scraps in a small apartment.",
    location: "Griffith Park Community Garden, Los Angeles, CA",
    start_datetime: "2026-09-19T17:00:00+00:00",
    end_datetime: "2026-09-19T19:00:00+00:00",
    organization: 1,
    image: null,
  },
  {
    id: 3,
    name: "Zero Waste Swap Meet",
    description:
      "A community clothing and household goods swap. Bring what you no longer use, take home something someone else loved.",
    location: "Echo Park, Los Angeles, CA",
    start_datetime: "2026-09-26T18:00:00+00:00",
    end_datetime: "2026-09-26T21:00:00+00:00",
    organization: 2,
    image: null,
  },
];

export default function MapScreen({ navigation }) {
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  //Here will be the state variables for the list
  const [listVisible, setListVisible] = useState(false);

  //This will handle the closing of the Modal
  const handleClose = () => {
    //close the party modal
    setListVisible(false);
  };

  //This will open event list modal
  const handleOpen = () => {
    setListVisible(true);
  };

  //Now I need to find the button that opens the page if the Event list button is clicked
  //So I can opent the party drawer modal from the event list page

  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Parent owns which event is showing; the sheet owns its own position
  const eventTabRef = useRef(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Only send the list back up if that's where the event came from
  const [returnToList, setReturnToList] = useState(false);

  // -1 closed, 0 collapsed, 1 half, 2 full
  const [listIndex, setListIndex] = useState(-1);

  const [currentRegion, setCurrentRegion] = useState({
    latitude: 34.0211573,
    longitude: -118.4503864,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setCurrentRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);

  const openEvent = (event, { fromList = false } = {}) => {
    setReturnToList(fromList);
    setSelectedEvent(event);
    eventTabRef.current?.open();
  };

  const handleSelectEvent = (event) => {
    setListVisible(false);
    openEvent(event, { fromList: true });
  };

  const handleListClosed = () => {
    setListVisible(false);
  };

  // Closing the event page brings back event list
  const handleEventClosed = () => {
    setSelectedEvent(null);

    if (returnToList) {
      setReturnToList(false);
      setListVisible(true);
    }
  };

  const handlePillSelect = (id) => {
    if (id !== "impacts") {
      console.log("Pill pressed:", id);
      return;
    }

    setListVisible(true);
  };

  return (
    <View style={[styles.container, { marginBottom: tabBarHeight }]}>
      <MapView
        style={StyleSheet.absoluteFill}
        region={currentRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      />

      {/* pills hide while off the map, if event sheet is up, or if list is full height */}
      <MapPillBar
        visible={isFocused && !selectedEvent && listIndex < 2}
        onSelect={handlePillSelect}
      />

      <View style={[styles.mapFooter]}>
        <View style={styles.locationContainer}>
          <TouchableOpacity
            style={[styles.userLocation, styles.shadow]}
            onPress={() => {
              if (!location) return;
              const { latitude, longitude } = location.coords;
              setCurrentRegion({ ...currentRegion, latitude, longitude });
            }}
          >
            <Ionicons name="navigate" size={15} color="black" />
          </TouchableOpacity>
        </View>

        <View style={[styles.bitmojiContainer, styles.shadow]}>
          <Pressable
            onPress={() => {
              setListVisible(true); //This line will open the party drawer modal when the button is pressed

              console.log("Event List button pressed");
            }}
          >
            <View style={styles.myBitmoji}>
              <Ionicons name="list-outline" size={50} color="gray" />
              <View style={styles.bitmojiTextContainer}>
                <Text style={styles.bitmojiText}>Event List</Text>
              </View>
            </View>
          </Pressable>

          {/* Takes one event, not the whole list */}
          <Pressable onPress={() => openEvent(SAMPLE_EVENTS[0])}>
            <View style={styles.myBitmoji}>
              <Ionicons name="calendar-outline" size={50} color="gray" />
              <View style={styles.bitmojiTextContainer}>
                <Text style={styles.bitmojiText}>Events</Text>
              </View>
            </View>
          </Pressable>

          <View style={styles.places}>
            <Image
              style={styles.bitmojiImage}
              source={require("../../assets/snapchat/personalBitmoji.png")}
            />
            <View style={styles.bitmojiTextContainer}>
              <Text style={styles.bitmojiText}>Places</Text>
            </View>
          </View>
          <View style={styles.myFriends}>
            <Image
              style={styles.bitmojiImage}
              source={require("../../assets/snapchat/personalBitmoji.png")}
            />
            <View style={styles.bitmojiTextContainer}>
              <Text style={styles.bitmojiText}>Friends</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Here on line 143 This function will open my modal */}
      <EventList
        // Here I will pass the state variable to the PartyDrawer component
        visible={listVisible}
        // renders list - comes from supabase later
        events={SAMPLE_EVENTS}
        // Tapping a card sends the whole event row back up here
        onSelectEvent={handleSelectEvent}
        // Lets pills know when list coverthem
        onIndexChange={setListIndex}
        //Here I am using the default function onClose() to pass false towards the component
        //This will give onClose() the ability to close the modal when called
        onClose={handleListClosed}
      />

      <EventPageTab
        ref={eventTabRef}
        event={selectedEvent}
        onClose={handleEventClosed}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  mapFooter: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 20,
    bottom: 0,
  },
  locationContainer: {
    backgroundColor: "transparent",
    width: "100%",
    paddingBottom: 8,
    alignItems: "center",
  },
  userLocation: {
    backgroundColor: "white",
    borderRadius: 100,
    height: 36,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  shadow: {
    shadowColor: "rgba(0, 0, 0)",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 3,
    shadowOpacity: 0.5,
    elevation: 4,
  },
  bitmojiContainer: {
    width: "100%",
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  myBitmoji: {
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 5,
  },
  bitmojiImage: {
    width: 50,
    height: 50,
  },
  bitmojiTextContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 4,
  },
  bitmojiText: {
    fontSize: 10,
    fontWeight: "700",
  },
  places: {
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  myFriends: {
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
  },
});