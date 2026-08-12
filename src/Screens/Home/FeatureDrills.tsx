import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveWidth,
  responsiveHeight,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import { useBranding } from "../../context/BrandingContext";
import { useAppTheme, ThemeColors } from "../../context/ThemeContext";
import { getDrills } from "../../services/api";
import { useIsPro } from "../../utils/subscription";
import { useLanguage } from "../../i18n";

const fallbackCategories = [
  "Ball handling",
  "Shooting",
  "Mid-post",
  "Jab series",
  "Footwork",
];

const fallbackDrillsData: any = {
  "Ball handling": [
    {
      id: 1,
      title: "Form shooting",
      image: require("../../assets/featureone.png"),
      duration: "45 mins",
      level: "Advanced",
      type: "Ball handling",
    },

    {
      id: 2,
      title: "Static Ball",
      image: require("../../assets/featuretwo.jpg"),
      duration: "45 mins",
      level: "Advanced",
      type: "Ball handling",
    },
  ],

  Shooting: [
    {
      id: 3,
      title: "Catch & Shoot",
      image: require("../../assets/shootingone.jpg"),
      duration: "30 mins",
      level: "Intermediate",
      type: "Shooting",
    },

    {
      id: 4,
      title: "Quick Release",
      image: require("../../assets/shootingtwo.jpg"),
      duration: "40 mins",
      level: "Advanced",
      type: "Shooting",
    },
  ],

  "Mid-post": [
    {
      id: 5,
      title: "Post Fade",
      image: require("../../assets/featuretwo.jpg"),
      duration: "35 mins",
      level: "Intermediate",
      type: "Mid-post",
    },

    {
      id: 6,
      title: "Drop Step",
      image: require("../../assets/featureone.png"),
      duration: "25 mins",
      level: "Beginner",
      type: "Mid-post",
    },
  ],

  "Jab series": [
    {
      id: 7,
      title: "Jab Attack",
      image: require("../../assets/shootingone.jpg"),
      duration: "30 mins",
      level: "Advanced",
      type: "Jab series",
    },

    {
      id: 8,
      title: "Quick Jab",
      image: require("../../assets/shootingtwo.jpg"),
      duration: "20 mins",
      level: "Intermediate",
      type: "Jab series",
    },
  ],

  Footwork: [
    {
      id: 9,
      title: "Fast Feet",
      image: require("../../assets/shootingone.jpg"),
      duration: "20 mins",
      level: "Beginner",
      type: "Footwork",
    },

    {
      id: 10,
      title: "Ladder Work",
      image: require("../../assets/featureone.png"),
      duration: "25 mins",
      level: "Intermediate",
      type: "Footwork",
    },
  ],
};

const categoryLabel = (category: string) => {
  if (category === "Defence") return "Defense";
  return category;
};

const toCardShape = (drill: any) => ({
  id: drill._id,
  title: drill.title || "",
  image: drill.imageUrl
    ? { uri: drill.imageUrl }
    : require("../../assets/featureone.png"),
  duration: drill.duration || "0 min",
  level: drill.level || "Beginner",
  type: categoryLabel(drill.category || "Other"),
  category: categoryLabel(drill.category || "Other"),
  description: drill.description || "",
  videoUrl: drill.videoUrl || "",
  views: drill.views || 0,
  proId: drill.proId || null,
});

