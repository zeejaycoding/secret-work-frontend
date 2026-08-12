import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Image,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveWidth,
  responsiveHeight,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import { useBranding } from "../../context/BrandingContext";
import { useAppTheme, ThemeColors } from "../../context/ThemeContext";
import { useLanguage } from "../../i18n";

const BeforeSubscribedPlan = () => {
  const navigation = useNavigation<any>();
  const { primaryColor } = useBranding();
  const { colors, statusBarStyle } = useAppTheme();
  const { t } = useLanguage();
  const styles = createStyles(colors);

  const handleSubscribe = () => {
    navigation.navigate("Subscription");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.background} barStyle={statusBarStyle} />

      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={moderateScale(22)} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{t("myCurrentPlan")}</Text>
      </View>

      <View style={styles.contentContainer}>
        <Image
          source={require("../../assets/wallet.png")}
          style={styles.walletImage}
          resizeMode="contain"
        />

        <Text style={styles.statusText}>
          {t("status")}: <Text style={[styles.inactiveText, { color: primaryColor }]}>{t("notActive")}</Text>
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.button, { backgroundColor: primaryColor }]}
          onPress={handleSubscribe}
        >
            <Text style={styles.buttonText}>{t("subscribeToPremium")}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default BeforeSubscribedPlan;

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: responsiveWidth(3),
    marginTop: responsiveHeight(6),
  },

  backButton: {
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

  contentContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: responsiveHeight(5),
  },

  walletImage: {
    width: responsiveWidth(24),
    height: responsiveWidth(24),
    marginBottom: responsiveHeight(1.5),
  },

  statusText: {
    color: colors.textMuted,
    fontSize: moderateScale(12),
    marginBottom: responsiveHeight(4),
    fontFamily: "Inter-Medium",
  },

  inactiveText: {
    color: "#E50914",
    fontFamily: "Inter-Bold",
  },

  button: {
    width: responsiveWidth(90),
    height: responsiveHeight(6.5),
    backgroundColor: "#E50914",
    borderRadius: moderateScale(12),
    justifyContent: "center",
    alignItems: "center",
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: colors.white,
    fontSize: moderateScale(14),
    fontFamily: "Inter-Medium",
  },
});
