// PracticeWorkout.tsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Animated,
  Easing,
} from "react-native";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import Svg, { Circle } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { moderateScale } from "react-native-size-matters";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getCachedPreferences } from "../../services/preferences";
import {
  markDrillComplete,
  recordDrillView,
  reportWatchTime,
} from "../../services/api";
import { useBranding } from "../../context/BrandingContext";
import { useAppTheme, ThemeColors } from "../../context/ThemeContext";

interface WorkoutItem {
  id: string;
  title: string;
  category: string;
  duration: number;
  reps: string;
  videoUrl?: string;
}

const CIRCLE_SIZE = moderateScale(52);
const STROKE_WIDTH = moderateScale(3.8);
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const fallbackWorkouts: WorkoutItem[] = [
  {
    id: "1",
    title: "Importance of passing",
    category: "Passing. Beginner",
    duration: 20,
    reps: "5 Reps",
  },
  {
    id: "2",
    title: "Catch jap pull up",
    category: "Footwork. Beginner",
    duration: 20,
    reps: "5 Reps",
  },
  {
    id: "3",
    title: "Post Roll off",
    category: "Passing. Beginner",
    duration: 20,
    reps: "5 Reps",
  },
  {
    id: "4",
    title: "Rear turn step back down",
    category: "Passing. Beginner",
    duration: 20,
    reps: "5 Reps",
  },
  {
    id: "5",
    title: "Rear turn step back down",
    category: "Passing. Beginner",
    duration: 20,
    reps: "5 Reps",
  },
];

const isMongoId = (id?: string) => /^[a-fA-F0-9]{24}$/.test(id || "");

