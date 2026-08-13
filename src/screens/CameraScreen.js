import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import Ionicons from "@expo/vector-icons/Ionicons";
import MarkPopUp from "../components/MarkPopUp";
import { useIsFocused } from "@react-navigation/native";

const CLEANUP_STAMP = require("../../assets/stickers/seedbombstamp.png");

const NOTIF_ICON = require("../../assets/camera-icons/notif.png");
const FRIEND_ICON = require("../../assets/camera-icons/friend.png");
const FLIP_ICON = require("../../assets/camera-icons/flip.png");
const FLASH_ICON = require("../../assets/camera-icons/flash.png");
const MUSIC_ICON = require("../../assets/camera-icons/music.png");
const RECORD_ICON = require("../../assets/camera-icons/record.png");
const HD_ICON = require("../../assets/camera-icons/hd.png");
const ARROW_ICON = require("../../assets/camera-icons/arrow.png");

const EDIT_ICONS = [
  [
    { id: "text", source: require("../../assets/camera-icons/edit-tools/text.png"), size: 25 },
    { id: "draw", source: require("../../assets/camera-icons/edit-tools/draw.png"), size: 23 },
    { id: "sticker", source: require("../../assets/camera-icons/edit-tools/sticker.png"), size: 23 },
    { id: "scissors", source: require("../../assets/camera-icons/edit-tools/scissors.png"), size: 23 },
  ],
  [
    { id: "music", source: require("../../assets/camera-icons/edit-tools/music.png"), size: 25 },
    { id: "facescan", source: require("../../assets/camera-icons/edit-tools/facescan.png"), size: 26 },
    { id: "smiley", source: require("../../assets/camera-icons/edit-tools/smiley.png"), size: 26 },
    { id: "enhance", source: require("../../assets/camera-icons/edit-tools/enhance.png"), large: true },
  ],
  [
    { id: "wand", source: require("../../assets/camera-icons/edit-tools/wand.png"), size: 25 },
    { id: "eraser", source: require("../../assets/camera-icons/edit-tools/eraser.png"), size: 24 },
    { id: "paperclip", source: require("../../assets/camera-icons/edit-tools/paperclip.png"), size: 26 },
    { id: "crop", source: require("../../assets/camera-icons/edit-tools/crop.png"), size: 25 },
    { id: "timer", source: require("../../assets/camera-icons/edit-tools/timer.png"), size: 24 },
  ],
];

