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
});

const DrillCard = ({ item }: any) => {
  const navigation = useNavigation<any>();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.cardWrapper}
      onPress={() =>
        navigation.navigate("DrilLibraryDetail", { drill: item })
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
            <Text style={styles.levelText}>{item.level}</Text>
          </View>
        </View>

        <View style={styles.bottomContent}>
          <Text numberOfLines={2} style={styles.cardTitle}>
            {item.title}
          </Text>

          <Text style={styles.cardCategory}>{item.category}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const DrilLibraryMainScreen = ({ route }: any) => {
  const { primaryColor } = useBranding();
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
          setDrillsData(drills.map(toCardShape));

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

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: responsiveHeight(8) }}
      >
        <View style={styles.header}>
          <Text style={styles.heading}>
            Drill{" "}
            <Text style={[styles.redText, { color: primaryColor }]}>Library</Text>
          </Text>

          <Text style={styles.subHeading}>
            Every drill. Every level. Pick your battle.
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={moderateScale(18)} color="#6B6B6B" />

            <TextInput
              placeholder="Search"
              placeholderTextColor="#3A3A3A"
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
                color="#fff"
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
                  {item}
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
          renderItem={({ item }) => <DrillCard item={item} />}
        />
      </ScrollView>
    </View>
  );
};

export default DrilLibraryMainScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  header: {
    paddingHorizontal: responsiveWidth(4),
    paddingTop: responsiveHeight(7),
  },

  heading: {
    color: "#fff",
    fontSize: moderateScale(23),
    fontFamily: "Inter-Bold",
  },

  redText: {
    color: "#FF1E2D",
  },

  subHeading: {
    color: "#929292",
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
    backgroundColor: "#111111",
    borderRadius: moderateScale(12),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: responsiveWidth(3),
  },

  input: {
    flex: 1,
    color: "#fff",
    marginLeft: responsiveWidth(2),
    fontSize: moderateScale(14),
    fontFamily: "Inter-Medium",
  },

  inlineFilter: {
    width: responsiveWidth(10),
    height: responsiveWidth(10),
    backgroundColor: "#161616",
    borderRadius: moderateScale(10),
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#1F1F1F",
    borderWidth: 1,
  },

  categoryContainer: {
    paddingLeft: responsiveWidth(4),
    marginTop: responsiveHeight(1.4),
    paddingRight: responsiveWidth(2),
  },

  categoryButton: {
    backgroundColor: "#111111",
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
    color: "#929292",
    fontSize: moderateScale(12),
    fontFamily: "Inter-Medium",
  },

  activeCategoryText: {
    color: "#fff",
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
    backgroundColor: "#161616",
    paddingHorizontal: responsiveWidth(2.5),
    paddingVertical: responsiveHeight(0.6),
    borderRadius: moderateScale(20),
  },

  timeText: {
    color: "#fff",
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
    color: "#fff",
    fontSize: moderateScale(10),
    fontFamily: "Inter-Medium",
  },

  bottomContent: {
    zIndex: 10,
  },

  cardTitle: {
    color: "#fff",
    fontSize: moderateScale(12.5),
    lineHeight: moderateScale(20),
    fontFamily: "Inter-Medium",
  },

  cardCategory: {
    color: "#6B6B6B",
    fontSize: moderateScale(12),
    fontFamily: "Inter-Regular",
  },
});
