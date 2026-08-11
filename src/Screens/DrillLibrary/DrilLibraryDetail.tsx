import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Modal,
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
  forcePaused?: boolean;
  onClose?: () => void;
  onToggleFullscreen: () => void;
  onOpenQuality: () => void;
};

const VideoPlayer = ({
  drill,
  quality,
  reloadKey,
  mode,
  forcePaused = false,
  onClose,
  onToggleFullscreen,
  onOpenQuality,
}: VideoPlayerProps) => {
  const { primaryColor } = useBranding();
  const videoRef = useRef<Video>(null);
  const completionSent = useRef(false);
  const viewSent = useRef(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const watchedSecRef = useRef(0);
  const lastPosRef = useRef(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [centerFlash, setCenterFlash] = useState(false);

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
    };
  }, []);

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

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    if (status.isPlaying && !viewSent.current && drill?.id) {
      viewSent.current = true;
      recordDrillView(drill.id).catch(() => {});
    }

    const currentPosition = status.positionMillis || 0;
    const duration = status.durationMillis || 1;
    const progressPercentage = (currentPosition / duration) * 100;

    setProgress(progressPercentage);

    setCurrentTime(formatTime(currentPosition));

    if (status.isPlaying && lastPosRef.current != null && currentPosition > lastPosRef.current) {
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
            color="#666666"
          />
          <Text style={styles.videoPlaceholderText}>Video coming soon</Text>
        </View>
      )}

      <LinearGradient
        colors={["rgba(0,0,0,0.2)", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.95)"]}
        style={styles.overlay}
      />

      {videoSource && (
        <TouchableOpacity
          activeOpacity={1}
          style={styles.videoTouch}
          onPress={togglePlayPause}
        />
      )}

      {mode === "inline" && (
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
        >
          <Ionicons name="close" size={moderateScale(22)} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {(paused || centerFlash) && (
        <View style={styles.centerIcon} pointerEvents="none">
          <Ionicons
            name={paused ? "play" : "pause"}
            size={moderateScale(22)}
            color="#FFFFFF"
          />
        </View>
      )}

      <View style={styles.controlsContainer}>
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

        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={onToggleFullscreen}
          >
            <Ionicons
              name={mode === "fullscreen" ? "contract" : "expand"}
              size={moderateScale(15)}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlBtn}
            onPress={onOpenQuality}
          >
            <Ionicons
              name="settings-outline"
              size={moderateScale(15)}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const DrilLibraryDetail = ({ route }: any) => {
  const { primaryColor } = useBranding();
  const navigation = useNavigation<any>();
  const drill = route?.params?.drill;

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

  const playerProps = {
    drill,
    quality,
    reloadKey,
    onToggleFullscreen: toggleFullscreen,
    onOpenQuality: () => setShowQuality(true),
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <VideoPlayer
          {...playerProps}
          mode="inline"
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
        <VideoPlayer {...playerProps} mode="fullscreen" />
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
                <Ionicons name="close" size={moderateScale(20)} color="#fff" />
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
                        color={active ? "#fff" : "#666"}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
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
    backgroundColor: "#000",
    zIndex: 999,
  },

  video: {
    width: "100%",
    height: "100%",
  },

  videoPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#0A0A0A",
    justifyContent: "center",
    alignItems: "center",
  },

  videoPlaceholderText: {
    color: "#666666",
    fontSize: moderateScale(13),
    marginTop: responsiveHeight(1),
    fontFamily: "Inter-Medium",
  },

  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  videoTouch: {
    ...StyleSheet.absoluteFillObject,
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
    backgroundColor: "#111111",
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
  },

  timeText: {
    color: "#FFFFFF",
    fontSize: moderateScale(10),
    marginRight: responsiveWidth(3),
    fontFamily: "Inter-Medium",
  },

  progressWrapper: {
    flex: 1,
    marginRight: responsiveWidth(3),
  },

  progressBg: {
    width: "100%",
    height: moderateScale(6),
    backgroundColor: "#2A2A2A",
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
    backgroundColor: "#111111",
    justifyContent: "center",
    alignItems: "center",
  },

  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(8),
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  qualitySheet: {
    width: "100%",
    backgroundColor: "#050505",
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
    color: "#fff",
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
    borderBottomColor: "#111111",
  },

  qualityCheck: {
    width: moderateScale(16),
    height: moderateScale(16),
    borderRadius: moderateScale(50),
    backgroundColor: "#1F1F1F",
    borderWidth: 1,
    borderColor: "#1F1F1F",
    justifyContent: "center",
    alignItems: "center",
    marginRight: responsiveWidth(3),
  },

  qualityCheckActive: {
    backgroundColor: "#E50914",
    borderColor: "#E50914",
  },

  qualityText: {
    color: "#8A8F98",
    fontSize: moderateScale(12),
    fontFamily: "Inter-Medium",
  },

  qualityTextActive: {
    color: "#8A8F98",
  },

  detailsContainer: {
    paddingHorizontal: responsiveWidth(4),
    paddingTop: responsiveHeight(2),
  },

  mainTitle: {
    color: "#FFFFFF",
    fontSize: moderateScale(18),
    marginBottom: responsiveHeight(0.2),
    fontFamily: "Inter-Medium",
  },

  subTitle: {
    color: "#929292",
    fontSize: moderateScale(12),
    fontFamily: "Inter-Regular",
    marginBottom: responsiveHeight(2.5),
  },

  descriptionTitle: {
    color: "#FFFFFF",
    fontSize: moderateScale(15),
    marginBottom: responsiveHeight(0.5),
    fontFamily: "Inter-Medium",
  },

  descriptionText: {
    color: "#929292",
    fontSize: moderateScale(12),
    lineHeight: moderateScale(18),
    fontFamily: "Inter-Regular",
  },
});
