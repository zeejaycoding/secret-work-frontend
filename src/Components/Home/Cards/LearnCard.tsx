import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveWidth,
  responsiveHeight,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import { useBranding } from "../../../context/BrandingContext";

const LearnCard = () => {
  const navigation = useNavigation<any>();
  const { primaryColor } = useBranding();
  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.learnCard}>
      <LinearGradient
        colors={[
          "rgba(0,0,0,0.75)",
          "rgba(35,0,0,0.85)",
          "rgba(80,0,0,0.95)",
          "rgba(35,0,0,0.85)",
          "rgba(0,0,0,0.75)",
        ]}
        locations={[0, 0.2, 0.5, 0.8, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.gradientBackground}
      />

      <TouchableOpacity onPress={() => navigation.navigate("LearnPros")}>
        <View style={styles.learnContent}>
          <View style={styles.learnLeft}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="run-fast"
                size={moderateScale(23)}
                color={primaryColor}
              />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.learnTitle}>Learn from the pros</Text>

              <Text style={styles.learnDesc}>
                Train with drills and insights from elite
                {"\n"}
                players and coaches.
              </Text>
            </View>
          </View>

          <Ionicons
            name="arrow-forward"
            size={moderateScale(20)}
            color={primaryColor}
          />
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default LearnCard;

const styles = StyleSheet.create({
  learnCard: {
    width: responsiveWidth(93),
    alignSelf: "center",
    marginTop: responsiveHeight(2),
    borderRadius: moderateScale(12),
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,0,50,0.2)",
    backgroundColor: "#120004",
    position: "relative",
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
    paddingVertical: responsiveHeight(1.5),
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
    width: responsiveWidth(13),
    height: responsiveWidth(13),
    borderRadius: responsiveWidth(7.5),
    borderWidth: 1.5,
    borderColor: "#FF4D5A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: responsiveWidth(4),
    backgroundColor: "#FD00001A",
  },

  textContainer: {
    flex: 1,
  },

  learnTitle: {
    color: "#fff",
    fontSize: moderateScale(14),
    fontFamily: "Poppins-Medium",
  },

  learnDesc: {
    color: "#E79B9B",
    fontSize: moderateScale(10),
    lineHeight: moderateScale(14),
    fontFamily: "Inter-Regular",
  },
});
