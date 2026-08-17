import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
} from "react-native";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ScreenOrientation from "expo-screen-orientation";
import { markDrillComplete, recordDrillView, reportWatchTime } from "../../services/api";
import { getCachedPreferences } from "../../services/preferences";
import { useBranding } from "../../context/BrandingContext";
import { useAppTheme, ThemeColors } from "../../context/ThemeContext";
import { useIsPro } from "../../utils/subscription";
import ProPaywall from "../../Components/ProPaywall";

const QUALITY_OPTIONS = ["Auto", "1080p", "720p", "480p", "360p"];

const buildVideoSource = (
  uri: string | null | undefined,
  quality: string,
) => {
  if (!uri) return null;

  if (quality === "Auto") return { uri };

  const separator = uri.includes("?") ? "&" : "?";

  return { uri: `${uri}${separator}quality=${encodeURIComponent(quality)}` };
};

const formatTime = (millis: number) => {
  const totalSeconds = Math.floor(millis / 1000);

  const minutes = Math.floor(totalSeconds / 60);

  const seconds = totalSeconds % 60;

  return `${minutes < 10 ? "0" : ""}${minutes}:${
    seconds < 10 ? "0" : ""
  }${seconds}`;
};

type VideoPlayerProps = {
  drill: any;
  quality: string;
  reloadKey: number;
  mode: "inline" | "fullscreen";
  active: boolean;
  forcePaused?: boolean;
  onClose?: () => void;
  onToggleFullscreen: () => void;
  onOpenQuality: () => void;
  onNextDrill?: () => void;
  onPreviousDrill?: () => void;
  hasNextDrill?: boolean;
  hasPreviousDrill?: boolean;
};