const FeatureDrills = () => {
  const navigation = useNavigation<any>();
  const [selectedCategory, setSelectedCategory] = useState("Ball handling");
  const [categories, setCategories] = useState(fallbackCategories);
  const [drillsData, setDrillsData] = useState(fallbackDrillsData);
  const { primaryColor } = useBranding();
  const { colors } = useAppTheme();
  const isPro = useIsPro();
  const { t } = useLanguage();
  const styles = createStyles(colors);

  useEffect(() => {
    let mounted = true;

    getDrills()
      .then((drills) => {
        if (!mounted || !Array.isArray(drills)) return;

        const grouped: any = {};

        for (const drill of drills) {
          if (!isPro && drill.proId) continue;

          const cat = categoryLabel(drill.category || "Other");

          if (!grouped[cat]) grouped[cat] = [];

          grouped[cat].push(toCardShape(drill));
        }

        // Feature the 2 most-viewed drills per category
        for (const cat of Object.keys(grouped)) {
          grouped[cat].sort((a: any, b: any) => b.views - a.views);
          grouped[cat] = grouped[cat].slice(0, 2);
        }

        const sorted = Object.keys(grouped).sort(
          (a, b) => grouped[b].length - grouped[a].length
        );

        if (!sorted.length) return;

        setCategories(sorted);
        setDrillsData(grouped);
        setSelectedCategory((prev) =>
          grouped[prev] ? prev : sorted[0]
        );
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const currentDrills = drillsData[selectedCategory] || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>{t("featuredDrills")}</Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate("Drills")}
        >
          <Text style={[styles.seeAll, { color: primaryColor }]}>{t("seeAll")}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryContainer}
      >
        {categories.map((item, index) => {
          const isSelected = selectedCategory === item;

          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.8}
              onPress={() => setSelectedCategory(item)}
              style={[
                styles.categoryButton,
                isSelected && [styles.activeCategoryButton, { backgroundColor: primaryColor }],
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  isSelected && styles.activeCategoryText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsContainer}
      >
        {currentDrills.map((item: any) => {
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              style={styles.card}
              onPress={() =>
                navigation.navigate("DrilLibraryDetail", { drill: item })
              }
            >
              <Image source={item.image} style={styles.cardImage} />

              <View style={styles.cardContent}>
                <View style={styles.titleRow}>
                  <Text style={styles.cardTitle}>{item.title}</Text>

                  <Ionicons
                    name="heart"
                    size={moderateScale(18)}
                    color={colors.text}
                  />
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Ionicons
                      name="time"
                      size={moderateScale(14)}
                      color={colors.textMuted}
                    />

                    <Text style={styles.infoText}>{item.duration}</Text>
                  </View>

                  <View style={styles.dot} />

                  <View style={styles.infoItem}>
                    <MaterialCommunityIcons
                      name="basketball"
                      size={moderateScale(15)}
                      color={colors.textMuted}
                    />

                    <Text style={styles.infoText}>{item.level}</Text>
                  </View>

                  <View style={styles.dot} />

                  <View style={styles.infoItem}>
                    <Ionicons
                      name="albums"
                      size={moderateScale(14)}
                      color={colors.textMuted}
                    />

                    <Text style={styles.infoText}>{item.type}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default FeatureDrills;

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    marginTop: responsiveHeight(1.5),
    paddingLeft: responsiveWidth(3),
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: responsiveWidth(4),
  },

  heading: {
    color: colors.text,
    fontSize: moderateScale(16),
    fontFamily: "Inter-Medium",
    paddingLeft: responsiveWidth(1),
  },

  seeAll: {
    color: "#E50914",
    fontSize: moderateScale(12),
    fontFamily: "Inter-Medium",
  },

  categoryContainer: {
    marginTop: responsiveHeight(2),
    paddingRight: responsiveWidth(2),
  },

  categoryButton: {
    backgroundColor: colors.backgroundElevated,
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(1),
    borderRadius: moderateScale(10),
    marginRight: responsiveWidth(1.8),
  },

  activeCategoryButton: {
    backgroundColor: "#E50914",
  },

  categoryText: {
    color: colors.textMuted,
    fontSize: moderateScale(12),
    fontFamily: "Inter-Medium",
  },

  activeCategoryText: {
    color: colors.white,
    fontFamily: "Inter-Medium",
  },

  cardsContainer: {
    marginTop: responsiveHeight(2.5),
  },

  card: {
    width: responsiveWidth(74),
    backgroundColor: colors.backgroundInput,
    borderRadius: moderateScale(14),
    padding: moderateScale(10),
    marginRight: responsiveWidth(3),
  },

  cardImage: {
    width: "100%",
    height: responsiveHeight(24),
    borderRadius: moderateScale(10),
    resizeMode: "cover",
  },

  cardContent: {
    marginTop: responsiveHeight(1.2),
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardTitle: {
    color: colors.text,
    fontSize: moderateScale(16),
    width: "82%",
    fontFamily: "Inter-Medium",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: responsiveHeight(1.2),
    flexWrap: "wrap",
  },

  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  infoText: {
    color: colors.textSecondary,
    fontSize: moderateScale(11),
    marginLeft: responsiveWidth(1.2),
    fontFamily: "Inter-Regular",
  },

  dot: {
    width: moderateScale(1),
    height: moderateScale(12),
    borderRadius: moderateScale(10),
    backgroundColor: colors.borderStrong,
    marginHorizontal: responsiveWidth(2),
  },
});
