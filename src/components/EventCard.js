import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  formatEventWhen,
  isOpenNow,
  formatEventShort,
} from "../../utils/datetimeUtil";
import { distanceFromUser, formatDistance } from "../../utils/geoUtil";

const MAX_VISIBLE_AVATARS = 3;
const THUMB_SIZE = 64;
const META_HEIGHT = 30; // chip + avatars share this height, centered together

// category text -> emoji, matches the values seeded on events.category anything unmapped just shows the label with no emoji
const CATEGORY_EMOJI = {
  Water: "💧",
  Restore: "🌱",
  Reuse: "♻️",
  Food: "🍎",
  Energy: "⚡",
};

// 1200 -> "1.2K" so the save pill stays short
function formatCount(n) {
  if (n < 1000) return `${n}`;
  if (n < 1_000_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
}

/**
 * EventCard
 *   top row  - story thumbnail + text block + heart pill
 *   meta row - full card width: category chip on the left, avatar stack on
 *              the right, both the same height and centered together
 *
 *   scheduled events show a date + avatar stack
 *   drop-ins show green Open Now / red Closed and no stack (chip sits alone)
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
  const isEvent = event?.kind === "event";

  const cardTitle = event?.name;
  const cardImage = event?.thumbnail;
  const cardSubtitle = event?.venue_type;

  // scheduled rows show a date, drop-ins show open/closed (colored)
  const cardWhen = isEvent ? formatEventShort(event?.start_datetime) : null;
  const open = !isEvent ? isOpenNow(event?.hours) : null;

  const cardDistance = formatDistance(distanceFromUser(userLocation, event));

  // impact category - Water, Food, etc - paired with its emoji
  const cardTag = event?.category;
  const cardTagEmoji = cardTag ? CATEGORY_EMOJI[cardTag] : null;

  // already filtered to friends attending, see eventsApi - drop-ins skip this
  const cardAttendees = isEvent ? (event?.attendees ?? []) : [];
  const cardAttendeeCount = isEvent
    ? (event?.attendeeCount ?? cardAttendees.length)
    : 0;

  const visibleAttendees = cardAttendees.slice(0, MAX_VISIBLE_AVATARS);
  const overflowCount = cardAttendeeCount - visibleAttendees.length;

  // everyone who saved it - from the db, so it survives closing the sheet
  const saveCount = event?.saveCount ?? 0;

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
      {/* TOP ROW - thumbnail + text + heart pill */}
      <View style={styles.topRow}>
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
            <View style={[styles.cardMedia, styles.imagePlaceholder]} />
          )}
        </Pressable>

        <View style={styles.textBlock}>
          <Text style={styles.title} numberOfLines={2}>
            {cardTitle}
          </Text>

          {!!cardSubtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {cardSubtitle}
            </Text>
          )}

          {/* date for events, colored open state for drop-ins */}
          {isEvent ? (
            (!!cardWhen || !!cardDistance) && (
              <Text style={styles.whenLine} numberOfLines={1}>
                {[cardWhen, cardDistance].filter(Boolean).join(" • ")}
              </Text>
            )
          ) : (
            <Text style={styles.whenLine} numberOfLines={1}>
              <Text style={open ? styles.openText : styles.closedText}>
                {open ? "Open Now" : "Closed"}
              </Text>
              {!!cardDistance && `  •  ${cardDistance}`}
            </Text>
          )}
        </View>

        {/* save pill - heart + count on the sheet's close-button grey */}
        <Pressable style={styles.savePill} onPress={handleHeartPress} hitSlop={6}>
            <Ionicons
              name={saved ? "heart" : "heart-outline"}
              size={18}
              color={saved ? "#E53935" : "#555555"}
            />
          </Pressable>
      </View>

      {/* META ROW - full width: chip left, avatar stack right, matched height */}
      <View style={styles.metaRow}>
        {!!cardTag ? (
          <View style={styles.tag}>
            {!!cardTagEmoji && (
              <Text style={styles.tagEmoji}>{cardTagEmoji}</Text>
            )}
            <Text style={styles.tagText}>{cardTag}</Text>
          </View>
        ) : (
          <View />
        )}

        {/* drop-ins have no avatar stack */}
        {isEvent && cardAttendeeCount > 0 && (
          <View style={styles.attendeeContainer}>
            <View style={styles.avatarGroup}>
              {visibleAttendees.map((attendee, index) =>
                attendee.image ? (
                  <Image
                    key={attendee.id ?? index}
                    source={{ uri: attendee.image }}
                    style={[
                      styles.attendeeAvatar,
                      index > 0 && styles.overlappingAvatar,
                    ]}
                  />
                ) : (
                  // null avatar - plain grey circle
                  <View
                    key={attendee.id ?? index}
                    style={[
                      styles.attendeeAvatar,
                      styles.attendeeAvatarEmpty,
                      index > 0 && styles.overlappingAvatar,
                    ]}
                  />
                ),
              )}

              {overflowCount > 0 && (
                <View
                  style={[
                    styles.attendeeAvatar,
                    styles.attendeeAvatarMore,
                    styles.overlappingAvatar,
                  ]}
                >
                  <Text style={styles.attendeeMoreText}>+{overflowCount}</Text>
                </View>
              )}
            </View>

            <Text style={styles.attendeeText}>{cardAttendeeCount} Going</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },

  cardPressed: {
    opacity: 0.9,
  },

  // TOP ROW
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  thumbRing: {
    borderRadius: (THUMB_SIZE + 8) / 2,
    borderWidth: 2,
    borderColor: "#3DA9FC",
    padding: 2,
    marginRight: 12,
  },

  cardMedia: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    resizeMode: "cover",
  },

  imagePlaceholder: {
    backgroundColor: "#E8E8E8",
  },

  textBlock: {
    flex: 1,
    marginRight: 8,
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111111",
    lineHeight: 20,
  },

  subtitle: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "500",
    color: "#8A8A8A",
  },

  whenLine: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "600",
    color: "#333333",
  },

  openText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1FA463",
  },

  closedText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#D93636",
  },

  savePill: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 24,
    backgroundColor: "#EBEBED",
    alignItems: "center",
    justifyContent: "center",
  },

  // META ROW - spans the full card width
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    minHeight: META_HEIGHT,
  },

  tag: {
    height: META_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: "#ececec",
    borderRadius: META_HEIGHT / 2,
  },

  tagEmoji: {
    fontSize: 12,
    marginRight: 4,
  },

  tagText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#222222",
  },

  attendeeContainer: {
    height: META_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
  },

  avatarGroup: {
    flexDirection: "row",
    alignItems: "center",
  },

  attendeeAvatar: {
    width: META_HEIGHT,
    height: META_HEIGHT,
    borderRadius: META_HEIGHT / 2,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    backgroundColor: "#EFEFEF",
  },

  attendeeAvatarEmpty: {
    backgroundColor: "#D9D9D9",
  },

  attendeeAvatarMore: {
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },

  attendeeMoreText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  overlappingAvatar: {
    marginLeft: -15,
  },

  attendeeText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "500",
    color: "#333333",
  },
});
