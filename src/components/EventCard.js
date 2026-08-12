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
 *   the thumbnail always wears a blue story ring, snapchat-style - taps on it
 *   just log for now
 */
export default function EventCard({
  event,
  //All events start false then if saved will turn true
  saved = false,
  userLocation,
  onPress,
  // Function handles when the heart button is pressed
  onSavePress,
}) {
  // This block will control what is being displayed to the card

  const cardTitle = event?.name;
  const cardImage = event?.thumbnail;

  // scheduled rows get a date line, drop-ins get their open state instead
  const cardDateTime =
    event?.kind === "event"
      ? formatEventWhen(event?.start_datetime, event?.end_datetime)
      : formatOpenState(event?.hours);

  // worked out from the row's lat/long against where the user is standing
  const cardDistance = formatDistance(distanceFromUser(userLocation, event));

  // impact category - Water, Food, etc
  const cardTag = event?.category;

  // the db only sends a count, so the avatar row stays empty until the query
  // pulls attendee profiles too
  const cardAttendees = event?.attendees ?? [];

  const cardAttendeeCount = event?.attendeeCount || cardAttendees.length;

  // This will show the first 3 people that are in the going
  const visibleAttendees = cardAttendees.slice(0, 3);

  // everyone who saved it, not just this user - comes from the db rather than
  // local state, so it survives closing the sheet
  const saveCount = event?.saveCount ?? 0;

  // Runs when the user taps the heart button on this card.
  const handleHeartPress = (pressEvent) => {
    // Prevent the full card's onPress from running.
    pressEvent.stopPropagation?.();

    onSavePress?.();
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      {/* Circular image on the far left - always wears the blue story ring */}
      <Pressable
        onPress={(e) => {
          e.stopPropagation?.();
          console.log("Open story", event?.id);
        }}
        style={styles.thumbRing}
      >
        {cardImage ? (
          <Image
            source={
              typeof cardImage === "string" ? { uri: cardImage } : cardImage
            }
            style={styles.cardMedia}
          />
        ) : (
          <View style={[styles.cardMedia, styles.imagePlaceholder]}>
            <Text style={styles.imagePlaceholderText}>IMG</Text>
          </View>
        )}
      </Pressable>

      {/* Main card information */}
      <View style={styles.cardContent}>
        <Text style={styles.title} numberOfLines={1}>
          {cardTitle}
        </Text>

        {!!cardDateTime && (
          <Text style={styles.dateTime} numberOfLines={1}>
            {cardDateTime}
          </Text>
        )}

        {!!cardDistance && <Text style={styles.distance}>{cardDistance}</Text>}

        {!!cardTag && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{cardTag}</Text>
          </View>
        )}

        <View style={styles.attendeeContainer}>
          <View style={styles.avatarGroup}>
            {visibleAttendees.map((attendee, index) => (
              <Image
                key={attendee.id ?? index}
                source={
                  typeof (attendee.image ?? attendee) === "string"
                    ? {
                        uri: attendee.image ?? attendee,
                      }
                    : (attendee.image ?? attendee)
                }
                style={[
                  styles.attendeeAvatar,
                  index > 0 && styles.overlappingAvatar,
                ]}
              />
            ))}
          </View>

          {cardAttendeeCount > 0 && (
            <Text style={styles.attendeeText}>{cardAttendeeCount} Going</Text>
          )}
        </View>
      </View>

      {/* Actions on the far right */}
      <View style={styles.cardActions}>
        {/* heart saves the place - count is everyone who saved it
         * comes from the db rather than local state */}
        <Pressable
          style={styles.heartButton}
          onPress={handleHeartPress}
          hitSlop={8}
        >
          <Ionicons
            name={saved ? "heart" : "heart-outline"}
            size={27}
            color={saved ? "#E53935" : "#555555"}
          />

          {saveCount > 0 && (
            <Text style={[styles.likeCount, saved && styles.likedCount]}>
              {saveCount}
            </Text>
          )}
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

  thumbRing: {
    borderRadius: 52,
    borderWidth: 2.5,
    borderColor: "#3DA9FC",
    padding: 3,
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

  avatarGroup: {
    flexDirection: "row",
    alignItems: "center",
  },

  attendeeAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    backgroundColor: "#EFEFEF",
  },

  overlappingAvatar: {
    marginLeft: -10,
  },

  attendeeText: {
    marginLeft: 7,
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
});
