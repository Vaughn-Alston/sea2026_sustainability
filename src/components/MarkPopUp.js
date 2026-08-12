import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const EVENT_NAME = "Dockweiler Beach Cleanup";

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function MarkPopUp({ visible, date, photoUri, onViewImpact, onDone }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarPlaceholder}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="image-outline" size={32} color="#b5b5ba" />
              )}
            </View>
          </View>

          <Text style={styles.title}>You Left Your Mark!</Text>
          <Text style={styles.subtitle}>
            {EVENT_NAME} · {formatDate(date)}
          </Text>

          <TouchableOpacity style={styles.viewImpactButton} onPress={onViewImpact}>
            <Text style={styles.viewImpactText}>View Impact</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onDone} hitSlop={10}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 32,
    paddingTop: 54,
    paddingBottom: 18,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  avatarWrap: {
    position: "absolute",
    top: -50,
    alignSelf: "center",
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#8B5CF6",
    backgroundColor: "#EDEDF0",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 25,
    fontWeight: "800",
    color: "#111",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8a8a8e",
    marginTop: 8,
    textAlign: "center",
  },
  viewImpactButton: {
    alignSelf: "stretch",
    backgroundColor: "#FFFC00",
    borderRadius: 26,
    paddingVertical: 13,
    marginTop: 16,
    alignItems: "center",
  },
  viewImpactText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111",
  },
  doneText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6b6b70",
    marginTop: 12,
  },
});
