import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  Image,
  StatusBar,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useBranding } from "../../context/BrandingContext";
import { toggleDrillLike, getLikedDrills } from "../../services/api";
import { sumDurations } from "../../utils/duration";

const initialWorkoutData = [
  {
    id: 1,
    title: "Importance of passing",
    category: "Passing",
    duration: "Beginner. 30 Secs",
    liked: true,
    image: require("../../assets/featuretwo.jpg"),
  },
  {
    id: 2,
    title: "Importance of passing",
    category: "Passing",
    duration: "Beginner. 30 Secs",
    liked: false,
    image: require("../../assets/mode2.jpg"),
  },
  {
    id: 3,
    title: "Importance of passing",
    category: "Passing",
    duration: "Beginner. 30 Secs",
    liked: false,
    image: require("../../assets/shoot.jpg"),
  },
  {
    id: 4,
    title: "Importance of passing",
    category: "Passing",
    duration: "Beginner. 30 Secs",
    liked: false,
    image: require("../../assets/mode.jpg"),
  },
  {
    id: 5,
    title: "Importance of passing",
    category: "Passing",
    duration: "Beginner. 30 Secs",
    liked: false,
    image: require("../../assets/shoot.jpg"),
  },
];

const toItemShape = (drill: any) => ({
  id: drill.id,
  title: drill.title,
  category: drill.category,
  duration: drill.duration,
  level: drill.level || "",
  liked: false,
  image: drill.image ? { uri: drill.image } : require("../../assets/mode2.jpg"),
  videoUrl: drill.videoUrl || "",
  reps: drill.reps || "5 Reps",
});

const StartWorkout = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { primaryColor } = useBranding();
  const routeDrills = route.params?.drills;
  const [workoutData, setWorkoutData] = useState<any[]>(
    routeDrills && routeDrills.length
      ? routeDrills.map(toItemShape)
      : initialWorkoutData
  );
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;

    getLikedDrills()
      .then((drillIds) => {
        if (!mounted) return;
        const set = new Set<string>(drillIds || []);
        setLikedIds(set);
        setWorkoutData((prev) =>
          prev.map((item) =>
            set.has(String(item.id)) ? { ...item, liked: true } : item
          )
        );
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const toggleHeart = (id: number | string) => {
    const drillId = String(id);
    const isRealDrill = /^[a-f0-9]{24}$/i.test(drillId);

    const applyToggle = () => {
      setWorkoutData((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, liked: !item.liked } : item,
        ),
      );
      if (isRealDrill) {
        setLikedIds((prev) => {
          const next = new Set(prev);
          if (next.has(drillId)) next.delete(drillId);
          else next.add(drillId);
          return next;
        });
      }
    };

    applyToggle();

    if (isRealDrill) {
      toggleDrillLike(drillId).catch(() => applyToggle());
    }
  };

  const levels = Array.from(
    new Set(
      workoutData.map((d: any) => d.level).filter((l: any) => l && l.length)
    )
  );
  const levelLabel =
    levels.length > 1 ? "Mixed levels" : levels[0] || "Intermediate";

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

        <View style={styles.mainContainer}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons
                name="chevron-back"
                size={moderateScale(22)}
                color="#fff"
              />
            </TouchableOpacity>

            <View style={styles.topContent}>
              <Text style={styles.heading}>Quick workout</Text>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Ionicons name="time" size={moderateScale(13)} color="#fff" />

                  <Text style={styles.infoText}>
                    {sumDurations(
                      workoutData.map((d: any) => d.duration)
                    )}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <MaterialCommunityIcons
                    name="basketball"
                    size={moderateScale(13)}
                    color="#fff"
                  />

                  <Text style={styles.infoText}>{levelLabel}</Text>
                </View>

                <View style={styles.infoItem}>
                  <MaterialCommunityIcons
                    name="basketball-hoop"
                    size={moderateScale(13)}
                    color="#FFFFFF"
                  />

                  <Text style={styles.infoText}>
                    {workoutData.length} drilling skills
                  </Text>
                </View>
              </View>
            </View>

            {workoutData.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                style={styles.card}
              >
                <View style={styles.imageContainer}>
                  <Image source={item.image} style={styles.cardImage} />

                  <LinearGradient
                    colors={[
                      "rgba(255, 0, 21, 0.2)",
                      "rgba(0,0,0,0.15)",
                      "rgba(0,0,0,0.45)",
                    ]}
                    locations={[0, 0.5, 1]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.imageOverlay}
                  />
                </View>

                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{item.title}</Text>

                  <Text style={styles.cardSubtitle}>{item.category}</Text>

                  <Text style={styles.cardDuration}>{item.duration}</Text>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => toggleHeart(item.id)}
                  >
                    <Ionicons
                      name={item.liked ? "heart" : "heart-outline"}
                      size={moderateScale(18)}
                      color={item.liked ? "#fff" : "#fff"}
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}

            <View
              style={{
                height: responsiveHeight(13),
              }}
            />
          </ScrollView>

          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.startButton, { backgroundColor: primaryColor }]}
              onPress={() =>
                navigation.navigate("PracticeWorkout", {
                  drills: workoutData.map((d) => ({
                    id: d.id,
                    title: d.title,
                    category: d.category,
                    duration: d.duration,
                    reps: d.reps || "5 Reps",
                    videoUrl: d.videoUrl || "",
                  })),
                })
              }
            >
              <Text style={styles.startButtonText}>Start workout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

