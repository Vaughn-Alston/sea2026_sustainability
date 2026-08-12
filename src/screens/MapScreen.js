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
  ScrollView,
  Linking,
  Platform,
} from "react-native";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
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
  fetchMyFriends,
  fetchMyRsvpEventIds,
  fetchMySavedImpactIds,
  rsvpToEvent,
  cancelRsvp,
  toggleSavedImpact,
} from "../lib/eventsAPI";

// one green for the whole marker - sprout, thumbnail ring, and text
const MARKER_GREEN = "#2ECC4E";

// friend strip sizing
const FRIEND_AVATAR_SIZE = 44;

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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// matches MapPillBar's press feel
const PRESS_SCALE = 0.85;
const PRESS_DURATION = 90;

// wraps anything in the strip so it shrinks on press like the pills do
function PressableScale({ style, onPress, children }) {
  const scale = useSharedValue(1);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[style, pressStyle]}
      onPressIn={() => {
        scale.value = withTiming(PRESS_SCALE, { duration: PRESS_DURATION });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: PRESS_DURATION });
      }}
      onPress={onPress}
    >
      {children}
    </AnimatedPressable>
  );
}

// A clean helper component to generate the hard white outline for the text
function OutlinedText({
  text,
  style,
  outlineColor = "white",
  outlineWidth = 0.8,
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

  // friends for the avatar strip along the bottom
  const [friends, setFriends] = useState([]);

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

  // one fetch - both tabs, every pin, and the friend strip come out of this
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [{ events: eventRows, anytime }, rsvpIds, savedIds, friendRows] =
          await Promise.all([
            fetchImpactFeed(),
            fetchMyRsvpEventIds(),
            fetchMySavedImpactIds(),
            fetchMyFriends(),
          ]);

        if (cancelled) return;

        setEvents(eventRows);
        setAnytimeImpacts(anytime);
        setRsvpEventIds(rsvpIds);
        setSavedPlaceIds(savedIds);
        setFriends(friendRows);
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

  // recenters the map on the user - the strip's round button
  const handleRecenter = useCallback(() => {
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
  }, [location, currentRegion]);

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

      {/* bottom strip - recenter button above, friend avatars scrolling below */}
      {!selectedEvent && !listVisible && !savedVisible && (
        <View style={styles.mapFooter}>
          <View style={styles.recenterRow}>
            <PressableScale
              style={[styles.circleButton, styles.shadow]}
              onPress={handleRecenter}
            >
              <Ionicons name="navigate-outline" size={20} color="#111111" />
            </PressableScale>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.friendStrip}
          >
            {/* search - not wired up yet, scrolls with the rest */}
            <PressableScale style={[styles.circleButton, styles.shadow]}>
              <Ionicons name="search" size={20} color="#111111" />
            </PressableScale>

            {friends.map((friend) => (
              <PressableScale
                key={friend.id}
                style={[styles.friendAvatarWrapper, styles.shadow]}
              >
                {friend.avatar ? (
                  <Image
                    source={{ uri: friend.avatar }}
                    style={styles.friendAvatar}
                  />
                ) : (
                  <View
                    style={[styles.friendAvatar, styles.friendAvatarEmpty]}
                  />
                )}
              </PressableScale>
            ))}

            <PressableScale
              style={[styles.addFriendPill, styles.shadow]}
            >
              <Ionicons name="person-add-outline" size={19} color="#111111" />
              <Text style={styles.addFriendText}>Add Friend</Text>
            </PressableScale>
          </ScrollView>
        </View>
      )}

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
    position: "absolute",
    paddingBottom: 23,
    bottom: 0,
  },

  recenterRow: {
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },

  circleButton: {
    width: FRIEND_AVATAR_SIZE,
    height: FRIEND_AVATAR_SIZE,
    borderRadius: FRIEND_AVATAR_SIZE / 2,
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    alignItems: "center",
    justifyContent: "center",
  },

  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    shadowOpacity: 0.18,
    elevation: 4,
  },

  // horizontal scroll of friend faces
  friendStrip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 10,
  },
  friendAvatarWrapper: {
    width: FRIEND_AVATAR_SIZE,
    height: FRIEND_AVATAR_SIZE,
    borderRadius: FRIEND_AVATAR_SIZE / 2,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.88)",
  },
  friendAvatar: {
    width: FRIEND_AVATAR_SIZE,
    height: FRIEND_AVATAR_SIZE,
    borderRadius: FRIEND_AVATAR_SIZE / 2,
    resizeMode: "cover",
  },
  friendAvatarEmpty: {
    backgroundColor: "rgba(255, 255, 255, 0.88)",
  },
  addFriendPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: FRIEND_AVATAR_SIZE,
    paddingHorizontal: 20,
    borderRadius: FRIEND_AVATAR_SIZE / 2,
    backgroundColor: "rgba(255, 255, 255, 0.88)",
  },
  addFriendText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111111",
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
    marginLeft: 2,
  },
});
