import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

const SELECTION_BLUE = "#0A84FF";

const TABS = ["All", "My AI", "Groups", "Contacts", "New"];

const STORIES = [
  {
    id: "spotlight",
    title: "Spotlight",
    subtitle: "Reach millions of Snapchatters!",
    shape: "square",
  },
  {
    id: "story-friends",
    title: "My Story · Friends Only",
    subtitle: "Just for Friends",
  },
  {
    id: "story-public",
    title: "My Story · Public",
    subtitle: "Friends, Followers, and Everyone",
  },
];

const BEST_FRIENDS = [
  { id: "bf1", name: "Jordan Lee", emoji: "😎😊" },
  { id: "bf2", name: "Mom", emoji: "🔥😅😊" },
  { id: "bf3", name: "Alex Chen", emoji: "😊" },
];

const TOP_GROUPS = [
  { id: "g1", name: "Beach Cleanup Crew", members: "Jordan Lee, Mom", emoji: "🔥✌️" },
  { id: "g2", name: "Compost Club", members: "Riley Park, Sam Ortiz", emoji: "✌️" },
];

const RECENTS = [
  {
    id: "r1",
    name: "Sustainability Squad 2026",
    members: "Nick, Jonathan, Hannah, +5",
    emoji: "🌱💬✏️🔍",
    type: "group",
  },
  {
    id: "r2",
    name: "Beach Cleanup Crew",
    members: "Jordan Lee, Mom",
    emoji: "🔥✌️",
    type: "group",
  },
];

const SELECTABLE_NAMES = [
  ...STORIES.map((s) => ({ id: s.id, name: s.title })),
  { id: "story-custom", name: "Custom Story" },
  { id: "my-ai", name: "My AI" },
  ...BEST_FRIENDS.map((f) => ({ id: f.id, name: f.name })),
  ...TOP_GROUPS.map((g) => ({ id: g.id, name: g.name })),
  ...RECENTS.map((r) => ({ id: r.id, name: r.name })),
].reduce((map, item) => ({ ...map, [item.id]: item.name }), {});

function PlaceholderAvatar({ shape = "circle", style }) {
  return (
    <View
      style={[
        styles.placeholderAvatar,
        shape === "square" && styles.placeholderSquare,
        style,
      ]}
    >
      <Ionicons name="image-outline" size={16} color="#b5b5ba" />
    </View>
  );
}

function Row({ title, subtitle, emoji, shape, stacked, selected, onPress }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      {stacked ? (
        <View style={styles.stackedAvatars}>
          <PlaceholderAvatar style={styles.avatarBack} />
          <PlaceholderAvatar style={styles.avatarFront} />
        </View>
      ) : (
        <PlaceholderAvatar shape={shape} />
      )}
      <View style={styles.rowText}>
        <Text
          style={[styles.rowTitle, selected && styles.rowTitleSelected]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.rowSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {emoji ? <Text style={styles.rowEmoji}>{emoji}</Text> : null}
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <Ionicons name="checkmark" size={14} color="#fff" />}
      </View>
    </TouchableOpacity>
  );
}

