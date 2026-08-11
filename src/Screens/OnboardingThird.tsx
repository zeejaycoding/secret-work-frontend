import React from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  Image,
  StatusBar,
  Text,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import { useBranding } from "../context/BrandingContext";

const OnboardingThird = () => {
  const navigation = useNavigation<any>();
  const { primaryColor } = useBranding();
  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <ImageBackground
        source={require("../assets/onboarding.png")}
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
            "rgba(0,0,0,0.90)",
          ]}
          locations={[0, 0.2, 0.35, 0.5, 0.65, 0.8, 0.9, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.bottomOverlay}
        />

        <View style={styles.contentContainer}>
          <Image
            source={require("../assets/logo.png")}
            resizeMode="contain"
            style={styles.logo}
          />

          <View style={styles.bottomContent}>
            <View style={styles.indicatorContainer}>
              <View style={styles.inactiveIndicator} />
              <View style={styles.inactiveIndicator} />
              <View style={[styles.activeIndicator, { backgroundColor: primaryColor }]} />
            </View>

            <Text style={styles.title}>
              See Real <Text style={[styles.redText, { color: primaryColor }]}>Progress</Text>
            </Text>

            <Text style={styles.description}>
              Track your growth, stay disciplined, and become the player you’re
              working to be.
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.getStartedBtn, { backgroundColor: primaryColor }]}
              onPress={() => navigation.navigate("Signin")}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.signInBtn}
              onPress={() => navigation.navigate("Signin")}
            >
              <Text style={styles.signInText}>Sign in</Text>
            </TouchableOpacity>

            <Text style={styles.footerText}>
              By continuing, you agree to our{"\n"}
              <Text style={styles.footerLink}>Terms</Text> and{" "}
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

export default OnboardingThird;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  backgroundImage: {
    flex: 1,
    width: responsiveWidth(100),
    height: responsiveHeight(65),
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
    height: responsiveHeight(45),
  },

  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: responsiveHeight(6),
    paddingBottom: responsiveHeight(4),
  },

  logo: {
    width: responsiveWidth(28),
    height: responsiveHeight(7),
  },

  bottomContent: {
    width: responsiveWidth(90),
    alignItems: "center",
  },

  indicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: responsiveHeight(2),
  },

  activeIndicator: {
    width: responsiveWidth(8),
    height: responsiveHeight(0.4),
    backgroundColor: "#E50914",
    borderRadius: moderateScale(50),
    marginRight: responsiveWidth(1),
  },

  inactiveIndicator: {
    width: responsiveWidth(3),
    height: responsiveHeight(0.4),
    backgroundColor: "#2A2A2A",
    borderRadius: moderateScale(50),
    marginRight: responsiveWidth(1),
  },

  title: {
    color: "#FFFFFF",
    fontSize: moderateScale(22),
    textAlign: "center",
    marginBottom: responsiveHeight(0),
    fontFamily: "Poppins-Medium",
  },

  redText: {
    color: "#E50914",
  },

  description: {
    width: responsiveWidth(78),
    color: "#6B6B6B",
    fontSize: moderateScale(14),
    textAlign: "center",
    lineHeight: moderateScale(16),
    marginBottom: responsiveHeight(2),
    fontFamily: "Poippins-Regular",
  },

  getStartedBtn: {
    width: responsiveWidth(88),
    height: responsiveHeight(6.5),
    backgroundColor: "#E50914",
    borderRadius: moderateScale(12),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: responsiveHeight(1.2),
  },

  getStartedText: {
    color: "#FFFFFF",
    fontSize: moderateScale(15),
    fontFamily: "Inter-Medium",
  },

  signInBtn: {
    width: responsiveWidth(88),
    height: responsiveHeight(6.5),
    backgroundColor: "#111111",
    borderRadius: moderateScale(12),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: responsiveHeight(8),
  },

  signInText: {
    color: "#FFFFFF",
    fontSize: moderateScale(15),
    fontFamily: "Inter-Medium",
  },

  footerText: {
    color: "#929292",
    fontSize: moderateScale(12),
    textAlign: "center",
    lineHeight: moderateScale(20),
    fontFamily: "Poppins-Regular",
  },

  footerLink: {
    color: "#FFFFFF",
    textDecorationLine: "underline",
    fontFamily: "Poppins-Regular",
  },
});
