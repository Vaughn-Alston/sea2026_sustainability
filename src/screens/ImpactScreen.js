import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

const AVATAR_RING_SIZE = 76;
const AVATAR_RING_STROKE = 2.5;
const AVATAR_RING_RADIUS = (AVATAR_RING_SIZE - AVATAR_RING_STROKE) / 2;
const AVATAR_RING_CIRCUMFERENCE = 2 * Math.PI * AVATAR_RING_RADIUS;
const AVATAR_RING_PROGRESS = 0.8; // 80% complete - leaves a gap like the reference design

function ProgressRing({ progress }) {
  return (
    <Svg
      width={AVATAR_RING_SIZE}
      height={AVATAR_RING_SIZE}
      style={styles.avatarRingSvg}
    >
      <Circle
        cx={AVATAR_RING_SIZE / 2}
        cy={AVATAR_RING_SIZE / 2}
        r={AVATAR_RING_RADIUS}
        stroke="#7ED957"
        strokeWidth={AVATAR_RING_STROKE}
        strokeDasharray={AVATAR_RING_CIRCUMFERENCE}
        strokeDashoffset={AVATAR_RING_CIRCUMFERENCE * (1 - progress)}
        strokeLinecap="round"
        fill="none"
        rotation={-90}
        origin={`${AVATAR_RING_SIZE / 2}, ${AVATAR_RING_SIZE / 2}`}
      />
    </Svg>
  );
}

const STATS = [
  { label: "Volunteer Hours", value: "54" },
  { label: "Events Attended", value: "18" },
  { label: "Organizations", value: "6" },
];

const RECENT_IMPACT = [
  {
    id: "recent-1",
    title: "Dockweiler Beach Cleanup",
    date: "Jul 30, 2026",
    hours: "2.5 hours",
    organization: "Heal the Bay",
  },
  {
    id: "recent-2",
    title: "Westchester Food Drive",
    date: "Jul 18, 2026",
    hours: null,
    organization: "Westchester Community Food Bank",
  },
];

function ImagePlaceholder({ style }) {
  return (
    <View style={[styles.imagePlaceholder, style]}>
      <Ionicons name="image-outline" size={20} color="#B0B0B0" />
    </View>
  );
}

export default function ImpactScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={26} color="#111111" />
        </Pressable>
        <Text style={styles.headerTitle}>Impact</Text>
        <View style={styles.backButton} />
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <Pressable
          style={styles.tab}
          onPress={() => setActiveTab("overview")}
        >
          <Text
            style={[
              styles.tabLabel,
              activeTab === "overview" && styles.tabLabelActive,
            ]}
          >
            Overview
          </Text>
          {activeTab === "overview" && <View style={styles.tabIndicator} />}
        </Pressable>

        <Pressable
          style={styles.tab}
          onPress={() => setActiveTab("community")}
        >
          <Text
            style={[
              styles.tabLabel,
              activeTab === "community" && styles.tabLabelActive,
            ]}
          >
            Community
          </Text>
          {activeTab === "community" && <View style={styles.tabIndicator} />}
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Impact leader card */}
        <View style={styles.card}>
          <View style={styles.avatarRing}>
            <ProgressRing progress={AVATAR_RING_PROGRESS} />
            <ImagePlaceholder style={styles.avatarImage} />
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarBadgeText}>2</Text>
            </View>
          </View>

          <View style={styles.leaderTextBlock}>
            <Text style={styles.leaderTitle}>Silver Impact Leader</Text>
            <Text style={styles.leaderSubtitle}>
              10 more actions until Gold Impact Leader
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {STATS.map((stat) => (
            <View key={stat.label} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Rewards */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Rewards</Text>
          <Pressable>
            <Text style={styles.seeAll}>See All</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <ImagePlaceholder style={styles.rewardImage} />
          <View style={styles.rewardTextBlock}>
            <Text style={styles.rewardEyebrow}>Next Unlock</Text>
            <Text style={styles.rewardTitle}>Seal Bitmoji Pet</Text>
            <Text style={styles.rewardSubtitle}>1 more action to unlock!</Text>
          </View>
        </View>

        {/* Recent impact */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Impact</Text>
          <Pressable>
            <Text style={styles.seeAll}>See All</Text>
          </Pressable>
        </View>

        {RECENT_IMPACT.map((item) => (
          <View key={item.id} style={[styles.card, styles.recentCard]}>
            <ImagePlaceholder style={styles.recentImage} />
            <View style={styles.recentTextBlock}>
              <Text style={styles.recentTitle}>{item.title}</Text>
              <Text style={styles.recentMeta}>
                {item.hours ? `${item.date} · ${item.hours}` : item.date}
              </Text>
              <Text style={styles.recentOrg}>{item.organization}</Text>
            </View>
          </View>
        ))}

        <Pressable style={styles.exportButton}>
          <Ionicons name="download-outline" size={18} color="#111111" />
          <Text style={styles.exportButtonText}>Export Volunteer Record</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },

  // Header
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

  // Tabs
  tabRow: {
    flexDirection: "row",
    marginTop: 8,
    marginBottom: 4,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 12,
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#B5B5B5",
  },
  tabLabelActive: {
    color: "#111111",
  },
  tabIndicator: {
    marginTop: 8,
    width: "100%",
    height: 2.5,
    borderRadius: 2,
    backgroundColor: "#111111",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },

  // Shared card
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
  },

  imagePlaceholder: {
    backgroundColor: "#EAEAEA",
    alignItems: "center",
    justifyContent: "center",
  },

  // Leader card
  avatarRing: {
    width: 76,
    height: 76,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarRingSvg: {
    position: "absolute",
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarBadge: {
    position: "absolute",
    bottom: -2,
    left: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#B0B0B0",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  leaderTextBlock: {
    flex: 1,
    marginLeft: 16,
  },
  leaderTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 4,
  },
  leaderSubtitle: {
    fontSize: 13,
    color: "#8A8A8A",
    lineHeight: 17,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111111",
  },
  statLabel: {
    marginTop: 4,
    fontSize: 11,
    color: "#8A8A8A",
    textAlign: "center",
  },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
  },
  seeAll: {
    fontSize: 14,
    color: "#8A8A8A",
  },

  // Reward card
  rewardImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  rewardTextBlock: {
    flex: 1,
    marginLeft: 16,
  },
  rewardEyebrow: {
    fontSize: 12,
    color: "#8A8A8A",
    marginBottom: 2,
  },
  rewardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111111",
    marginBottom: 2,
    paddingTop: 4,
    paddingBottom: 4,
  },
  rewardSubtitle: {
    fontSize: 13,
    color: "#8A8A8A",
  },

  // Recent impact
  recentCard: {
    marginBottom: 14,
  },
  recentImage: {
    width: 56,
    height: 56,
    borderRadius: 14,
  },
  recentTextBlock: {
    flex: 1,
    marginLeft: 14,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111111",
    marginBottom: 3,
  },
  recentMeta: {
    fontSize: 13,
    color: "#8A8A8A",
    marginBottom: 2,
  },
  recentOrg: {
    fontSize: 13,
    color: "#8A8A8A",
  },

  // Export button
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFC00",
    borderRadius: 100,
    height: 54,
    marginTop: 8,
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
  },
});
