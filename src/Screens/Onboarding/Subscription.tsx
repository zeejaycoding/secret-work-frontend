import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  StatusBar,
  TouchableOpacity,
  Text,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { createCheckoutSession, getSubscriptionStatus, getPlans, validateDiscountCode } from "../../services/api";
import { useBranding } from "../../context/BrandingContext";
import { ThemeColors, darkColors } from "../../context/ThemeContext";
import { useLanguage } from "../../i18n";

  const FALLBACK_BENEFIT_KEYS = [
    "benefit1",
    "benefit2",
    "benefit3",
    "benefit4",
    "benefit5",
  ];

const Subscription = () => {
  const navigation = useNavigation<any>();
  const { primaryColor } = useBranding();
  const colors = darkColors;
  const statusBarStyle = "light-content" as const;
  const { t } = useLanguage();
  const styles = createStyles(colors);

  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annually">(
    "monthly",
  );
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; amount: number } | null>(null);
  const [discountLoading, setDiscountLoading] = useState(false);

  useEffect(() => {
    getPlans()
      .then(setPlans)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedPlan !== "annually") {
      setAppliedDiscount(null);
      setDiscountCode("");
    }
  }, [selectedPlan]);

  const monthlyPlan = plans.find((p) => p.key === "monthly");
  const annualPlan = plans.find((p) => p.key === "annual");
  const currentPlan = selectedPlan === "monthly" ? monthlyPlan : annualPlan;

  const formatPrice = (amount?: number) => {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return null;
    return n % 1 === 0 ? `$${n}` : `$${n}`;
  };

  const priceText =
    formatPrice(currentPlan?.price?.amount) ??
    (selectedPlan === "monthly" ? "$9.5" : "$79");

  const discountedPriceText = appliedDiscount && selectedPlan === "annually"
    ? formatPrice((currentPlan?.price?.amount || 79) - appliedDiscount.amount)
    : null;

  const periodText =
    currentPlan?.price?.interval === "year"
      ? "/year"
      : currentPlan?.price?.interval === "month"
        ? "/month"
        : selectedPlan === "monthly"
          ? "/month"
          : "/year";

  const visibleBenefits: string[] =
    (currentPlan?.benefits || [])
      .filter((b: any) => b.enabled)
      .map((b: any) => b.text) || [];

  const benefits: string[] = visibleBenefits.length
    ? visibleBenefits
    : FALLBACK_BENEFIT_KEYS.map((k) => t(k));

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    setDiscountLoading(true);
    try {
      const result = await validateDiscountCode(discountCode.trim(), "annually");
      if (result.valid) {
        setAppliedDiscount({ code: result.code || discountCode, amount: result.discountAmount || 5 });
          Alert.alert(t("discountApplied"), result.message || `$${result.discountAmount} off applied!`);
      } else {
        Alert.alert(t("invalidCode"), result.message || "This code is not valid");
        setAppliedDiscount(null);
      }
    } catch {
      Alert.alert(t("error"), t("discountValidateError"));
    } finally {
      setDiscountLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const { url } = await createCheckoutSession(selectedPlan, appliedDiscount?.code);
      if (url) {
        const Linking = require("expo-linking");
        await Linking.openURL(url);
        pollSubscriptionStatus();
      }
    } catch (error: any) {
      const msg = error?.response?.data?.error || "Failed to start payment. Try again.";
      Alert.alert(t("paymentError"), msg);
    } finally {
      setLoading(false);
    }
  };

  const pollSubscriptionStatus = async () => {
    const maxAttempts = 20;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      try {
        const status = await getSubscriptionStatus();
        if (status.isActive || status.tier === "pro") {
          navigation.reset({ index: 0, routes: [{ name: "PaymentSuccess" }] });
          return;
        }
      } catch {
        // continue polling
      }
    }
    Alert.alert(
      t("paymentStatus"),
      t("paymentProcessing")
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={statusBarStyle}
      />

      <LinearGradient
        colors={[
          "rgba(120,0,10,0.35)",
          "rgba(180,0,15,0.25)",
          "rgba(255,0,21,0.10)",
          "rgba(255,0,21,0.03)",
          "transparent",
        ]}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.redHorizontal}
      />

      <LinearGradient
        colors={[
          "rgba(255,0,21,0.10)",
          "rgba(255,0,21,0.07)",
          "rgba(255,0,21,0.04)",
          "rgba(255,0,21,0.02)",
          "transparent",
        ]}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.redVertical}
      />

      <LinearGradient
        colors={[
          "rgba(0,0,0,0.65)",
          "rgba(0,0,0,0.20)",
          "rgba(0,0,0,0.05)",
          "rgba(0,0,0,0.20)",
          "rgba(0,0,0,0.65)",
        ]}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.sideOverlay}
      />

      <LinearGradient
        colors={[
          "transparent",
          "rgba(0,0,0,0.05)",
          "rgba(0,0,0,0.10)",
          "rgba(0,0,0,0.18)",
          "rgba(0,0,0,0.25)",
          "rgba(0,0,0,0.35)",
          "rgba(0,0,0,0.55)",
          "rgba(0,0,0,0.75)",
        ]}
        locations={[0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.bottomOverlay}
      />

      <SafeAreaView style={styles.safeContainer}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons
            name="arrow-back-ios-new"
            size={moderateScale(16)}
            color={colors.text}
          />
        </TouchableOpacity>

        <View style={styles.contentContainer}>
          <View style={styles.switchContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.switchButton,
                selectedPlan === "monthly" && styles.activeSwitch,
              ]}
              onPress={() => setSelectedPlan("monthly")}
            >
                <Text
                  style={[
                    styles.switchText,
                    selectedPlan === "monthly" && styles.activeSwitchText,
                  ]}
                >
                  {t("monthly")}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.switchButton,
                selectedPlan === "annually" && styles.activeSwitch,
              ]}
              onPress={() => setSelectedPlan("annually")}
            >
                <Text
                  style={[
                    styles.switchText,
                    selectedPlan === "annually" && styles.activeSwitchText,
                  ]}
                >
                  {t("annually")}
                </Text>
            </TouchableOpacity>
          </View>

          <LinearGradient
            colors={[
              "rgba(20, 0, 0, 0.15)",
              "rgba(30, 0, 0, 0)",
              "rgba(45, 0, 0, 0.62)",
              "rgba(70,0,0,0.88)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <Text style={styles.title}>{t("popular")}</Text>

            <Text style={styles.description}>{t("upgradeDesc")}</Text>

            <View style={styles.priceRow}>
              {discountedPriceText ? (
                <>
                  <Text style={[styles.price, styles.originalPrice]}>
                    {priceText}
                  </Text>
                  <Text style={styles.price}>
                    {discountedPriceText}
                  </Text>
                </>
              ) : (
                <Text style={styles.price}>
                  {priceText}
                </Text>
              )}

              <Text style={styles.monthText}>
                {periodText}
              </Text>
            </View>

            {appliedDiscount && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>
                  {t("saveAmount", { amount: `$${appliedDiscount.amount}` })}
                </Text>
              </View>
            )}

            {selectedPlan === "annually" && !appliedDiscount && (
              <View style={styles.discountCodeContainer}>
                <Text style={styles.discountLabel}>{t("discountCodeLabel")}</Text>
                <View style={styles.discountInputRow}>
                  <TextInput
                    style={styles.discountInput}
                    placeholder={t("enterCode")}
                    placeholderTextColor={colors.textMuted}
                    value={discountCode}
                    onChangeText={setDiscountCode}
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={[styles.discountButton, { backgroundColor: primaryColor }]}
                    onPress={handleApplyDiscount}
                    disabled={discountLoading || !discountCode.trim()}
                  >
                    {discountLoading ? (
                      <ActivityIndicator color={colors.white} size="small" />
                    ) : (
                      <Text style={styles.discountButtonText}>{t("apply")}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.divider} />

            <Text style={styles.whatText}>{t("whatYouGet")}</Text>

            <View style={styles.benefitsContainer}>
              {benefits.map((item, index) => (
                <View key={index} style={styles.benefitRow}>
                  <View style={styles.redDot}>
                    <Ionicons
                      name="checkmark"
                      size={moderateScale(8)}
                      color={colors.white}
                    />
                  </View>

                  <Text style={styles.benefitText}>{item}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.subscribeButton, { backgroundColor: primaryColor }]}
              onPress={handleSubscribe}
              disabled={loading}
            >
              <LinearGradient
                colors={[primaryColor, primaryColor, primaryColor]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.subscribeGradient}
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                   <Text style={styles.subscribeText}>{t("subscribe")}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.reset({ index: 0, routes: [{ name: "BottomTabs" }] })}
          >
            <Text style={styles.skipText}>{t("skip")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default Subscription;

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    safeContainer: {
      flex: 1,
      paddingTop: responsiveHeight(3.8),
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
      height: responsiveHeight(40),
    },

    backButton: {
      marginTop: responsiveHeight(2),
      marginLeft: responsiveWidth(4),
      width: moderateScale(40),
      height: moderateScale(40),
      justifyContent: "center",
      backgroundColor: "#00000092",
      borderRadius: "50%",
      alignItems: "center",
    },

    contentContainer: {
      flex: 1,
      justifyContent: "flex-start",
      paddingHorizontal: responsiveWidth(3),
      paddingBottom: responsiveHeight(5),
      paddingTop: responsiveHeight(1),
    },

    switchContainer: {
      width: "100%",
      height: responsiveHeight(5.5),
      backgroundColor: colors.backgroundElevated,
      borderRadius: moderateScale(12),
      flexDirection: "row",
      alignItems: "center",
      padding: moderateScale(4),
      marginBottom: responsiveHeight(1.8),
      borderWidth: 1,
      borderColor: colors.border,
    },

    switchButton: {
      flex: 1,
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: moderateScale(10),
    },

    activeSwitch: {
      borderWidth: 1,
      borderColor: colors.textMuted,
      backgroundColor: "#1A0002",
    },

    switchText: {
      color: "rgba(255,255,255,0.45)",
      fontSize: moderateScale(12),
      fontWeight: "500",
    },

    activeSwitchText: {
      color: colors.white,
      fontWeight: "600",
    },

    card: {
      width: "100%",
      borderRadius: moderateScale(18),
      paddingHorizontal: responsiveWidth(4),
      paddingVertical: responsiveHeight(2),
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
    },

    cardGlow: {
      position: "absolute",
      bottom: 0,
      width: "100%",
      height: responsiveHeight(30),
    },

    title: {
      color: colors.white,
      fontSize: moderateScale(20),
      fontFamily: "Poppins-Medium",
    },

    description: {
      color: colors.textSecondary,
      fontSize: moderateScale(11.5),
      lineHeight: moderateScale(18),
      marginBottom: responsiveHeight(2),
      fontFamily: "Poppins-Regular",
    },

    priceRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      marginBottom: responsiveHeight(2),
    },

    price: {
      color: colors.white,
      fontSize: moderateScale(38),
      fontFamily: "Inter-Medium",
    },

    originalPrice: {
      fontSize: moderateScale(20),
      color: colors.textMuted,
      textDecorationLine: "line-through",
      marginRight: moderateScale(8),
      marginBottom: moderateScale(6),
    },

    monthText: {
      color: colors.textSecondary,
      fontSize: moderateScale(15),
      marginBottom: moderateScale(6),
      marginLeft: moderateScale(4),
    },

    discountBadge: {
      backgroundColor: "#22C55E",
      borderRadius: moderateScale(8),
      paddingHorizontal: moderateScale(12),
      paddingVertical: moderateScale(4),
      alignSelf: "flex-start",
      marginBottom: responsiveHeight(1.5),
    },

    discountBadgeText: {
      color: colors.white,
      fontSize: moderateScale(12),
      fontFamily: "Inter-Bold",
    },

    discountCodeContainer: {
      marginBottom: responsiveHeight(1.5),
    },

    discountLabel: {
      color: colors.textSecondary,
      fontSize: moderateScale(12),
      marginBottom: moderateScale(8),
      fontFamily: "Inter-Medium",
    },

    discountInputRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: moderateScale(8),
    },

    discountInput: {
      flex: 1,
      height: moderateScale(40),
      backgroundColor: "rgba(255,255,255,0.1)",
      borderRadius: moderateScale(8),
      paddingHorizontal: moderateScale(12),
      color: colors.white,
      fontSize: moderateScale(13),
      fontFamily: "Inter-Medium",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.15)",
    },

    discountButton: {
      height: moderateScale(40),
      paddingHorizontal: moderateScale(16),
      borderRadius: moderateScale(8),
      justifyContent: "center",
      alignItems: "center",
    },

    discountButtonText: {
      color: colors.white,
      fontSize: moderateScale(13),
      fontFamily: "Inter-Bold",
    },

    divider: {
      width: "100%",
      height: 1,
      backgroundColor: "rgba(255,255,255,0.08)",
      marginBottom: responsiveHeight(2),
    },

    whatText: {
      color: colors.textSecondary,
      fontSize: moderateScale(13),
      marginBottom: responsiveHeight(2),
      fontFamily: "Inter-Medium",
    },

    benefitsContainer: {
      marginBottom: responsiveHeight(1),
    },

    benefitRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: responsiveHeight(1.7),
    },

    redDot: {
      width: moderateScale(16),
      height: moderateScale(16),
      borderRadius: moderateScale(20),
      backgroundColor: "#ff0000",
      justifyContent: "center",
      alignItems: "center",
      marginRight: responsiveWidth(3),
    },

    benefitText: {
      color: colors.white,
      fontSize: moderateScale(12),
      flex: 1,
      fontFamily: "Inter-Medium",
    },

    subscribeButton: {
      width: "100%",
      height: responsiveHeight(5.8),
      borderRadius: moderateScale(12),
      overflow: "hidden",
    },

    subscribeGradient: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },

    subscribeText: {
      color: colors.white,
      fontSize: moderateScale(15),
      fontFamily: "Inter-Medium",
    },

    skipText: {
      color: colors.text,
      fontSize: moderateScale(14),
      textAlign: "center",
      marginTop: responsiveHeight(2),
      fontFamily: "Inter-Medium",
    },
  });
