import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import { useBranding } from "../../context/BrandingContext";
import { useAppTheme, ThemeColors } from "../../context/ThemeContext";

type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

const faqData: FAQItem[] = [
  {
    id: "1",
    question: "How do I start a workout?",
    answer:
      "Yes. A premium subscription gives you unlimited access to all drills, guided workouts, and exclusive training content. Some preview content may be available, but full access requires an active subscription.",
  },
  {
    id: "2",
    question: "Do I need a subscription to access drills?",
    answer:
      "Some drills are free, but premium content requires an active subscription plan.",
  },
  {
    id: "3",
    question: "Can I download videos for offline use?",
    answer:
      "Yes, premium users can download selected videos and watch them offline anytime.",
  },
  {
    id: "4",
    question: "How often are new drills added?",
    answer:
      "New drills and workouts are added every week to keep your training updated.",
  },
  {
    id: "5",
    question: "Can beginners use this app?",
    answer:
      "Absolutely. The app includes beginner-friendly workouts and step-by-step guidance.",
  },
  {
    id: "6",
    question: "How do I reset my password?",
    answer:
      "Go to settings, tap on 'Forgot Password', and follow the instructions sent to your email.",
  },
];

const HelpSupport = () => {
  const navigation = useNavigation<any>();
  const { primaryColor } = useBranding();
  const { colors, statusBarStyle } = useAppTheme();
  const styles = createStyles(colors);
  const [expandedId, setExpandedId] = useState<string | null>("1");

  const toggleItem = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.background} barStyle={statusBarStyle} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="chevron-back"
              size={moderateScale(22)}
              color={colors.text}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Help & Support</Text>
        </View>
        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>How can we help you?</Text>

          <Text style={styles.helpSubtitle}>
            Find answers to the most commonly asked questions
          </Text>
        </View>

        <View style={styles.faqContainer}>
          {faqData.map((item) => {
            const isExpanded = expandedId === item.id;

            return (
              <View key={item.id}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.questionRow}
                  onPress={() => toggleItem(item.id)}
                >
                  <Text style={styles.questionText}>{item.question}</Text>

                  <Ionicons
                    name={isExpanded ? "remove" : "add"}
                    size={moderateScale(18)}
                    color={colors.text}
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <Text style={styles.answerText}>{item.answer}</Text>
                )}

                {item.id !== faqData[faqData.length - 1].id && (
                  <View style={styles.divider} />
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.floatingBtn, { backgroundColor: primaryColor }]}
        onPress={() => navigation.navigate("HelpChat")}
      >
        <MaterialCommunityIcons
          name="chat-plus"
          size={moderateScale(30)}
          color={colors.white}
        />
      </TouchableOpacity>
    </View>
  );
};

export default HelpSupport;

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    paddingBottom: responsiveHeight(15),
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: responsiveWidth(4),
    marginTop: responsiveHeight(6),
  },

  backBtn: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(100),
    backgroundColor: colors.backgroundElevated,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    color: colors.text,
    fontSize: moderateScale(17),
    fontFamily: "Inter-Medium",
    marginLeft: responsiveWidth(3),
  },

  helpCard: {
    width: responsiveWidth(92),
    alignSelf: "center",
    backgroundColor: "#E50914",
    borderRadius: moderateScale(10),
    paddingVertical: responsiveHeight(1.6),
    paddingHorizontal: responsiveWidth(5),
    marginTop: responsiveHeight(2.5),
    alignItems: "center",
  },

  helpTitle: {
    color: colors.white,
    fontSize: moderateScale(20),
    textAlign: "center",
    fontFamily: "Inter-Bold",
  },

  helpSubtitle: {
    color: "#FFE5E7",
    fontSize: moderateScale(11),
    marginTop: responsiveHeight(0.2),
    textAlign: "center",
    opacity: 0.9,
    fontFamily: "Inter-Medium",
  },

  faqContainer: {
    width: responsiveWidth(92),
    alignSelf: "center",
    backgroundColor: colors.backgroundCard,
    borderRadius: moderateScale(10),
    marginTop: responsiveHeight(1.5),
    paddingVertical: responsiveHeight(1),
    paddingHorizontal: responsiveWidth(4),
  },

  questionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: responsiveHeight(2),
  },

  questionText: {
    color: colors.text,
    fontSize: moderateScale(13),
    width: responsiveWidth(72),
    lineHeight: moderateScale(22),
    fontFamily: "Inter-Bold",
  },

  answerText: {
    color: colors.textMuted,
    fontSize: moderateScale(12),
    lineHeight: moderateScale(18),
    paddingBottom: responsiveHeight(2),
    width: responsiveWidth(76),
    fontFamily: "Inter-Medium",
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
  },

  floatingBtn: {
    position: "absolute",
    bottom: responsiveHeight(4),
    right: responsiveWidth(5),
    width: moderateScale(58),
    height: moderateScale(58),
    borderRadius: moderateScale(100),
    backgroundColor: "#E50914",
    justifyContent: "center",
    alignItems: "center",
  },
});
