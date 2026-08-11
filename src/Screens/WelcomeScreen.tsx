import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  Image,
  StatusBar,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";

const WelcomeScreen = () => {
  const navigation = useNavigation<any>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("OnboardingFirst");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);
  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <ImageBackground
        source={require("../assets/onboarding-first.png")}
        resizeMode="cover"
        style={styles.backgroundImage}
      >
        <LinearGradient
          colors={[
            "rgba(120,0,10,0.30)",
            "rgba(180,0,15,0.20)",
            "rgba(255,0,21,0.10)",
            "rgba(255,0,21,0.05)",
            "transparent",
          ]}
          locations={[0, 0.25, 0.5, 0.75, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.redHorizontal}
        />

        <LinearGradient
          colors={[
            "rgba(255,0,21,0.08)",
            "rgba(255,0,21,0.05)",
            "rgba(255,0,21,0.03)",
            "rgba(255,0,21,0.015)",
            "rgba(255,0,21,0.005)",
            "transparent",
          ]}
          locations={[0, 0.2, 0.4, 0.6, 0.8, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.redVertical}
        />

        <LinearGradient
          colors={[
            "rgba(0,0,0,0.55)",
            "rgba(0,0,0,0.20)",
            "rgba(0,0,0,0.05)",
            "rgba(0,0,0,0.20)",
            "rgba(0,0,0,0.55)",
          ]}
          locations={[0, 0.25, 0.5, 0.75, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.sideOverlay}
        />

        <LinearGradient
          colors={[
            "transparent",
            "rgba(0,0,0,0.02)",
            "rgba(0,0,0,0.06)",
            "rgba(0,0,0,0.10)",
            "rgba(0,0,0,0.18)",
            "rgba(0,0,0,0.22)",
            "rgba(0,0,0,0.25)",
            "rgba(0,0,0,0.28)",
          ]}
          locations={[0, 0.2, 0.35, 0.5, 0.65, 0.8, 0.9, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.bottomOverlay}
        />

        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/logo.png")}
            resizeMode="contain"
            style={styles.logo}
          />
        </View>
      </ImageBackground>
    </View>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  backgroundImage: {
    flex: 1,
    width: responsiveWidth(100),
    height: responsiveHeight(100),
    justifyContent: "center",
    alignItems: "center",
  },

  redHorizontal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    width: responsiveWidth(100),
    height: responsiveHeight(30),
  },

  redVertical: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    width: responsiveWidth(100),
    height: responsiveHeight(55),
  },

  sideOverlay: {
    position: "absolute",
    width: responsiveWidth(100),
    height: responsiveHeight(100),
  },

  bottomOverlay: {
    position: "absolute",
    bottom: 0,
    width: responsiveWidth(100),
    height: responsiveHeight(35),
  },

  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    width: responsiveWidth(30),
    height: responsiveHeight(12),
    maxWidth: moderateScale(180),
    maxHeight: moderateScale(120),
  },
});
