import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  Image,
  StatusBar,
  Text,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { Audio } from "expo-av";

import { getPodcast, getPros, incrementPodcastPlays, reportPodcastProgress, reportWatchTime } from "../../services/api";
import { useBranding } from "../../context/BrandingContext";
import { useAppTheme, ThemeColors } from "../../context/ThemeContext";
import { useIsPro } from "../../utils/subscription";
import { useLanguage } from "../../i18n";
import ProPaywall from "../../Components/ProPaywall";

const PodcastDetail = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { primaryColor } = useBranding();
  const { colors, statusBarStyle } = useAppTheme();
  const { t } = useLanguage();
  const styles = createStyles(colors);
  const { id } = route.params || {};
  const soundRef = useRef<Audio.Sound | null>(null);
  const [podcast, setPodcast] = useState<any>(null);
  const isPro = useIsPro();
  const [proNames, setProNames] = useState<Set<string>>(new Set());

  useEffect(() => {
    getPros()
      .then((pros) =>
        setProNames(
          new Set(
            (pros || []).map((p: any) => String(p.name).toLowerCase().trim())
          )
        )
      )
      .catch(() => setProNames(new Set()));
  }, []);

  const isProPodcast = !!(
    podcast &&
    proNames.size > 0 &&
    (proNames.has(String(podcast.host || "").toLowerCase().trim()) ||
      (podcast.guest &&
        proNames.has(String(podcast.guest).toLowerCase().trim())))
  );

  const locked = !isPro && isProPodcast;
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(1);
  const [position, setPosition] = useState(0);
  const [repeatOn, setRepeatOn] = useState(false);
  const [shuffleOn, setShuffleOn] = useState(false);
  const repeatRef = useRef(false);
  const listenedSecRef = useRef(0);
  const lastPositionRef = useRef(0);
  const completionRef = useRef(0);
  const audioFile = require("../../assets/song.mp3");

  const bars = [
    1.2, 2.8, 1.6, 3.5, 1.8, 4.2, 2.2, 3.2, 1.4, 4.5, 2.4, 3.8, 1.6, 2.8, 4.2,
    1.8, 3.5, 2.4, 4.6, 1.5, 3.2, 2.2, 4.1, 1.7, 3.8, 2.6, 4.4, 1.4, 3.2, 2.1,
    4.5, 1.6, 3.7, 2.4, 4.2, 1.5, 3.4, 2.2, 4.6, 1.8, 3.8, 2.5, 4.4, 1.6, 3.2,
    2.1, 4.5, 1.7, 3.6, 2.4, 4.3, 1.5,
  ];

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      getPodcast(id)
        .then(setPodcast)
        .catch(() => setPodcast(null));
    }, [id])
  );

  const flushProgress = useCallback(
    (completion?: number) => {
      if (!id) return;
      const listenedSec = Math.round(listenedSecRef.current);
      if (listenedSec <= 0 && completion == null) return;

      const payload: { listenedSec?: number; completion?: number } = {};
      if (listenedSec > 0) payload.listenedSec = listenedSec;
      if (completion != null) {
        payload.completion = Math.max(0, Math.min(100, Math.round(completion)));
      }

      reportPodcastProgress(id, payload).catch(() => {});
      if (listenedSec > 0) {
        reportWatchTime(listenedSec).catch(() => {});
      }
      listenedSecRef.current = 0;
    },
    [id]
  );

  useEffect(() => {
    if (!podcast || locked) return;
    loadAudio();
    const interval = setInterval(() => flushProgress(), 30000);

    return () => {
      clearInterval(interval);
      flushProgress(completionRef.current);
      unloadAudio();
    };
  }, [podcast, flushProgress, locked]);

  const loadAudio = async () => {
    listenedSecRef.current = 0;
    lastPositionRef.current = 0;
    completionRef.current = 0;

    const source = podcast?.mediaUrl
      ? { uri: podcast.mediaUrl }
      : audioFile;

    try {
      const { sound } = await Audio.Sound.createAsync(source, {
        shouldPlay: false,

        progressUpdateIntervalMillis: 50,
      });

      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded) {
          const pos = status.positionMillis || 0;
          setPosition(pos);
          setDuration(status.durationMillis || 1);
          setIsPlaying(status.isPlaying);

          if (
            status.isPlaying &&
            lastPositionRef.current != null &&
            pos > lastPositionRef.current
          ) {
            listenedSecRef.current += (pos - lastPositionRef.current) / 1000;
          }
          lastPositionRef.current = pos;

          if (status.durationMillis) {
            completionRef.current = Math.min(
              100,
              Math.round((pos / status.durationMillis) * 100)
            );
          }

          if (status.didJustFinish) {
            if (repeatRef.current && soundRef.current) {
              soundRef.current.setPositionAsync(0);
              soundRef.current.playAsync();
              lastPositionRef.current = 0;
            } else {
              setIsPlaying(false);
              flushProgress(100);
            }
          }
        }
      });
    } catch {
      soundRef.current = null;
    }
  };

  const unloadAudio = async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
    }
  };

  const togglePlayPause = async () => {
    if (!soundRef.current) return;

    if (isPlaying) {
      await soundRef.current.pauseAsync();
      flushProgress(completionRef.current);
    } else {
      await soundRef.current.playAsync();
      if (id && podcast?.mediaUrl) {
        incrementPodcastPlays(id).catch(() => {});
      }
    }
  };

  const toggleRepeat = () => {
    const next = !repeatRef.current;
    repeatRef.current = next;
    setRepeatOn(next);
  };

  const toggleShuffle = () => {
    setShuffleOn((v) => !v);
  };

  const skipBack = async () => {
    if (!soundRef.current) return;
    const newPos = Math.max(0, position - 15000);
    await soundRef.current.setPositionAsync(newPos);
    setPosition(newPos);
  };

  const skipForward = async () => {
    if (!soundRef.current) return;
    let newPos: number;
    if (shuffleOn) {
      newPos = Math.random() * Math.max(0, duration - 1000);
    } else {
      newPos = Math.min(duration, position + 15000);
    }
    await soundRef.current.setPositionAsync(newPos);
    setPosition(newPos);
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const progress = position / duration;

  if (podcast && locked) {
    return (
      <ProPaywall
        title={t("podcastProTitle")}
        subtitle={t("podcastProDesc")}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={statusBarStyle}
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
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={moderateScale(22)} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.cardWrapper}>
          <ImageBackground
            source={
              podcast?.imageUrl
                ? { uri: podcast.imageUrl }
                : require("../../assets/podone.png")
            }
            style={styles.cardImage}
            imageStyle={styles.cardImageStyle}
          >
            <LinearGradient
              colors={[
                "rgba(0,255,100,0.70)",
                "rgba(0,255,100,0.35)",
                "rgba(0,255,100,0.20)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.greenOverlay}
            />

            <Image
              source={require("../../assets/mic.png")}
              style={styles.micImage}
              resizeMode="contain"
            />
          </ImageBackground>

          <View style={styles.profileWrapper}>
            <Image
              source={require("../../assets/mainprofile.png")}
              style={styles.profileImage}
            />
          </View>
        </View>

        <Text style={styles.authorText}>{podcast?.host || "Richard Murphy"}</Text>

        <Text style={styles.titleText}>
          {podcast?.title || "The Mentality Of\nElite Players"}
        </Text>

        <View style={styles.waveContainer}>
          {bars.map((barHeight, index) => {
            const currentBar = progress * bars.length;

            const isActive = index <= currentBar;

            return (
              <View
                key={index}
                style={[
                  styles.waveBar,
                  {
                    height: responsiveHeight(barHeight),

                    backgroundColor: isActive ? colors.text : colors.switchTrack,

                    transform: [
                      {
                        scaleY: isActive ? 1.05 : 1,
                      },
                    ],
                  },
                ]}
              />
            );
          })}
        </View>

        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>

          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>

        <View style={styles.playerContainer}>
          <TouchableOpacity onPress={toggleRepeat}>
            <Feather name="repeat" size={moderateScale(16)} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.smallButton} onPress={skipBack}>
            <Ionicons
              name="play-skip-back"
              size={moderateScale(20)}
              color={colors.text}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.playButton, { backgroundColor: primaryColor }]}
            activeOpacity={0.8}
            onPress={togglePlayPause}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={moderateScale(28)}
              color={colors.white}
              style={{
                marginLeft: isPlaying ? 0 : responsiveWidth(1),
              }}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.smallButton} onPress={skipForward}>
            <Ionicons
              name="play-skip-forward"
              size={moderateScale(20)}
              color={colors.text}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleShuffle}>
            <MaterialCommunityIcons
              name="shuffle"
              size={moderateScale(20)}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default PodcastDetail;

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  contentContainer: {
    flex: 1,
    paddingTop: responsiveHeight(6),
    paddingHorizontal: responsiveWidth(5),
    alignItems: "center",
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

  backButton: {
    width: responsiveWidth(10),
    height: responsiveWidth(10),
    borderRadius: moderateScale(50),
    backgroundColor: colors.backgroundElevated,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
  },

  cardWrapper: {
    marginTop: responsiveHeight(5),
    alignItems: "center",
  },

  cardImage: {
    width: responsiveWidth(70),
    height: responsiveHeight(30),
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderRadius: moderateScale(10),
  },

  cardImageStyle: {
    borderRadius: moderateScale(18),
  },

  greenOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  micImage: {
    width: responsiveWidth(72),
    height: responsiveHeight(32),
  },

  profileWrapper: {
    position: "absolute",
    bottom: responsiveHeight(-3),
    alignSelf: "center",
    borderWidth: moderateScale(3),
    borderColor: colors.background,
    borderRadius: moderateScale(100),
  },

  profileImage: {
    width: responsiveWidth(12),
    height: responsiveWidth(12),
    borderRadius: responsiveWidth(7),
  },

  authorText: {
    color: colors.textMuted,
    fontSize: moderateScale(14),
    marginTop: responsiveHeight(4),
    fontFamily: "Inter-Medium",
  },

  titleText: {
    color: colors.text,
    fontSize: moderateScale(20),
    textAlign: "center",
    lineHeight: moderateScale(28),
    marginTop: responsiveHeight(1),
    fontFamily: "Inter-Bold",
  },

  waveContainer: {
    width: responsiveWidth(88),
    height: responsiveHeight(5),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: responsiveHeight(6),
  },

  waveBar: {
    width: responsiveWidth(0.8),
    borderRadius: moderateScale(50),
  },

  timeRow: {
    width: responsiveWidth(88),
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: responsiveHeight(1.5),
  },

  timeText: {
    color: colors.textMuted,
    fontSize: moderateScale(12),
    fontFamily: "Inter-Medium",
  },

  playerContainer: {
    width: responsiveWidth(92),
    height: responsiveHeight(9),
    backgroundColor: colors.backgroundElevated,
    borderRadius: moderateScale(22),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    marginTop: responsiveHeight(4),
  },

  smallButton: {
    width: responsiveWidth(10),
    height: responsiveWidth(10),
    borderRadius: responsiveWidth(100),
    backgroundColor: colors.borderStrong,
    justifyContent: "center",
    alignItems: "center",
  },

  playButton: {
    width: responsiveWidth(16),
    height: responsiveWidth(16),
    borderRadius: responsiveWidth(8.5),
    backgroundColor: "#E50914",
    justifyContent: "center",
    alignItems: "center",
  },
});
