import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import MapView, { Marker } from "react-native-maps";
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  Pressable,
  Linking,
  Platform,
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

// Both tables load here so the map pins and the list share one dataset
import {
  fetchImpactFeed,
  fetchMyRsvpEventIds,
  fetchMySavedImpactIds,
  rsvpToEvent,
  cancelRsvp,
  toggleSavedImpact,
} from "../lib/eventsAPI";

export default function MapScreen({ navigation }) {
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  //Here will be the state variables for the list
  const [listVisible, setListVisible] = useState(false);

  // separate flag for the saved list opened from the Favorites pill - it's
  // the same EventList, just opened in saved-only mode
  const [savedVisible, setSavedVisible] = useState(false);

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

  // supabase rows - scheduled events and drop-in places kept separate so the list can tab between them without refiltering
  const [events, setEvents] = useState([]);
  const [anytimeImpacts, setAnytimeImpacts] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);

  // rsvp ids live up here so the card and the event page can't disagree
  const [rsvpEventIds, setRsvpEventIds] = useState([]);

  // saved ids too - persist so the list can't own them either
  const [savedPlaceIds, setSavedPlaceIds] = useState([]);

  // Parent owns which event is showing; the sheet owns its own position
  const eventTabRef = useRef(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // map ref - the map is uncontrolled now, so recentering goes through here
  // instead of through currentRegion
  const mapRef = useRef(null);

  // Only send the list back up if that's where the event came from
  const [returnToList, setReturnToList] = useState(false);

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

      // initialRegion only lands on first render, so the jump to the user
      // has to be animated in
      mapRef.current?.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);

  // one fetch - both tabs and every pin come out of this
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [{ events: eventRows, anytime }, rsvpIds, savedIds] =
          await Promise.all([
            fetchImpactFeed(),
            fetchMyRsvpEventIds(),
            fetchMySavedImpactIds(),
          ]);

        if (cancelled) return;

        setEvents(eventRows);
        setAnytimeImpacts(anytime);
        setRsvpEventIds(rsvpIds);
        setSavedPlaceIds(savedIds);
      } catch (error) {
        console.log("Impact feed failed to load", error.message);
      } finally {
        if (!cancelled) setFeedLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // everything the user has bookmarked, either kind - this is what the Saved
  // tab renders
  const savedItems = useMemo(
    () =>
      [...events, ...anytimeImpacts].filter((item) =>
        savedPlaceIds.includes(item.id),
      ),
    [events, anytimeImpacts, savedPlaceIds],
  );

  // drops the pin in the visible part of the map - the sheet covers the
  // bottom half, so the center is nudged south to sit above it
  const focusOnItem = useCallback((item) => {
    if (!item || item.latitude == null || item.longitude == null) return;

    mapRef.current?.animateToRegion(
      {
        latitude: item.latitude - 0.012,
        longitude: item.longitude,
        latitudeDelta: 0.045,
        longitudeDelta: 0.045,
      },
      450,
    );
  }, []);

  const openEvent = (event, { fromList = false } = {}) => {
    setReturnToList(fromList);
    setSelectedEvent(event);

    // recenter whether the row came from the list or from a pin callout
    focusOnItem(event);
  };

  // tapping a different pin while a page is already open drops the current one first, then raises the new one - mirrors the list -> page swap
  const handleSelectPin = useCallback(
    (item) => {
      if (selectedEvent && selectedEvent.id !== item.id) {
        setSelectedEvent(null);
        setTimeout(() => openEvent(item), 220);
      } else {
        openEvent(item);
      }
    },
    [selectedEvent],
  );

  const handleSelectEvent = (event) => {
    setListVisible(false);
    setSavedVisible(false);
    openEvent(event, { fromList: true });
  };

  const handleListClosed = () => {
    setListVisible(false);
  };

  const handleSavedClosed = () => {
    setSavedVisible(false);
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
    // Favorites opens the saved-only sheet, Impacts opens the event tabs
    if (id === "favorites") {
      setSavedVisible(true);
      return;
    }

    if (id !== "impacts") {
      console.log("Pill pressed:", id);
      return;
    }

    setListVisible(true);
  };

  // new: the sheet's View Impact button routes to the full Impact screen -
  // new: EventList doesn't know navigation exists, it just calls this
  const handleViewImpact = useCallback(() => {
    navigation.navigate("Impact");
  }, [navigation]);

  // rsvp straight from a card - the page writes through onRsvpChange instead
  const handleToggleRsvp = useCallback(
    async (item) => {
      const hasRsvp = rsvpEventIds.includes(item.id);

      setRsvpEventIds((currentIds) =>
        hasRsvp
          ? currentIds.filter((id) => id !== item.id)
          : [...currentIds, item.id],
      );

      try {
        if (hasRsvp) {
          await cancelRsvp(item.id);
        } else {
          await rsvpToEvent(item.id);
        }
      } catch (error) {
        console.log("RSVP failed", error.message);

        // put the id back the way it was
        setRsvpEventIds((currentIds) =>
          hasRsvp
            ? [...currentIds, item.id]
            : currentIds.filter((id) => id !== item.id),
        );
      }
    },
    [rsvpEventIds],
  );

  // save straight from a card - the toggle returns where it landed so list state follows the db
  const handleToggleSaved = useCallback(
    async (item) => {
      const wasSaved = savedPlaceIds.includes(item.id);

      setSavedPlaceIds((currentIds) =>
        wasSaved
          ? currentIds.filter((id) => id !== item.id)
          : [...currentIds, item.id],
      );

      try {
        const nowSaved = await toggleSavedImpact(item.id);

        setSavedPlaceIds((currentIds) =>
          nowSaved
            ? [...new Set([...currentIds, item.id])]
            : currentIds.filter((id) => id !== item.id),
        );
      } catch (error) {
        console.log("Save failed", error.message);

        // put the id back the way it was
        setSavedPlaceIds((currentIds) =>
          wasSaved
            ? [...new Set([...currentIds, item.id])]
            : currentIds.filter((id) => id !== item.id),
        );
      }
    },
    [savedPlaceIds],
  );

  // keeps the card in sync when the rsvp happened on the event page
  const handleRsvpChange = useCallback((item, status) => {
    setRsvpEventIds((currentIds) =>
      status
        ? [...new Set([...currentIds, item.id])]
        : currentIds.filter((id) => id !== item.id),
    );
  }, []);

  // same for a save made on the event page
  const handleSavedChange = useCallback((item, isSaved) => {
    setSavedPlaceIds((currentIds) =>
      isSaved
        ? [...new Set([...currentIds, item.id])]
        : currentIds.filter((id) => id !== item.id),
    );
  }, []);

  const handleDirections = useCallback((item) => {
    if (item.latitude == null || item.longitude == null) return;

    const label = encodeURIComponent(item.name ?? "");
    const url = Platform.select({
      ios: `maps://?daddr=${item.latitude},${item.longitude}&q=${label}`,
      android: `geo:${item.latitude},${item.longitude}?q=${item.latitude},${item.longitude}(${label})`,
    });

    Linking.openURL(url).catch(() =>
      console.log("Could not open directions for", item.id),
    );
  }, []);

  return (
    <View style={[styles.container, { marginBottom: tabBarHeight }]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={currentRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {/* pins come from the same rows the list renders */}
        {[...events, ...anytimeImpacts]
          .filter((item) => item.latitude != null && item.longitude != null)
          .map((item) => (
            <Marker
              key={item.id}
              coordinate={{
                latitude: item.latitude,
                longitude: item.longitude,
              }}
              // green pin, no title/description so no callout label shows
              pinColor="green"
              // swap straight to this event, bringing any open page down first
              onPress={() => handleSelectPin(item)}
            />
          ))}
      </MapView>

      {/* pills hide while off the map, or while either modal is open */}
      <MapPillBar
        visible={isFocused && !selectedEvent && !listVisible && !savedVisible}
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

              // animate rather than re-render into place
              mapRef.current?.animateToRegion({
                latitude,
                longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              });
            }}
          >
            <Ionicons name="navigate" size={15} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Here on line 143 This function will open my modal */}
      <EventList
        // Here I will pass the state variable to the PartyDrawer component
        visible={listVisible}
        // renders list - comes from supabase later
        events={events}
        anytimeImpacts={anytimeImpacts}
        savedItems={savedItems}
        loading={feedLoading}
        userLocation={location}
        rsvpEventIds={rsvpEventIds}
        savedPlaceIds={savedPlaceIds}
        onToggleRsvp={handleToggleRsvp}
        onToggleSaved={handleToggleSaved}
        onDirections={handleDirections}
        // View Impact button in the header routes to the Impact screen
        onViewImpact={handleViewImpact}
        // Tapping a card sends the whole event row back up here
        onSelectEvent={handleSelectEvent}
        //Here I am using the default function onClose() to pass false towards the component
        //This will give onClose() the ability to close the modal when called
        onClose={handleListClosed}
      />

      {/* same list opened from the Favorites pill, saved-only */}
      <EventList
        visible={savedVisible}
        savedItems={savedItems}
        loading={feedLoading}
        userLocation={location}
        rsvpEventIds={rsvpEventIds}
        savedPlaceIds={savedPlaceIds}
        tabs={["saved"]}
        initialTab="saved"
        onToggleRsvp={handleToggleRsvp}
        onToggleSaved={handleToggleSaved}
        onDirections={handleDirections}
        onViewImpact={handleViewImpact}
        onSelectEvent={handleSelectEvent}
        onClose={handleSavedClosed}
      />

      <EventPageTab
        ref={eventTabRef}
        event={selectedEvent}
        userLocation={location}
        onRsvpChange={handleRsvpChange}
        onSavedChange={handleSavedChange}
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
