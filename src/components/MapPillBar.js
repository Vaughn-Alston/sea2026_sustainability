import React, { useEffect } from "react";
import { StyleSheet, ScrollView, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import MemoriesIcon from "../../assets/pill-icons/memories.svg";
import TrendingIcon from "../../assets/pill-icons/trending.svg";
import ImpactIcon from "../../assets/pill-icons/impact.svg";
import ClockIcon from "../../assets/pill-icons/clock.svg";
import PopularIcon from "../../assets/pill-icons/popular.svg";
import HeartIcon from "../../assets/pill-icons/heart.svg";
import RestaurantsIcon from "../../assets/pill-icons/restaurant.svg";
import CoffeeIcon from "../../assets/pill-icons/coffee.svg";
import TreeIcon from "../../assets/pill-icons/tree.svg";
import ShopsIcon from "../../assets/pill-icons/shops.svg";
import FootstepsIcon from "../../assets/pill-icons/footsteps.svg";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// How long the row takes to fade in or out
const FADE_DURATION = 150;

// How far pill shrinks while held down
const PRESS_SCALE = 0.85;
const PRESS_DURATION = 90;

const ICON_SIZE = 14;

const PILLS = [
  { id: "memories", label: "Memories", Icon: MemoriesIcon },
  { id: "trending", label: "Trending", Icon: TrendingIcon },
  { id: "impacts", label: "Impacts", Icon: ImpactIcon },
   { id: "footsteps", label: "Footsteps", Icon: FootstepsIcon },
  { id: "visited", label: "Visited", Icon: ClockIcon },
  { id: "popular", label: "Popular", Icon: PopularIcon },
  { id: "favorites", label: "Favorites", Icon: HeartIcon },
  { id: "restaurants", label: "Restaurants", Icon: RestaurantsIcon },
  { id: "cafes", label: "Cafes", Icon: CoffeeIcon },
  { id: "parks", label: "Parks", Icon: TreeIcon },
  { id: "shops", label: "Shops", Icon: ShopsIcon },
];

function Pill({ label, Icon, onPress }) {
  const scale = useSharedValue(1);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[styles.pill, pressStyle]}
      onPressIn={() => {
        scale.value = withTiming(PRESS_SCALE, { duration: PRESS_DURATION });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: PRESS_DURATION });
      }}
      onPress={onPress}
    >
      {!!Icon && (
        <Icon width={ICON_SIZE} height={ICON_SIZE} style={styles.pillIcon} />
      )}
      <Text style={styles.pillLabel}>{label}</Text>
    </AnimatedPressable>
  );
}

export default function MapPillBar({
  visible = true,
  topOffset = 8,
  onSelect,
}) {
  const insets = useSafeAreaInsets();
  const opacity = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: FADE_DURATION });
  }, [visible, opacity]);

  const fadeStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[styles.wrapper, { top: insets.top + topOffset }, fadeStyle]}
      // Flips right away rather than after the fade, so a hidden row never swallows a tap meant for the map underneath
      pointerEvents={visible ? "auto" : "none"}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {PILLS.map((pill) => (
          <Pill
            key={pill.id}
            label={pill.label}
            Icon={pill.Icon}
            onPress={() => onSelect?.(pill.id)}
          />
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  // Padding lives here rather than on the ScrollView so the pill shadows aren't clipped at the edges of the scroll area
  content: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 100,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    shadowOpacity: 0.16,
    elevation: 4,
  },
  pillIcon: {
    marginRight: 4,
  },
  pillLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1a1c1e",
  },
});