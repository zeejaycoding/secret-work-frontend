import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ImageBackground,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getWorkout, getFollowStatus, toggleFollow } from "../../services/api";
import { useBranding } from "../../context/BrandingContext";
import { useAppTheme, ThemeColors } from "../../context/ThemeContext";
import { useLanguage, translateCategory } from "../../i18n";
import { useIsPro } from "../../utils/subscription";
import ProPaywall from "../../Components/ProPaywall";

const fallbackTabs = [
  "Ball Handling",
  "Pick Ups",
  "Job Series",
  "Shooting",
  "Handling Finish",
];

const fallbackVideoData = [
  {
    id: "1",
    title: "Master Contact Finishes",
    category: "Passing, Beginner",
    duration: "20 secs",
    reps: "5 Reps",
    image: require("../../assets/mode2.jpg"),
  },
  {
    id: "2",
    title: "Elite Layup Package",
    category: "Passing, Beginner",
    duration: "20 secs",
    reps: "5 Reps",
    image: require("../../assets/mode2.jpg"),
  },
  {
    id: "3",
    title: "Footwork around the basket",
    category: "Passing, Beginner",
    duration: "20 secs",
    reps: "5 Reps",
    image: require("../../assets/mode2.jpg"),
  },
  {
    id: "4",
    title: "Elite Layup Package",
    category: "Passing, Beginner",
    duration: "20 secs",
    reps: "5 Reps",
    image: require("../../assets/mode2.jpg"),
  },
];

const fallbackStatsData = [
  {
    id: "1",
    icon: "person",
    value: "12k",
    label: "Followers",
  },
  {
    id: "2",
    icon: "videocam",
    value: "359",
    label: "Videos",
  },
  {
    id: "3",
    icon: "school",
    value: "10",
    label: "Years of Exp",
  },
];

const toVideoShape = (video: any) => ({
  id: video.id,
  title: video.title,
  category: video.category,
  level: video.level || "",
  description: video.description || "",
  duration: video.duration || "20 secs",
  reps: video.reps || "5 Reps",
  image: video.image
    ? { uri: video.image }
    : require("../../assets/mode2.jpg"),
  videoUrl: video.videoUrl || "",
});

const formatCount = (n: number) => {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
};

const STAT_LABEL_KEYS: Record<string, string> = {
  Followers: "statFollowers",
  Videos: "statVideos",
  "Years of Exp": "statYearsExp",
};

const statLabelKey = (label: string) => STAT_LABEL_KEYS[label] || label;

