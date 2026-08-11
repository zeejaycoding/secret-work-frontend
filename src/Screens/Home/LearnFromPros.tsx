import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  Image,
  StatusBar,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getPros } from "../../services/api";

const PRO_PRIORITY = ["latin", "cooper", "corey", "destiny", "jayson"];

const rankPro = (name: string) => {
  const n = (name || "").toLowerCase();
  const i = PRO_PRIORITY.findIndex((k) => n.includes(k));
  return i === -1 ? PRO_PRIORITY.length : i;
};

const LearnFromPros = () => {
  const navigation = useNavigation<any>();
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    getPros()
      .then((pros) => {
        const sorted = [...(pros || [])].sort((a, b) => {
          const ra = rankPro(a.name);
          const rb = rankPro(b.name);
          if (ra !== rb) return ra - rb;
          if (Boolean(a.homepageBanner) !== Boolean(b.homepageBanner)) {
            return a.homepageBanner ? -1 : 1;
          }
          if (Boolean(a.featured) !== Boolean(b.featured)) {
            return a.featured ? -1 : 1;
          }
          return 0;
        });
        setPlayers(
          sorted.map((p) => ({
            id: p._id,
            name: p.name,
            team: p.team,
            imageUrl: p.imageUrl,
          }))
        );
      })
      .catch(() => setPlayers([]));
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

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

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons
                name="chevron-back"
                size={moderateScale(20)}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>Learn from the pros</Text>

            <Text style={styles.description}>
              Learn real game techniques, smart decisions, and pro-level
              training habits.
            </Text>
          </View>

          <View style={styles.cardsWrapper}>
            {players.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.9}
                style={styles.cardContainer}
                onPress={() => navigation.navigate("ProsDetail", { pro: item })}
              >
                <View style={styles.card}>
                  <Image
                    source={
                      item.imageUrl
                        ? { uri: item.imageUrl }
                        : require("../../assets/latin.png")
                    }
                    style={styles.cardImage}
                  />

                  <LinearGradient
                    colors={[
                      "transparent",
                      "rgba(0,0,0,0.10)",
                      "rgba(0,0,0,0.35)",
                    ]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.cardOverlay}
                  />
                </View>

                <Text style={styles.playerName}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: responsiveHeight(4) }} />
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

export default LearnFromPros;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
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

  scrollContent: {
    paddingTop:
      Platform.OS === "ios" ? responsiveHeight(6) : responsiveHeight(5),
    paddingBottom: responsiveHeight(0),
  },

  header: {
    paddingHorizontal: responsiveWidth(4),
  },

  backButton: {
    width: responsiveWidth(10),
    height: responsiveWidth(10),
    borderRadius: responsiveWidth(6),
    backgroundColor: "#ffffff10",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: responsiveHeight(1),
  },

  titleContainer: {
    marginTop: responsiveHeight(0),
    paddingHorizontal: responsiveWidth(4),
  },

  title: {
    color: "#fff",
    fontSize: moderateScale(22),
    fontFamily: "Inter-Medium",
  },

  description: {
    color: "#929292",
    fontSize: moderateScale(11),
    lineHeight: moderateScale(16),
    width: responsiveWidth(82),
    marginTop: responsiveHeight(0.8),
    fontFamily: "Inter-Regular",
  },

  cardsWrapper: {
    marginTop: responsiveHeight(2.5),
    paddingHorizontal: responsiveWidth(4),
  },

  cardContainer: {
    marginBottom: responsiveHeight(1),
  },

  card: {
    width: "100%",
    height: responsiveHeight(22),
    borderRadius: moderateScale(14),
    overflow: "hidden",
    backgroundColor: "#111111",
    borderWidth: 1,
    borderColor: "#161616",
  },

  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  cardOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  playerName: {
    color: "#fff",
    fontSize: moderateScale(14),
    marginTop: responsiveHeight(1),
    marginLeft: responsiveWidth(1),
    fontFamily: "Inter-Medium",
  },
});