const PracticeWorkout = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { primaryColor } = useBranding();
  const { colors, statusBarStyle, isDarkMode } = useAppTheme();
  const styles = createStyles(colors);
  const videoRef = useRef<Video | null>(null);
  const [currentVideo, setCurrentVideo] = useState(0);
  const [resumePosition, setResumePosition] = useState(0);
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const drillProgressRef = useRef<number[]>([]);
  const positionRef = useRef<number[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const viewedRef = useRef(false);
  const completionSent = useRef(false);
  const watchedSecRef = useRef(0);
  const lastPosRef = useRef(0);

  const workouts: WorkoutItem[] = useMemo(() => {
    const routeDrills = route.params?.drills;
    if (routeDrills && routeDrills.length) {
      return routeDrills.map((d: any) => ({
        id: String(d.id),
        title: d.title,
        category: d.category || "Passing. Beginner",
        duration: typeof d.duration === "number" ? d.duration : 20,
        reps: d.reps || "5 Reps",
        videoUrl: d.videoUrl || "",
      }));
    }
    return fallbackWorkouts;
  }, [route.params?.drills]);

  const flushWatchTime = () => {
    const id = workouts[currentVideo]?.id;
    const sec = Math.round(watchedSecRef.current);
    if (sec <= 0) return;
    watchedSecRef.current = 0;
    if (id) reportWatchTime(sec, id).catch(() => {});
  };

  const recomputeOverall = () => {
    const arr = drillProgressRef.current;
    const total = arr.reduce((a, b) => a + b, 0);
    const overall = workouts.length ? total / workouts.length : 0;
    setOverallProgress(Math.round(overall));
  };

  useEffect(() => {
    drillProgressRef.current = workouts.map(() => 0);
    positionRef.current = workouts.map(() => 0);
    setOverallProgress(0);
  }, [workouts]);

  useEffect(() => {
    const interval = setInterval(() => flushWatchTime(), 30000);
    return () => {
      clearInterval(interval);
      flushWatchTime();
    };
  }, [workouts, currentVideo]);

  const selectVideo = (index: number) => {
    setCurrentVideo(index);
    viewedRef.current = false;
    completionSent.current = false;
    watchedSecRef.current = 0;
    lastPosRef.current = 0;
    animatedProgress.setValue(drillProgressRef.current[index] || 0);
    setResumePosition(positionRef.current[index] || 0);
    recomputeOverall();
  };

  const goToPrevious = () => {
    if (currentVideo > 0) selectVideo(currentVideo - 1);
  };

  const goToNext = () => {
    if (currentVideo < workouts.length - 1) selectVideo(currentVideo + 1);
  };

  const completeWorkout = () => {
    const ids = Array.from(
      new Set(workouts.map((w) => w.id).filter((id) => isMongoId(id)))
    );
    ids.forEach((id) => markDrillComplete(id).catch(() => {}));
    flushWatchTime();
    navigation.goBack();
  };

  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: [CIRCUMFERENCE, 0],
  });

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    const position = status.positionMillis || 0;
    const duration = status.durationMillis || 1;

    const id = workouts[currentVideo]?.id;

    if (status.isPlaying && !viewedRef.current && isMongoId(id)) {
      viewedRef.current = true;
      recordDrillView(id).catch(() => {});
    }

    const currentPosition = status.positionMillis || 0;

    if (
      status.isPlaying &&
      lastPosRef.current != null &&
      currentPosition > lastPosRef.current
    ) {
      watchedSecRef.current += (currentPosition - lastPosRef.current) / 1000;
    }
    lastPosRef.current = currentPosition;
    positionRef.current[currentVideo] = currentPosition;

    let progress = (currentPosition / duration) * 100;

    if (progress > 99.2) {
      progress = 100;
    }

    if (isMongoId(id) && !completionSent.current && progress >= 90) {
      completionSent.current = true;
      markDrillComplete(id).catch(() => {});
      flushWatchTime();
    }

    drillProgressRef.current[currentVideo] = progress;
    recomputeOverall();

    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 100,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: WorkoutItem;
    index: number;
  }) => {
    const isActive = currentVideo === index;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.itemContainer}
        onPress={() => selectVideo(index)}
      >
        <View style={styles.circleOuter}>
          {isActive ? (
            <View style={styles.activeCircleWrapper}>
              <Svg
                width={CIRCLE_SIZE}
                height={CIRCLE_SIZE}
                style={styles.svgStyle}
              >
                <Circle
                  stroke={colors.borderStrong}
                  fill="none"
                  cx={CIRCLE_SIZE / 2}
                  cy={CIRCLE_SIZE / 2}
                  r={RADIUS}
                  strokeWidth={STROKE_WIDTH}
                />

                <AnimatedCircle
                  stroke="#E50914"
                  fill="none"
                  cx={CIRCLE_SIZE / 2}
                  cy={CIRCLE_SIZE / 2}
                  r={RADIUS}
                  strokeWidth={STROKE_WIDTH}
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  rotation="-90"
                  origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}
                />
              </Svg>

              <View style={styles.activeCircle}>
                <Ionicons name="play" size={moderateScale(18)} color={colors.text} />
              </View>
            </View>
          ) : (
            <View style={styles.inactiveCircle}>
              <Text style={styles.timeText}>0:40</Text>
            </View>
          )}
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{item.title}</Text>

          <Text style={styles.category}>{item.category}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time" size={moderateScale(12)} color={colors.text} />

              <Text style={styles.metaText}>{item.duration} secs</Text>
            </View>

            <View style={styles.metaItem}>
              <MaterialIcons
                name="directions-run"
                size={moderateScale(14)}
                color={colors.text}
              />

              <Text style={styles.metaText}>{item.reps}</Text>
            </View>
          </View>
        </View>
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

      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={
            workouts[currentVideo]?.videoUrl
              ? { uri: workouts[currentVideo].videoUrl }
              : require("../../assets/video/intro.mp4")
          }
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          shouldPlay={getCachedPreferences().autoplayVideos}
          positionMillis={resumePosition}
          isLooping={false}
          useNativeControls={false}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        />

        <LinearGradient
          colors={[
            "rgba(0,0,0,0.95)",
            "rgba(0,0,0,0.65)",
            "rgba(0,0,0,0.25)",
            "rgba(0,0,0,0)",
          ]}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0 }}
          style={styles.bottomGradient}
        />

        <View style={styles.overlay} />

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="close"
            size={moderateScale(20)}
            color={isDarkMode ? colors.white : colors.text}
          />
        </TouchableOpacity>

        <View style={styles.controlsContainer}>
            <TouchableOpacity
              style={[
                styles.controlBtn,
                currentVideo === 0 && styles.controlBtnDisabled,
              ]}
              disabled={currentVideo === 0}
              onPress={goToPrevious}
            >
              <Ionicons
                name="play-skip-back"
                size={moderateScale(14)}
                color={isDarkMode ? colors.white : colors.text}
              />
            </TouchableOpacity>

          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: animatedProgress.interpolate({
                    inputRange: [0, 100],
                    outputRange: ["0%", "101%"],
                  }),
                },
              ]}
            />
          </View>

            <TouchableOpacity
              style={[
                styles.controlBtn,
                currentVideo === workouts.length - 1 && styles.controlBtnDisabled,
              ]}
              disabled={currentVideo === workouts.length - 1}
              onPress={goToNext}
            >
              <Ionicons
                name="play-skip-forward"
                size={moderateScale(14)}
                color={isDarkMode ? colors.white : colors.text}
              />
            </TouchableOpacity>
        </View>
      </View>

      <View style={styles.listWrapper}>
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: responsiveHeight(14),
          }}
        />
      </View>

      <View style={styles.bottomButtonWrapper}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.bottomButton}
          onPress={completeWorkout}
        >
          <View
            style={[
              styles.buttonProgress,
              {
                width: `${overallProgress}%`,
                backgroundColor: primaryColor,
              },
            ]}
          />

          <Text style={styles.buttonText}>Workout completed</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PracticeWorkout;

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  videoContainer: {
    width: "100%",
    height: responsiveHeight(36),
    backgroundColor: colors.backgroundElevated,
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
    backgroundColor: "rgba(0, 0, 0, 0.03)",
  },

  bottomGradient: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: responsiveHeight(16),
    zIndex: 2,
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
    bottom: responsiveHeight(2),
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: responsiveWidth(4),
    zIndex: 5,
  },

  controlBtn: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(20),
    backgroundColor: colors.backgroundElevated,
    justifyContent: "center",
    alignItems: "center",
  },

  controlBtnDisabled: {
    opacity: 0.35,
  },

  progressBar: {
    flex: 1,
    height: moderateScale(6.2),
    backgroundColor: colors.borderStrong,
    borderRadius: moderateScale(20),
    marginHorizontal: responsiveWidth(3),
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#FF1F2D",
  },

  listWrapper: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: responsiveHeight(1.5),
  },

  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: responsiveHeight(1.2),
    marginHorizontal: responsiveWidth(4),
    borderBottomColor: colors.backgroundElevated,
    borderBottomWidth: 1,
  },

  circleOuter: {
    marginRight: responsiveWidth(4),
  },

  activeCircleWrapper: {
    width: moderateScale(52),
    height: moderateScale(52),
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  svgStyle: {
    position: "absolute",
  },

  activeCircle: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(42),
    backgroundColor: colors.backgroundElevated,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },

  inactiveCircle: {
    width: moderateScale(52),
    height: moderateScale(52),
    borderRadius: moderateScale(50),
    backgroundColor: colors.backgroundElevated,
    borderWidth: 4.5,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },

  timeText: {
    color: colors.text,
    fontSize: moderateScale(11),
    fontFamily: "Inter-Medium",
  },

  contentContainer: {
    flex: 1,
  },

  title: {
    color: colors.text,
    fontSize: moderateScale(14),
    fontFamily: "Inter-Medium",
  },

  category: {
    color: colors.textMuted,
    fontSize: moderateScale(11),
    marginTop: responsiveHeight(0.3),
    fontFamily: "Inter-Regular",
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: responsiveHeight(0.6),
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: responsiveWidth(4),
  },

  metaText: {
    color: colors.text,
    fontSize: moderateScale(11),
    marginLeft: responsiveWidth(1),
  },

  bottomButtonWrapper: {
    position: "absolute",
    bottom: responsiveHeight(3),
    left: responsiveWidth(4),
    right: responsiveWidth(4),
  },

  bottomButton: {
    width: "100%",
    height: responsiveHeight(6.5),
    backgroundColor: colors.backgroundElevated,
    borderRadius: moderateScale(12),
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  buttonProgress: {
    position: "absolute",
    left: 0,
    height: "100%",
    backgroundColor: "#E50914",
  },

  buttonText: {
    color: colors.text,
    fontSize: moderateScale(15),
    fontWeight: "700",
    zIndex: 10,
  },
});
