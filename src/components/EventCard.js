import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { formatEventWhen, formatOpenState } from "../../utils/datetimeUtil";
import { distanceFromUser, formatDistance } from "../../utils/geoUtil";

/**
 * EventCard
 *   Takes one normalized row (see lib/eventsAPI) and derives its own display
 *   strings, so the list doesn't have to spread a dozen props per card. Works
 *   for both kinds — `event` rows show a date, `anytime` rows show Open Now.
 *
 *   heart = save, number next to it is how many people saved it
 *   bookmark = rsvp, scheduled rows only since drop-ins can't be rsvp'd
 */
export default function EventCard({
  event,
  saved = false,
  rsvped = false,
  userLocation,
  onPress,
  onSavePress,
  onRsvpPress,
  onDirectionsPress,
}) {
  // scheduled rows get a date line, drop-ins get their open state instead
  const dateTime =
    event.kind === "event"
      ? formatEventWhen(event.start_datetime, event.end_datetime)
      : formatOpenState(event.hours);

  const distance = formatDistance(distanceFromUser(userLocation, event));

  // impact category - Water, Food, etc
  const tag = event.category;

  const isEvent = event.kind === "event";

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      {/* Circular image on the far left */}
      {event.thumbnail ? (
        <Image source={{ uri: event.thumbnail }} style={styles.cardMedia} />
      ) : (
        <View style={[styles.cardMedia, styles.imagePlaceholder]}>
          <Text style={styles.imagePlaceholderText}>IMG</Text>
        </View>
      )}

      {/* Main card information */}
      <View style={styles.cardContent}>
        <Text style={styles.title} numberOfLines={1}>
          {event.name}
        </Text>

        {!!dateTime && (
          <Text style={styles.dateTime} numberOfLines={1}>
            {dateTime}
          </Text>
        )}

        {!!distance && <Text style={styles.distance}>{distance}</Text>}

        {!!tag && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        )}

        {event.attendeeCount > 0 && (
          <View style={styles.attendeeContainer}>
            <Text style={styles.attendeeText}>{event.attendeeCount} Going</Text>
          </View>
        )}
      </View>

      {/* Actions on the far right */}
      <View style={styles.cardActions}>
        {/* heart saves the place - count is everyone who saved it
          * comes from the db rather than local state */}
        <Pressable
          style={styles.heartButton}
          onPress={(pressEvent) => {
            // Prevent the full card's onPress from running.
            pressEvent.stopPropagation?.();
            onSavePress?.();
          }}
          hitSlop={8}
        >
          <Ionicons
            name={saved ? "heart" : "heart-outline"}
            size={27}
            color={saved ? "#E53935" : "#555555"}
          />

          {event.saveCount > 0 && (
            <Text style={[styles.likeCount, saved && styles.likedCount]}>
              {event.saveCount}
            </Text>
          )}
        </Pressable>

        {/* rsvp only on scheduled rows - db trigger rejects it on drop-ins anyway */}
        {isEvent && (
          <Pressable
            style={[styles.actionButton, rsvped && styles.actionButtonSelected]}
            onPress={(pressEvent) => {
              pressEvent.stopPropagation?.();
              onRsvpPress?.();
            }}
            hitSlop={8}
          >
            <Ionicons
              name={rsvped ? "bookmark" : "bookmark-outline"}
              size={20}
              color={rsvped ? "#FFFFFF" : "#111111"}
            />
          </Pressable>
        )}

        {/* directions is its own handler (used to share the rsvp one which meant tapping it toggled the rsvp) */}
        <Pressable
          style={styles.actionButton}
          onPress={(pressEvent) => {
            pressEvent.stopPropagation?.();
            onDirectionsPress?.();
          }}
          hitSlop={8}
        >
          <Ionicons name="navigate" size={23} color="#111111" />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    minHeight: 160,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 12,
    marginBottom: 14,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  cardPressed: {
    opacity: 0.85,
  },

  // Circular event image
  cardMedia: {
    width: 92,
    height: 92,
    borderRadius: 46,
    resizeMode: "cover",
  },

  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8E8E8",
  },

  imagePlaceholderText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#777777",
  },

  cardContent: {
    flex: 1,
    marginLeft: 14,
    paddingRight: 8,
  },

  title: {
    fontSize: 21,
    fontWeight: "800",
    color: "#111111",
  },

  dateTime: {
    marginTop: 5,
    fontSize: 15,
    fontWeight: "600",
    color: "#454545",
  },

  distance: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: "700",
    color: "#111111",
  },

  tag: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#E1E4E8",
    borderRadius: 20,
  },

  tagText: {
    fontSize: 13,
    color: "#222222",
  },

  attendeeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  attendeeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444444",
  },

  // Far-right controls
  cardActions: {
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },

  heartButton: {
    minWidth: 48,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },

  likeCount: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "700",
    color: "#555555",
  },

  likedCount: {
    color: "#E53935",
  },

  actionButton: {
    width: 48,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF1F3",
  },

  actionButtonSelected: {
    backgroundColor: "#111111",
  },
});