const VideoPlayer = ({
  drill,
  quality,
  reloadKey,
  mode,
  active,
  forcePaused = false,
  onClose,
  onToggleFullscreen,
  onOpenQuality,
  onNextDrill,
  onPreviousDrill,
  hasNextDrill = false,
  hasPreviousDrill = false,
}: VideoPlayerProps) => {
  const { primaryColor } = useBranding();
  const { colors, isDarkMode } = useAppTheme();
  const styles = createStyles(colors);
  const videoRef = useRef<Video>(null);
  const completionSent = useRef(false);
  const viewSent = useRef(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const watchedSecRef = useRef(0);
  const lastPosRef = useRef(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [totalDuration, setTotalDuration] = useState("00:00");
  const [centerFlash, setCenterFlash] = useState(false);
  const status = useRef<AVPlaybackStatus | null>(null);

  const lastTapRef = useRef<{ time: number; side: "left" | "right" } | null>(null);
  const [tapIndicator, setTapIndicator] = useState<"left" | "right" | null>(null);
  const tapAnim = useRef(new Animated.Value(0)).current;
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const autoplay = getCachedPreferences().autoplayVideos;

  const flushWatchTime = () => {
    const sec = Math.round(watchedSecRef.current);
    if (sec <= 0) return;
    watchedSecRef.current = 0;
    reportWatchTime(sec, drill?.id).catch(() => {});
  };

  useEffect(() => {
    const interval = setInterval(() => flushWatchTime(), 30000);

    return () => {
      clearInterval(interval);
      flushWatchTime();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    };
  }, []);

  const handleVideoTap = (side: "left" | "right") => {
    const now = Date.now();
    const last = lastTapRef.current;

    if (last && last.side === side && now - last.time < 300) {
      lastTapRef.current = null;

      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      tapTimerRef.current = null;

      const s = status.current;
      if (!s || !s.isLoaded) return;

      if (side === "left") {
        videoRef.current?.setPositionAsync(
          Math.max((s.positionMillis || 0) - 10000, 0),
        );
      } else {
        videoRef.current?.setPositionAsync(
          Math.min((s.positionMillis || 0) + 10000, s.durationMillis || 0),
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
        togglePlayPause();
      }, 250);
    }
  };

  const videoSource = useMemo(
    () => buildVideoSource(drill?.videoUrl, quality),
    [drill?.videoUrl, quality],
  );

  const togglePlayPause = () => {
    const next = !paused;
    setPaused(next);

    if (!next) {
      setCenterFlash(true);

      if (flashTimer.current) clearTimeout(flashTimer.current);

      flashTimer.current = setTimeout(() => setCenterFlash(false), 1200);
    }
  };

  const handlePlaybackStatusUpdate = (statusUpdate: AVPlaybackStatus) => {
    status.current = statusUpdate;
    if (!statusUpdate.isLoaded) return;

    if (statusUpdate.isPlaying && !viewSent.current && drill?.id) {
      viewSent.current = true;
      recordDrillView(drill.id).catch(() => {});
    }

    const currentPosition = statusUpdate.positionMillis || 0;
    const duration = statusUpdate.durationMillis || 1;
    const progressPercentage = (currentPosition / duration) * 100;

    setProgress(progressPercentage);

    setCurrentTime(formatTime(currentPosition));
    setTotalDuration(formatTime(duration));

    if (statusUpdate.isPlaying && lastPosRef.current != null && currentPosition > lastPosRef.current) {
      watchedSecRef.current += (currentPosition - lastPosRef.current) / 1000;
    }
    lastPosRef.current = currentPosition;

    if (drill?.id && !completionSent.current && progressPercentage >= 90) {
      completionSent.current = true;
      markDrillComplete(drill.id).catch(() => {});
      flushWatchTime();
    }
  };

  return (
    <View
      style={[
        styles.videoContainer,
        mode === "fullscreen" && styles.fullscreenContainer,
      ]}
    >
      {videoSource ? (
        <Video
          key={reloadKey}
          ref={videoRef}
          style={styles.video}
          source={videoSource}
          resizeMode={ResizeMode.COVER}
          shouldPlay={autoplay && !paused && !forcePaused}
          isLooping
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        />
      ) : (
        <View style={styles.videoPlaceholder}>
          <Ionicons
            name="videocam-off-outline"
            size={moderateScale(26)}
            color={colors.textSecondary}
          />
          <Text style={styles.videoPlaceholderText}>Video coming soon</Text>
        </View>
      )}

      {active && (
        <>
          {isDarkMode && (
            <LinearGradient
              colors={["rgba(0,0,0,0.2)", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.95)"]}
              style={styles.overlay}
            />
          )}

          {videoSource && (
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
          )}

          {mode === "inline" && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={moderateScale(22)} color={colors.text} />
            </TouchableOpacity>
          )}

          {(paused || centerFlash) && (
            <View style={styles.centerIcon} pointerEvents="none">
              <Ionicons
                name={paused ? "play" : "pause"}
                size={moderateScale(22)}
                color={colors.white}
              />
            </View>
          )}

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
              <Text style={styles.tapLabel}>
                10 sec
              </Text>
            </Animated.View>
          )}

          <View style={styles.controlsContainer}>
            <View style={styles.progressRow}>
              <Text style={styles.timeText}>{currentTime}</Text>

              <View style={styles.progressWrapper}>
                <View style={styles.progressBg}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${progress}%`,
                        backgroundColor: primaryColor,
                      },
                    ]}
                  />
                </View>
              </View>

              <Text style={styles.timeText}>{totalDuration}</Text>
            </View>

            <View style={styles.bottomRow}>
              {onPreviousDrill && (
                <TouchableOpacity
                  style={[
                    styles.controlBtn,
                    !hasPreviousDrill && styles.controlBtnDisabled,
                  ]}
                  disabled={!hasPreviousDrill}
                  onPress={onPreviousDrill}
                >
                  <Ionicons
                    name="play-skip-back"
                    size={moderateScale(15)}
                    color={colors.white}
                  />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.controlBtn}
                onPress={onToggleFullscreen}
              >
                <Ionicons
                  name={mode === "fullscreen" ? "contract" : "expand"}
                  size={moderateScale(15)}
                  color={colors.white}
                />
              </TouchableOpacity>

              {onNextDrill && (
                <TouchableOpacity
                  style={[
                    styles.controlBtn,
                    !hasNextDrill && styles.controlBtnDisabled,
                  ]}
                  disabled={!hasNextDrill}
                  onPress={onNextDrill}
                >
                  <Ionicons
                    name="play-skip-forward"
                    size={moderateScale(15)}
                    color={colors.white}
                  />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.controlBtn}
                onPress={onOpenQuality}
              >
                <Ionicons
                  name="settings-outline"
                  size={moderateScale(15)}
                  color={colors.white}
                />
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const DrilLibraryDetail = ({ route }: any) => {
  const { primaryColor } = useBranding();
  const { colors, statusBarStyle } = useAppTheme();
  const styles = createStyles(colors);
  const navigation = useNavigation<any>();
  const drill = route?.params?.drill;
  const drills = route?.params?.drills || [];
  const currentDrillIndex = route?.params?.currentDrillIndex ?? -1;
  const isPro = useIsPro();

  if (!isPro) {
    return (
      <ProPaywall
        title="Drills are a Pro feature"
        subtitle="Subscribe to Pro to unlock all drills and training videos."
      />
    );
  }

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQuality, setShowQuality] = useState(false);
  const [quality, setQuality] = useState(() => {
    const saved = getCachedPreferences().videoQuality;
    return QUALITY_OPTIONS.includes(saved) ? saved : "Auto";
  });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    return () => {
      ScreenOrientation.unlockAsync().catch(() => {});
    };
  }, []);

  const toggleFullscreen = async () => {
    const next = !isFullscreen;
    setIsFullscreen(next);

    try {
      if (next) {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE,
        );
      } else {
        await ScreenOrientation.unlockAsync();
      }
    } catch {}
  };

  const selectQuality = (value: string) => {
    setQuality(value);
    setShowQuality(false);
    setReloadKey((key) => key + 1);
  };

  const drillTitle = drill?.title || "Two-ball pound series";
  const drillSubTitle = drill
    ? `${drill.category || "Passing"}. ${drill.level || "Beginner"}`
    : "Passing. Beginner";
  const drillDescription =
    drill?.description ||
    "A high-intensity dribbling drill using both hands at the same time to build control, rhythm, and hand strength. Focus on pounding the ball hard, staying low, and keeping your eyes up. This drill improves ambidexterity, ball control under pressure, and overall handle confidence.";

  const hasNextDrill = currentDrillIndex >= 0 && currentDrillIndex < drills.length - 1;
  const hasPreviousDrill = currentDrillIndex > 0;

  const goToNextDrill = () => {
    if (hasNextDrill) {
      const nextDrill = drills[currentDrillIndex + 1];
      navigation.replace("DrilLibraryDetail", {
        drill: nextDrill,
        drills,
        currentDrillIndex: currentDrillIndex + 1,
      });
    }
  };

  const goToPreviousDrill = () => {
    if (hasPreviousDrill) {
      const prevDrill = drills[currentDrillIndex - 1];
      navigation.replace("DrilLibraryDetail", {
        drill: prevDrill,
        drills,
        currentDrillIndex: currentDrillIndex - 1,
      });
    }
  };

  const playerProps = {
    drill,
    quality,
    reloadKey,
    onToggleFullscreen: toggleFullscreen,
    onOpenQuality: () => setShowQuality(true),
    onNextDrill: drills.length > 0 ? goToNextDrill : undefined,
    onPreviousDrill: drills.length > 0 ? goToPreviousDrill : undefined,
    hasNextDrill,
    hasPreviousDrill,
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
        <VideoPlayer
          {...playerProps}
          mode="inline"
          active={!isFullscreen}
          forcePaused={isFullscreen}
          onClose={() => navigation.goBack()}
        />

        <View style={styles.detailsContainer}>
          <Text style={styles.mainTitle}>{drillTitle}</Text>

          <Text style={styles.subTitle}>{drillSubTitle}</Text>
          <Text style={styles.descriptionTitle}>Description</Text>

          <Text style={styles.descriptionText}>{drillDescription}</Text>
        </View>
      </ScrollView>

      {isFullscreen && (
        <VideoPlayer {...playerProps} mode="fullscreen" active={isFullscreen} />
      )}

      <Modal
        visible={showQuality}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setShowQuality(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowQuality(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.qualitySheet}
            onPress={() => {}}
          >
            <View style={styles.headerRow}>
              <Text style={styles.qualityTitle}>Video quality</Text>

              <TouchableOpacity onPress={() => setShowQuality(false)}>
                <Ionicons name="close" size={moderateScale(20)} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.qualityOptions}>
              {QUALITY_OPTIONS.map((item, index) => {
                const active = quality === item;

                return (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.8}
                    style={styles.qualityItem}
                    onPress={() => selectQuality(item)}
                  >
                    <View
                      style={[
                        styles.qualityCheck,
                        active && styles.qualityCheckActive,
                        active && {
                          backgroundColor: primaryColor,
                          borderColor: primaryColor,
                        },
                      ]}
                    >
                      <Ionicons
                        name="checkmark"
                        size={moderateScale(10)}
                        color={active ? colors.white : colors.textSecondary}
                      />
                    </View>

                    <Text
                      style={[
                        styles.qualityText,
                        active && styles.qualityTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default DrilLibraryDetail;

const createStyles = (colors: ThemeColors) =>
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

  fullscreenContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    backgroundColor: colors.background,
    zIndex: 999,
  },

  video: {
    width: "100%",
    height: "100%",
  },

  videoPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.backgroundCard,
    justifyContent: "center",
    alignItems: "center",
  },

  videoPlaceholderText: {
    color: colors.textSecondary,
    fontSize: moderateScale(13),
    marginTop: responsiveHeight(1),
    fontFamily: "Inter-Medium",
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

  centerIcon: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: moderateScale(64),
    height: moderateScale(64),
    marginLeft: moderateScale(-32),
    marginTop: moderateScale(-32),
    borderRadius: moderateScale(50),
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
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
    bottom: 0,
    width: "100%",
    paddingHorizontal: responsiveWidth(4),
    paddingBottom: responsiveHeight(2),
    zIndex: 10,
  },

  seekRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: moderateScale(16),
    marginBottom: responsiveHeight(1),
  },

  progressRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: moderateScale(8),
    marginTop: responsiveHeight(1),
  },

  timeText: {
    color: colors.white,
    fontSize: moderateScale(10),
    fontFamily: "Inter-Medium",
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

  controlBtn: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: moderateScale(17),
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },

  controlBtnDisabled: {
    opacity: 0.35,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  qualitySheet: {
    width: "100%",
    backgroundColor: colors.background,
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    paddingHorizontal: responsiveWidth(4),
    paddingTop: responsiveHeight(2),
    paddingBottom: responsiveHeight(4),
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: responsiveHeight(1),
  },

  qualityTitle: {
    color: colors.text,
    fontSize: moderateScale(20),
    fontFamily: "Inter-Medium",
  },

  qualityOptions: {
    marginTop: responsiveHeight(0.5),
  },

  qualityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: responsiveHeight(1.2),
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundElevated,
  },

  qualityCheck: {
    width: moderateScale(16),
    height: moderateScale(16),
    borderRadius: moderateScale(50),
    backgroundColor: colors.border,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginRight: responsiveWidth(3),
  },

  qualityCheckActive: {
    backgroundColor: "#E50914",
    borderColor: "#E50914",
  },

  qualityText: {
    color: colors.textMuted,
    fontSize: moderateScale(12),
    fontFamily: "Inter-Medium",
  },

  qualityTextActive: {
    color: colors.textMuted,
  },

  detailsContainer: {
    paddingHorizontal: responsiveWidth(4),
    paddingTop: responsiveHeight(2),
  },

  mainTitle: {
    color: colors.text,
    fontSize: moderateScale(18),
    marginBottom: responsiveHeight(0.2),
    fontFamily: "Inter-Medium",
  },

  subTitle: {
    color: colors.textMuted,
    fontSize: moderateScale(12),
    fontFamily: "Inter-Regular",
    marginBottom: responsiveHeight(2.5),
  },

  descriptionTitle: {
    color: colors.text,
    fontSize: moderateScale(15),
    marginBottom: responsiveHeight(0.5),
    fontFamily: "Inter-Medium",
  },

  descriptionText: {
    color: colors.textMuted,
    fontSize: moderateScale(12),
    lineHeight: moderateScale(18),
    fontFamily: "Inter-Regular",
  },
});
