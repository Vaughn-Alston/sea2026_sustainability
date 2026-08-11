import React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function EventCard({
  event,
  title,
  image,
  dateTime,
  distance,
  tag,
  attendees = [],
  attendeeCount = 0,
  initialLikes = 7,
  //All events start false then if like will turn true
  liked = false,
  onPress,
  // Function handles when the like button is pressed
  onLikePress,
  onActionPress,
}) {

  // This block of data 29 - 34 will control what is being displyed to the card

  //CardTitle -> will display title if it excist if not -> it will display event.title
  const cardTitle = title ?? event?.title;
  const cardImage = image ?? event?.image;

// Build one date/time string from event.date and event.time, skipping missing values.
  const cardDateTime = dateTime ?? [event?.date, event?.time].filter(Boolean).join(" ");


//Use distance if it was passed directly. If not, use event.distance
  const cardDistance = distance ?? event?.distance;
// Use tag if it was passed directly. If not, use event.category.
  const cardTag = tag ?? event?.category;




//This checks if the direct prop attendees if it has people inside it use attendees // if not then use event.attendees, 
//if that doesnt exist then use a empty array
  const cardAttendees = attendees.length
    ? attendees
    : event?.attendees ?? [];

//this will check if there is a value in the prop that is passed if not then use the array length that is passed
  const cardAttendeeCount = 
    attendeeCount || cardAttendees.length;

  // This will show the first 3 people that are in the going 
  const visibleAttendees = cardAttendees.slice(0, 3);

  //increment the count
  const likeCount = initialLikes + (liked ? 1 : 0);




// Runs when the user taps the heart button on this card.
  const handleHeartPress = (event) => {
    // Prevent the full card's onPress from running.
    event.stopPropagation?.();

    // The user can only increment the count once.
    onLikePress?.();
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
      {cardImage ? (
        <Image
          source={
            typeof cardImage === "string"
              ? { uri: cardImage }
              : cardImage
          }
          style={styles.cardMedia}
        />
      ) : (
        <View style={[styles.cardMedia, styles.imagePlaceholder]}>
          <Text style={styles.imagePlaceholderText}>IMG</Text>
        </View>
      )}

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

        {!!cardDistance && (
          <Text style={styles.distance}>
            {cardDistance}
          </Text>
        )}

        {!!cardTag && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>
              {cardTag}
            </Text>
          </View>
        )}

        <View style={styles.attendeeContainer}>
          <View style={styles.avatarGroup}>
            {visibleAttendees.map((attendee, index) => (
              <Image
                key={attendee.id ?? index}
                source={
                  typeof (attendee.image ?? attendee) ===
                  "string"
                    ? {
                        uri:
                          attendee.image ?? attendee,
                      }
                    : attendee.image ?? attendee
                }
                style={[
                  styles.attendeeAvatar,
                  index > 0 && styles.overlappingAvatar,
                ]}
              />
            ))}
          </View>

          {cardAttendeeCount > 0 && (
            <Text style={styles.attendeeText}>
              {cardAttendeeCount} Going
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
