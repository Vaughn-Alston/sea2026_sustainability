import React, { useState } from "react";
import {
  Image,
  Text,
  View,
  Button,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

import { supabase } from "../../utils/hooks/supabase";
import { useAuthentication } from "../../utils/hooks/useAuthentication";

import PartyDrawer from "../components/PartyDrawer";

const storyItems = [
  {
    id: "story-1",
    title: "Add to My Story · Friends Only",
    description: "Visible to friends only",
    icon: "📷",
  },
  {
    id: "story-2",
    title: "Add to My Story · Public",
    description: "Friends, followers, and more",
    icon: "🌎",
  },
  {
    id: "story-3",
    title: "Add to Test",
    description: "Ashley and Matt",
    icon: "📸",
  },
  {
    id: "story-4",
    title: "Add to Test Private Story",
    description: "Ashley and Matt",
    icon: "🔒",
  },
];

const countdownItems = [
  {
    id: "countdown-1",
    title: "Create a new countdown",
    description: "Invite friends or create one privately",
    icon: "📅",
  },
];

const handleSignOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error.message);
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
};

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user } = useAuthentication();

  const [partyVisible, setPartyVisible] = useState(false);
  const [partyMode, setPartyMode] = useState(false);

  const fakeName = "Isa Munoz";
  const fakeEmail = user?.email || "wendy_332";

  const handleOpenPartyDrawer = () => {
    setPartyVisible(true);
  };

  const handleClosePartyDrawer = () => {
    setPartyVisible(false);
  };

  const handleStartParty = () => {
    setPartyMode(true);
    setPartyVisible(false);
  };

  const handleMoreOptions = (item) => {
    console.log("Open more options for:", item.title);
  };

  const renderDynamicRow = (item) => {
    return (
      <View key={item.id} style={styles.dynamicRow}>
        <View style={styles.rowIconContainer}>
          <Text style={styles.rowIcon}>{item.icon}</Text>
        </View>

        <View style={styles.rowTextContainer}>
          <Text style={styles.rowTitle}>{item.title}</Text>

          <Text style={styles.rowDescription}>{item.description}</Text>
        </View>

        <Pressable
          style={styles.moreButton}
          onPress={() => handleMoreOptions(item)}
        >
          <Text style={styles.moreButtonText}>•••</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero section */}
        <View style={styles.heroContainer}>
          <Image
            source={{
              uri: "/Users/valston/Desktop/SEA - Project/party_mode/assets/snapchat/folder_page_1/pier_background_bitmoji.png",
            }}
            style={styles.heroImage}
          />

          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.heroButtonText}>‹</Text>
          </Pressable>

          <Pressable
            style={styles.settingsButton}
            onPress={() => navigation.navigate("Settings")}
          >
            <Image
              source={{
                uri: "/Users/valston/Desktop/SEA - Project/party_mode/assets/snapchat/folder_page_1/gear-512.webp",
              }}
              style={{
                width: 28,
                height: 28,
                tintColor: "#FFFFFF", // optional
              }}
            />
          </Pressable>
        </View>

        {/* Main content below hero */}
        <View style={styles.contentContainer}>
          <View style={styles.topHandle} />

          {/* User information */}
          <View style={styles.profileRow}>
            <Image
              source={{
                uri: "/Users/valston/Desktop/SEA - Project/party_mode/assets/snapchat/folder_page_1/default.png",
              }}
              style={styles.profileImage}
            />

            <View style={styles.profileText}>
              <Text style={styles.profileName}>{fakeName}</Text>
              <Text style={styles.profileEmail}>Isathewrld</Text>
            </View>
          </View>

          {/* Profile information buttons */}
          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>🎂 Dec 20</Text>
            </View>

            <View style={styles.tag}>
              <Text style={styles.tagText}>♓ Pisces</Text>
            </View>

            <View style={styles.tag}>
              <Text style={styles.tagText}>💜 Cancer</Text>
            </View>
          </View>

          {/* Black and gold feature card */}
          <Pressable style={styles.goldFeatureCard}>
            <Image
              source={{
                uri: "https://link.snapchat.com/plus/plus.png",
              }}
              style={styles.goldFeatureImage}
            />

            <View style={styles.goldFeatureText}>
              <Text style={styles.goldFeatureTitle}>Snapchat+</Text>

              <Text style={styles.goldFeatureDescription} numberOfLines={1}>
                Try custom themes, icons, and exclusive features
              </Text>
            </View>

            <View style={styles.featureBadge}>
              <Text style={styles.featureBadgeText}>New Feature</Text>
            </View>

            <Text style={styles.chevron}>›</Text>
          </Pressable>

          {/* Stories section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Stories</Text>

            <Pressable style={styles.sectionButton}>
              <Text style={styles.sectionButtonText}>＋ New Story</Text>
            </Pressable>
          </View>

          <View style={styles.rowsContainer}>
            {storyItems.map(renderDynamicRow)}
          </View>

          {/* Party Planner section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Party Time</Text>
          </View>

          <Pressable
            style={[styles.partyCard, partyMode && styles.partyCardActive]}
            onPress={handleOpenPartyDrawer}
          >
            <View style={styles.rowIconContainer}>
              <Text style={styles.rowIcon}>🎉</Text>
            </View>

            <View style={styles.rowTextContainer}>
              <Text style={styles.rowTitle}>
                {partyMode ? "Party Mode Active" : "Party Planner"}
              </Text>

              <Text style={styles.rowDescription} numberOfLines={1}>
                {partyMode
                  ? "Your Party Mode settings are currently active."
                  : "Going out tonight? Make a plan to Snap with friends."}
              </Text>
            </View>

            {!partyMode && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>New</Text>
              </View>
            )}

            <Text style={styles.chevron}>›</Text>
          </Pressable>

          {/* Countdowns section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Countdowns</Text>

            <Pressable style={styles.sectionButton}>
              <Text style={styles.sectionButtonText}>＋ New</Text>
            </Pressable>
          </View>

          <View style={styles.rowsContainer}>
            {countdownItems.map(renderDynamicRow)}
          </View>

          <View style={styles.logoutContainer}>
            <Button title="Log Out" onPress={handleSignOut} />
          </View>
        </View>
      </ScrollView>

      <PartyDrawer
        visible={partyVisible}
        onClose={handleClosePartyDrawer}
        onStartParty={handleStartParty}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000000",
  },

  scrollContent: {
    flexGrow: 1,
  },

  heroContainer: {
    width: "100%",
    height: 320,
    position: "relative",
  },

  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  backButton: {
    position: "absolute",
    top: 55,
    left: 18,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    justifyContent: "center",
    alignItems: "center",
  },

  settingsButton: {
    position: "absolute",
    top: 55,
    right: 18,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    justifyContent: "center",
    alignItems: "center",
  },

  heroButtonText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "700",
  },

  heroButtonIcon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },

  contentContainer: {
    marginTop: -26,
    paddingTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 50,
    backgroundColor: "rgba(248, 248, 248, 0.98)",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  topHandle: {
    width: 54,
    height: 5,
    backgroundColor: "#D3D3D3",
    borderRadius: 4,
    alignSelf: "center",
    marginBottom: 18,
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  profileImage: {
    width: 88,
    height: 88,
    borderRadius: 18,
    marginRight: 15,
    borderWidth: 2,
    borderColor: "#D4AF37",
  },

  profileText: {
    flex: 1,
  },

  profileName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111111",
  },

  profileEmail: {
    marginTop: 4,
    fontSize: 15,
    color: "#777777",
  },

  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 18,
  },

  tag: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
    marginBottom: 8,
  },

  tagText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555555",
  },

  goldFeatureCard: {
    minHeight: 90,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#C9A227",
    borderRadius: 18,
    padding: 10,
    marginBottom: 22,
  },

  goldFeatureImage: {
    width: 66,
    height: 66,
    borderRadius: 13,
    marginRight: 12,
    backgroundColor: "#111111",
  },

  goldFeatureText: {
    flex: 1,
  },

  goldFeatureTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111111",
  },

  goldFeatureDescription: {
    marginTop: 4,
    fontSize: 13,
    color: "#777777",
  },

  featureBadge: {
    backgroundColor: "#24B8EA",
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 5,
    marginLeft: 6,
  },

  featureBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#111111",
  },

  sectionButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: "#EAEAEA",
  },

  sectionButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#222222",
  },

  rowsContainer: {
    marginBottom: 20,
  },

  dynamicRow: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },

  rowIconContainer: {
    width: 48,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  rowIcon: {
    fontSize: 28,
  },

  rowTextContainer: {
    flex: 1,
  },

  rowTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#191919",
  },

  rowDescription: {
    marginTop: 4,
    fontSize: 13,
    color: "#858585",
  },

  moreButton: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },

  moreButtonText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#777777",
  },

  partyCard: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 22,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },

  partyCardActive: {
    borderWidth: 2,
    borderColor: "#8A2BE2",
  },

  newBadge: {
    backgroundColor: "#25B8E8",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginRight: 8,
  },

  newBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  chevron: {
    fontSize: 28,
    color: "#999999",
    marginLeft: 6,
  },

  logoutContainer: {
    marginTop: 18,
  },
});
