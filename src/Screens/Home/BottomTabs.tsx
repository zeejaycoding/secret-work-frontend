import React from "react";
import { StyleSheet, View, Image } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "./HomeScreen";
import DrillLibraryScreen from "../DrillLibrary/DrilLibraryMainScreen";
import WorkoutScreen from "../WorkOut/WorkOutMainScreen";
import PodcastsScreen from "../Podcast/PodcastMainScreen";
import ProfileScreen from "../Profile/ProfileMainScreen";
import { moderateScale } from "react-native-size-matters";
import { BlurView } from "expo-blur";
import { useBranding } from "../../context/BrandingContext";

import {
  responsiveWidth,
  responsiveHeight,
} from "react-native-responsive-dimensions";

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  const { primaryColor } = useBranding();

  const tabIcon = (focused: boolean, active: any, inactive: any) => (
    <View
      style={[
        styles.iconContainer,
        focused && [styles.activeIconContainer, { backgroundColor: primaryColor }],
      ]}
    >
      <Image
        source={focused ? active : inactive}
        style={styles.icon}
        resizeMode="contain"
      />
    </View>
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBarStyle,
        tabBarItemStyle: styles.tabBarItemStyle,
        tabBarBackground: () => (
          <BlurView intensity={0} tint="dark" style={StyleSheet.absoluteFill} />
        ),
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) =>
            tabIcon(focused, require("../../assets/homeactive.png"), require("../../assets/homeinactive.png")),
        }}
      />

      <Tab.Screen
        name="Drills"
        component={DrillLibraryScreen}
        options={{
          tabBarIcon: ({ focused }) =>
            tabIcon(focused, require("../../assets/drilactive.png"), require("../../assets/drilinactive.png")),
        }}
      />

      <Tab.Screen
        name="Podcasts"
        component={PodcastsScreen}
        options={{
          tabBarIcon: ({ focused }) =>
            tabIcon(focused, require("../../assets/podactive.png"), require("../../assets/podinactive.png")),
        }}
      />

      <Tab.Screen
        name="Workout"
        component={WorkoutScreen}
        options={{
          tabBarIcon: ({ focused }) =>
            tabIcon(focused, require("../../assets/workactive.png"), require("../../assets/workinactive.png")),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) =>
            tabIcon(focused, require("../../assets/profileactive.png"), require("../../assets/profileinactive.png")),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabs;

const styles = StyleSheet.create({
  tabBarStyle: {
    position: "absolute",
    bottom: responsiveHeight(2),
    height: responsiveHeight(6.5),
    backgroundColor: "#121516CC",
    marginHorizontal: responsiveWidth(7.5),
    borderRadius: moderateScale(50),
    borderTopWidth: 0,
    elevation: 0,
    shadowColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: responsiveWidth(2),
  },

  tabBarItemStyle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },

  iconContainer: {
    width: responsiveWidth(17),
    height: responsiveWidth(9),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: moderateScale(100),
    marginTop: responsiveHeight(2),
  },

  activeIconContainer: {
    backgroundColor: "red",
  },

  icon: {
    width: responsiveWidth(5.5),
    height: responsiveWidth(5.5),
    resizeMode: "contain",
  },
});
