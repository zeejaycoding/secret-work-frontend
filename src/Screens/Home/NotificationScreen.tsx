import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import {
  Ionicons,
  MaterialCommunityIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import {
  getInAppNotifications,
  markAllNotificationsRead,
} from "../../services/api";
import { useBranding } from "../../context/BrandingContext";
import { useAppTheme, ThemeColors } from "../../context/ThemeContext";
import { useLanguage } from "../../i18n";

const NotificationScreen = () => {
  const navigation = useNavigation<any>();
  const { accentColor } = useBranding();
  const { colors, statusBarStyle } = useAppTheme();
  const { t } = useLanguage();
  const styles = createStyles(colors);

  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    getInAppNotifications()
      .then((list) => {
        setNotifications(
          (list || []).map((n) => ({
            id: n._id,
            title: n.title,
            subtitle: n.message,
            icon: "target",
            button: "",
          }))
        );
        markAllNotificationsRead().catch(() => {});
      })
      .catch(() => {});
  }, []);

  const renderIcon = (icon: string) => {
    switch (icon) {
      case "target":
        return (
          <Ionicons
            name="shield-checkmark-outline"
            size={moderateScale(18)}
            color={accentColor}
          />
        );

      case "fire":
        return (
          <SimpleLineIcons
            name="fire"
            size={moderateScale(18)}
            color={accentColor}
          />
        );

      case "dumbbell":
        return (
          <MaterialCommunityIcons
            name="basketball-hoop"
            size={moderateScale(18)}
            color={accentColor}
          />
        );

      case "hourglass-half":
        return (
          <Ionicons
            name="hourglass-outline"
            size={moderateScale(18)}
            color={accentColor}
          />
        );

      default:
        return null;
    }
  };

  const renderItem = ({ item }: any) => {
    return (
      <TouchableOpacity activeOpacity={0.8} style={styles.card}>
        <View style={styles.leftSection}>
          <View style={styles.iconContainer}>{renderIcon(item.icon)}</View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.title}</Text>

            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        </View>

        {item.button ? (
          <TouchableOpacity activeOpacity={0.8} style={styles.button}>
            <Text style={styles.buttonText}>{item.button}</Text>
          </TouchableOpacity>
        ) : null}
      </TouchableOpacity>
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
          "rgba(0,0,0,0.28)",
        ]}
        locations={[0, 0.2, 0.35, 0.5, 0.65, 0.8, 0.9, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.bottomOverlay}
      />

      <View style={styles.contentContainer}>
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

          <Text style={styles.headerTitle}>{t("notifications")}</Text>
        </View>

        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </View>
  );
};

export default NotificationScreen;

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    height: responsiveHeight(35),
  },

  contentContainer: {
    flex: 1,
    paddingTop: responsiveHeight(6),
    paddingHorizontal: responsiveWidth(4),
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: responsiveHeight(2),
  },

  backButton: {
    width: responsiveWidth(10),
    height: responsiveWidth(10),
    borderRadius: responsiveWidth(6),
    backgroundColor: "#e96e6e13",
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    color: colors.text,
    fontSize: moderateScale(16),
    fontFamily: "Inter-Medium",
    marginLeft: responsiveWidth(3),
  },

  listContainer: {
    paddingBottom: responsiveHeight(4),
  },

  card: {
    width: "100%",
    minHeight: responsiveHeight(8),
    backgroundColor: colors.backgroundElevated,
    borderRadius: moderateScale(16),
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(1.2),
    marginBottom: responsiveHeight(1.2),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  iconContainer: {
    width: responsiveWidth(12),
    height: responsiveWidth(12),
    borderRadius: responsiveWidth(6),
    backgroundColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginRight: responsiveWidth(3.5),
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },

  textContainer: {
    flex: 1,
    paddingRight: responsiveWidth(2),
  },

  title: {
    color: colors.text,
    fontSize: moderateScale(12),
    fontFamily: "Inter-Medium",
    marginBottom: responsiveHeight(0.4),
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: moderateScale(9.1),
    lineHeight: moderateScale(13),
    fontFamily: "Inter-Regular",
  },

  button: {
    backgroundColor: "#E50914",
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(1),
    borderRadius: moderateScale(30),
    justifyContent: "center",
    alignItems: "center",
    marginLeft: responsiveWidth(2),
  },

  buttonText: {
    color: colors.white,
    fontSize: moderateScale(12),
    fontFamily: "Inter-Medium",
  },
});
