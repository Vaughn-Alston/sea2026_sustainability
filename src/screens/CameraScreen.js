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

const CLEANUP_STAMP = require("../../assets/stickers/group-141.png");

export default function CameraScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState("back");
  const [photoUri, setPhotoUri] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: photoUri ? { display: "none" } : undefined,
    });

    return () => navigation.setOptions({ tabBarStyle: undefined });
  }, [navigation, photoUri]);

  const takePhoto = async () => {
    if (!cameraRef.current) return;

    const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
    if (photo) setPhotoUri(photo.uri);
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
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>

          <Image source={CLEANUP_STAMP} style={styles.cleanupStamp} resizeMode="contain" />

          <View style={styles.previewActions}>
            <TouchableOpacity
              style={styles.darkActionButton}
              onPress={() => {}}
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
              onPress={() => navigation.navigate("SendTo", { photoUri })}
            >
              <Text style={styles.sendButtonText}>Send To</Text>
              <Ionicons name="send" size={24} color="#111" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} />
      <SafeAreaView style={styles.overlay}>
        <TouchableOpacity
          style={styles.flipButton}
          onPress={() => setFacing((current) => (current === "back" ? "front" : "back"))}
        >
          <Ionicons name="sync-outline" size={24} color="#fff" />
        </TouchableOpacity>

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
  flipButton: {
    alignSelf: "flex-end",
    marginTop: 14,
    marginRight: 18,
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
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "700",
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