export default function CameraScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState("back");
  const [photoUri, setPhotoUri] = useState(null);
  const [photoTakenAt, setPhotoTakenAt] = useState(null);
  const [markPopupVisible, setMarkPopupVisible] = useState(false);
  const cameraRef = useRef(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      setPhotoUri(null);
      setPhotoTakenAt(null);
    }
  }, [isFocused]);

  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: photoUri ? { display: "none" } : undefined,
    });

    return () => navigation.setOptions({ tabBarStyle: undefined });
  }, [navigation, photoUri]);

  const takePhoto = async () => {
    if (!cameraRef.current) return;

    const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
    if (photo) {
      setPhotoUri(photo.uri);
      setPhotoTakenAt(new Date());
    }
  };

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionScreen}>
        <Text style={styles.permissionText}>Snap needs camera access.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Enable Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (photoUri) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.overlay}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setPhotoUri(null)}>
            <Ionicons name="close" size={26} color="#fff" />
          </TouchableOpacity>

          <View style={styles.editIconsRail}>
            {EDIT_ICONS.map((group, groupIndex) => (
              <View
                key={groupIndex}
                style={[
                  styles.editIconsGroup,
                  groupIndex !== EDIT_ICONS.length - 1 && styles.editIconsGroupSpacing,
                ]}
              >
                {group.map((icon) => (
                  <Image
                    key={icon.id}
                    source={icon.source}
                    style={[
                      styles.editIcon,
                      { width: icon.large ? 34 : icon.size, height: icon.large ? 34 : icon.size },
                    ]}
                    resizeMode="contain"
                  />
                ))}
              </View>
            ))}
          </View>

          <Image source={CLEANUP_STAMP} style={styles.cleanupStamp} resizeMode="contain" />

          <View style={styles.previewActions}>
            <TouchableOpacity
              style={styles.darkActionButton}
              onPress={() => setMarkPopupVisible(true)}
            >
              <View style={styles.saveSymbol}>
                <Ionicons name="arrow-down" size={27} color="#fff" />
                <View style={styles.saveLine} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.storiesButton}
              onPress={() => {}}
            >
              <Text style={styles.darkActionText}>Stories</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sendButton}
              onPress={() => navigation.navigate("SendTo", { photoUri, photoTakenAt })}
            >
              <Text style={styles.sendButtonText}>Send To</Text>
              <Ionicons name="send" size={24} color="#111" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <MarkPopUp
          visible={markPopupVisible}
          date={photoTakenAt || new Date()}
          photoUri={photoUri}
          onDone={() => setMarkPopupVisible(false)}
          onViewImpact={() => {
            setMarkPopupVisible(false);
            navigation.navigate("Impact");
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} />
      <SafeAreaView style={styles.overlay}>
        <View style={styles.topIconsRow}>
          <TouchableOpacity>
            <Image source={NOTIF_ICON} style={styles.notifIcon} resizeMode="contain" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image source={FRIEND_ICON} style={styles.friendIcon} resizeMode="contain" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFacing((current) => (current === "back" ? "front" : "back"))}
          >
            <Image source={FLIP_ICON} style={styles.topIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        <View style={styles.rightRail}>
          <TouchableOpacity style={styles.railButton}>
            <Image source={FLASH_ICON} style={styles.railIcon} resizeMode="contain" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.railButton}>
            <Image source={MUSIC_ICON} style={styles.railIcon} resizeMode="contain" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.railButton}>
            <Image source={RECORD_ICON} style={styles.railIcon} resizeMode="contain" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.railButton}>
            <Image source={HD_ICON} style={styles.railIcon} resizeMode="contain" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.railButton}>
            <Image source={ARROW_ICON} style={styles.arrowIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        <View style={styles.captureArea}>
          <TouchableOpacity
            accessibilityLabel="Take photo"
            style={styles.shutterOuter}
            onPress={takePhoto}
          >
            <View style={styles.shutterInner} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  permissionScreen: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  permissionText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: "#FFFC00",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  permissionButtonText: {
    color: "#111",
    fontWeight: "800",
  },
  overlay: {
    flex: 1,
  },
  topIconsRow: {
    position: "absolute",
    top: 66,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  topIcon: {
    width: 24,
    height: 24,
  },
  notifIcon: {
    width: 24,
    height: 24,
    transform: [{ translateX: -4 }],
  },
  friendIcon: {
    width: 40,
    height: 40,
    transform: [{ translateY: -8 }, { translateX: 5 }],
  },
  rightRail: {
    position: "absolute",
    top: 123,
    right: 14,
    alignItems: "center",
  },
  railButton: {
    marginBottom: 23,
  },
  railIcon: {
    width: 24,
    height: 24,
  },
  arrowIcon: {
    width: 29,
    height: 29,
  },
  captureArea: {
    position: "absolute",
    bottom: 112,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  shutterOuter: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 4,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#fff",
  },
  closeButton: {
    alignSelf: "flex-start",
    marginTop: 12,
    marginLeft: 18,
  },
  editIconsRail: {
    position: "absolute",
    top: 60,
    right: 16,
    alignItems: "center",
  },
  editIconsGroup: {
    alignItems: "center",
  },
  editIconsGroupSpacing: {
    marginBottom: 5,
  },
  editIcon: {
    marginBottom: 20,
  },
  cleanupStamp: {
    position: "absolute",
    top: 160,
    left: 24,
    width: 190,
    height: 152,
    transform: [{ rotate: "-15deg" }],
  },
  previewActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#000",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 42,
  },
  darkActionButton: {
    width: 70,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#313131",
    alignItems: "center",
    justifyContent: "center",
  },
  saveSymbol: {
    alignItems: "center",
  },
  saveLine: {
    width: 22,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#fff",
    marginTop: -3,
  },
  storiesButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#313131",
    alignItems: "center",
    justifyContent: "center",
  },
  darkActionText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  sendButton: {
    flex: 1.1,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFC00",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  sendButtonText: {
    color: "#111",
    fontSize: 17,
    fontWeight: "800",
  },
});
