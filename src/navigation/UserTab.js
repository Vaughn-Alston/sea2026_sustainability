import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, StyleSheet, Pressable, Text, Button } from "react-native";
import { supabase } from "../../utils/hooks/supabase";
// Import the Supabase client
// Screens
import MapScreen from "../screens/MapScreen";
import CameraScreen from "../screens/CameraScreen";
import StoriesScreen from "../screens/StoriesScreen";
import SpotlightScreen from "../screens/SpotlightScreen";
import ChatScreen from "../screens/ChatScreen";

// Stacks
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  CameraOutline,
  LensSearchFill,
  ChatOutline,
  ChatFill,
  GroupOutline,
  GroupFill,
  MapPinOutline,
  MapPinFill,
  PlayOutline,
  PlayFill,
} from "../../assets/snapchat/NavigationIcons";
import { colors } from "../../assets/themes/colors";

const Tab = createBottomTabNavigator();

export default function UserStack({ route, navigation }) {
  // Sign-out logic using Supabase
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error.message);
      } else {
        // Handle successful sign out (e.g., redirect to login screen)
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const screenOptions = {
    tabBarShowLabel: false,
    headerLeft: () => <Button onPress={handleSignOut} title="Log Out" />,
  };

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      activeColor="#f0edf6"
      inactiveColor="#3e2465"
      barStyle={{ backgroundColor: "black" }}
      initialRouteName="Camera"
    >
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{ ...screenOptions, headerShown: false }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{ ...screenOptions, headerShown: false }}
      />
      <Tab.Screen
        name="Camera"
        component={CameraScreen}
        options={{ ...screenOptions, headerShown: false }}
      />
      <Tab.Screen
        name="Stories"
        component={StoriesScreen}
        options={{ ...screenOptions, headerShown: false }}
      />
      <Tab.Screen
        name="Spotlight"
        component={SpotlightScreen}
        options={screenOptions}
      />
    </Tab.Navigator>
  );
}

const getTabIcon = (routeName, focused, color) => {
  switch (routeName) {
    case "Map":
      return focused ? <MapPinFill color={color} /> : <MapPinOutline color={color} />;
    case "Chat":
      return focused ? <ChatFill color={color} /> : <ChatOutline color={color} />;
    case "Camera":
      return focused ? <LensSearchFill color={color} /> : <CameraOutline color={color} />;
    case "Stories":
      return focused ? <GroupFill color={color} /> : <GroupOutline color={color} />;
    case "Spotlight":
      return focused ? <PlayFill color={color} /> : <PlayOutline color={color} />;
    case "Event":
      return focused ? <PlayFill color={color} /> : <PlayOutline color={color} />;
    default:
      return null;
  }
};

const CustomTabBar = (props) => {
  const { state, descriptors, navigation } = props;
  const insets = useSafeAreaInsets();
  const isCameraActive = state.routes[state.index]?.name === "Camera";

  return (
    <View
      style={[
        styles.container,
        isCameraActive && styles.cameraContainer,
        { paddingBottom: insets.bottom },
      ]}
    >
      <View
        style={[
          styles.grayRectangle,
          isCameraActive && styles.cameraRectangle,
        ]}
      >
        {state.routes.map((route, index) => {
          const isActive = state.index === index;
          const tabStyle = isActive ? styles.activeTab : styles.inactiveTab;

          return (
            <Pressable
              key={route.key}
              style={[styles.tab, tabStyle]}
              onPress={() => navigation.navigate(route.name)}
            >
              {getTabIcon(route.name, isActive, isCameraActive ? "#fff" : null)}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    backgroundColor: "white",
    borderRadius: 24,
    padding: 16,
    bottom: 0,
  },
  cameraContainer: {
    backgroundColor: "#000",
  },
  grayRectangle: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: colors.belowPage,
    borderRadius: 100,
    height: 48,
  },
  cameraRectangle: {
    backgroundColor: "#000",
  },
  tab: {
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    // Add styles for active tab if needed
  },
  inactiveTab: {
    // Add styles for inactive tab if needed
  },
});
