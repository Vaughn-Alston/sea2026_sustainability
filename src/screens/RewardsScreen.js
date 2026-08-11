import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const TIERS = [
  {
    name: "Bronze",
    items: [
      { id: "leaf-sprout", label: "Leaf Sprout Accessory" },
      { id: "bitmoji-pose-bronze", label: "Bitmoji Pose" },
      { id: "snap-maps-pose", label: "Snap Maps Pose" },
      { id: "sunglasses", label: "Sunglasses Accessory" },
      { id: "custom-app-icon", label: "Custom App Icon+", highlighted: true },
      { id: "trash-bag-hat", label: "Trash Bag Hat+", highlighted: true },
    ],
  },
  {
    name: "Silver",
    items: [
      { id: "beach-bag", label: "Beach Bag Accessory" },
      { id: "starfish", label: "Starfish Accessory" },
      { id: "bitmoji-pose-silver", label: "Bitmoji Pose" },
      { id: "bitmoji-pet-seal", label: "Bitmoji Pet Seal" },
      { id: "silver-locked-1", locked: true },
      { id: "silver-locked-2", locked: true },
    ],
  },
];

function RewardItem({ item }) {
  if (item.locked) {
    return (
      <View style={styles.item}>
        <View style={styles.lockedTile}>
          <Ionicons name="lock-closed" size={22} color="#FFFFFF" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.item}>
      <View
        style={[styles.imageTile, item.highlighted && styles.imageTileHighlighted]}
      >
        <Ionicons name="image-outline" size={22} color="#B0B0B0" />
      </View>
      <Text style={styles.itemLabel} numberOfLines={2}>
        {item.label}
      </Text>
    </View>
  );
}

export default function RewardsScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={26} color="#111111" />
        </Pressable>
        <Text style={styles.headerTitle}>Rewards</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {TIERS.map((tier) => (
          <View key={tier.name} style={styles.tierBlock}>
            <Text style={styles.tierTitle}>{tier.name}</Text>
            <View style={styles.grid}>
              {tier.items.map((item) => (
                <RewardItem key={item.id} item={item} />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111111",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },

  tierBlock: {
    marginBottom: 24,
  },
  tierTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 14,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 18,
  },
  item: {
    width: "31%",
  },

  imageTile: {
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: "#EFEFEF",
    alignItems: "center",
    justifyContent: "center",
  },
  imageTileHighlighted: {
    borderWidth: 2,
    borderColor: "#E8C34A",
    backgroundColor: "#FFFFFF",
  },
  itemLabel: {
    marginTop: 8,
    fontSize: 11,
    color: "#8A8A8A",
    lineHeight: 14,
  },

  lockedTile: {
    aspectRatio: 0.86,
    borderRadius: 16,
    backgroundColor: "#8E8E8E",
    alignItems: "center",
    justifyContent: "center",
  },
});
