import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  StatusBar,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useBranding } from "../../context/BrandingContext";

const difficultyLevels = [
  {
    id: 1,
    title: "Youth/ High school",
    icon: "run-fast",
    time: "25 mins",
    levelLabel: "Beginner",
  },
  {
    id: 2,
    title: "NCAA",
    icon: "basketball",
    time: "30 mins",
    levelLabel: "Intermediate",
  },
  {
    id: 3,
    title: "PRO",
    icon: "run",
    time: "35 mins",
    levelLabel: "Advanced",
  },
  {
    id: 4,
    title: "Random",
    icon: "weight-lifter",
    time: "25-35 mins",
    levelLabel: "Mixed levels",
  },
];

const QuickWorkoutFirst = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { primaryColor } = useBranding();
  const [selectedLevel, setSelectedLevel] = useState(2);
  const coach = route.params?.coach || "";

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <ImageBackground
        source={require("../../assets/forgotpassword.png")}
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
            "rgba(0,0,0,0.95)",
          ]}
          locations={[0, 0.2, 0.35, 0.5, 0.65, 0.8, 0.9, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.bottomOverlay}
        />

        <View style={styles.contentContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather
              name="chevron-left"
              size={moderateScale(22)}
              color="#fff"
            />
          </TouchableOpacity>

          <View style={styles.progressContainer}>
            <Text style={styles.stepText}>Step 1 of 2</Text>

            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
          </View>

          <View style={styles.headingContainer}>
            <Text style={styles.heading}>Workout difficulty level</Text>

            <Text style={styles.subHeading}>
              Select the exact level of your experience
            </Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.cardWrapper}>
              {difficultyLevels.map((item) => {
                const isActive = selectedLevel === item.id;

                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.8}
                    style={[styles.card, isActive && styles.activeCard]}
                    onPress={() => setSelectedLevel(item.id)}
                  >
                    <MaterialCommunityIcons
                      name={item.icon as any}
                      size={moderateScale(22)}
                      color="#E50914"
                    />

                    <Text
                      style={[
                        styles.cardText,
                        isActive && styles.activeCardText,
                      ]}
                    >
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <View style={styles.bottomFixedContainer}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="time" size={moderateScale(12)} color="#FFFFFF" />

              <Text style={styles.infoText}>
                {
                  difficultyLevels.find((l) => l.id === selectedLevel)?.time ||
                    "30 mins"
                }
              </Text>
            </View>

            <View style={styles.infoItem}>
              <MaterialCommunityIcons
                name="basketball"
                size={moderateScale(12)}
                color="#FFFFFF"
              />

              <Text style={styles.infoText}>
                {difficultyLevels.find((l) => l.id === selectedLevel)
                  ?.levelLabel || "Intermediate"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.nextButton, { backgroundColor: primaryColor }]}
            onPress={() =>
              navigation.navigate("QuickWorkoutSecond", {
                level: difficultyLevels.find((l) => l.id === selectedLevel)?.title || "Random",
                coach: coach || undefined,
              })
            }
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
};

export default QuickWorkoutFirst;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  backgroundImage: {
    flex: 1,
    width: responsiveWidth(100),
    height: responsiveHeight(40),
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
    height: responsiveHeight(55),
  },

  contentContainer: {
    flex: 1,
    paddingTop: responsiveHeight(6),
    paddingHorizontal: responsiveWidth(4),
  },

  backButton: {
    width: responsiveWidth(10),
    height: responsiveWidth(10),
    borderRadius: responsiveWidth(6),
    backgroundColor: "#e96e6e13",
    justifyContent: "center",
    alignItems: "center",
  },

  progressContainer: {
    marginTop: responsiveHeight(2),
  },

  stepText: {
    color: "#fff",
    fontSize: moderateScale(14),
    marginBottom: responsiveHeight(1.2),
    fontFamily: "Inter-Medium",
  },

  progressBar: {
    width: "100%",
    height: responsiveHeight(0.9),
    backgroundColor: "#161616",
    overflow: "hidden",
    borderRadius: 100,
  },

  progressFill: {
    width: "50%",
    height: "100%",
    backgroundColor: "#FF1F2D",
  },

  headingContainer: {
    marginTop: responsiveHeight(1.8),
  },

  heading: {
    color: "#fff",
    fontSize: moderateScale(18),
    fontFamily: "Inter-Medium",
  },

  subHeading: {
    color: "#6B6B6B",
    fontSize: moderateScale(12),
    fontFamily: "Inter-Regular",
  },

  scrollContent: {
    paddingBottom: responsiveHeight(22),
  },

  cardWrapper: {
    marginTop: responsiveHeight(2.2),
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: responsiveWidth(44.5),
    height: responsiveHeight(14),
    backgroundColor: "#0A0A0A",
    borderRadius: moderateScale(12),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: responsiveHeight(1.8),
    borderWidth: 1,
    borderColor: "#111111",
  },

  activeCard: {
    backgroundColor: "#1A0002",
    borderColor: "#E50914",
  },

  cardText: {
    color: "#fff",
    fontSize: moderateScale(12.5),
    marginTop: responsiveHeight(1.2),
    textAlign: "center",
    fontFamily: "Inter-Medium",
  },

  activeCardText: {
    color: "#fff",
  },

  bottomFixedContainer: {
    position: "absolute",
    bottom: responsiveHeight(0),
    width: responsiveWidth(100),
    paddingHorizontal: responsiveWidth(4),
    borderTopColor: "#161616",
    borderTopWidth: 1,
    paddingVertical: responsiveHeight(1.5),
    backgroundColor: "#0A0A0A",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: responsiveHeight(1.2),
  },

  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: responsiveWidth(4),
  },

  infoText: {
    color: "#929292",
    fontSize: moderateScale(12),
    marginLeft: responsiveWidth(1.2),
    fontFamily: "Inter-Medium",
  },

  nextButton: {
    width: "100%",
    height: responsiveHeight(6.5),
    backgroundColor: "#E50914",
    borderRadius: moderateScale(12),
    justifyContent: "center",
    alignItems: "center",
  },

  nextButtonText: {
    color: "#fff",
    fontSize: moderateScale(16),
    fontFamily: "Inter-Medium",
  },
});
