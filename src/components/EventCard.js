import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";



//I need to import my data to display on my modal

import {anytimeEvents } from "../data/anytimeEvents";
import {ascheduledevents} from "../data/ascheduledevents";







export default function EventCard({
  title,
  image,
  dateTime,
  distance,
  tag,
  attendees = [],
  attendeeCount = 0,
  initialLikes = 7,
  onPress,
  onActionPress,
}) {
  const visibleAttendees = attendees.slice(0, 3);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikes);

  const [rsvp, setRsvp] = useState(false);


  const handleHeartPress = (event) => {
    // Prevent the full card's onPress from running.
    event.stopPropagation?.();

    // The user can only increment the count once.
    if (liked) return;

    setLiked(true);
    setLikeCount((currentCount) => currentCount + 1);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      {/* Circular image on the far left */}
      {image ? (
        <Image source={image} style={styles.cardMedia} />
      ) : (
        <View style={[styles.cardMedia, styles.imagePlaceholder]}>
          <Text style={styles.imagePlaceholderText}>IMG</Text>
        </View>
      )}

      {/* Main card information */}
      <View style={styles.cardContent}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        {!!dateTime && (
          <Text style={styles.dateTime} numberOfLines={1}>
            {dateTime}
          </Text>
        )}

        {!!distance && (
          <Text style={styles.distance}>
            {distance}
          </Text>
        )}

        {!!tag && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>
              {tag}
            </Text>
          </View>
        )}

        <View style={styles.attendeeContainer}>
          <View style={styles.avatarGroup}>
            {visibleAttendees.map((attendee, index) => (
              <Image
                key={attendee.id ?? index}
                source={attendee.image ?? attendee}
                style={[
                  styles.attendeeAvatar,
                  index > 0 && styles.overlappingAvatar,
                ]}
              />
            ))}
          </View>

          {attendeeCount > 0 && (
            <Text style={styles.attendeeText}>
              {attendeeCount} Going
            </Text>
          )}
        </View>
      </View>

      {/* Actions on the far right */}
      <View style={styles.cardActions}>
        <Pressable
          style={styles.heartButton}
          onPress={handleHeartPress}
          hitSlop={8}
        >
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={27}
            color={liked ? "#E53935" : "#555555"}
          />

          <Text
            style={[
              styles.likeCount,
              liked && styles.likedCount,
            ]}
          >
            {likeCount}
          </Text>
        </Pressable>






        {/* Here I will create a rsvp button that will track the user if he clicks it */}

   <Pressable
          style={styles.actionButton}
          onPress={(event) => {
            event.stopPropagation?.();
            onActionPress?.();
          }}
          
        >


     

            <Text  style={styles.attendeeText}>


            RSVP

            </Text>

     </Pressable>



        

        <Pressable
          style={styles.actionButton}
          onPress={(event) => {
            event.stopPropagation?.();
            onActionPress?.();
          }}
          hitSlop={8}
        >
          <Ionicons
            name="navigate"
            size={23}
            color="#111111"
          />
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

  actionButton: {
    width: 48,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF1F3",
  },
});