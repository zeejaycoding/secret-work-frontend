import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
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
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { getQuickWorkout } from "../../services/api";
import { useBranding } from "../../context/BrandingContext";
import { useAppTheme, ThemeColors } from "../../context/ThemeContext";
import { sumDurations } from "../../utils/duration";

const QuickWorkoutSecond = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { primaryColor } = useBranding();
  const { colors, statusBarStyle, isDarkMode } = useAppTheme();
  const styles = createStyles(colors, isDarkMode);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDrills, setSelectedDrills] = useState<any[]>([]);
  const [drillsData, setDrillsData] = useState<any[]>([]);
  const [availableLevels, setAvailableLevels] = useState<string[]>([]);
  const level = route.params?.level || "Random";
  const coach = route.params?.coach || "";

  useEffect(() => {
    let mounted = true;

    getQuickWorkout({ level, coach: coach || undefined })
      .then((result) => {
        if (!mounted) return;

        const drills = Array.isArray(result?.drills) ? result.drills : [];
        setAvailableLevels(result?.availableLevels || []);

        if (drills.length) {
          setDrillsData(
            drills.map((d, index) => ({
              id: d.id,
              title: d.title,
              subTitle: d.subTitle || d.category,
              videoUrl: d.videoUrl || "",
              image: d.image || "",
              duration: d.duration || "20 secs",
              level: d.level || "",
              reps: d.reps || "5 Reps",
            }))
          );
          setSelectedDrills(drills.slice(0, 2).map((d) => d.id));
        } else {
          setDrillsData([]);
          setSelectedDrills([]);
        }
      })
      .catch(() => {
        if (mounted) {
          setDrillsData([]);
          setSelectedDrills([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, [level, coach]);

  const toggleSelection = (id: any) => {
    if (selectedDrills.includes(id)) {
      setSelectedDrills(selectedDrills.filter((item) => item !== id));
    } else {
      if (selectedDrills.length < 5) {
        setSelectedDrills([...selectedDrills, id]);
      }
    }
  };

  const categories = [
    "All",
    ...Array.from(
      new Set(
        drillsData.map((d: any) => d.category || d.subTitle).filter(Boolean)
      )
    ),
  ];

  const activeCategory = categories.includes(selectedCategory)
    ? selectedCategory
    : "All";

  const visibleDrills =
    activeCategory === "All"
      ? drillsData
      : drillsData.filter(
          (d: any) => (d.category || d.subTitle) === activeCategory
        );

  const selectedItems = visibleDrills.filter((d: any) =>
    selectedDrills.includes(d.id)
  );

  const levelLabelMap: Record<string, string> = {
    "Youth/ High school": "Beginner",
    "Youth/High school": "Beginner",
    NCAA: "Intermediate",
    PRO: "Advanced",
    Random: "Mixed levels",
  };
  const levelLabel = levelLabelMap[level] || level;

  const content = (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.mainScrollContainer}
      >
        <View style={styles.contentContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather
              name="chevron-left"
              size={moderateScale(22)}
              color={isDarkMode ? colors.white : colors.text}
            />
          </TouchableOpacity>

          <View style={styles.progressContainer}>
            <Text style={styles.stepText}>Step 2 of 2</Text>

            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
          </View>

          <View style={styles.headingContainer}>
            <Text style={styles.heading}>Drilling skills</Text>

            <Text style={styles.subHeading}>
              {coach
                ? `Pick up to 5 skills by ${coach}`
                : "Pickup up to 5 skills"}
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContainer}
          >
            {categories.map((item, index) => {
              const active = selectedCategory === item;
              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  style={[
                    styles.categoryButton,
                    active && styles.activeCategoryButton,
                  ]}
                  onPress={() => setSelectedCategory(item)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      active && styles.activeCategoryText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.drillWrapper}>
            {visibleDrills.length === 0 ? (
              <View style={styles.emptyContainer}>
                {drillsData.length === 0 ? (
                  <>
                    <Text style={styles.emptyTitle}>
                      {coach
                        ? `No ${level === "Random" ? "" : `${level} `}drills from ${coach} yet`
                        : "No drills available yet"}
                    </Text>

                    {availableLevels.length > 0 && (
                      <Text style={styles.emptyDesc}>
                        Pick a level that has drills:{" "}
                        {availableLevels.join(", ")}.
                      </Text>
                    )}
                  </>
                ) : (
                  <Text style={styles.emptyTitle}>
                    No drills in {activeCategory} yet
                  </Text>
                )}
              </View>
            ) : (
              visibleDrills.map((item) => {
                const selected = selectedDrills.includes(item.id);

                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.8}
                    style={[
                      styles.drillCard,
                      selected && styles.activeDrillCard,
                      selected && { borderColor: primaryColor },
                    ]}
                    onPress={() => toggleSelection(item.id)}
                  >
                    <View style={styles.leftRow}>
                      <View
                        style={[
                          styles.radioCircle,
                          selected && styles.activeRadioCircle,
                        ]}
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={moderateScale(18)}
                          color={selected ? primaryColor : colors.switchTrack}
                        />
                      </View>

                      <View>
                        <Text style={styles.drillTitle}>{item.title}</Text>

                        <Text style={styles.drillSubTitle}>
                          {item.subTitle}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomFixedContainer}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons
              name="time"
              size={moderateScale(13)}
              color={isDarkMode ? colors.white : colors.text}
            />

            <Text style={styles.infoText}>
              {sumDurations(selectedItems.map((d: any) => d.duration))}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <FontAwesome5
              name="basketball-ball"
              size={moderateScale(13)}
              color={isDarkMode ? colors.white : colors.text}
            />

            <Text style={styles.infoText}>{levelLabel}</Text>
          </View>

          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="basketball-hoop"
              size={moderateScale(13)}
              color={isDarkMode ? colors.white : colors.text}
            />

            <Text style={styles.infoText}>
              {selectedItems.length} skill
              {selectedItems.length === 1 ? "" : "s"} selected
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          disabled={selectedDrills.length === 0}
          style={[
            styles.buildButton,
            { backgroundColor: primaryColor },
            selectedDrills.length === 0 && styles.buildButtonDisabled,
          ]}
          onPress={() =>
            navigation.navigate("StartWorkout", {
              drills: selectedItems
                .map((d: any) => ({
                  id: d.id,
                  title: d.title,
                  category: d.subTitle || "Team workout",
                  duration: d.duration || "Beginner. 30 Secs",
                  level: d.level || "",
                  videoUrl: d.videoUrl || "",
                  image: d.image || "",
                  reps: d.reps || "5 Reps",
                })),
            })
          }
        >
          <Text style={styles.buildButtonText}>Build my workout</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={statusBarStyle}
      />

      {isDarkMode ? (
        <ImageBackground
          source={require("../../assets/forgotpassword.png")}
          resizeMode="cover"
          style={styles.backgroundImage}
        >
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

          {content}
        </ImageBackground>
      ) : (
        <View style={styles.lightBackground}>{content}</View>
      )}
    </View>
  );
};

export default QuickWorkoutSecond;

const createStyles = (colors: ThemeColors, isDarkMode: boolean) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  lightBackground: {
    flex: 1,
    backgroundColor: colors.background,
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
    height: responsiveHeight(55),
  },

  mainScrollContainer: {
    paddingBottom: responsiveHeight(18),
  },

  contentContainer: {
    flex: 1,
    paddingTop: responsiveHeight(6),
    paddingHorizontal: responsiveWidth(4),
  },

  backButton: {
    width: responsiveWidth(10),
    height: responsiveWidth(10),
    borderRadius: responsiveWidth(6),
    backgroundColor: isDarkMode ? "#ffffff10" : colors.backgroundInput,
    justifyContent: "center",
    alignItems: "center",
  },

  progressContainer: {
    marginTop: responsiveHeight(2),
  },

  stepText: {
    color: isDarkMode ? colors.white : colors.text,
    fontSize: moderateScale(14),
    marginBottom: responsiveHeight(1.2),
    fontFamily: "Inter-Medium",
  },

  progressBar: {
    width: "100%",
    height: responsiveHeight(0.9),
    backgroundColor: colors.backgroundElevated,
    borderRadius: 100,
    overflow: "hidden",
  },

  progressFill: {
    width: "100%",
    height: "100%",
    backgroundColor: "#FF1F2D",
  },

  headingContainer: {
    marginTop: responsiveHeight(2),
  },

  heading: {
    color: isDarkMode ? colors.white : colors.text,
    fontSize: moderateScale(18),
    fontFamily: "Inter-Medium",
  },

  subHeading: {
    color: colors.textMuted,
    fontSize: moderateScale(12),
    marginTop: responsiveHeight(0.3),
    fontFamily: "Inter-Regular",
  },

  categoryContainer: {
    marginTop: responsiveHeight(2.2),
    paddingRight: responsiveWidth(0),
  },

  categoryButton: {
    height: responsiveHeight(4.1),
    paddingHorizontal: responsiveWidth(4),
    backgroundColor: colors.backgroundElevated,
    borderRadius: moderateScale(10),
    justifyContent: "center",
    alignItems: "center",
    marginRight: responsiveWidth(1),
  },

  activeCategoryButton: {
    backgroundColor: "#FF1F2D",
  },

  categoryText: {
    color: colors.textMuted,
    fontSize: moderateScale(12),
    fontFamily: "Inter-Medium",
  },

  activeCategoryText: {
    color: colors.white,
  },

  drillWrapper: {
    marginTop: responsiveHeight(2),
  },

  emptyContainer: {
    paddingVertical: responsiveHeight(6),
    paddingHorizontal: responsiveWidth(4),
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    color: isDarkMode ? colors.white : colors.text,
    fontSize: moderateScale(14),
    textAlign: "center",
    fontFamily: "Inter-Medium",
  },

  emptyDesc: {
    color: colors.textMuted,
    fontSize: moderateScale(12),
    textAlign: "center",
    marginTop: responsiveHeight(1),
    fontFamily: "Inter-Regular",
  },

  drillCard: {
    width: "100%",
    minHeight: responsiveHeight(7.5),
    backgroundColor: colors.backgroundCard,
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: colors.backgroundCard,
    paddingHorizontal: responsiveWidth(4),
    justifyContent: "center",
    marginBottom: responsiveHeight(1.2),
  },

  activeDrillCard: {
    backgroundColor: isDarkMode ? "#1A0002" : "rgba(229,9,20,0.10)",
    borderColor: "#E50914",
  },

  leftRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  radioCircle: {
    width: responsiveWidth(6),
    height: responsiveWidth(6),
    justifyContent: "center",
    alignItems: "center",
    marginRight: responsiveWidth(3),
  },

  activeRadioCircle: {},

  drillTitle: {
    color: isDarkMode ? colors.white : colors.text,
    fontSize: moderateScale(14),
    fontFamily: "Inter-Medium",
  },

  drillSubTitle: {
    color: colors.textFaint,
    fontSize: moderateScale(11),
    marginTop: responsiveHeight(0.3),
    fontFamily: "Inter-Regular",
  },

  bottomFixedContainer: {
    position: "absolute",
    bottom: 0,
    width: responsiveWidth(100),
    paddingHorizontal: responsiveWidth(4),
    paddingTop: responsiveHeight(1.5),
    paddingBottom: responsiveHeight(2),
    backgroundColor: colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: responsiveHeight(1.5),
  },

  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: responsiveWidth(3.5),
    marginBottom: responsiveHeight(0.5),
  },

  infoText: {
    color: isDarkMode ? colors.textMuted : "#000000",
    fontSize: moderateScale(11),
    marginLeft: responsiveWidth(1),
    fontFamily: "Inter-Medium",
  },

  buildButton: {
    width: "100%",
    height: responsiveHeight(6.5),
    backgroundColor: "#FF0015",
    borderRadius: moderateScale(12),
    justifyContent: "center",
    alignItems: "center",
  },

  buildButtonText: {
    color: colors.white,
    fontSize: moderateScale(15),
    fontFamily: "Inter-Medium",
  },

  buildButtonDisabled: {
    opacity: 0.4,
  },
});
