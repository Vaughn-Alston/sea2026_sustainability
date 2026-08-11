import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const CONNECTIONS = [
  { id: "1", name: "Nisha", username: "nishac", timesMet: 8 },
  { id: "2", name: "Suzie Freeman", username: "suziefree", timesMet: 6 },
  { id: "3", name: "Bridgette Wicks", username: "bridgettewicks", timesMet: 5 },
];

function ImagePlaceholder({ style }) {
  return (
    <View style={[styles.imagePlaceholder, style]}>
      <Ionicons name="image-outline" size={18} color="#B0B0B0" />
    </View>
  );
}

export default function CommunityTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.introText}>
        Turn familiar faces into familiar friends.{"\n"}
        See here who you've crossed paths with at local events.
      </Text>

      <View style={styles.card}>
        {CONNECTIONS.map((person, index) => (
          <View
            key={person.id}
            style={[
              styles.row,
              index !== CONNECTIONS.length - 1 && styles.rowDivider,
            ]}
          >
            <ImagePlaceholder style={styles.avatar} />

            <View style={styles.textBlock}>
              <Text style={styles.name}>{person.name}</Text>
              <Text style={styles.username}>{person.username}</Text>
              <Text style={styles.metLabel}>MET {person.timesMet} TIMES</Text>
            </View>

            <Pressable style={styles.addButton}>
              <Ionicons name="person-add" size={14} color="#111111" />
              <Text style={styles.addButtonText}>Add</Text>
            </Pressable>

            <Pressable style={styles.removeButton} hitSlop={10}>
              <Ionicons name="close" size={20} color="#8A8A8A" />
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  introText: {
    fontSize: 13,
    color: "#8A8A8A",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EAEAEA",
  },

  imagePlaceholder: {
    backgroundColor: "#EAEAEA",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },

  textBlock: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 1,
  },
  username: {
    fontSize: 13,
    color: "#8A8A8A",
    marginBottom: 4,
  },
  metLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#B0B0B0",
    letterSpacing: 0.4,
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FFFC00",
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginLeft: 8,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111111",
  },

  removeButton: {
    marginLeft: 10,
  },
});
