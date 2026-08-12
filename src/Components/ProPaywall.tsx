import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import { useBranding } from "../context/BrandingContext";
import { useAppTheme, ThemeColors } from "../context/ThemeContext";
import { useLanguage } from "../i18n";

const ProPaywall = ({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) => {
  const navigation = useNavigation<any>();
  const { primaryColor } = useBranding();
  const { colors, statusBarStyle } = useAppTheme();
  const { t } = useLanguage();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.background} barStyle={statusBarStyle} />

      <View style={styles.iconWrap}>
        <Ionicons
          name="lock-closed"
          size={moderateScale(38)}
          color={primaryColor}
        />
      </View>

      <Text style={styles.title}>
        {title || t("proFeature")}
      </Text>

      <Text style={styles.subtitle}>
        {subtitle || t("proFeatureDesc")}
      </Text>

      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.button, { backgroundColor: primaryColor }]}
        onPress={() => navigation.navigate("Subscription")}
      >
        <Text style={styles.buttonText}>{t("subscribeToPro")}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProPaywall;

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: responsiveWidth(10),
  },

  iconWrap: {
    width: responsiveWidth(22),
    height: responsiveWidth(22),
    borderRadius: moderateScale(100),
    backgroundColor: colors.backgroundElevated,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: responsiveHeight(2),
  },

  title: {
    color: colors.text,
    fontSize: moderateScale(18),
    fontFamily: "Inter-Medium",
    textAlign: "center",
    marginBottom: responsiveHeight(1),
  },

  subtitle: {
    color: colors.textMuted,
    fontSize: moderateScale(12),
    lineHeight: moderateScale(18),
    textAlign: "center",
    marginBottom: responsiveHeight(3),
    fontFamily: "Inter-Regular",
  },

  button: {
    width: responsiveWidth(70),
    height: responsiveHeight(6.5),
    borderRadius: moderateScale(12),
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: colors.white,
    fontSize: moderateScale(14),
    fontFamily: "Inter-Medium",
  },
});
