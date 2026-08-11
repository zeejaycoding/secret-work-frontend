import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import { getSubscriptionStatus, createPortalSession } from "../../services/api";
import { useAuthContext } from "../../context/AuthContext";
import { useBranding } from "../../context/BrandingContext";

const AfterSubscribed = () => {
  const navigation = useNavigation<any>();
  const { refreshDbUser } = useAuthContext();
  const { primaryColor } = useBranding();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<{
    tier: string;
    expiry: string | null;
    plan: string | null;
    amount: number | null;
    label: string | null;
  }>({ tier: "pro", expiry: null, plan: null, amount: null, label: null });

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const data = await getSubscriptionStatus();
      setSubscription(data);
      if (!data.isActive && data.tier !== "pro") {
        navigation.goBack();
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleManage = async () => {
    try {
      const { url } = await createPortalSession();
      if (url) {
        const Linking = require("expo-linking");
        await Linking.openURL(url);
      }
    } catch {
      Alert.alert("Error", "Could not open subscription management");
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const planLabel =
    subscription.label ||
    (subscription.plan === "month"
      ? "Monthly Pro"
      : subscription.plan === "year"
        ? "Annual Pro"
        : "Pro");

  const formatAmount = (value: number | null) => {
    if (value == null) return null;
    return value % 1 === 0 ? `$${value}` : `$${value.toFixed(2)}`;
  };

  const priceText =
    formatAmount(subscription.amount) ||
    (subscription.plan === "month"
      ? "$9.50/mo"
      : subscription.plan === "year"
        ? "$79/yr"
        : "Pro");

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#E50914" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="chevron-back"
            size={moderateScale(22)}
            color="#fff"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My current plan</Text>
      </View>

      <View style={styles.centerSection}>
        <View style={styles.mainLogoContainer}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.mainLogo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status: </Text>
          <Text style={styles.statusActive}>Active</Text>
        </View>

        <Text style={styles.priceText}>{priceText}</Text>

        <View style={styles.subscriptionBadge}>
          <Text style={styles.subscriptionText}>
            {planLabel} - Renews {formatDate(subscription.expiry)}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.manageButton, { borderColor: primaryColor }]}
          onPress={handleManage}
        >
          <Text style={[styles.manageButtonText, { color: primaryColor }]}>
            Manage Subscription
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AfterSubscribed;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: responsiveWidth(4),
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: responsiveHeight(6),
  },

  backButton: {
    width: responsiveWidth(10),
    height: responsiveWidth(10),
    borderRadius: moderateScale(50),
    backgroundColor: "#111111",
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    color: "#fff",
    fontSize: moderateScale(17),
    fontFamily: "Inter-Medium",
    marginLeft: responsiveWidth(3),
  },

  centerSection: {
    alignItems: "center",
    marginTop: responsiveHeight(8),
  },

  mainLogoContainer: {
    width: responsiveWidth(26),
    height: responsiveWidth(26),
    borderRadius: responsiveWidth(14),
    backgroundColor: "#111111",
    justifyContent: "center",
    alignItems: "center",
  },

  mainLogo: {
    width: responsiveWidth(15),
    height: responsiveWidth(15),
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: responsiveHeight(2),
  },

  statusLabel: {
    color: "#929292",
    fontSize: moderateScale(12),
    fontFamily: "Inter-Medium",
  },

  statusActive: {
    color: "#22C55E",
    fontSize: moderateScale(12),
    fontFamily: "Inter-Bold",
  },

  priceText: {
    color: "#fff",
    fontSize: moderateScale(28),
    marginTop: responsiveHeight(0.7),
    fontFamily: "Inter-Bold",
  },

  subscriptionBadge: {
    backgroundColor: "#111111",
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveHeight(0.8),
    borderRadius: moderateScale(30),
    marginTop: responsiveHeight(1),
  },

  subscriptionText: {
    color: "#8A9095",
    fontSize: moderateScale(11),
    fontFamily: "Inter-Medium",
  },

  manageButton: {
    marginTop: responsiveHeight(3),
    backgroundColor: "#1A0002",
    paddingHorizontal: responsiveWidth(8),
    paddingVertical: responsiveHeight(1.2),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: "#E50914",
  },

  manageButtonText: {
    color: "#E50914",
    fontSize: moderateScale(13),
    fontFamily: "Inter-Medium",
  },
});
