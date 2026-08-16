import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  AppState,
} from "react-native";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveWidth,
  responsiveHeight,
} from "react-native-responsive-dimensions";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuthContext } from "../../context/AuthContext";
import { useBranding } from "../../context/BrandingContext";
import { useAppTheme, ThemeColors } from "../../context/ThemeContext";
import { useLanguage } from "../../i18n";
import { getUnreadNotificationCount } from "../../services/api";
import { connectSocket, onNotificationNew } from "../../services/socket";

const Header = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthContext();
  const { primaryColor, tagline } = useBranding();
  const { colors, isDarkMode } = useAppTheme();
  const styles = createStyles(colors);
  const { t } = useLanguage();
  const [unread, setUnread] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshUnread = useCallback(() => {
    getUnreadNotificationCount()
      .then((count) => setUnread(Number(count) || 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const unsubscribe = onNotificationNew((count) => setUnread(count));
    connectSocket().catch(() => {});
    return unsubscribe;
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshUnread();
      connectSocket().catch(() => {});
      intervalRef.current = setInterval(refreshUnread, 15000);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
      };
    }, [refreshUnread])
  );

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") refreshUnread();
    });
    return () => sub.remove();
  }, [refreshUnread]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const displayName = user?.firstName
    ? `${user.firstName}`
    : user?.email?.split("@")[0] || "User";

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Image
          source={
            user?.avatarUrl
              ? { uri: user.avatarUrl }
              : require("../../assets/user.png")
          }
          style={styles.image}
          resizeMode={user?.avatarUrl ? "cover" : "contain"}
        />

        <View>
          <Text style={styles.title}>{t("hey", { name: displayName })}</Text>
          <Text style={[styles.subtitle, { color: isDarkMode ? colors.textMuted : "#000000" }]}>{tagline}</Text>
        </View>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate("Notification")}>
        <Image
          source={require("../../assets/notification.png")}
          style={styles.notificationIcon}
        />

        {unread > 0 && (
          <View style={[styles.badge, { backgroundColor: primaryColor }]}>
            <Text style={styles.badgeText}>
              {unread > 99 ? "99+" : unread}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default Header;

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    marginTop: responsiveHeight(6),
    paddingHorizontal: responsiveWidth(4),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
  },

  image: {
    width: responsiveWidth(13),
    height: responsiveWidth(13),
    borderRadius: responsiveWidth(6),
    marginRight: responsiveWidth(3),
    resizeMode: "contain",
  },

  title: {
    color: colors.text,
    fontSize: moderateScale(14.5),
    fontFamily: "Inter-Medium",
  },

  subtitle: {
    fontSize: moderateScale(10),
    fontFamily: "Inter-Regular",
  },

  notificationIcon: {
    width: responsiveWidth(5.5),
    height: responsiveWidth(5.5),
    resizeMode: "contain",
  },

  badge: {
    position: "absolute",
    top: -responsiveHeight(1),
    right: -responsiveWidth(1.6),
    minWidth: responsiveWidth(4.5),
    height: responsiveWidth(4.5),
    borderRadius: responsiveWidth(2.25),
    backgroundColor: "#E50914",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: responsiveWidth(0.8),
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  badgeText: {
    color: colors.white,
    fontSize: moderateScale(8.5),
    fontFamily: "Inter-Bold",
  },
});
