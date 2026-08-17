import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  Animated,
} from "react-native";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { reportWatchTime, getWorkout } from "../../services/api";
import { useBranding } from "../../context/BrandingContext";
import { useAppTheme, ThemeColors } from "../../context/ThemeContext";
import { useIsPro } from "../../utils/subscription";
import { useLanguage, translateCategory, translateLevel } from "../../i18n";
import ProPaywall from "../../Components/ProPaywall";

const categoryLabel = (category: string) => {
  if (category === "Defence") return "Defense";
  return category;
};

const toLessonShape = (t: (key: string) => string, drill: any) => ({
  id: drill._id || drill.id,
  title: drill.title || "",
  subtitle: `${translateCategory(t, categoryLabel(drill.category || "Drill"))}${
    drill.level ? `, ${translateLevel(t, drill.level)}` : ""
  }`,
  duration: drill.duration || "20 secs",
  reps: drill.reps || "5 Reps",
  image: drill.imageUrl || drill.image
    ? { uri: drill.imageUrl || drill.image }
    : require("../../assets/mode2.jpg"),
  videoUrl: drill.videoUrl || "",
  category: categoryLabel(drill.category || "Drill"),
  level: drill.level || "",
  description: drill.description || "",
});

const ProsDetails = ({ route }: any) => {
  const navigation = useNavigation<any>();
  const { primaryColor } = useBranding();
  const { colors, statusBarStyle, isDarkMode } = useAppTheme();
  const styles = createStyles(colors, isDarkMode);
  const { t } = useLanguage();
  const videoRef = useRef<Video>(null);
  const pro = route?.params?.pro;
  const isPro = useIsPro();

  if (!isPro) {
    return (
      <ProPaywall
        title={t("prosProTitle")}
        subtitle={t("prosProDesc")}
      />
    );
  }

  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedTab, setSelectedTab] = useState("");
  const [lessons, setLessons] = useState<any[]>([]);
  const [tabs, setTabs] = useState<string[]>([]);

  const watchedSecRef = useRef(0);
  const lastPosRef = useRef(0);
  const positionRef = useRef(0);

  const lastTapRef = useRef<{ time: number; side: "left" | "right" } | null>(null);
  const [tapIndicator, setTapIndicator] = useState<"left" | "right" | null>(null);
  const tapAnim = useRef(new Animated.Value(0)).current;
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushWatchTime = () => {
    const sec = Math.round(watchedSecRef.current);
    if (sec <= 0) return;
    watchedSecRef.current = 0;
    reportWatchTime(sec).catch(() => {});
  };

  useEffect(() => {
    const interval = setInterval(() => flushWatchTime(), 30000);

    return () => {
      clearInterval(interval);
      flushWatchTime();
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const applyVideos = (videos: any[]) => {
      const mapped = videos
        .filter((v) => v && v.title)
        .map((v) => toLessonShape(t, v));

      const cats = Array.from(
        new Set(mapped.map((m: any) => m.category).filter(Boolean))
      );

      if (!mounted) return;

      setTabs(cats);
      setLessons(mapped);
      setSelectedTab((prev) => (cats.includes(prev) ? prev : cats[0] || ""));
    };

    if (pro?.name || pro?._id || pro?.id) {
      getWorkout(pro._id || pro.id || pro.name)
        .then((workout) => {
          if (mounted) applyVideos(workout?.videos || []);
        })
        .catch(() => {});
    }

    return () => {
      mounted = false;
    };
  }, []);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    const currentPosition = status.positionMillis || 0;
    const duration = status.durationMillis || 1;

    const progressPercentage = (currentPosition / duration) * 100;

    setProgress(progressPercentage);
    positionRef.current = currentPosition;

    if (status.isPlaying && lastPosRef.current != null && currentPosition > lastPosRef.current) {
      watchedSecRef.current += (currentPosition - lastPosRef.current) / 1000;
    }
    lastPosRef.current = currentPosition;
  };

  const handleVideoTap = (side: "left" | "right") => {
    const now = Date.now();
    const last = lastTapRef.current;

    if (last && last.side === side && now - last.time < 300) {
      lastTapRef.current = null;
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      tapTimerRef.current = null;

      if (side === "left") {
        videoRef.current?.setPositionAsync(
          Math.max(positionRef.current - 10000, 0),
        );
      } else {
        videoRef.current?.setPositionAsync(
          Math.min(positionRef.current + 10000, 999999),
        );
      }

      setTapIndicator(side);
      tapAnim.setValue(0);
      Animated.timing(tapAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        setTapIndicator(null);
        tapAnim.setValue(0);
      });
    } else {
      lastTapRef.current = { time: now, side };
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);

      tapTimerRef.current = setTimeout(() => {
        lastTapRef.current = null;
        tapTimerRef.current = null;
        setPaused((p) => !p);
      }, 250);
    }
  };

  const openDrill = (item: any, index: number) => {
    navigation.navigate("DrilLibraryDetail", {
      drill: {
        id: item.id,
        title: item.title,
        category: item.category,
        level: item.level,
        description: item.description,
        duration: item.duration,
        imageUrl: item.image?.uri || "",
        videoUrl: item.videoUrl || "",
      },
      drills: filteredLessons.map((l: any) => ({
        id: l.id,
        title: l.title,
        category: l.category,
        level: l.level,
        description: l.description,
        duration: l.duration,
        imageUrl: l.image?.uri || "",
        videoUrl: l.videoUrl || "",
      })),
      currentDrillIndex: index,
    });
  };

  const filteredLessons = selectedTab
    ? lessons.filter((item) => item.category === selectedTab)
    : lessons;

  const renderLesson = ({ item, index }: any) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.lessonCard}
        onPress={() => openDrill(item, index)}
      >
        <Image source={item.image} style={styles.lessonImage} />

        <View style={styles.lessonContent}>
          <Text numberOfLines={1} style={styles.lessonTitle}>
            {item.title}
          </Text>

          <Text style={styles.lessonSubtitle}>{item.subtitle}</Text>

          <View style={styles.row}>
            <View style={styles.metaRow}>
              <Ionicons name="time" size={moderateScale(13)} color={colors.text} />

              <Text style={styles.metaText}>{item.duration}</Text>
            </View>

            <View style={styles.metaRow}>
              <MaterialIcons
                name="sports-gymnastics"
                size={moderateScale(13)}
                color={colors.text}
              />

              <Text style={styles.metaText}>{item.reps}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.playButton}
          onPress={() => openDrill(item, index)}
        >
          <Ionicons name="play" size={moderateScale(16)} color={colors.text} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={statusBarStyle}
      />

      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.videoContainer}>
          <Video
            ref={videoRef}
            style={styles.video}
            source={require("../../assets/video/intro.mp4")}
            resizeMode={ResizeMode.COVER}
            shouldPlay={!paused}
            isLooping
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          />

          {isDarkMode && (
            <LinearGradient
              colors={["rgba(0,0,0,0.2)", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.95)"]}
              style={styles.overlay}
            />
          )}

          <View style={styles.videoTouchContainer}>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.videoTouchLeft}
              onPress={() => handleVideoTap("left")}
            />
            <TouchableOpacity
              activeOpacity={1}
              style={styles.videoTouchRight}
              onPress={() => handleVideoTap("right")}
            />
          </View>

          {tapIndicator && (
            <Animated.View
              style={[
                styles.tapRipple,
                tapIndicator === "left" ? styles.tapRippleLeft : styles.tapRippleRight,
                {
                  opacity: tapAnim.interpolate({
                    inputRange: [0, 0.3, 1],
                    outputRange: [0, 1, 0],
                  }),
                },
              ]}
              pointerEvents="none"
            >
              <Animated.View
                style={[
                  styles.tapRippleCircle,
                  {
                    opacity: tapAnim.interpolate({
                      inputRange: [0, 0.3, 1],
                      outputRange: [0.5, 0.3, 0],
                    }),
                    transform: [
                      {
                        scale: tapAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.5, 1.5],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <Ionicons
                name={tapIndicator === "left" ? "play-back" : "play-forward"}
                size={moderateScale(28)}
                color={colors.white}
              />
              <Text style={styles.tapLabel}>10 sec</Text>
            </Animated.View>
          )}

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={moderateScale(22)} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.detailsWrapper}>
          {isDarkMode && (
            <LinearGradient
              colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.2)", "#000000"]}
              style={styles.bottomOverlay}
            />
          )}

          <View style={styles.detailsContainer}>
            <Text style={styles.mainTitle}>
              {pro?.name || 'MR. 85 LATIN "RED SHOES" DAVIS'}
            </Text>
            <Text style={styles.subTitle}>
              {pro?.team || "International Pro-Canadian BSL"}
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsContainer}
            >
              {tabs.map((tab) => {
                const active = selectedTab === tab;

                return (
                  <TouchableOpacity
                    key={tab}
                    activeOpacity={0.8}
                    style={[
                      styles.tabButton,
                      active && styles.activeTabButton,
                      active && { backgroundColor: primaryColor },
                    ]}
                    onPress={() => setSelectedTab(tab)}
                  >
                    <Text
                      style={[styles.tabText, active && styles.activeTabText]}
                    >
                      {tab}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <FlatList
              data={filteredLessons}
              keyExtractor={(item) => item.id}
              renderItem={renderLesson}
              scrollEnabled={false}
              contentContainerStyle={styles.listContainer}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProsDetails;

const createStyles = (colors: ThemeColors, isDarkMode: boolean) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContainer: {
    paddingBottom: responsiveHeight(4),
  },

  videoContainer: {
    width: "100%",
    height: responsiveHeight(38),
    position: "relative",
    overflow: "hidden",
  },

  video: {
    width: "100%",
    height: "100%",
  },

  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  videoTouchContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    zIndex: 5,
  },

  videoTouchLeft: {
    flex: 1,
  },

  videoTouchRight: {
    flex: 1,
  },

  tapRipple: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "50%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 15,
  },

  tapRippleLeft: {
    left: 0,
  },

  tapRippleRight: {
    right: 0,
  },

  tapRippleCircle: {
    position: "absolute",
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: "rgba(255,255,255,0.25)",
  },

  tapLabel: {
    color: colors.white,
    fontSize: moderateScale(11),
    fontFamily: "Inter-Medium",
    marginTop: responsiveHeight(0.5),
  },

  closeButton: {
    position: "absolute",
    top: responsiveHeight(6),
    right: responsiveWidth(5),
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(100),
    backgroundColor: colors.backgroundElevated,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },

  controlsContainer: {
    position: "absolute",
    bottom: responsiveHeight(3),
    width: "100%",
    paddingHorizontal: responsiveWidth(4),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: moderateScale(12),
  },

  controlBtn: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },

  progressWrapper: {
    flex: 1,
    marginHorizontal: responsiveWidth(3),
  },

  progressBg: {
    width: "100%",
    height: moderateScale(6),
    backgroundColor: colors.borderStrong,
    borderRadius: moderateScale(10),
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#FF1F2D",
  },

  detailsWrapper: {
    position: "relative",
  },

  bottomOverlay: {
    position: "absolute",
    top: responsiveHeight(-6),
    left: 0,
    right: 0,
    height: responsiveHeight(10),
    zIndex: 1,
  },

  detailsContainer: {
    marginTop: isDarkMode ? responsiveHeight(-1) : responsiveHeight(1.5),
    paddingHorizontal: responsiveWidth(4),
    zIndex: 2,
  },

  mainTitle: {
    color: isDarkMode ? colors.white : "#000000",
    fontSize: moderateScale(18),
    marginBottom: responsiveHeight(0.2),
    fontFamily: "Inter-Medium",
  },

  subTitle: {
    color: isDarkMode ? "rgba(255,255,255,0.72)" : "#000000",
    fontSize: moderateScale(11),
    marginBottom: responsiveHeight(2),
    fontFamily: "Inter-Regular",
  },

  tabsContainer: {
    paddingBottom: responsiveHeight(1),
  },

  tabButton: {
    paddingHorizontal: responsiveWidth(2),
    paddingVertical: responsiveHeight(0.9),
    backgroundColor: colors.backgroundElevated,
    borderRadius: moderateScale(8),
    marginRight: responsiveWidth(1.2),
  },

  activeTabButton: {
    backgroundColor: "#E50914",
  },

  tabText: {
    color: colors.textMuted,
    fontSize: moderateScale(12),
    fontFamily: "Inter-Medium",
  },

  activeTabText: {
    color: colors.white,
    fontFamily: "Inter-Medium",
  },

  listContainer: {
    paddingTop: responsiveHeight(1.5),
  },

  lessonCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: responsiveHeight(1.2),
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    paddingBottom: responsiveHeight(1),
  },

  lessonImage: {
    width: responsiveWidth(30),
    height: responsiveHeight(10),
    borderRadius: moderateScale(8),
    backgroundColor: colors.backgroundElevated,
  },

  lessonContent: {
    flex: 1,
    marginLeft: responsiveWidth(3),
  },

  lessonTitle: {
    color: colors.text,
    fontSize: moderateScale(12),
    marginBottom: responsiveHeight(0.5),
    fontFamily: "Inter-Medium",
  },

  lessonSubtitle: {
    color: colors.textMuted,
    fontSize: moderateScale(12),
    marginBottom: responsiveHeight(0.5),
    fontFamily: "Inter-Medium",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: responsiveWidth(4),
  },

  metaText: {
    color: colors.textMuted,
    fontSize: moderateScale(11),
    marginLeft: responsiveWidth(1),
    fontFamily: "Inter-Medium",
  },

  playButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(21),
    backgroundColor: colors.backgroundInput,
    justifyContent: "center",
    alignItems: "center",
  },
});
