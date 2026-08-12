import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  StatusBar,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getPros } from "../../services/api";
import { useAppTheme, ThemeColors } from "../../context/ThemeContext";

const PRO_PRIORITY = ["latin", "cooper", "corey", "destiny", "jayson"];

const rankPro = (name: string) => {
  const n = (name || "").toLowerCase();
  const i = PRO_PRIORITY.findIndex((k) => n.includes(k));
  return i === -1 ? PRO_PRIORITY.length : i;
};

const LearnFromPros = () => {
  const navigation = useNavigation<any>();
  const { colors, statusBarStyle } = useAppTheme();
  const styles = createStyles(colors);
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
        barStyle={statusBarStyle}
      />

      <View style={styles.background}>
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
                color={colors.text}
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
                </View>

                <Text style={styles.playerName}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: responsiveHeight(4) }} />
        </ScrollView>
      </View>
    </View>
  );
};

export default LearnFromPros;

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  background: {
    flex: 1,
    backgroundColor: colors.background,
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
    backgroundColor: colors.backgroundInput,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: responsiveHeight(1),
  },

  titleContainer: {
    marginTop: responsiveHeight(0),
    paddingHorizontal: responsiveWidth(4),
  },

  title: {
    color: colors.text,
    fontSize: moderateScale(22),
    fontFamily: "Inter-Medium",
  },

  description: {
    color: colors.textSecondary,
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
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.backgroundInput,
  },

  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  playerName: {
    color: colors.text,
    fontSize: moderateScale(14),
    marginTop: responsiveHeight(1),
    marginLeft: responsiveWidth(1),
    fontFamily: "Inter-Medium",
  },
});
