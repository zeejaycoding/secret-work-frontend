import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TextInput,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  ScrollView,
} from "react-native";
import { Ionicons, FontAwesome6 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import FilterModal from "./FilterModal";
import { getDrills } from "../../services/api";
import { useBranding } from "../../context/BrandingContext";
import { useAppTheme, ThemeColors } from "../../context/ThemeContext";
import {
  useLanguage,
  translateCategory,
  translateLevel,
} from "../../i18n";
import { useIsPro } from "../../utils/subscription";
import ProPaywall from "../../Components/ProPaywall";

const fallbackDrillsData = [
  {
    id: "1",
    title: "Two-ball pound series",
    category: "Dribbling",
    level: "Beginner",
    time: "6 mins",
    image: require("../../assets/mode2.jpg"),
  },
  {
    id: "2",
    title: "Crossover Combos",
    category: "Dribbling",
    level: "Intermediate",
    time: "10 mins",
    image: require("../../assets/mode.jpg"),
  },
  {
    id: "3",
    title: "Catch & Shoot Reps",
    category: "Shooting",
    level: "Beginner",
    time: "6 mins",
    image: require("../../assets/shoot.jpg"),
  },
  {
    id: "4",
    title: "Off-the dribble pull-ups",
    category: "Shooting",
    level: "Intermediate",
    time: "8 mins",
    image: require("../../assets/drib.jpg"),
  },
  {
    id: "5",
    title: "Closeout drill",
    category: "Defense",
    level: "Intermediate",
    time: "6 mins",
    image: require("../../assets/mode2.jpg"),
  },
  {
    id: "6",
    title: "Lateral Slide burner",
    category: "Defense",
    level: "Beginner",
    time: "8 mins",
    image: require("../../assets/shoot.jpg"),
  },
];

const defaultCategories = [
  "All",
  "Shooting",
  "Finishing",
  "Dribbling",
  "Footwork",
  "Defense",
];

const categoryLabel = (category: string) => {
  if (category === "Defence") return "Defense";
  return category;
};

const toCardShape = (drill: any) => ({
  id: drill._id,
  title: drill.title,
  category: categoryLabel(drill.category),
  level: drill.level,
  time: drill.duration || "0 min",
  image: drill.imageUrl
    ? { uri: drill.imageUrl }
    : require("../../assets/mode2.jpg"),
  description: drill.description,
  videoUrl: drill.videoUrl,
  proId: drill.proId || null,
});

const DrillCard = ({ item, drills, index }: any) => {
  const navigation = useNavigation<any>();
  const { colors, isDarkMode } = useAppTheme();
  const { t } = useLanguage();
  const styles = createStyles(colors, isDarkMode);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.cardWrapper}
      onPress={() =>
        navigation.navigate("DrilLibraryDetail", {
          drill: item,
          drills,
          currentDrillIndex: index,
        })
      }
    >
      <ImageBackground
        source={item.image}
        style={styles.cardImage}
        imageStyle={styles.cardImageStyle}
      >
        <LinearGradient
          colors={[
            "rgba(0,0,0,0.9)",
            "rgba(0,0,0,0.5)",
            "rgba(0,0,0,0.1)",
            "transparent",
          ]}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0 }}
          style={styles.bottomGradient}
        />

        <View style={styles.topRow}>
          <View style={styles.timeBadge}>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>

          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{translateLevel(t, item.level)}</Text>
          </View>
        </View>

        <View style={styles.bottomContent}>
          <Text numberOfLines={2} style={styles.cardTitle}>
            {item.title}
          </Text>

          <Text style={styles.cardCategory}>
            {translateCategory(t, item.category)}
          </Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const DrilLibraryMainScreen = ({ route }: any) => {
  const { primaryColor } = useBranding();
  const { colors, isDarkMode } = useAppTheme();
  const { t } = useLanguage();
  const styles = createStyles(colors, isDarkMode);
  const isPro = useIsPro();

  const [selectedCategory, setSelectedCategory] = useState(
    route?.params?.category || "All"
  );
  const [categories, setCategories] = useState(defaultCategories);
  const [showFilter, setShowFilter] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [drillsData, setDrillsData] = useState(fallbackDrillsData);
  const [filters, setFilters] = useState({
    skill: "All",
    difficulty: "All",
    duration: "All",
    goal: "All",
  });

  useEffect(() => {
    let mounted = true;

    getDrills()
      .then((drills) => {
        if (mounted && Array.isArray(drills)) {
          const shaped = drills
            .map(toCardShape)
            .filter((d) => isPro || !d.proId);
          setDrillsData(shaped);

          const distinct = Array.from(
            new Set(
              drills.map((d: any) => categoryLabel(d.category)).filter(Boolean)
            )
          ).sort();

          if (distinct.length) {
            setCategories(["All", ...distinct]);
          }
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (route?.params?.category) {
      setSelectedCategory(route.params.category);
    }
  }, [route?.params?.category]);

  const filteredData = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    const skillCategory =
      filters.skill === "Conditioning" ? "Fitness" : filters.skill;

    const goalKeywords: Record<string, string[]> = {
      "Improve Handles": ["handle", "dribbl", "control"],
      "Increase Speed": ["speed", "fast", "explosiv"],
      "Shooting Accuracy": ["shoot", "shot", "accura"],
      Stamina: ["stamina", "endurance", "condition"],
      "Court Awareness": ["awareness", "vision", "read"],
    };

    return drillsData.filter((item: any) => {
      if (selectedCategory !== "All" && item.category !== selectedCategory) {
        return false;
      }

      if (query) {
        const haystack = `${item.title} ${item.category} ${
          item.description || ""
        }`.toLowerCase();

        if (!haystack.includes(query)) return false;
      }

      if (filters.skill !== "All" && item.category !== skillCategory) {
        return false;
      }

      if (filters.difficulty !== "All" && item.level !== filters.difficulty) {
        return false;
      }

      if (filters.duration !== "All") {
        const minutes = parseInt(
          (item.time || "0").match(/\d+/)?.[0] || "0",
          10,
        );

        const durationOk =
          filters.duration === "Under 5 mins"
            ? minutes < 5
            : filters.duration === "5–10 mins"
            ? minutes >= 5 && minutes <= 10
            : filters.duration === "10–20 mins"
            ? minutes > 10 && minutes <= 20
            : minutes > 20;

        if (!durationOk) return false;
      }

      if (filters.goal !== "All") {
        const keywords = goalKeywords[filters.goal] || [];
        const haystack = `${item.title} ${item.description || ""}`.toLowerCase();

        if (!keywords.some((word) => haystack.includes(word))) return false;
      }

      return true;
    });
  }, [drillsData, searchText, selectedCategory, filters]);

  if (!isPro) {
    return (
      <ProPaywall
        title={t("unlockDrills")}
        subtitle={t("unlockDrillsDesc")}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: responsiveHeight(8) }}
      >
        <View style={styles.header}>
          <Text style={styles.heading}>
            {t("drillWord")}{" "}
            <Text style={[styles.redText, { color: primaryColor }]}>
              {t("library")}
            </Text>
          </Text>

          <Text style={styles.subHeading}>{t("drillLibrarySub")}</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={moderateScale(18)} color={colors.textSecondary} />

            <TextInput
              placeholder={t("search")}
              placeholderTextColor={colors.switchTrack}
              style={styles.input}
              value={searchText}
              onChangeText={setSearchText}
            />

            <TouchableOpacity
              style={styles.inlineFilter}
              onPress={() => setShowFilter(true)}
            >
              <FontAwesome6
                name="sliders"
                size={moderateScale(18)}
                color={colors.text}
              />
            </TouchableOpacity>

            <FilterModal
              visible={showFilter}
              onClose={() => setShowFilter(false)}
              filters={filters}
              onApply={setFilters}
            />
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map((item, index) => {
            const isActive = selectedCategory === item;

            return (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedCategory(item)}
                style={[
                  styles.categoryButton,
                  isActive && styles.activeCategory,
                  isActive && { backgroundColor: primaryColor },
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isActive && styles.activeCategoryText,
                  ]}
                >
                  {item === "All" ? t("all") : translateCategory(t, item)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={{
            justifyContent: "space-between",
            marginBottom: responsiveHeight(1.8),
          }}
          contentContainerStyle={styles.flatListContent}
          renderItem={({ item, index }) => (
            <DrillCard item={item} drills={filteredData} index={index} />
          )}
        />
      </ScrollView>
    </View>
  );
};

export default DrilLibraryMainScreen;

const createStyles = (colors: ThemeColors, isDarkMode: boolean) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    paddingHorizontal: responsiveWidth(4),
    paddingTop: responsiveHeight(7),
  },

  heading: {
    color: colors.text,
    fontSize: moderateScale(23),
    fontFamily: "Inter-Bold",
  },

  redText: {
    color: "#FF1E2D",
  },

  subHeading: {
    color: colors.textMuted,
    marginTop: responsiveHeight(0.5),
    fontSize: moderateScale(12),
    fontFamily: "Inter-Regular",
  },

  searchContainer: {
    marginTop: responsiveHeight(2),
    paddingHorizontal: responsiveWidth(3),
  },

  searchBox: {
    height: responsiveHeight(6.5),
    backgroundColor: colors.backgroundElevated,
    borderRadius: moderateScale(12),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: responsiveWidth(3),
  },

  input: {
    flex: 1,
    color: colors.text,
    marginLeft: responsiveWidth(2),
    fontSize: moderateScale(14),
    fontFamily: "Inter-Medium",
  },

  inlineFilter: {
    width: responsiveWidth(10),
    height: responsiveWidth(10),
    backgroundColor: colors.backgroundInput,
    borderRadius: moderateScale(10),
    justifyContent: "center",
    alignItems: "center",
    borderColor: colors.border,
    borderWidth: 1,
  },

  categoryContainer: {
    paddingLeft: responsiveWidth(4),
    marginTop: responsiveHeight(1.4),
    paddingRight: responsiveWidth(2),
  },

  categoryButton: {
    backgroundColor: colors.backgroundElevated,
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(1),
    borderRadius: moderateScale(8),
    marginRight: responsiveWidth(1.5),
  },

  activeCategory: {
    backgroundColor: "#E50914",
    paddingHorizontal: responsiveWidth(7),
  },

  categoryText: {
    color: colors.textMuted,
    fontSize: moderateScale(12),
    fontFamily: "Inter-Medium",
  },

  activeCategoryText: {
    color: colors.white,
  },

  flatListContent: {
    paddingHorizontal: responsiveWidth(3),
    marginTop: responsiveHeight(2.5),
  },

  cardWrapper: {
    width: responsiveWidth(45.5),
  },

  cardImage: {
    height: responsiveHeight(20),
    justifyContent: "space-between",
    padding: moderateScale(8),
    overflow: "hidden",
    borderColor: "#00000000",
    borderWidth: 1,
  },

  cardImageStyle: {
    borderRadius: moderateScale(10),
  },

  bottomGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: moderateScale(10),
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
  },

  timeBadge: {
    backgroundColor: colors.backgroundInput,
    paddingHorizontal: responsiveWidth(2.5),
    paddingVertical: responsiveHeight(0.6),
    borderRadius: moderateScale(20),
  },

  timeText: {
    color: isDarkMode ? colors.white : colors.text,
    fontSize: moderateScale(8),
    fontFamily: "Inter-Medium",
  },

  levelBadge: {
    backgroundColor: "#E50914",
    paddingHorizontal: responsiveWidth(2.5),
    paddingVertical: responsiveHeight(0.6),
    borderRadius: moderateScale(20),
  },

  levelText: {
    color: colors.white,
    fontSize: moderateScale(10),
    fontFamily: "Inter-Medium",
  },

  bottomContent: {
    zIndex: 10,
  },

  cardTitle: {
    color: colors.white,
    fontSize: moderateScale(12.5),
    lineHeight: moderateScale(20),
    fontFamily: "Inter-Medium",
  },

  cardCategory: {
    color: colors.textSecondary,
    fontSize: moderateScale(12),
    fontFamily: "Inter-Regular",
  },
});
