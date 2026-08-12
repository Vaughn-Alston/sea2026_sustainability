import React from "react";
import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const MELISSA_BITMOJI = require("../../assets/bitmoji-icons/Melissa Lazenby_SEA.png");
const KEZIAH_BITMOJI = require("../../assets/bitmoji-icons/Keziah Muyna_SEA.png");
const VAUGHN_BITMOJI = require("../../assets/bitmoji-icons/Vaughn Alston_SEA.png");

const CONNECTIONS = [
  { id: "1", name: "Melissa Lazenby", username: "melissalazer", timesMet: 8, avatar: MELISSA_BITMOJI },
  { id: "2", name: "keziah muyna", username: "kezm", timesMet: 6, avatar: KEZIAH_BITMOJI },
  { id: "3", name: "Vaughn", username: "vaughnnn", timesMet: 5, avatar: VAUGHN_BITMOJI },
];

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
            <Image source={person.avatar} style={styles.avatar} />

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
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
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

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    resizeMode: "cover",
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
