import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  responsiveWidth,
  responsiveHeight,
} from "react-native-responsive-dimensions";
import { moderateScale } from "react-native-size-matters";
import { useNavigation } from "@react-navigation/native";
import { useBranding } from "../../context/BrandingContext";
import { getDrills } from "../../services/api";

interface SkillItemProps {
  title: string;
  category: string;
  image: ImageSourcePropType;
}

const fallbackSkillsData: SkillItemProps[] = [
  {
    title: "Shooting",
    category: "Shooting",
    image: require("../../assets/shoot.jpg"),
  },
  {
    title: "Dribbling",
    category: "Dribbling",
    image: require("../../assets/drib.jpg"),
  },
  {
    title: "Passing",
    category: "Passing",
    image: require("../../assets/mode2.jpg"),
  },
  {
    title: "Defense",
    category: "Defense",
    image: require("../../assets/mode.jpg"),
  },
];

const categoryLabel = (category: string) => {
  if (category === "Defence") return "Defense";
  return category;
};

const TrainSkills = () => {
  const navigation = useNavigation<any>();
  const { primaryColor } = useBranding();
  const [skillsData, setSkillsData] = useState<SkillItemProps[]>(
    fallbackSkillsData
  );

  useEffect(() => {
    let mounted = true;

    getDrills()
      .then((drills) => {
        if (!mounted || !Array.isArray(drills)) return;

        const byCategory = new Map<string, any[]>();

        for (const drill of drills) {
          const cat = categoryLabel(drill.category || "Other");

          if (!byCategory.has(cat)) byCategory.set(cat, []);

          byCategory.get(cat)!.push(drill);
        }

        const list = Array.from(byCategory.entries())
          .sort((a, b) => b[1].length - a[1].length)
          .slice(0, 4)
          .map(([category, group]) => ({
            title: category,
            category,
            image: (group[0]?.imageUrl
              ? { uri: group[0].imageUrl }
              : require("../../assets/shoot.jpg")) as ImageSourcePropType,
          }));

        if (list.length) setSkillsData(list);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Train by skills</Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate("Drills")}
        >
          <Text style={[styles.seeAll, { color: primaryColor }]}>See All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {skillsData.map((item, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.8}
            style={styles.card}
            onPress={() =>
              navigation.navigate("Drills", { category: item.category })
            }
          >
            <Image source={item.image} style={styles.image} />

            <LinearGradient
              colors={[
                "rgba(120,0,10,0.40)",
                "rgba(180,0,15,0.22)",
                "rgba(255,0,21,0.08)",
                "transparent",
              ]}
              locations={[0, 0.3, 0.65, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.redTopGradient}
            />

            <LinearGradient
              colors={[
                "rgba(0,0,0,0.55)",
                "rgba(0,0,0,0.10)",
                "rgba(0,0,0,0.10)",
                "rgba(0,0,0,0.55)",
              ]}
              locations={[0, 0.25, 0.75, 1]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.sideOverlay}
            />

            <LinearGradient
              colors={[
                "transparent",
                "rgba(0,0,0,0.08)",
                "rgba(0,0,0,0.18)",
                "rgba(0,0,0,0.35)",
                "rgba(0,0,0,0.65)",
                "rgba(0,0,0,0.90)",
              ]}
              locations={[0, 0.2, 0.4, 0.6, 0.8, 1]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.bottomOverlay}
            />

            <Text style={styles.cardTitle}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default TrainSkills;

const styles = StyleSheet.create({
  container: {
    marginTop: responsiveHeight(3),
    paddingHorizontal: responsiveWidth(4),
    paddingBottom: responsiveHeight(8),
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: responsiveHeight(2),
  },

  heading: {
    color: "#fff",
    fontSize: moderateScale(16),
    fontFamily: "Inter-Medium",
  },

  seeAll: {
    color: "#E50914",
    fontSize: moderateScale(12),
    fontFamily: "Inter-Medium",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: responsiveWidth(44.5),
    height: responsiveHeight(15),
    borderRadius: moderateScale(12),
    overflow: "hidden",
    marginBottom: responsiveHeight(1.8),
    position: "relative",
    backgroundColor: "#1E1E1E",
  },

  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  redTopGradient: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: "45%",
  },

  sideOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  bottomOverlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "70%",
  },

  cardTitle: {
    position: "absolute",
    bottom: responsiveHeight(1),
    left: responsiveWidth(3),
    color: "#fff",
    fontSize: moderateScale(14),
    fontFamily: "Inter-Medium",
  },
});