export default StartWorkout;

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
    height: responsiveHeight(50),
  },

  mainContainer: {
    flex: 1,
    paddingTop:
      Platform.OS === "ios" ? responsiveHeight(6) : responsiveHeight(5),
  },

  scrollContent: {
    paddingHorizontal: responsiveWidth(4),
    paddingTop: responsiveHeight(1),
  },

  backButton: {
    width: responsiveWidth(10),
    height: responsiveWidth(10),
    borderRadius: responsiveWidth(6),
    backgroundColor: "#ffffff10",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: responsiveHeight(1),
  },

  topContent: {
    marginBottom: responsiveHeight(2),
  },

  heading: {
    color: "#fff",
    fontSize: moderateScale(25),
    fontFamily: "Inter-Medium",
    marginBottom: responsiveHeight(1),
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: responsiveWidth(4),
  },

  infoText: {
    color: "#929292",
    fontSize: moderateScale(11),
    marginLeft: responsiveWidth(1),
    fontFamily: "Inter-Regular",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: responsiveHeight(1.5),
  },

  imageContainer: {
    position: "relative",
  },

  cardImage: {
    width: responsiveWidth(40),
    height: responsiveHeight(11.5),
    borderRadius: moderateScale(10),
  },

  imageOverlay: {
    position: "absolute",
    width: responsiveWidth(40),
    height: responsiveHeight(11.5),
    borderRadius: moderateScale(12),
    top: 0,
    left: 0,
  },

  cardContent: {
    flex: 1,
    marginLeft: responsiveWidth(3.5),
    justifyContent: "center",
  },

  cardTitle: {
    color: "#fff",
    fontSize: moderateScale(13),
    marginBottom: responsiveHeight(0.4),
    fontFamily: "Inter-Medium",
  },

  cardSubtitle: {
    color: "#929292",
    fontSize: moderateScale(11),
    fontFamily: "Inter-Regular",
  },

  cardDuration: {
    color: "#929292",
    fontSize: moderateScale(11),
    marginBottom: responsiveHeight(1),
    fontFamily: "Inter-Regular",
  },

  bottomButtonContainer: {
    position: "absolute",
    bottom: responsiveHeight(3),
    left: 0,
    right: 0,
    paddingHorizontal: responsiveWidth(4),
  },

  startButton: {
    width: "100%",
    height: responsiveHeight(6.5),
    backgroundColor: "#FF0015",
    borderRadius: moderateScale(12),
    justifyContent: "center",
    alignItems: "center",
  },

  startButtonText: {
    color: "#fff",
    fontSize: moderateScale(15),
    fontFamily: "Inter-Medium",
  },
});
