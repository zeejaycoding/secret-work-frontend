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

const categoryLabel = (category: string) => {
  if (category === "Defence") return "Defense";
  return category;
};

const toLessonShape = (drill: any) => ({
  id: drill._id || drill.id,
  title: drill.title || "",
  subtitle: `${categoryLabel(drill.category || "Drill")}${
    drill.level ? `, ${drill.level}` : ""
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
  const videoRef = useRef<Video>(null);
  const pro = route?.params?.pro;

  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedTab, setSelectedTab] = useState("");
  const [lessons, setLessons] = useState<any[]>([]);
  const [tabs, setTabs] = useState<string[]>([]);

  const watchedSecRef = useRef(0);
  const lastPosRef = useRef(0);

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
        .map(toLessonShape);

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

    if (status.isPlaying && lastPosRef.current != null && currentPosition > lastPosRef.current) {
      watchedSecRef.current += (currentPosition - lastPosRef.current) / 1000;
    }
    lastPosRef.current = currentPosition;
  };

  const openDrill = (item: any) => {
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
    });
  };

  const filteredLessons = selectedTab
    ? lessons.filter((item) => item.category === selectedTab)
    : lessons;

  const renderLesson = ({ item }: any) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.lessonCard}
        onPress={() => openDrill(item)}
      >
        <Image source={item.image} style={styles.lessonImage} />

        <View style={styles.lessonContent}>
          <Text numberOfLines={1} style={styles.lessonTitle}>
            {item.title}
          </Text>

          <Text style={styles.lessonSubtitle}>{item.subtitle}</Text>

          <View style={styles.row}>
            <View style={styles.metaRow}>
              <Ionicons name="time" size={moderateScale(13)} color="#fff" />

              <Text style={styles.metaText}>{item.duration}</Text>
            </View>

            <View style={styles.metaRow}>
              <MaterialIcons
                name="sports-gymnastics"
                size={moderateScale(13)}
                color="#FFFFFF"
              />

              <Text style={styles.metaText}>{item.reps}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.playButton}
          onPress={() => openDrill(item)}
        >
          <Ionicons name="play" size={moderateScale(16)} color="#FFFFFF" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
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

          <LinearGradient
            colors={["rgba(0,0,0,0.2)", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.95)"]}
            style={styles.overlay}
          />

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={moderateScale(22)} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.controlBtn}>
              <Ionicons
                name="play-back"
                size={moderateScale(15)}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            <View style={styles.progressWrapper}>
              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progress}%`,
                    },
                  ]}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.controlBtn}
              onPress={() => setPaused(!paused)}
            >
              <Ionicons
                name={paused ? "play" : "pause"}
                size={moderateScale(15)}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.detailsWrapper}>
          <LinearGradient
            colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.2)", "#000000"]}
            style={styles.bottomOverlay}
          />

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

  video: {
    width: "100%",
    height: "100%",
  },

  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
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

  controlBtn: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: moderateScale(17),
    backgroundColor: "#111111",
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
    backgroundColor: "#2A2A2A",
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
    marginTop: responsiveHeight(-1),
    paddingHorizontal: responsiveWidth(4),
    zIndex: 2,
  },

  mainTitle: {
    color: "#FFFFFF",
    fontSize: moderateScale(18),
    marginBottom: responsiveHeight(0.2),
    fontFamily: "Inter-Medium",
  },

  subTitle: {
    color: "#929292",
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
    backgroundColor: "#111111",
    borderRadius: moderateScale(8),
    marginRight: responsiveWidth(1.2),
  },

  activeTabButton: {
    backgroundColor: "#E50914",
  },

  tabText: {
    color: "#929292",
    fontSize: moderateScale(12),
    fontFamily: "Inter-Medium",
  },

  activeTabText: {
    color: "#FFFFFF",
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
    borderBottomColor: "rgba(255,255,255,0.05)",
    paddingBottom: responsiveHeight(1),
  },

  lessonImage: {
    width: responsiveWidth(30),
    height: responsiveHeight(10),
    borderRadius: moderateScale(8),
    backgroundColor: "#111111",
  },

  lessonContent: {
    flex: 1,
    marginLeft: responsiveWidth(3),
  },

  lessonTitle: {
    color: "#FFFFFF",
    fontSize: moderateScale(12),
    marginBottom: responsiveHeight(0.5),
    fontFamily: "Inter-Medium",
  },

  lessonSubtitle: {
    color: "#929292",
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
    color: "#929292",
    fontSize: moderateScale(11),
    marginLeft: responsiveWidth(1),
    fontFamily: "Inter-Medium",
  },

  playButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(21),
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
});
