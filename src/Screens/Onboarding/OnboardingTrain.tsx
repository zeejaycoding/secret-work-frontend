import React, { useState } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Text,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { useBranding } from "../../context/BrandingContext";

const OnboardingTrain = () => {
  const navigation = useNavigation<any>();
  const { primaryColor } = useBranding();
  const [selectedLevel, setSelectedLevel] = useState("Beginner");

  const levels = [
    {
      id: 1,
      title: "Quick daily drills",
      subtitle: "10-15 mins",
      image: require("../../assets/daily.png"),
    },
    {
      id: 2,
      title: "Full workouts",
      subtitle: "45-60 mins",
      image: require("../../assets/full.png"),
    },
    {
      id: 3,
      title: "Custom Training",
      subtitle: "Build your own",
      image: require("../../assets/custom.png"),
    },
  ];

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
          "rgba(0,0,0,0.70)",
          "rgba(0,0,0,0.25)",
          "rgba(0,0,0,0.05)",
          "rgba(0,0,0,0.25)",
          "rgba(0,0,0,0.70)",
        ]}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.sideOverlay}
      />

      <LinearGradient
        colors={[
          "transparent",
          "rgba(0,0,0,0.05)",
          "rgba(0,0,0,0.12)",
          "rgba(0,0,0,0.20)",
          "rgba(0,0,0,0.35)",
          "rgba(0,0,0,0.50)",
          "rgba(0,0,0,0.75)",
          "#000",
        ]}
        locations={[0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.bottomOverlay}
      />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={moderateScale(19)} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.step}>Step 5 of 5</Text>

          <View style={{ width: responsiveWidth(8) }} />
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.fill, { width: "100%", backgroundColor: primaryColor }]} />
        </View>

        <Text style={styles.title}>How do you train?</Text>

        <Text style={styles.subtitle}>We'll tailor your sessions.</Text>

        <View style={styles.optionsWrapper}>
          {levels.map((item, index) => {
            const isSelected = selectedLevel === item.title;

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                onPress={() => setSelectedLevel(item.title)}
                style={[styles.optionCard, isSelected && styles.selectedCard]}
              >
                <Image
                  source={item.image}
                  style={styles.optionImage}
                  resizeMode="contain"
                />

                <View style={styles.textWrapper}>
                  <Text style={styles.optionTitle}>{item.title}</Text>

                  <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: primaryColor }]}
          onPress={() => navigation.navigate("Subscription")}
        >
          <Text style={styles.buttonText}>Next</Text>

          <Feather
            name="arrow-right"
            size={moderateScale(17)}
            style={{ marginTop: responsiveHeight(0.5) }}
            color="#fff"
          />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.skipWrapper}
          onPress={() => navigation.navigate("Subscription")}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OnboardingTrain;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  content: {
    flex: 1,
    paddingHorizontal: responsiveWidth(5),
    paddingTop: responsiveHeight(7),
  },

  redHorizontal: {
    position: "absolute",
    top: 0,
    width: responsiveWidth(100),
    height: responsiveHeight(30),
  },

  redVertical: {
    position: "absolute",
    top: 0,
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
    height: responsiveHeight(40),
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: responsiveHeight(2),
  },

  backButton: {
    width: responsiveWidth(8),
    justifyContent: "center",
    alignItems: "flex-start",
  },

  step: {
    color: "#fff",
    fontSize: moderateScale(12.5),
    textAlign: "center",
    fontFamily: "Poppins-Medium",
  },

  progressBar: {
    width: "100%",
    height: responsiveHeight(1),
    backgroundColor: "#161616",
    borderRadius: moderateScale(100),
    overflow: "hidden",
    marginBottom: responsiveHeight(2.5),
  },

  fill: {
    height: "100%",
    backgroundColor: "#FF1F2D",
  },

  title: {
    color: "#fff",
    fontSize: moderateScale(17),
    fontFamily: "Poppins-Medium",
  },

  subtitle: {
    color: "#6B6B6B",
    fontSize: moderateScale(12),
    marginBottom: responsiveHeight(1),
    fontFamily: "Poppins-Regular",
  },

  optionsWrapper: {
    gap: responsiveHeight(1.4),
    marginTop: responsiveHeight(1),
  },

  optionCard: {
    width: "100%",
    minHeight: responsiveHeight(7.8),
    borderRadius: moderateScale(10),
    backgroundColor: "#0A0A0A",
    borderWidth: 1,
    borderColor: "#0A0A0A",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(0),
  },

  selectedCard: {
    backgroundColor: "#1A0002",
    borderColor: "#E50914",
  },

  optionImage: {
    width: responsiveWidth(4),
    height: responsiveWidth(4),
  },

  textWrapper: {
    marginLeft: responsiveWidth(3),
  },

  optionTitle: {
    color: "#FFFFFF",
    fontSize: moderateScale(14),
    fontFamily: "Poppins-Medium",
  },

  optionSubtitle: {
    color: "#6B6B6B",
    fontSize: moderateScale(10),
    fontFamily: "Poppins-Regular",
  },

  button: {
    flexDirection: "row",
    gap: responsiveWidth(2),
    width: responsiveWidth(90),
    height: responsiveHeight(6.5),
    borderRadius: moderateScale(12),
    justifyContent: "center",
    alignItems: "center",
    marginTop: responsiveHeight(4),
    alignSelf: "center",
    backgroundColor: "#FF0015",
  },

  buttonText: {
    color: "#fff",
    fontSize: moderateScale(15),
    fontFamily: "Inter-Medium",
  },

  skipWrapper: {
    alignItems: "center",
    marginTop: responsiveHeight(2),
  },

  skipText: {
    color: "#FFFFFF",
    fontSize: moderateScale(13),
    fontFamily: "Poppins-Medium",
  },
});
