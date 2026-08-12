import React from "react";
import { View, Text, Image, StyleSheet, Pressable, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const SPROUT_IMAGE = require("../../assets/reward-assets/sprout.png");
const WATERING_POSE_IMAGE = require("../../assets/reward-assets/wateringpose.png");
const TRASH_POSE_IMAGE = require("../../assets/reward-assets/trashpose.png");
const SUNGLASSES_IMAGE = require("../../assets/reward-assets/sunglasses.png");
const GHOST_LOGO_IMAGE = require("../../assets/snapchat/ghostlogo.png");
const TRASH_HAT_IMAGE = require("../../assets/reward-assets/trashhat.png");
const BEACH_BAG_IMAGE = require("../../assets/reward-assets/beachbag.png");
const STARFISH_IMAGE = require("../../assets/reward-assets/starfish image.png");
const EARTH_POSE_IMAGE = require("../../assets/reward-assets/earthpose.png");
const SEAL_IMAGE = require("../../assets/reward-assets/seal.png");

const TIERS = [
  {
    name: "Bronze",
    items: [
      { id: "leaf-sprout", label: "Leaf Sprout Accessory", image: SPROUT_IMAGE },
      { id: "bitmoji-pose-bronze", label: "Bitmoji Pose", image: WATERING_POSE_IMAGE },
      { id: "snap-maps-pose", label: "Snap Maps Pose", image: TRASH_POSE_IMAGE, cropped: true },
      { id: "sunglasses", label: "Sunglasses Accessory", image: SUNGLASSES_IMAGE },
      { id: "custom-app-icon", label: "Custom App Icon+", image: GHOST_LOGO_IMAGE, highlighted: true },
      { id: "trash-bag-hat", label: "Trash Bag Hat+", image: TRASH_HAT_IMAGE, highlighted: true },
    ],
  },
  {
    name: "Silver",
    items: [
      { id: "beach-bag", label: "Beach Bag Accessory", image: BEACH_BAG_IMAGE },
      { id: "starfish", label: "Starfish Accessory", image: STARFISH_IMAGE },
      { id: "bitmoji-pose-silver", label: "Bitmoji Pose", image: EARTH_POSE_IMAGE, cropped: true },
      { id: "bitmoji-pet-seal", label: "Bitmoji Pet Seal", image: SEAL_IMAGE },
      { id: "silver-locked-1", locked: true },
      { id: "silver-locked-2", locked: true },
    ],
  },
];

function RewardItem({ item }) {
  if (item.locked) {
    return (
      <View style={styles.item}>
        <View style={styles.tileShadow}>
          <View style={styles.lockedTile}>
            <Ionicons name="lock-closed" size={22} color="#FFFFFF" />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.item}>
      <View style={styles.tileShadow}>
        <View
          style={[styles.imageTile, item.highlighted && styles.imageTileHighlighted]}
        >
          {item.image ? (
            <Image
              source={item.image}
              style={[styles.rewardImage, item.cropped && styles.rewardImageCropped]}
            />
          ) : (
            <Ionicons name="image-outline" size={22} color="#B0B0B0" />
          )}
          <Text style={styles.itemLabel} numberOfLines={2}>
            {item.label}
          </Text>
        </View>
      </View>
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
    paddingHorizontal: 14,
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
    width: "32%",
  },

  tileShadow: {
    borderRadius: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  imageTile: {
    aspectRatio: 0.7,
    borderRadius: 16,
    backgroundColor: "#EFEFEF",
    alignItems: "center",
    paddingTop: 14,
    paddingHorizontal: 8,
    paddingBottom: 8,
    overflow: "hidden",
  },
  rewardImage: {
    flex: 1,
    width: "100%",
    resizeMode: "contain",
  },
  rewardImageCropped: {
    resizeMode: "cover",
  },
  imageTileHighlighted: {
    borderWidth: 2,
    borderColor: "#E8C34A",
    backgroundColor: "#FFFFFF",
  },
  itemLabel: {
    width: "100%",
    marginTop: 6,
    fontSize: 11,
    color: "#8A8A8A",
    lineHeight: 14,
    textAlign: "center",
  },

  lockedTile: {
    aspectRatio: 0.7,
    borderRadius: 16,
    backgroundColor: "#8E8E8E",
    alignItems: "center",
    justifyContent: "center",
  },
});
