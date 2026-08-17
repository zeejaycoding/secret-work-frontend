import React, { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  Image,
  StatusBar,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { getPodcasts, getPros } from "../../services/api";
import { useAppTheme, ThemeColors } from "../../context/ThemeContext";
import { useLanguage } from "../../i18n";
import { useIsPro } from "../../utils/subscription";
import ProPaywall from "../../Components/ProPaywall";

const PodcastsScreen = () => {
  const navigation = useNavigation<any>();
  const { colors, statusBarStyle } = useAppTheme();
  const { t } = useLanguage();
  const styles = createStyles(colors);
  const isPro = useIsPro();

  const [trendingData, setTrendingData] = useState<any[]>([]);
  const [learnData, setLearnData] = useState<any[]>([]);

  const loadPodcasts = useCallback(() => {
    if (!isPro) return;
    Promise.all([getPodcasts(), getPros()])
      .then(([podcasts, pros]) => {
        const proNames = new Set(
          pros.map((p) => String(p.name).toLowerCase().trim())
        );
        const isProPodcast = (p: any) =>
          proNames.has(String(p.host).toLowerCase().trim()) ||
          (p.guest &&
            proNames.has(String(p.guest).toLowerCase().trim()));

        const proPodcasts = podcasts.filter(isProPodcast);
        const regularPodcasts = podcasts.filter((p: any) => !isProPodcast(p));

        setTrendingData(
          regularPodcasts.slice(0, 2).map((p) => ({
            id: p._id,
            title: p.title,
            author: p.host,
            category: p.guest ? t("guest", { name: p.guest }) : p.type,
            image: p.imageUrl || require("../../assets/podone.png"),
            micImage: require("../../assets/mic.png"),
            overlay: ["rgba(54,255,124,0.75)", "rgba(0,180,90,0.65)"],
          }))
        );
        setLearnData(
          proPodcasts.map((p) => ({
            id: p._id,
            title: p.title,
            author: p.guest || p.host,
            duration: p.duration,
            image: p.imageUrl || require("../../assets/mode2.jpg"),
          }))
        );
      })
      .catch(() => {
        setTrendingData([]);
        setLearnData([]);
      });
  }, [isPro]);

  useFocusEffect(
    useCallback(() => {
      loadPodcasts();
      const interval = setInterval(loadPodcasts, 10000);
      return () => clearInterval(interval);
    }, [loadPodcasts])
  );

  if (!isPro) {
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.heading}>{t("podcastHeading")}</Text>

          <Text style={styles.subHeading}>{t("podcastSub")}</Text>
        </View>

        <Text style={styles.sectionTitle}>{t("trendingNow")}</Text>

        {trendingData.length === 0 && (
          <Text style={styles.emptyText}>{t("noEpisodes")}</Text>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {trendingData.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              style={styles.trendingCard}
              onPress={() =>
                navigation.navigate("PodcastDetail", { id: item.id })
              }
            >
              <ImageBackground
                source={item.image}
                style={styles.trendingImage}
                imageStyle={styles.trendingImageStyle}
              >
                <LinearGradient
                  colors={item.overlay as any}
                  style={styles.trendingOverlay}
                >
                  <Image
                    source={item.micImage}
                    style={styles.micImage}
                    resizeMode="contain"
                  />

                  <Text style={styles.trendingTitle}>{item.title}</Text>

                  <View style={styles.bottomRow}>
                    <View style={styles.userRow}>
                      <View>
                        <Image
                          source={require("../../assets/avatar.png")}
                          style={styles.avatar}
                        />
                      </View>

                      <View>
                        <Text style={styles.authorText}>{item.author}</Text>

                        <Text style={styles.categoryText}>{item.category}</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.playButton}
                      onPress={() =>
                        navigation.navigate("PodcastDetail", { id: item.id })
                      }
                    >
                      <Ionicons
                        name="play"
                        size={moderateScale(14)}
                        color={colors.white}
                      />
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {learnData.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: moderateScale(18) }]}>
              {t("learnFromPros")}
            </Text>

            <View style={styles.learnContainer}>
              {learnData.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  style={styles.learnCard}
                  onPress={() =>
                    navigation.navigate("PodcastDetail", { id: item.id })
                  }
                >
                  <Image source={item.image} style={styles.learnImage} />

                  <View style={styles.learnContent}>
                    <Text numberOfLines={1} style={styles.learnTitle}>
                      {item.title}
                    </Text>

                    <Text style={styles.learnAuthor}>
                      {t("byAuthor", { name: item.author })}
                    </Text>

                    <View style={styles.durationRow}>
                      <MaterialCommunityIcons
                        name="clock-time-four"
                        size={moderateScale(12)}
                        color={colors.text}
                      />

                      <Text style={styles.durationText}>{item.duration}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.learnPlayButton}
                    onPress={() =>
                      navigation.navigate("PodcastDetail", { id: item.id })
                    }
                  >
                    <Ionicons name="play" size={moderateScale(15)} color={colors.text} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default PodcastsScreen;

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    paddingTop: responsiveHeight(7),
    paddingBottom: responsiveHeight(8),
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
    bottom: -responsiveHeight(10),
    width: responsiveWidth(100),
    height: responsiveHeight(40),
  },

  headerContainer: {
    paddingHorizontal: responsiveWidth(4),
    marginBottom: responsiveHeight(2),
  },

  heading: {
    color: colors.text,
    fontSize: moderateScale(24),
    fontFamily: "Inter-Medium",
  },

  subHeading: {
    color: colors.textMuted,
    fontSize: moderateScale(11),
    marginTop: moderateScale(1),
    fontFamily: "Inter-Regular",
  },

  sectionTitle: {
    color: colors.text,
    fontSize: moderateScale(18),
    paddingHorizontal: responsiveWidth(4),
    marginBottom: moderateScale(10),
    fontFamily: "Inter-Medium",
  },

  emptyText: {
    color: colors.textMuted,
    fontSize: moderateScale(13),
    paddingHorizontal: responsiveWidth(4),
    marginBottom: moderateScale(10),
    fontFamily: "Inter-Regular",
  },

  horizontalScroll: {
    paddingLeft: responsiveWidth(4),
    paddingRight: responsiveWidth(2),
  },

  trendingCard: {
    width: responsiveWidth(50),
    height: responsiveHeight(21),
    marginRight: responsiveWidth(3),
    borderRadius: moderateScale(12),
    overflow: "hidden",
  },

  trendingImage: {
    flex: 1,
  },

  trendingImageStyle: {
    borderRadius: moderateScale(12),
  },

  trendingOverlay: {
    flex: 1,
    justifyContent: "space-between",
    padding: moderateScale(14),
    position: "relative",
  },

  trendingTitle: {
    color: colors.white,
    fontSize: moderateScale(15),
    lineHeight: moderateScale(19),
    fontFamily: "Inter-Bold",
    width: "80%",
    zIndex: 2,
  },

  micImage: {
    width: responsiveWidth(40),
    height: responsiveHeight(20),
    position: "absolute",
    right: moderateScale(0),
    top: moderateScale(10),
    zIndex: 1,
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 2,
  },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  avatar: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(20),
    backgroundColor: colors.textSoft,
    marginRight: moderateScale(6),
  },

  authorText: {
    color: colors.white,
    fontSize: moderateScale(10),
    fontFamily: "Inter-Bold",
  },

  categoryText: {
    color: "#BFF5D3",
    fontSize: moderateScale(9.5),
  },

  playButton: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(30),
    backgroundColor: "#0C642C66",
    justifyContent: "center",
    alignItems: "center",
  },

  learnContainer: {
    paddingHorizontal: responsiveWidth(4),
  },

  learnCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: moderateScale(14),
  },

  learnImage: {
    width: responsiveWidth(26),
    height: responsiveHeight(10),
    borderRadius: moderateScale(8),
  },

  learnContent: {
    flex: 1,
    marginLeft: responsiveWidth(3),
  },

  learnTitle: {
    color: colors.text,
    fontSize: moderateScale(14),
    fontFamily: "Inter-Medium",
  },

  learnAuthor: {
    color: colors.textMuted,
    fontSize: moderateScale(11),
    marginTop: moderateScale(2),
    fontFamily: "Inter-Regular",
  },

  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: moderateScale(2),
  },

  durationText: {
    color: colors.textMuted,
    fontSize: moderateScale(11),
    marginLeft: moderateScale(4),
  },

  learnPlayButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(40),
    backgroundColor: colors.backgroundElevated,
    justifyContent: "center",
    alignItems: "center",
  },
});
