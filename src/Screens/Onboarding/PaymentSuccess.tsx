import React, { useState } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { completeOnboarding } from "../../services/api";
import { useBranding } from "../../context/BrandingContext";

const PaymentSuccess = () => {
  const navigation = useNavigation<any>();
  const { primaryColor } = useBranding();
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    setIsLoading(true);
    try {
      await completeOnboarding();
      navigation.navigate("BottomTabs");
    } catch {
      navigation.navigate("BottomTabs");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

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

      <View style={styles.contentContainer}>
        <View style={styles.iconOuter}>
          <View style={styles.iconInner}>
            <Feather name="check" size={moderateScale(34)} color="#5A0007" />
          </View>
        </View>

        <Text style={styles.title}>Payment success</Text>

        <Text style={styles.subtitle}>
          Your payment has been processed successfully. You can start enjoying
          the full app benefits
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.button, { backgroundColor: primaryColor }]}
          onPress={handleStart}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.buttonText}>Start exploring</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PaymentSuccess;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
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

  contentContainer: {
    width: responsiveWidth(100),
    alignItems: "center",
    paddingHorizontal: moderateScale(20),
    marginTop: responsiveHeight(-15),
  },

  iconOuter: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(100),
    backgroundColor: "#660008",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: responsiveHeight(3),
  },

  iconInner: {
    width: moderateScale(62),
    height: moderateScale(62),
    borderRadius: moderateScale(100),
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    color: "#FFFFFF",
    fontSize: moderateScale(25),
    fontFamily: "Poppins-Medium",
    textAlign: "center",
  },

  subtitle: {
    color: "#6B6B6B",
    fontSize: moderateScale(12),
    textAlign: "center",
    lineHeight: moderateScale(18),
    fontFamily: "Poppins-Regular",
    width: responsiveWidth(65),
    marginBottom: responsiveHeight(3),
  },

  button: {
    width: responsiveWidth(92),
    height: responsiveHeight(6.5),
    borderRadius: moderateScale(12),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: responsiveHeight(3),
    backgroundColor: "#E50914",
  },

  buttonText: {
    color: "#fff",
    fontSize: moderateScale(14),
    fontFamily: "Inter-Medium",
  },
});
