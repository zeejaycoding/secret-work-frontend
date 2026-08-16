import React, { useState, useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  View,
  StyleSheet,
  ImageBackground,
  Image,
  StatusBar,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { useAuthContext } from "../../context/AuthContext";
import { useBranding } from "../../context/BrandingContext";
import { useAppTheme, ThemeColors, overlayGradient } from "../../context/ThemeContext";
import { useLanguage } from "../../i18n";
import { uploadProfilePic, deleteProfilePic } from "../../services/api";

const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { user, signOut, refreshDbUser } = useAuthContext();
  const { primaryColor, accentColor } = useBranding();
  const { colors, statusBarStyle, isDarkMode } = useAppTheme();
  const { t } = useLanguage();
  const styles = createStyles(colors);
  const overlays = overlayGradient(isDarkMode);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshDbUser();
    }, [refreshDbUser])
  );

  const uploadProfileImage = useCallback(async (imageUri: string) => {
    setIsUploading(true);
    try {
      let formData = new FormData();
      formData.append("profile", {
        uri: imageUri,
        type: "image/jpeg",
        name: "profile.jpg",
      } as any);

      const updatedUser = await uploadProfilePic(formData);
      if (updatedUser) {
        await refreshDbUser();
        Alert.alert("Success", "Profile image saved");
      }
    } catch (error: any) {
      setProfileImage(null);
      Alert.alert("Error", "Failed to upload profile image");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  }, [refreshDbUser]);

  const pickImage = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Photos access needed",
          "Allow Secret Work to access your photos so you can set a profile picture.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setProfileImage(uri);
        await uploadProfileImage(uri);
      }
    } catch (error: any) {
      Alert.alert("Error", "Could not open the photo library. Please try again.");
      console.error("Pick image error:", error);
    }
  }, [uploadProfileImage]);

  const deleteProfileImage = useCallback(async () => {
    Alert.alert(
      "Remove profile picture?",
      "This will remove your current profile picture.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProfilePic();
              setProfileImage(null);
              await refreshDbUser();
            } catch (error: any) {
              Alert.alert("Error", "Failed to remove profile image");
              console.error("Delete avatar error:", error);
            }
          },
        },
      ]
    );
  }, [refreshDbUser]);

  const displayName = user?.firstName
    ? `${user.firstName}`
    : user?.email?.split("@")[0] || "User";

  const formatActiveSince = (dateStr?: string) => {
    if (!dateStr) return "Jan 2026";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Jan 2026";
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const activeSince = formatActiveSince(user?.createdAt);
  const workoutCount = user?.completedDrills?.length ?? 0;
  const watchMinutes = Math.floor((user?.watchTimeSec || 0) / 60);
  const intensity = Math.min(100, watchMinutes);

  const handleSignOut = () => {
    Alert.alert(t("signOut"), t("signOutConfirm"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("signOut"),
        style: "destructive",
        onPress: async () => {
          await signOut();
          navigation.reset({ index: 0, routes: [{ name: "Signin" }] });
        },
      },
    ]);
  };

  const isPro = user?.subscriptionTier === "pro" || user?.subscriptionTier === "premium";

  const menuData = [
    {
      id: "2",
      title: t("subscriptionPlan"),
      icon: (
        <MaterialCommunityIcons name="credit-card" size={22} color={primaryColor} />
      ),
      screen: isPro ? "AfterSubscribe" : "BeforeSubscribe",
    },
    {
      id: "3",
      title: t("helpSupport"),
      icon: <Ionicons name="help-circle" size={24} color={primaryColor} />,
      screen: "HelpSupport",
    },
    {
      id: "4",
      title: t("preferences"),
      icon: <Ionicons name="settings" size={22} color={primaryColor} />,
      screen: "Settings",
    },
  ];

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
        colors={overlays.side.colors}
        locations={overlays.side.locations}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.sideOverlay}
      />

      <LinearGradient
        colors={overlays.bottom.colors}
        locations={overlays.bottom.locations}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.bottomOverlay}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
          <View style={styles.profileContainer}>
            <View style={styles.avatarWrap}>
              <View style={styles.profileBorder}>
                <TouchableOpacity
                  onPress={pickImage}
                  style={styles.avatarTouchable}
                  activeOpacity={0.85}
                >
                  <Image
                    source={
                      profileImage
                        ? { uri: profileImage }
                        : user?.avatarUrl
                        ? { uri: user.avatarUrl }
                        : require("../../assets/mainprofile.png")
                    }
                    style={styles.profileImage}
                    resizeMode="cover"
                  />
                  {isUploading && (
                    <View style={styles.uploadingOverlay} pointerEvents="none">
                      <ActivityIndicator color={colors.white} size="small" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={pickImage}
                style={styles.cameraBtn}
                hitSlop={10}
              >
                <Ionicons name="camera" size={16} color={colors.white} />
              </TouchableOpacity>

              {user?.avatarUrl ? (
                <TouchableOpacity
                  onPress={deleteProfileImage}
                  style={styles.deleteAvatarBtn}
                  hitSlop={10}
                >
                  <Ionicons name="trash" size={15} color={colors.white} />
                </TouchableOpacity>
              ) : null}
            </View>

            <Text style={styles.avatarHint}>
              {user?.avatarUrl ? "Tap photo to change" : "Tap photo to add"}
            </Text>

          {isPro && (
            <View style={[styles.proMemberTag, { backgroundColor: primaryColor }]}>
              <Text style={styles.proMemberText}>{t("proMember")}</Text>
            </View>
          )}

          <Text style={styles.userName}>{displayName}</Text>

          <TouchableOpacity
            style={styles.editRow}
            onPress={() => navigation.navigate("EditProfileInformation")}
          >
            <Text style={[styles.editText, { color: accentColor }]}>{t("editPersonalInfo")}</Text>
          </TouchableOpacity>
        </View>

        {!isPro && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.upgradeCard}
            onPress={() => navigation.navigate("Subscription")}
          >
            <ImageBackground
              source={require("../../assets/upgrade.png")}
              resizeMode="cover"
              imageStyle={styles.upgradeBg}
              style={styles.upgradeImage}
            >
              <View style={styles.upgradeContent}>
                <View>
                  <View style={[styles.proBadge, { backgroundColor: accentColor }]}>
                    <Text style={styles.proText}>PRO</Text>
                  </View>

                  <Text style={styles.upgradeTitle}>{t("upgradeToPremium")}</Text>

                  <Text style={styles.upgradeSubTitle}>
                    {t("autoRenewable")}
                  </Text>
                </View>

                <Feather
                  name="chevron-right"
                  size={22}
                  style={{ paddingRight: responsiveWidth(2) }}
                  color={colors.white}
                />
              </View>
            </ImageBackground>
          </TouchableOpacity>
        )}

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: primaryColor }]}>{activeSince}</Text>
            <Text style={styles.statLabel}>{t("activeSince")}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: primaryColor }]}>{workoutCount}</Text>
            <Text style={styles.statLabel}>{t("workouts")}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: primaryColor }]}>{intensity}%</Text>
            <Text style={styles.statLabel}>{t("intensity")}</Text>
          </View>
        </View>

        {menuData.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconContainer}>{item.icon}</View>

              <Text style={styles.menuTitle}>{item.title}</Text>
            </View>

            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <Text style={[styles.logoutText, { color: primaryColor }]}>{t("signOut")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    paddingTop: responsiveHeight(8),
    paddingBottom: responsiveHeight(5),
    paddingHorizontal: responsiveWidth(4),
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
    height: responsiveHeight(50),
  },

  profileContainer: {
    alignItems: "center",
    marginBottom: responsiveHeight(3),
  },

  avatarWrap: {
    position: "relative",
    width: responsiveWidth(33),
    height: responsiveWidth(33),
  },

  profileBorder: {
    width: "100%",
    height: "100%",
    borderRadius: responsiveWidth(100),
    borderWidth: moderateScale(3),
    borderColor: "#E50914",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: colors.backgroundElevated,
  },

  deleteAvatarBtn: {
    position: "absolute",
    top: -moderateScale(3),
    right: -moderateScale(3),
    width: moderateScale(26),
    height: moderateScale(26),
    borderRadius: moderateScale(13),
    backgroundColor: "#E50914",
    borderWidth: moderateScale(1.5),
    borderColor: colors.backgroundElevated,
    alignItems: "center",
    justifyContent: "center",
  },

  cameraBtn: {
    position: "absolute",
    bottom: -moderateScale(3),
    right: -moderateScale(3),
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(15),
    backgroundColor: "#E50914",
    borderWidth: moderateScale(1.5),
    borderColor: colors.backgroundElevated,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarHint: {
    color: colors.textSoft,
    fontSize: moderateScale(11),
    fontFamily: "Inter-Medium",
    marginTop: responsiveHeight(0.8),
    textAlign: "center",
  },

  avatarTouchable: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  profileImage: {
    width: "100%",
    height: "100%",
  },

  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: responsiveWidth(100),
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },

  proMemberTag: {
    alignSelf: "center",
    borderRadius: moderateScale(20),
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(0.6),
    marginTop: responsiveHeight(0.5),
  },

  proMemberText: {
    color: colors.white,
    fontSize: moderateScale(12),
    fontFamily: "Inter-Medium",
  },

  userName: {
    color: colors.text,
    fontSize: moderateScale(22),
    marginTop: responsiveHeight(0.5),
    fontFamily: "Inter-Medium",
  },

  editRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: responsiveHeight(0.2),
  },

  editText: {
    color: colors.textSoft,
    fontSize: moderateScale(11),
    fontFamily: "Inter-Medium",
  },

  upgradeCard: {
    width: "100%",
    height: responsiveHeight(11),
    borderRadius: moderateScale(18),
    overflow: "hidden",
    marginBottom: responsiveHeight(1.5),
  },

  upgradeImage: {
    flex: 1,
  },

  upgradeBg: {
    borderRadius: moderateScale(18),
  },

  upgradeContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    height: "100%",
    paddingHorizontal: responsiveWidth(3),
  },

  proBadge: {
    backgroundColor: "#FF2424",
    alignSelf: "flex-start",
    paddingHorizontal: responsiveWidth(1),
    paddingVertical: responsiveHeight(0.2),
    borderRadius: moderateScale(5),
    marginBottom: responsiveHeight(0.7),
  },

  proText: {
    color: colors.white,
    fontSize: moderateScale(11),
    fontFamily: "Inter-Medium",
  },

  upgradeTitle: {
    color: colors.white,
    fontSize: moderateScale(16),
    fontFamily: "Inter-Medium",
  },

  upgradeSubTitle: {
    color: colors.textSoft,
    fontSize: moderateScale(11),
    marginTop: responsiveHeight(0.3),
    fontFamily: "Inter-Medium",
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: responsiveHeight(1.5),
  },

  statCard: {
    width: responsiveWidth(29),
    backgroundColor: colors.backgroundCard,
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingVertical: responsiveHeight(2),
    alignItems: "center",
  },

  statValue: {
    color: "#E50914",
    fontSize: moderateScale(18),
    fontFamily: "Inter-Bold",
  },

  statLabel: {
    color: colors.textSecondary,
    fontSize: moderateScale(11),
    marginTop: responsiveHeight(0.6),
    fontFamily: "Inter-Medium",
  },

  menuCard: {
    width: "100%",
    height: responsiveHeight(8),
    backgroundColor: colors.backgroundCard,
    borderRadius: moderateScale(14),
    marginBottom: responsiveHeight(1),
    paddingHorizontal: responsiveWidth(2.2),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: responsiveWidth(11),
    height: responsiveWidth(11),
    borderRadius: responsiveWidth(100),
    backgroundColor: colors.backgroundInput,
    alignItems: "center",
    justifyContent: "center",
    marginRight: responsiveWidth(3),
  },

  menuTitle: {
    color: colors.text,
    fontSize: moderateScale(15),
    fontFamily: "Inter-Medium",
  },

  logoutButton: {
    width: "100%",
    height: responsiveHeight(7),
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: moderateScale(14),
    alignItems: "center",
    justifyContent: "center",
    marginTop: responsiveHeight(0.5),
    marginBottom: responsiveHeight(6),
    backgroundColor: colors.backgroundCard,
  },

  logoutText: {
    color: "#E50914",
    fontSize: moderateScale(16),
    fontFamily: "Inter-Bold",
  },
});