import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { supabase } from "../lib/supabase";

const CONNECTION_USERNAMES = ["shawn", "sabrina", "jade"];
const TIMES_MET = { shawn: 8, sabrina: 6, jade: 5 };


export default function CommunityTab() {
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, username, avatar")
        .in("username", CONNECTION_USERNAMES);

      if (error) {
        console.log("Connections failed to load", error.message);
        return;
      }

      if (!cancelled) setConnections(data ?? []);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.introText}>
        Turn familiar faces into familiar friends.{"\n"}
        See here who you've crossed paths with at local events.
      </Text>

      <View style={styles.card}>
        {connections.map((person, index) => (
          <View
            key={person.id}
            style={[
              styles.row,
              index !== connections.length - 1 && styles.rowDivider,
            ]}
          >
            {person.avatar ? (
              <Image source={{ uri: person.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarEmpty]} />
            )}

            <View style={styles.textBlock}>
              <Text style={styles.name}>{person.username}</Text>
              <Text style={styles.username}>{person.username}</Text>
              <Text style={styles.metLabel}>
                MET {TIMES_MET[person.username] ?? 3} TIMES
              </Text>
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
  avatarEmpty: {
    backgroundColor: "#D9D9D9",
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
