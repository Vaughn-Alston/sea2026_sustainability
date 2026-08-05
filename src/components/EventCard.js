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
  title,
  image,
  dateTime,
  distance,
  tag,
  attendees = [],
  attendeeCount = 0,
  onPress,
  onActionPress,
}) {
  const visibleAttendees = attendees.slice(0, 3);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      {/* Similar to MUI CardMedia */}
      <Image source={image} style={styles.cardMedia} />

      {/* Similar to MUI CardContent */}
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
          <Text style={styles.distance}>{distance}</Text>
        )}

        {!!tag && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        )}
      </View>

      {/* Similar to MUI CardActions */}
      <View style={styles.cardActions}>
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
            size={24}
            color="#111111"
          />
        </Pressable>

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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    minHeight: 160,
    flexDirection: "row",
    alignItems: "flex-start",
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

  cardMedia: {
    width: 92,
    height: 92,
    borderRadius: 46,
    resizeMode: "cover",
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
    marginTop: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#E1E4E8",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },

  tagText: {
    fontSize: 13,
    color: "#222222",
  },

  cardActions: {
    minHeight: 135,
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  actionButton: {
    width: 84,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF1F3",
  },

  attendeeContainer: {
    flexDirection: "row",
    alignItems: "center",
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
});