export default function SendToScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [showMoreStories, setShowMoreStories] = useState(false);
  const [selected, setSelected] = useState(new Set());

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = (items) => {
    setSelected((prev) => {
      const next = new Set(prev);
      items.forEach((item) => next.add(item.id));
      return next;
    });
  };

  const normalizedQuery = query.trim().toLowerCase();
  const matches = (text) => text.toLowerCase().includes(normalizedQuery);

  const showStories = activeTab === "All";

  const filteredStories = useMemo(
    () => (normalizedQuery ? STORIES.filter((s) => matches(s.title)) : STORIES),
    [normalizedQuery],
  );

  const filteredBestFriends = useMemo(() => {
    if (activeTab !== "All" && activeTab !== "Contacts") return [];
    return BEST_FRIENDS.filter((f) => matches(f.name));
  }, [activeTab, normalizedQuery]);

  const filteredGroups = useMemo(() => {
    if (activeTab !== "All" && activeTab !== "Groups") return [];
    return TOP_GROUPS.filter((g) => matches(g.name));
  }, [activeTab, normalizedQuery]);

  const filteredRecents = useMemo(() => {
    if (activeTab === "All") return RECENTS.filter((r) => matches(r.name));
    if (activeTab === "Groups")
      return RECENTS.filter((r) => r.type === "group" && matches(r.name));
    if (activeTab === "Contacts")
      return RECENTS.filter((r) => r.type === "contact" && matches(r.name));
    return [];
  }, [activeTab, normalizedQuery]);

  const selectedNames = useMemo(
    () => Array.from(selected).map((id) => SELECTABLE_NAMES[id]).join(", "),
    [selected],
  );

  const handleSend = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.searchRow, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="chevron-down" size={20} color="#8a8a8e" />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#6b6b70" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Send To..."
            placeholderTextColor="#8a8a8e"
            style={styles.searchInput}
          />
          <TouchableOpacity
            onPress={() => navigation.navigate("AddFriend")}
            hitSlop={8}
          >
            <Ionicons name="person-add-outline" size={18} color="#3a3a3c" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsRow}
          contentContainerStyle={styles.tabsRowContent}
        >
          {TABS.map((tab) => {
            const isNew = tab === "New";
            const isActive = tab === activeTab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabPill, isActive && styles.tabPillActive]}
                onPress={() =>
                  isNew ? navigation.navigate("AddFriend") : setActiveTab(tab)
                }
              >
                {tab === "My AI" && (
                  <View style={styles.aiAvatar}>
                    <Ionicons name="sparkles" size={11} color="#fff" />
                  </View>
                )}
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab}
                </Text>
                {isNew && <Ionicons name="add-circle" size={16} color="#111" />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {showStories && filteredStories.length > 0 && (
            <>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeader}>Post to...</Text>
                <TouchableOpacity style={styles.newStoryPill}>
                  <Text style={styles.newStoryText}>New Story</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.sectionCard}>
                {filteredStories.map((story) => (
                  <Row
                    key={story.id}
                    title={story.title}
                    subtitle={story.subtitle}
                    shape={story.shape}
                    selected={selected.has(story.id)}
                    onPress={() => toggleSelect(story.id)}
                  />
                ))}
                <TouchableOpacity
                  style={styles.moreStoriesRow}
                  onPress={() => setShowMoreStories((v) => !v)}
                >
                  <Text style={styles.moreStoriesText}>
                    {showMoreStories ? "Show Less" : "1 More Story"}
                  </Text>
                </TouchableOpacity>
                {showMoreStories && (
                  <Row
                    title="Custom Story"
                    subtitle="Choose who can view"
                    shape="circle"
                    selected={selected.has("story-custom")}
                    onPress={() => toggleSelect("story-custom")}
                  />
                )}
              </View>
            </>
          )}

          {activeTab === "My AI" && (
            <View style={styles.sectionCard}>
              <Row
                title="My AI"
                subtitle="Chat with My AI"
                shape="circle"
                selected={selected.has("my-ai")}
                onPress={() => toggleSelect("my-ai")}
              />
            </View>
          )}

          {filteredBestFriends.length > 0 && (
            <>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeader}>Best Friends</Text>
                <TouchableOpacity onPress={() => selectAll(filteredBestFriends)}>
                  <Text style={styles.selectAllText}>Select All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.sectionCard}>
                {filteredBestFriends.map((friend) => (
                  <Row
                    key={friend.id}
                    title={friend.name}
                    emoji={friend.emoji}
                    shape="circle"
                    selected={selected.has(friend.id)}
                    onPress={() => toggleSelect(friend.id)}
                  />
                ))}
              </View>
            </>
          )}

          {filteredGroups.length > 0 && (
            <>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeader}>Top Groups</Text>
                <TouchableOpacity onPress={() => selectAll(filteredGroups)}>
                  <Text style={styles.selectAllText}>Select All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.sectionCard}>
                {filteredGroups.map((group) => (
                  <Row
                    key={group.id}
                    title={group.name}
                    subtitle={group.members}
                    emoji={group.emoji}
                    stacked
                    selected={selected.has(group.id)}
                    onPress={() => toggleSelect(group.id)}
                  />
                ))}
              </View>
            </>
          )}

          {filteredRecents.length > 0 && (
            <>
              <Text style={[styles.sectionHeader, styles.sectionHeaderStandalone]}>
                Recents & Suggested
              </Text>
              <View style={styles.sectionCard}>
                {filteredRecents.map((item) => (
                  <Row
                    key={item.id}
                    title={item.name}
                    subtitle={item.members}
                    emoji={item.emoji}
                    stacked={item.type === "group"}
                    selected={selected.has(item.id)}
                    onPress={() => toggleSelect(item.id)}
                  />
                ))}
              </View>
            </>
          )}

          <View style={{ height: selected.size > 0 ? 100 : 40 }} />
        </ScrollView>
      </View>

      {selected.size > 0 && (
        <View style={[styles.sendBar, { paddingBottom: insets.bottom + 12 }]}>
          <Text style={styles.sendBarText} numberOfLines={1}>
            {selectedNames}
          </Text>
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Ionicons name="arrow-forward" size={20} color={SELECTION_BLUE} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#EAEAEC",
  },
  card: {
    flex: 1,
    backgroundColor: "#EAEAEC",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E2E2E6",
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#111",
    padding: 0,
  },
  tabsRow: {
    flexGrow: 0,
    marginTop: 14,
  },
  tabsRowContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F3F3F5",
  },
  tabPillActive: {
    backgroundColor: "#CFE9FB",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3a3a3c",
  },
  tabTextActive: {
    color: "#111",
  },
  aiAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#7C6CF0",
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    flex: 1,
    marginTop: 8,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    marginBottom: 8,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
  },
  sectionHeaderStandalone: {
    marginTop: 18,
    marginBottom: 8,
  },
  selectAllText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8a8a8e",
  },
  newStoryPill: {
    backgroundColor: "#ECECEE",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  newStoryText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111",
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 12,
  },
  placeholderAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E4E4E8",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderSquare: {
    borderRadius: 10,
  },
  stackedAvatars: {
    width: 38,
    height: 38,
    justifyContent: "center",
  },
  avatarBack: {
    position: "absolute",
    left: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  avatarFront: {
    position: "absolute",
    left: 0,
    top: 3,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#fff",
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
  rowTitleSelected: {
    color: SELECTION_BLUE,
  },
  rowSubtitle: {
    fontSize: 12,
    color: "#8a8a8e",
    marginTop: 2,
  },
  rowEmoji: {
    fontSize: 13,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#d3d3d7",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    backgroundColor: SELECTION_BLUE,
    borderColor: SELECTION_BLUE,
  },
  moreStoriesRow: {
    paddingVertical: 12,
    alignItems: "center",
  },
  moreStoriesText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
  },
  sendBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: SELECTION_BLUE,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  sendBarText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