const WorkoutProfileDetail = () => {
  const { primaryColor } = useBranding();
  const { colors, statusBarStyle, isDarkMode } = useAppTheme();
  const { t } = useLanguage();
  const styles = createStyles(colors, isDarkMode);
  const isPro = useIsPro();

  if (!isPro) {
    return (
      <ProPaywall
        title={t("workoutProTitle")}
        subtitle={t("workoutProDesc")}
      />
    );
  }

  const [activeTab, setActiveTab] = useState(fallbackTabs[0]);
  const [tabs, setTabs] = useState(fallbackTabs);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const workoutId = route.params?.workoutId;
  const [coachName, setCoachName] = useState(workoutId || "Coach Hudson");
  const [teamName, setTeamName] = useState("Portland Trailblazers");
  const [description, setDescription] = useState(
    "Train with expert coaches and explore their drills, sessions, and insights designed to improve your game."
  );
  const [statsData, setStatsData] = useState(fallbackStatsData);
  const [videoData, setVideoData] = useState(fallbackVideoData);
  const [following, setFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);

  useEffect(() => {
    if (!workoutId) return;
    let mounted = true;

    getWorkout(workoutId)
      .then((workout) => {
        if (!mounted) return;
        if (workout.coachName) setCoachName(workout.coachName);
        if (workout.team) setTeamName(workout.team);
        if (workout.description) setDescription(workout.description);
        if (workout.stats) {
          const followerCount = Number(workout.stats.followers || 0);
          setFollowers(followerCount);
          setStatsData([
            { id: "1", icon: "person", value: formatCount(followerCount), label: "Followers" },
            { id: "2", icon: "videocam", value: String(workout.stats.videos || 0), label: "Videos" },
            { id: "3", icon: "school", value: String(workout.stats.yearsExp || 10), label: "Years of Exp" },
          ]);
        }
        if (Array.isArray(workout.videos) && workout.videos.length) {
          const shaped = workout.videos.map(toVideoShape);
          setVideoData(shaped);

          const cats = Array.from(
            new Set(shaped.map((v) => v.category).filter(Boolean))
          );
          if (cats.length) {
            setTabs(cats);
            setActiveTab(cats[0]);
          }
        }
      })
      .catch(() => {});

    getFollowStatus(workoutId)
      .then((status) => {
        if (!mounted) return;
        setFollowing(status.following);
        setFollowers(status.followers);
        setStatsData((prev) =>
          prev.map((s) =>
            s.label === "Followers"
              ? { ...s, value: formatCount(status.followers) }
              : s
          )
        );
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [workoutId]);

  const handleFollow = async () => {
    try {
      const status = await toggleFollow(coachName);
      setFollowing(status.following);
      setFollowers(status.followers);
      setStatsData((prev) =>
        prev.map((s) =>
          s.label === "Followers"
            ? { ...s, value: formatCount(status.followers) }
            : s
        )
      );
    } catch {}
  };

  const hasCategory = videoData.some((v) => v.category === activeTab);
  const visibleVideos = hasCategory
    ? videoData.filter((v) => v.category === activeTab)
    : videoData;

  const renderVideoItem = ({ item }: any) => {
    return (
      <TouchableOpacity activeOpacity={0.8} style={styles.videoCard}>
        <View style={styles.imageWrapper}>
          <Image source={item.image} style={styles.videoImage} />

          <LinearGradient
            colors={[
              "rgba(229, 9, 20, 0.37)",
              "rgba(229,9,20,0.25)",
              "rgba(229,9,20,0.05)",
              "transparent",
            ]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.imageOverlay}
          />
        </View>

        <View style={styles.videoContent}>
          <Text numberOfLines={1} style={styles.videoTitle}>
            {item.title}
          </Text>

          <Text style={styles.videoCategory}>
            {translateCategory(t, item.category)}
          </Text>

          <View style={styles.videoBottomRow}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="clock-time-three"
                size={moderateScale(10)}
                color={colors.text}
              />

              <Text style={styles.infoText}>{item.duration}</Text>
            </View>

            <View style={styles.infoRow}>
              <FontAwesome5
                name="running"
                size={moderateScale(10)}
                color={colors.text}
              />

              <Text style={styles.infoText}>{item.reps}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.playButton}
          onPress={() =>
            navigation.navigate("DrilLibraryDetail", {
              drill: {
                id: item.id,
                title: item.title,
                category: item.category,
                level: item.level,
                description: item.description,
                duration: item.duration,
                videoUrl: item.videoUrl,
              },
            })
          }
        >
          <Ionicons name="play" size={moderateScale(16)} color={colors.text} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.background} barStyle={statusBarStyle} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: responsiveHeight(4) }}
      >
        <ImageBackground
          source={require("../../assets/cover.png")}
          style={styles.headerImage}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="chevron-back"
              size={moderateScale(22)}
              color={colors.white}
            />
          </TouchableOpacity>
        </ImageBackground>

        <View style={styles.profileSection}>
          <View style={styles.profileImageWrapper}>
            <Image
              source={require("../../assets/coachimage.jpeg")}
              style={styles.profileImage}
              resizeMode="cover"
            />
          </View>

          <Text style={styles.coachName}>{coachName}</Text>

          <Text style={styles.teamName}>{teamName}</Text>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.followButton, { backgroundColor: primaryColor }]}
            onPress={handleFollow}
          >
            <Feather
              name={following ? "user-check" : "user-plus"}
              size={moderateScale(14)}
              color={colors.white}
            />

            <Text style={styles.followText}>
              {following ? t("following") : t("follow")}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          {statsData.map((item) => {
            return (
              <View key={item.id} style={styles.statCard}>
                <View style={styles.iconCircle}>
                  <MaterialIcons
                    name={item.icon as any}
                    size={moderateScale(18)}
                    color={primaryColor}
                  />
                </View>

                <Text style={styles.statValue}>{item.value}</Text>

                <Text style={styles.statLabel}>{t(statLabelKey(item.label))}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionTitle}>{t("description")}</Text>

          <Text style={styles.descriptionText}>
            {description}
          </Text>
        </View>

        <View style={styles.videoSection}>
          <Text style={styles.videoHeading}>{t("video")}</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContainer}
          >
            {tabs.map((tab, index) => {
              const isActive = activeTab === tab;

              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  onPress={() => setActiveTab(tab)}
                  style={[
                    styles.tabButton,
                    isActive && styles.activeTab,
                    isActive && { backgroundColor: primaryColor },
                  ]}
                >
                   <Text
                     style={[styles.tabText, isActive && styles.activeTabText]}
                   >
                     {translateCategory(t, tab)}
                   </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <FlatList
            data={visibleVideos}
            keyExtractor={(item) => item.id}
            renderItem={renderVideoItem}
            scrollEnabled={false}
            contentContainerStyle={{
              paddingTop: responsiveHeight(1),
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default WorkoutProfileDetail;

const createStyles = (colors: ThemeColors, isDarkMode: boolean) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  headerImage: {
    width: "100%",
    height: responsiveHeight(24),
    justifyContent: "flex-start",
  },

  backButton: {
    width: responsiveWidth(10),
    height: responsiveWidth(10),
    borderRadius: moderateScale(100),
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: responsiveHeight(6),
    marginLeft: responsiveWidth(4),
  },

  profileSection: {
    alignItems: "center",
    marginTop: -responsiveHeight(7),
  },

  profileImageWrapper: {
    width: responsiveWidth(21),
    height: responsiveWidth(21),
    borderRadius: responsiveWidth(10.5),
    overflow: "hidden",
    borderWidth: moderateScale(3),
    borderColor: colors.background,
  },

  profileImage: {
    width: "100%",
    height: "100%",
  },

  coachName: {
    color: colors.text,
    fontSize: moderateScale(18),
    marginTop: responsiveHeight(1),
    fontFamily: "Inter-Medium",
  },

  teamName: {
    color: colors.textMuted,
    fontSize: moderateScale(11),
    marginTop: responsiveHeight(0.5),
    fontFamily: "Inter-Medium",
  },

  followButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E50914",
    paddingHorizontal: responsiveWidth(6),
    paddingVertical: responsiveHeight(0.9),
    borderRadius: moderateScale(10),
    marginTop: responsiveHeight(1.2),
  },

  followText: {
    color: colors.white,
    fontSize: moderateScale(12),
    marginLeft: responsiveWidth(1.5),
    fontFamily: "Inter-Medium",
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: responsiveHeight(2.5),
    paddingHorizontal: responsiveWidth(3),
  },

  statCard: {
    width: responsiveWidth(30),
    backgroundColor: colors.backgroundCard,
    borderRadius: moderateScale(14),
    borderWidth: moderateScale(1),
    borderColor: "#330004",
    paddingVertical: responsiveHeight(1),
    alignItems: "center",
  },

  iconCircle: {
    width: responsiveWidth(9.5),
    height: responsiveWidth(9.5),
    borderRadius: moderateScale(100),
    backgroundColor: colors.backgroundElevated,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: responsiveHeight(0.3),
  },

  statValue: {
    color: colors.text,
    fontSize: moderateScale(16),
    fontFamily: "Inter-Medium",
  },

  statLabel: {
    color: colors.textMuted,
    fontSize: moderateScale(9),
    marginTop: responsiveHeight(0.5),
    fontFamily: "Inter-Medium",
  },

  descriptionCard: {
    backgroundColor: colors.backgroundElevated,
    marginHorizontal: responsiveWidth(3),
    marginTop: responsiveHeight(2),
    borderRadius: moderateScale(14),
    padding: moderateScale(14),
  },

  descriptionTitle: {
    color: colors.text,
    fontSize: moderateScale(14),
    marginBottom: responsiveHeight(0.5),
    fontFamily: "Inter-Medium",
  },

  descriptionText: {
    color: colors.textMuted,
    fontSize: moderateScale(11),
    lineHeight: moderateScale(16),
    fontFamily: "Inter-Medium",
  },

  videoSection: {
    marginTop: responsiveHeight(1),
  },

  videoHeading: {
    color: colors.text,
    fontSize: moderateScale(17),
    marginBottom: responsiveHeight(1.5),
    paddingHorizontal: responsiveWidth(4),
    fontFamily: "Inter-Medium",
  },

  tabsContainer: {
    paddingHorizontal: responsiveWidth(4),
  },

  tabButton: {
    backgroundColor: colors.backgroundElevated,
    paddingHorizontal: responsiveWidth(2.4),
    paddingVertical: responsiveHeight(0.9),
    borderRadius: moderateScale(9),
    marginRight: responsiveWidth(1.5),
  },

  activeTab: {
    backgroundColor: "#E50914",
  },

  tabText: {
    color: colors.textMuted,
    fontSize: moderateScale(11),
    fontFamily: "Inter-Medium",
  },

  activeTabText: {
    color: colors.white,
    fontWeight: "600",
  },

  videoCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: responsiveWidth(2),
    borderRadius: moderateScale(14),
    padding: moderateScale(10),
  },

  imageWrapper: {
    position: "relative",
    borderRadius: moderateScale(8),
    overflow: "hidden",
  },

  videoImage: {
    width: responsiveWidth(24),
    height: responsiveHeight(9),
    borderRadius: moderateScale(8),
  },

  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  videoContent: {
    flex: 1,
    marginLeft: responsiveWidth(3),
  },

  videoTitle: {
    color: colors.text,
    fontSize: moderateScale(13),
    fontFamily: "Inter-Medium",
  },

  videoCategory: {
    color: colors.textMuted,
    fontSize: moderateScale(10),
    fontFamily: "Inter-Medium",
  },

  videoBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: responsiveHeight(0.2),
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: responsiveWidth(4),
  },

  infoText: {
    color: colors.textMuted,
    fontSize: moderateScale(10),
    marginLeft: responsiveWidth(1),
    fontFamily: "Inter-Medium",
  },

  playButton: {
    width: responsiveWidth(10),
    height: responsiveWidth(10),
    borderRadius: moderateScale(100),
    backgroundColor: isDarkMode ? "#161616B2" : "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
});
