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
import { useLanguage } from "../../i18n";

type FAQItem = {
  id: string;
  questionKey: string;
  answerKey: string;
};

const faqData: FAQItem[] = [
  { id: "1", questionKey: "faq1q", answerKey: "faq1a" },
  { id: "2", questionKey: "faq2q", answerKey: "faq2a" },
  { id: "3", questionKey: "faq3q", answerKey: "faq3a" },
  { id: "4", questionKey: "faq4q", answerKey: "faq4a" },
  { id: "5", questionKey: "faq5q", answerKey: "faq5a" },
  { id: "6", questionKey: "faq6q", answerKey: "faq6a" },
];

const HelpSupport = () => {
  const navigation = useNavigation<any>();
  const { primaryColor } = useBranding();
  const { colors, statusBarStyle } = useAppTheme();
  const { t } = useLanguage();
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

          <Text style={styles.headerTitle}>{t("helpSupport")}</Text>
        </View>
        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>{t("helpTitle")}</Text>

          <Text style={styles.helpSubtitle}>{t("helpSubtitle")}</Text>
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
                  <Text style={styles.questionText}>{t(item.questionKey)}</Text>

                  <Ionicons
                    name={isExpanded ? "remove" : "add"}
                    size={moderateScale(18)}
                    color={colors.text}
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <Text style={styles.answerText}>{t(item.answerKey)}</Text>
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
