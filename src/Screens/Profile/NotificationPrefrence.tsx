// NotificationPrefrence.tsx

import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Animated,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { moderateScale } from "react-native-size-matters";

import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  loadPreferences,
  savePreferences,
  getCachedPreferences,
} from "../../services/preferences";
import { useBranding } from "../../context/BrandingContext";
import { getCachedNotificationPrefs } from "../../services/branding";
import { useAppTheme, ThemeColors } from "../../context/ThemeContext";
import { useLanguage } from "../../i18n";

type NotificationItemProps = {
  title: string;
  subtitle: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  disabled?: boolean;
};

const notificationData = [
  {
    id: "1",
    titleKey: "pushNotifTitle",
    subtitleKey: "pushNotifSub",
  },
  {
    id: "2",
    titleKey: "emailNotifTitle",
    subtitleKey: "emailNotifSub",
  },
  {
    id: "3",
    titleKey: "inAppNotifTitle",
    subtitleKey: "inAppNotifSub",
  },
];

const NotificationItem = ({
  title,
  subtitle,
  value,
  onToggle,
  disabled,
}: NotificationItemProps) => {
  const { accentColor } = useBranding();
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const translateX = useRef(
    new Animated.Value(value ? moderateScale(13) : 0),
  ).current;

  const handleToggle = () => {
    if (disabled) return;
    Animated.timing(translateX, {
      toValue: value ? 0 : moderateScale(13),
      duration: 200,
      useNativeDriver: true,
    }).start();

    onToggle(!value);
  };

  return (
    <View style={styles.itemContainer}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>

        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        disabled={disabled}
        style={[
          styles.customSwitch,
          {
            backgroundColor: value ? accentColor : colors.switchTrack,
          },
        ]}
        onPress={handleToggle}
      >
        <Animated.View
          style={[
            styles.switchCircle,
            {
              transform: [{ translateX }],
            },
          ]}
        />
      </TouchableOpacity>
    </View>
  );
};

const NotificationPrefrence = () => {
  const navigation = useNavigation<any>();
  const { notifPrefs: globalPrefs, accentColor } = useBranding();
  const { colors, statusBarStyle } = useAppTheme();
  const { t } = useLanguage();
  const styles = createStyles(colors);

  const [pushNotification, setPushNotification] = useState(false);
  const [emailNotification, setEmailNotification] = useState(false);
  const [inAppNotification, setInAppNotification] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadPreferences().then((prefs) => {
        setPushNotification(prefs.notifications.push ?? true);
        setEmailNotification(prefs.notifications.email ?? true);
        setInAppNotification(prefs.notifications.inApp ?? true);
      });
    }, [])
  );

  const handleToggle = (key: "push" | "email" | "inApp", value: boolean) => {
    savePreferences({
      notifications: { ...getCachedPreferences().notifications, [key]: value },
    });
    loadPreferences().then((prefs) => {
      if (key === "push") setPushNotification(prefs.notifications.push ?? true);
      if (key === "email") setEmailNotification(prefs.notifications.email ?? true);
      if (key === "inApp") setInAppNotification(prefs.notifications.inApp ?? true);
    });
  };

  const global = getCachedNotificationPrefs();
  const pushDisabled = global.push === false;
  const emailDisabled = global.email === false;
  const inAppDisabled = global.inApp === false;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.background} barStyle={statusBarStyle} />

      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={moderateScale(22)} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{t("notifPreferences")}</Text>
      </View>

      {/* List */}
      <View style={styles.listContainer}>
        <NotificationItem
          title={t(notificationData[0].titleKey)}
          subtitle={t(notificationData[0].subtitleKey)}
          value={pushNotification}
          disabled={pushDisabled}
          onToggle={(value) => {
            setPushNotification(value);
            handleToggle("push", value);
          }}
        />

        <NotificationItem
          title={t(notificationData[1].titleKey)}
          subtitle={t(notificationData[1].subtitleKey)}
          value={emailNotification}
          disabled={emailDisabled}
          onToggle={(value) => {
            setEmailNotification(value);
            handleToggle("email", value);
          }}
        />

        <NotificationItem
          title={t(notificationData[2].titleKey)}
          subtitle={t(notificationData[2].subtitleKey)}
          value={inAppNotification}
          disabled={inAppDisabled}
          onToggle={(value) => {
            setInAppNotification(value);
            handleToggle("inApp", value);
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default NotificationPrefrence;

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: responsiveWidth(5),
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

  listContainer: {
    marginTop: responsiveHeight(2),
    paddingHorizontal: responsiveWidth(5),
  },

  itemContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: responsiveHeight(1.6),
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },

  textContainer: {
    width: "82%",
  },

  title: {
    color: colors.text,
    fontSize: moderateScale(14),
    fontFamily: "Inter-Medium",
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: moderateScale(11.5),
    fontFamily: "Inter-Regular",
    marginTop: responsiveHeight(0.4),
    lineHeight: moderateScale(16),
  },

  customSwitch: {
    width: moderateScale(35),
    height: moderateScale(22),
    borderRadius: moderateScale(100),
    justifyContent: "center",
    paddingHorizontal: moderateScale(3),
  },

  switchCircle: {
    width: moderateScale(14),
    height: moderateScale(14),
    borderRadius: moderateScale(100),
    backgroundColor: colors.text,
  },
});
