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
  Linking,
  Platform,
} from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";

// Here Im importing the event drawer modal
import EventList from "../components/EventList";

import * as Location from "expo-location";

import { Ionicons } from "@expo/vector-icons";
import EventPageTab from "../components/EventPageTab";
import MapPillBar from "../components/MapPillBar";

// Import your sprout SVG
import SproutIcon from "../../assets/pill-icons/sprout.svg";

// Both tables load here so the map pins and the list share one dataset
import {
  fetchImpactFeed,
  fetchMyRsvpEventIds,
  fetchMySavedImpactIds,
  rsvpToEvent,
  cancelRsvp,
  toggleSavedImpact,
} from "../lib/eventsAPI";

// one green for the whole marker - sprout, thumbnail ring, and text
const MARKER_GREEN = "#2ECC4E";

// the 8 directional offsets that build the hard stroke
const OUTLINE_OFFSETS = [
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
  [0, -1],
  [0, 1],
  [-1, 0],
  [1, 0],
];

// A clean helper component to generate the hard white outline for the text
function OutlinedText({
  text,
  style,
  outlineColor = "white",
  outlineWidth = .8,
  numberOfLines,
}) {
  return (
    <View style={styles.outlinedTextWrapper}>
      {OUTLINE_OFFSETS.map(([dx, dy], i) => (
        <Text
          key={i}
          numberOfLines={numberOfLines}
          style={[
            style,
            {
              position: "absolute",
              textShadowColor: outlineColor,
              textShadowOffset: {
                width: dx * outlineWidth,
                height: dy * outlineWidth,
              },
              textShadowRadius: 0,
            },
          ]}
        >
          {text}
        </Text>
      ))}
      {/* The main text sits on top */}
      <Text numberOfLines={numberOfLines} style={style}>
        {text}
      </Text>
    </View>
  );
}

export default function MapScreen({ navigation }) {
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  //Here will be the state variables for the list
  const [listVisible, setListVisible] = useState(false);

  // separate flag for the saved list opened from the Favorites pill - it's
  // the same EventList, just opened in saved-only mode
  const [savedVisible, setSavedVisible] = useState(false);

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

  // every row with coordinates, so the marker loop reads from one list
  const mapPins = useMemo(
    () =>
      [...events, ...anytimeImpacts].filter(
        (item) => item.latitude != null && item.longitude != null,
      ),
    [events, anytimeImpacts],
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
        {mapPins.map((item) => (
          <Marker
            key={item.id}
            coordinate={{
              latitude: item.latitude,
              longitude: item.longitude,
            }}
            onPress={() => handleSelectPin(item)}
          >
            <View style={styles.customMarkerContainer}>
              {/* Thumbnail group with the plant SVG peeking from behind */}
              <View style={styles.markerGraphicContainer}>
                {/* sproutContainer positions the SVG behind the thumbnail */}
                <View style={styles.sproutContainer}>
                  <SproutIcon
                    width={28}
                    height={28}
                    fill={MARKER_GREEN}
                    color={MARKER_GREEN}
                  />
                </View>

                {/* Thumbnail wrapper providing just the drop shadow */}
                <View style={styles.thumbnailShadow}>
                  {item.thumbnail ? (
                    <Image
                      source={{ uri: item.thumbnail }}
                      style={styles.thumbnailImage}
                    />
                  ) : (
                    <View
                      style={[
                        styles.thumbnailImage,
                        styles.thumbnailPlaceholder,
                      ]}
                    />
                  )}
                </View>
              </View>

              {/* Text container using the clean helper function */}
              <View style={styles.markerTextContainer}>
                <OutlinedText
                  text={item.name}
                  style={styles.markerTitle}
                  numberOfLines={2}
                />
                <OutlinedText
                  text={item.kind === "event" ? "Community Event" : "Drop-In"}
                  style={styles.markerSubtitle}
                  numberOfLines={1}
                />
              </View>
            </View>
          </Marker>
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

      <EventList
        visible={listVisible}
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
        onViewImpact={handleViewImpact}
        onSelectEvent={handleSelectEvent}
        onClose={handleListClosed}
      />

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
        navigation={navigation}
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
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 3,
    shadowOpacity: 0.5,
    elevation: 4,
  },

  // Outline Text Wrapper Helper Style
  outlinedTextWrapper: {
    justifyContent: "center",
  },

  // Custom Marker Styles
  customMarkerContainer: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 220,
    paddingTop: 18,
    paddingBottom: 4,
    paddingHorizontal: 4,
  },
  markerGraphicContainer: {
    position: "relative",
    alignItems: "center",
    marginRight: 5,
  },
  // sproutContainer positions the SVG behind the thumbnail
  sproutContainer: {
    position: "absolute",
    top: -19, // Adjusted higher so the SVG clears the top of the image
    zIndex: 0, // Behind the thumbnail image
  },
  thumbnailShadow: {
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  thumbnailImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2.5, // The pure green outline
    borderColor: MARKER_GREEN,
  },
  thumbnailPlaceholder: {
    backgroundColor: "#E8E8E8",
  },
  markerTextContainer: {
    justifyContent: "center",
    flexShrink: 1,
  },
  markerTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: MARKER_GREEN,
  },
  markerSubtitle: {
    fontSize: 8,
    fontWeight: "700",
    color: MARKER_GREEN,
    marginLeft: 2
  },
});
