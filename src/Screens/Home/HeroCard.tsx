import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveWidth,
  responsiveHeight,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";

import LearnCard from "../../Components/Home/Cards/LearnCard";
import { getPros, getDrills } from "../../services/api";

const getWeekStart = () => {
  const weekStart = new Date();
  const currentDay = weekStart.getDay();
  const offset = (currentDay + 6) % 7;

  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - offset);

  return weekStart;
};

const getWeeklyViews = (drill: any, weekStart: Date) => {
  const history = Array.isArray(drill?.viewsHistory) ? drill.viewsHistory : [];

  if (!history.length) {
    return Number(drill?.views || 0);
  }

  return history.reduce((total: number, entry: any) => {
    const entryDate = entry?.date ? new Date(entry.date) : null;

    if (!entryDate || Number.isNaN(entryDate.getTime())) {
      return total;
    }

    if (entryDate < weekStart) {
      return total;
    }

    return total + Number(entry?.count || 0);
  }, 0);
};

const HeroCard = () => {
  const navigation = useNavigation<any>();
  const videoRef = useRef<Video>(null);
  const drillVideoRef = useRef<Video>(null);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [showDrillPlayButton, setShowDrillPlayButton] = useState(true);
  const [bannerPro, setBannerPro] = useState<any>(null);
  const [drillOfWeek, setDrillOfWeek] = useState<any>({
    coach: "Coach Hudson",
    videoUrl: "",
  });

  useEffect(() => {
    getPros()
      .then((pros) =>
        setBannerPro((pros || []).find((p: any) => p.homepageBanner) || null)
      )
      .catch(() => setBannerPro(null));
  }, []);

  useEffect(() => {
    let mounted = true;

    getDrills()
      .then((drills) => {
        if (!mounted || !Array.isArray(drills)) return;

        const weekStart = getWeekStart();
        const rankedDrills = drills
          .filter((drill: any) => drill?.videoUrl)
          .map((drill: any) => ({
            ...drill,
            weeklyViews: getWeeklyViews(drill, weekStart),
            totalViews: Number(drill?.views || 0),
          }))
          .sort(
            (a: any, b: any) =>
              b.weeklyViews - a.weeklyViews ||
              b.totalViews - a.totalViews ||
              new Date(b.createdAt || 0).getTime() -
                new Date(a.createdAt || 0).getTime()
          );

        const topDrill = rankedDrills[0];

        setDrillOfWeek(
          topDrill
            ? {
                coach: topDrill.coach || "Coach Hudson",
                videoUrl: topDrill.videoUrl,
              }
            : {
                coach: "Coach Hudson",
                videoUrl: "",
              }
        );
      })
      .catch(() => {
        if (!mounted) return;

        setDrillOfWeek({
          coach: "Coach Hudson",
          videoUrl: "",
        });
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setShowDrillPlayButton(true);
  }, [drillOfWeek.videoUrl]);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    if (status.didJustFinish) {
      setShowPlayButton(true);
    }
  };

  const handleDrillPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    if (status.didJustFinish) {
      setShowDrillPlayButton(true);
    }
  };

  const replayVideo = async () => {
    if (videoRef.current) {
      setShowPlayButton(false);

      await videoRef.current.replayAsync();
    }
  };

  const replayDrillVideo = async () => {
    if (drillVideoRef.current) {
      setShowDrillPlayButton(false);

      await drillVideoRef.current.replayAsync();
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.videoWrapper}>
        {bannerPro ? (
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.videoCard}
            onPress={() => navigation.navigate("ProsDetail", { pro: bannerPro })}
          >
            <ImageBackground
              source={{ uri: bannerPro.imageUrl }}
              style={styles.video}
              resizeMode="cover"
            >
              <View style={styles.shadowOverlay} />

              <View style={styles.bottomContent}>
                <Text style={styles.title}>{bannerPro.name}</Text>

                <Text style={styles.subtitle}>{bannerPro.team}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ) : (
          <View style={styles.videoCard}>
            <Video
              ref={videoRef}
              source={require("../../assets/video/intro.mp4")}
              style={styles.video}
              resizeMode={ResizeMode.COVER}
              shouldPlay
              isLooping={false}
              isMuted
              useNativeControls={false}
              onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            />

            {/* Shadow Overlay */}
            <View style={styles.shadowOverlay} />

            {showPlayButton && (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.playButton}
                onPress={replayVideo}
              >
                <Ionicons name="play" size={moderateScale(22)} color="#fff" />
              </TouchableOpacity>
            )}

            <View style={styles.bottomContent}>
              <Text style={styles.title}>Drill of the week</Text>

              <Text style={styles.subtitle}>Coach Hudson</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.drillWrapper}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.videoCard}
          onPress={replayDrillVideo}
        >
          <Video
            ref={drillVideoRef}
            source={
              drillOfWeek.videoUrl
                ? { uri: drillOfWeek.videoUrl }
                : require("../../assets/video/intro.mp4")
            }
            style={styles.video}
            resizeMode={ResizeMode.COVER}
            shouldPlay={false}
            isLooping={false}
            isMuted
            useNativeControls={false}
            onPlaybackStatusUpdate={handleDrillPlaybackStatusUpdate}
          />

          <View style={styles.shadowOverlay} />

          {showDrillPlayButton && (
            <View style={styles.playButton}>
              <Ionicons name="play" size={moderateScale(22)} color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.drillTextBlock}>
          <Text style={styles.title}>Drill of the week</Text>

          <Text style={styles.subtitle}>{drillOfWeek.coach}</Text>
        </View>
      </View>

      <LearnCard />
    </View>
  );
};

export default HeroCard;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingTop: responsiveHeight(2),
  },

  videoWrapper: {
    alignItems: "center",
  },

  drillWrapper: {
    alignItems: "center",
    marginTop: responsiveHeight(2),
  },

  videoCard: {
    width: responsiveWidth(93),
    height: responsiveHeight(24),
    borderRadius: moderateScale(12),
    overflow: "hidden",
    backgroundColor: "#111111",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  video: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },

  shadowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    zIndex: 5,
  },

  playButton: {
    width: responsiveWidth(14),
    height: responsiveWidth(14),
    borderRadius: responsiveWidth(9),
    backgroundColor: "#1f1f1fc0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    zIndex: 20,
  },

  drillTextBlock: {
    width: responsiveWidth(93),
    alignSelf: "center",
    marginTop: responsiveHeight(1),
  },

  bottomContent: {
    position: "absolute",
    bottom: responsiveHeight(1),
    left: responsiveWidth(2),
    zIndex: 20,
  },

  title: {
    color: "#fff",
    fontSize: moderateScale(17),
    fontFamily: "Inter-Bold",
  },

  subtitle: {
    color: "#929292",
    fontSize: moderateScale(12),
    fontFamily: "Inter-Medium",
  },
});
