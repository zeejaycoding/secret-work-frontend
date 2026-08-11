import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  FlatList,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import { getWorkouts } from "../../services/api";

const toCardShape = (drill: any) => ({
  id: drill.id,
  name: drill.name,
  level: drill.level,
  duration: drill.duration,
  image: drill.image
    ? { uri: drill.image }
    : require("../../assets/drib.jpg"),
});

const toSectionShape = (section: any) => ({
  id: section.id,
  title: section.title,
  workouts: (section.workouts || []).map(toCardShape),
});

const WorkoutCard = ({ item, coach }: any) => {
  const navigation = useNavigation<any>();
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.card}
      onPress={() =>
        navigation.navigate("WorkoutProfileDetail", { workoutId: coach })
      }
    >
      <ImageBackground
        source={item.image}
        style={styles.cardImage}
        imageStyle={styles.imageStyle}
      >
        <View style={styles.overlay} />

        <LinearGradient
          colors={[
            "rgba(0,0,0,0.85)",
            "rgba(0,0,0,0.55)",
            "rgba(0,0,0,0.15)",
            "transparent",
          ]}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0 }}
          style={styles.gradientOverlay}
        />

        <View style={styles.cardBottomContent}>
          <Text numberOfLines={1} style={styles.workoutTitle}>
            {item.name}
          </Text>

          <Text style={styles.workoutSubText}>
            {item.level}, {item.duration}
          </Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const WorkoutScreen = () => {
  const navigation = useNavigation<any>();
  const [workoutData, setWorkoutData] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;

    getWorkouts()
      .then((sections) => {
        if (mounted && Array.isArray(sections)) {
          setWorkoutData(sections.map(toSectionShape));
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.heading}>Workouts</Text>

        <Text style={styles.subHeading}>
          Every drill. Every level. Pick your battle.
        </Text>

        {workoutData.map((section) => {
          return (
            <View key={section.id} style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>{section.title}</Text>

              <FlatList
                horizontal
                data={section.workouts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <WorkoutCard item={item} coach={section.title} />}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default WorkoutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  scrollContent: {
    paddingTop: responsiveHeight(7),
    paddingBottom: responsiveHeight(10),
  },

  heading: {
    color: "#fff",
    fontSize: moderateScale(20),
    paddingHorizontal: responsiveWidth(4),
    fontFamily: "Inter-Medium",
  },

  subHeading: {
    color: "#929292",
    fontSize: moderateScale(11),
    paddingHorizontal: responsiveWidth(4),
    fontFamily: "Inter-Regular",
    marginBottom: responsiveHeight(2),
  },

  sectionContainer: {
    marginTop: responsiveHeight(0.5),
  },

  sectionTitle: {
    color: "#fff",
    fontSize: moderateScale(15),
    marginBottom: responsiveHeight(1),
    paddingHorizontal: responsiveWidth(4),
    fontFamily: "Inter-Medium",
  },

  horizontalList: {
    paddingLeft: responsiveWidth(4),
    paddingRight: responsiveWidth(1),
    paddingBottom: responsiveHeight(1),
  },

  card: {
    width: responsiveWidth(44),
    height: responsiveHeight(18),
    marginRight: responsiveWidth(3),
    borderRadius: moderateScale(10),
    overflow: "hidden",
    backgroundColor: "#111",
  },

  cardImage: {
    flex: 1,
    justifyContent: "flex-end",
    borderWidth: 1,
    borderColor: "#0B0A0A00",
  },

  imageStyle: {
    borderRadius: moderateScale(10),
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: responsiveHeight(12),
  },

  cardBottomContent: {
    paddingHorizontal: responsiveWidth(2),
    paddingBottom: responsiveHeight(1),
    zIndex: 10,
  },

  workoutTitle: {
    color: "#fff",
    fontSize: moderateScale(12),
    fontFamily: "Inter-Medium",
  },

  workoutSubText: {
    color: "#6B6B6B",
    fontSize: moderateScale(9),
  },

  text: {
    color: "#fff",
    fontSize: moderateScale(22),
    fontFamily: "Inter-Regular",
  },
});
