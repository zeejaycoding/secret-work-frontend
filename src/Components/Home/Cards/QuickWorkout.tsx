import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveWidth,
  responsiveHeight,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import { getTopCoach } from "../../../services/api";
import { useAppTheme, ThemeColors } from "../../../context/ThemeContext";
import { useLanguage } from "../../../i18n";

const QuickWorkout = () => {
  const navigation = useNavigation<any>();
  const { colors, isDarkMode } = useAppTheme();
  const styles = createStyles(colors);
  const { t } = useLanguage();
  const [coachName, setCoachName] = useState("");
  const gradientColors = (
    isDarkMode
      ? [
          "rgba(0, 0, 0, 0.75)",
          "rgba(32, 0, 35, 0.85)",
          "rgba(77, 0, 80, 0.95)",
          "rgba(33, 0, 35, 0.85)",
          "rgba(0, 0, 0, 0.75)",
        ]
      : [
          "rgba(229,9,192,0.04)",
          "rgba(229,9,192,0.07)",
          "rgba(229,9,192,0.10)",
          "rgba(229,9,192,0.07)",
          "rgba(229,9,192,0.04)",
        ]
  ) as [string, string, string, string, string];

  useEffect(() => {
    let mounted = true;

    getTopCoach()
      .then((top) => {
        if (mounted && top?.coachName) setCoachName(top.coachName);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.learnCard}>
      <LinearGradient
        colors={gradientColors}
        locations={[0, 0.2, 0.5, 0.8, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.gradientBackground}
      />

      <TouchableOpacity
        onPress={() =>
          navigation.navigate("QuickWorkoutFirst", {
            coach: coachName || undefined,
          })
        }
      >
        <View style={styles.learnContent}>
          <View style={styles.learnLeft}>
            <Image
              source={require("../../../assets/quick.png")}
              style={styles.image}
            />

            <View style={styles.textContainer}>
              <Text style={styles.learnTitle}>
                {t("quickWorkoutsWith", { name: coachName || "Coach Hudson" })}
              </Text>

              <Text
                style={[styles.learnDesc, { color: isDarkMode ? "#AB65A8" : "#8A3A86" }]}
              >
                {t("wednesday8pmEst")}
              </Text>
            </View>
          </View>

          <Ionicons
            name="arrow-forward"
            size={moderateScale(18)}
            color="#e509c0cb"
          />
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default QuickWorkout;

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  learnCard: {
    width: responsiveWidth(93),
    alignSelf: "center",
    marginTop: responsiveHeight(2),
    borderRadius: moderateScale(12),
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(229,9,192,0.15)",
    backgroundColor: colors.backgroundElevated,
    position: "relative",
  },

  image: {
    width: responsiveWidth(16),
    height: responsiveWidth(16),
    borderRadius: responsiveWidth(6),
    marginRight: responsiveWidth(2),
    resizeMode: "contain",
  },

  gradientBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  learnBg: {
    width: "100%",
    position: "relative",
    overflow: "hidden",
  },

  learnBgImage: {
    opacity: 0.05,
  },

  learnContent: {
    paddingVertical: responsiveHeight(1),
    paddingHorizontal: responsiveWidth(2.5),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
  },

  learnLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  iconContainer: {
    width: responsiveWidth(20),
    height: responsiveWidth(20),
    justifyContent: "center",
    alignItems: "center",
    marginRight: responsiveWidth(4),
    backgroundColor: "#FD00001A",
  },

  textContainer: {
    flex: 1,
  },

  learnTitle: {
    color: colors.text,
    fontSize: moderateScale(12),
    fontFamily: "Poppins-Medium",
  },

  learnDesc: {
    fontSize: moderateScale(10),
    fontFamily: "Inter-Regular",
  },
});
