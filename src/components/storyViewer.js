import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Modal,
  Animated,
  Easing,
} from "react-native";

const IMAGE_DURATION_MS = 5000; // how long each photo stays up
const TAP_MAX_MS = 250; // shorter = tap (advance), longer = hold (pause)

// same seed bomb sticker used on the camera preview
const CLEANUP_STAMP = require("../../assets/stickers/seedbombstamp.png");

export default function StoryViewer({
  visible,
  stories = [],
  initialIndex = 0,
  onClose,
}) {
  const [index, setIndex] = useState(initialIndex);
  const [isPaused, setIsPaused] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef(null);
  const pausedAtRef = useRef(0);
  const pressStartRef = useRef(0);

  const story = stories[index];

  useEffect(() => {
    if (!visible) return;
    setIndex(initialIndex);
    setIsPaused(false);
    pausedAtRef.current = 0;
    progressAnim.setValue(0);
  }, [visible, initialIndex, progressAnim]);

  useEffect(() => {
    if (!visible || !story || isPaused) return;

    const fromValue = pausedAtRef.current;
    progressAnim.setValue(fromValue);

    animationRef.current = Animated.timing(progressAnim, {
      toValue: 1,
      duration: IMAGE_DURATION_MS * (1 - fromValue),
      easing: Easing.linear,
      useNativeDriver: false,
    });

    animationRef.current.start(({ finished }) => {
      if (finished) goToNext();
    });

    return () => {
      if (animationRef.current) animationRef.current.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, index, isPaused]);

  useEffect(() => {
    pausedAtRef.current = 0;
    progressAnim.setValue(0);
  }, [index, progressAnim]);

  function goToNext() {
    pausedAtRef.current = 0;
    if (index + 1 < stories.length) {
      setIndex(index + 1);
    } else {
      onClose();
    }
  }

  function pause() {
    setIsPaused(true);
    progressAnim.stopAnimation((value) => {
      pausedAtRef.current = value;
    });
  }

  function handlePressIn() {
    pressStartRef.current = Date.now();
    pause();
  }

  function handlePressOut() {
    const heldFor = Date.now() - pressStartRef.current;
    if (heldFor < TAP_MAX_MS) {
      setIsPaused(false);
      pausedAtRef.current = 0;
      goToNext();
    } else {
      setIsPaused(false);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {story ? (
          <>
            <Image
              source={{ uri: story.media }}
              style={styles.media}
              resizeMode="contain"
            />

            {/* seed bomb stamp overlay - pointerEvents none so taps pass
                through to the tap-to-advance area below */}
            <Image
              source={CLEANUP_STAMP}
              style={styles.cleanupStamp}
              resizeMode="contain"
              pointerEvents="none"
            />

            <Pressable
              style={styles.tapArea}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            />

            <View style={styles.progressRow}>
              {stories.map((item, segmentIndex) => (
                <View key={item.id} style={styles.progressTrack}>
                  {segmentIndex < index ? (
                    <View style={styles.progressFilled} />
                  ) : segmentIndex === index ? (
                    <Animated.View
                      style={[
                        styles.progressFilled,
                        {
                          width: progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ["0%", "100%"],
                          }),
                        },
                      ]}
                    />
                  ) : null}
                </View>
              ))}
            </View>

            <View style={styles.headerRow}>
              {story.profiles?.avatar ? (
                <Image
                  source={{ uri: story.profiles.avatar }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatar} />
              )}
              <Text style={styles.username}>
                {story.profiles?.username ?? "Someone"}
              </Text>
              <View style={{ flex: 1 }} />
              <Pressable onPress={onClose} hitSlop={12}>
                <Text style={styles.close}>✕</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <Pressable style={styles.tapArea} onPress={onClose}>
            <Text style={styles.emptyText}>No stories posted yet.</Text>
          </Pressable>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  media: { width: "100%", height: "100%" },
  tapArea: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  cleanupStamp: {
    position: "absolute",
    top: 160,
    left: 24,
    width: 190,
    height: 152,
    transform: [{ rotate: "-15deg" }],
  },
  progressRow: {
    position: "absolute",
    top: 54,
    left: 12,
    right: 12,
    flexDirection: "row",
    gap: 4,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.35)",
    overflow: "hidden",
  },
  progressFilled: {
    height: "100%",
    width: "100%",
    borderRadius: 2,
    backgroundColor: "#FFF",
  },
  headerRow: {
    position: "absolute",
    top: 66,
    left: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: "#FFF",
    backgroundColor: "#555",
    marginRight: 10,
  },
  username: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  close: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "600",
    paddingHorizontal: 6,
  },
  emptyText: { color: "#FFF", fontSize: 16, textAlign: "center" },
});