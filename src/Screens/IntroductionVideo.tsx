import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Image,
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
import {
  useAppTheme,
  ThemeColors,
  overlayGradient,
} from "../context/ThemeContext";

const IntroductionVideo = () => {
  const navigation = useNavigation<any>();
  const videoRef = useRef<Video>(null);
  const { colors, statusBarStyle, isDarkMode } = useAppTheme();
  const styles = createStyles(colors);
  const overlays = overlayGradient(isDarkMode);

  const [isPaused, setIsPaused] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);

  const progressAnim = useRef(new Animated.Value(0)).current;

  const videoSource = require("../assets/video/intro.mp4");

  const logoImage = require("../assets/logo.png");

  useEffect(() => {
    if (duration > 0) {
      Animated.timing(progressAnim, {
        toValue: currentPosition / duration,
        duration: 100,
        useNativeDriver: false,
      }).start();
    }
  }, [currentPosition, duration]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, responsiveWidth(82)],
  });

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    setDuration(status.durationMillis || 0);
    setCurrentPosition(status.positionMillis || 0);

    if (
      status.durationMillis &&
      status.positionMillis >= status.durationMillis - 500
    ) {
      setShowButton(true);
    }
  };

  const handlePlayPause = async () => {
    if (!videoRef.current) return;

    if (isPaused) {
      await videoRef.current.playAsync();
    } else {
      await videoRef.current.pauseAsync();
    }

    setIsPaused(!isPaused);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={statusBarStyle}
      />

      <Video
        ref={videoRef}
        source={videoSource}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping={false}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      />

      <View style={[styles.overlay, { backgroundColor: isDarkMode ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.20)" }]} />

      <LinearGradient
        colors={overlays.bottom.colors}
        locations={overlays.bottom.locations}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.bottomOverlay, { bottom: 0 }]}
      />

      <View style={styles.logoContainer}>
        <Image
          source={logoImage}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      {!showButton && (
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.playButton}
          onPress={handlePlayPause}
        >
          <Ionicons
            name={isPaused ? "play" : "pause"}
            size={moderateScale(30)}
            color={colors.white}
          />
        </TouchableOpacity>
      )}

      <View style={styles.bottomContainer}>
        {showButton ? (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.startButton}
            onPress={() => navigation.navigate("OnboardingDetail")}
          >
            <Text style={styles.startButtonText}>Start exploring</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressWidth,
                },
              ]}
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default IntroductionVideo;

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    video: {
      position: "absolute",
      width: "100%",
      height: "100%",
    },

     overlay: {
      position: "absolute",
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.45)",
    },

    bottomOverlay: {
      position: "absolute",
      bottom: 0,
      width: "100%",
      height: "100%",
    },

    logoContainer: {
      alignItems: "center",
      marginTop: responsiveHeight(7),
    },

    logoImage: {
      width: responsiveWidth(22),
      height: responsiveHeight(8),
    },

    playButton: {
      position: "absolute",
      top: responsiveHeight(45),
      alignSelf: "center",
      width: moderateScale(70),
      height: moderateScale(70),
      borderRadius: moderateScale(100),
      backgroundColor: "rgba(0, 0, 0, 0.68)",
      justifyContent: "center",
      alignItems: "center",
    },

    bottomContainer: {
      position: "absolute",
      bottom: responsiveHeight(2),
      width: "100%",
      alignItems: "center",
    },

    progressBarContainer: {
      width: responsiveWidth(85),
      height: moderateScale(6.5),
      backgroundColor: colors.backgroundInput,
      borderRadius: moderateScale(20),
      overflow: "hidden",
    },

    progressBar: {
      height: "100%",
      backgroundColor: "#FF1F2D",
    },

    startButton: {
      width: responsiveWidth(90),
      height: responsiveHeight(6.5),
      backgroundColor: "#FF1F2D",
      borderRadius: moderateScale(12),
      justifyContent: "center",
      alignItems: "center",
    },

    startButtonText: {
      color: colors.white,
      fontSize: moderateScale(14),
      fontFamily: "Inter-Medium",
    },
  });
