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
import { Alert, ActivityIndicator } from "react-native";
import { updateMe } from "../../services/api";
import { useBranding } from "../../context/BrandingContext";

const OnboardingWorking = () => {
  const navigation = useNavigation<any>();
  const { primaryColor } = useBranding();
  const [selectedItem, setSelectedItem] = useState<string>("Shooting accuracy");
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async () => {
    setIsLoading(true);
    try {
      await updateMe({ trainingGoal: selectedItem });
      navigation.navigate("OnboardingTrain");
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Something went wrong";
      Alert.alert("Error", msg);
    } finally {
      setIsLoading(false);
    }
  };

  const goals = [
    {
      id: 1,
      title: "Improve\ndribbling",
      image: require("../../assets/improve.png"),
    },
    {
      id: 2,
      title: "Shooting\naccuracy",
      image: require("../../assets/defence.png"),
    },
    {
      id: 3,
      title: "Footwork",
      image: require("../../assets/improve.png"),
    },
    {
      id: 4,
      title: "Defense",
      image: require("../../assets/defence.png"),
    },
    {
      id: 5,
      title: "Conditioning",
      image: require("../../assets/improve.png"),
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
          "rgba(0,0,0,0.75)",
          "rgba(0,0,0,0.25)",
          "rgba(0,0,0,0.05)",
          "rgba(0,0,0,0.25)",
          "rgba(0,0,0,0.75)",
        ]}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.sideOverlay}
      />

      <LinearGradient
        colors={[
          "transparent",
          "rgba(0,0,0,0.10)",
          "rgba(0,0,0,0.25)",
          "rgba(0,0,0,0.45)",
          "#000",
        ]}
        locations={[0, 0.25, 0.5, 0.75, 1]}
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

          <Text style={styles.step}>Step 4 of 5</Text>

          <View style={{ width: responsiveWidth(8) }} />
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.fill, { width: "80%", backgroundColor: primaryColor }]} />
        </View>

        <Text style={styles.title}>What are you working on?</Text>

        <Text style={styles.subtitle}>
          Select any that apply. You can change later.
        </Text>

        <View style={styles.gridWrapper}>
          {goals.map((item) => {
            const isSelected = selectedItem === item.title;

            return (
              <View key={item.id} style={styles.cardOuter}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setSelectedItem(item.title)}
                  style={[
                    styles.goalCard,
                    isSelected && styles.selectedGoalCard,
                  ]}
                >
                  {isSelected && (
                    <LinearGradient
                      colors={[
                        "rgba(255,0,21,0.18)",
                        "rgba(255,0,21,0.06)",
                        "transparent",
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.cardGlow}
                    />
                  )}

                  <Image
                    source={item.image}
                    resizeMode="contain"
                    style={styles.goalImage}
                  />

                  <Text style={styles.goalText}>{item.title}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.button, { backgroundColor: primaryColor }]}
          onPress={handleNext}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Text style={styles.buttonText}>Next</Text>
              <Feather name="arrow-right" size={moderateScale(17)} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OnboardingWorking;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  content: {
    flex: 1,
    paddingHorizontal: responsiveWidth(4.5),
    paddingTop: responsiveHeight(7),
  },

  redHorizontal: {
    position: "absolute",
    top: 0,
    width: responsiveWidth(100),
    height: responsiveHeight(28),
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
    height: responsiveHeight(35),
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
    fontSize: moderateScale(12),
    fontFamily: "Poppins-Medium",
  },

  progressBar: {
    width: "100%",
    height: responsiveHeight(0.9),
    backgroundColor: "#161616",
    borderRadius: moderateScale(100),
    overflow: "hidden",
    marginBottom: responsiveHeight(2.7),
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
    marginBottom: responsiveHeight(2.5),
    fontFamily: "Poppins-Regular",
  },

  gridWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  cardOuter: {
    width: "48%",
    marginBottom: responsiveHeight(1.8),
  },

  goalCard: {
    width: "100%",
    height: responsiveHeight(15),
    backgroundColor: "#0A0A0A",
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: "#0A0A0A",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  selectedGoalCard: {
    backgroundColor: "#1A0002",
    borderColor: "#E50914",
  },

  cardGlow: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  goalImage: {
    width: responsiveWidth(7),
    height: responsiveWidth(7),
    marginBottom: responsiveHeight(1.2),
  },

  goalText: {
    color: "#fff",
    textAlign: "center",
    fontSize: moderateScale(12),
    lineHeight: moderateScale(18),
    fontFamily: "Poppins-Medium",
  },

  button: {
    flexDirection: "row",
    gap: responsiveWidth(2),
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
    fontSize: moderateScale(15),
    fontFamily: "Poppins-Medium",
  },
});
