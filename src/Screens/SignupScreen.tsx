import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  Image,
  StatusBar,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useOAuth, useClerk } from "@clerk/clerk-expo";
import api, { socialLogin } from "../services/api";
import { useAuthContext } from "../context/AuthContext";
import { useBranding } from "../context/BrandingContext";
import { useAppTheme, ThemeColors, overlayGradient } from "../context/ThemeContext";
import { useLanguage } from "../i18n";

const SignupScreen = () => {
  const navigation = useNavigation<any>();
  const { primaryColor } = useBranding();
  const { colors, statusBarStyle, isDarkMode } = useAppTheme();
  const { t } = useLanguage();
  const styles = createStyles(colors);
  const overlays = overlayGradient(isDarkMode);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "facebook" | "apple" | null>(null);
  const { setAuthToken, refreshDbUser } = useAuthContext();
  const clerk = useClerk();

  const { startOAuthFlow: startGoogleOAuth } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: startFacebookOAuth } = useOAuth({ strategy: "oauth_facebook" });
  const { startOAuthFlow: startAppleOAuth } = useOAuth({ strategy: "oauth_apple" });

  const handleSocialSignUp = async (
    startOAuth: () => Promise<any>,
    provider: "google" | "facebook" | "apple"
  ) => {
    setSocialLoading(provider);
    try {
      await clerk.signOut();

      const { createdSessionId, setActive, signIn, signUp } = await startOAuth();

      if (!createdSessionId || !setActive) return;

      await setActive({ session: createdSessionId });

      const account = signUp || signIn;
      const socialEmail =
        (account as any)?.emailAddress ||
        (account as any)?.emailAddresses?.[0]?.emailAddress ||
        clerk.user?.emailAddresses?.[0]?.emailAddress ||
        "";
      const socialFirstName =
        (account as any)?.firstName ||
        clerk.user?.firstName ||
        "";
      const socialLastName =
        (account as any)?.lastName ||
        clerk.user?.lastName ||
        "";
      const socialAvatar =
        (account as any)?.profileImageUrl ||
        (account as any)?.imageUrl ||
        clerk.user?.imageUrl ||
        "";

      let clerkToken: string | null | undefined = null;
      for (let i = 0; i < 10; i++) {
        clerkToken = await clerk.session?.getToken();
        if (clerkToken) break;
        await new Promise((r) => setTimeout(r, 300));
      }

      if (!socialEmail || !clerkToken) {
        Alert.alert(
          "Error",
          `Could not retrieve account. email: ${socialEmail}, token: ${clerkToken ? "ok" : "null"}`,
        );
        return;
      }

      const { token } = await socialLogin({
        clerkToken,
        email: socialEmail,
        firstName: socialFirstName,
        lastName: socialLastName,
        avatarUrl: socialAvatar,
        provider,
      });

      await setAuthToken(token);
      await refreshDbUser();

      navigation.navigate("IntroVideo");
    } catch (err: any) {
      if (err?.message?.includes("cancelled") || err?.message?.includes("canceled")) return;
      Alert.alert("Error", err?.message || `${provider} sign up failed`);
    } finally {
      setSocialLoading(null);
    }
  };

  const handleEmailSignUp = async () => {
    if (!email.trim()) {
      Alert.alert(t("emailRequired"), t("enterEmailPrompt"));
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await api.post("/auth/register", { email: email.trim() });
      await setAuthToken(data.token);
      await refreshDbUser();
      navigation.navigate("IntroVideo");
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Something went wrong";
      Alert.alert(t("signupFailed"), msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={statusBarStyle}
      />

      <ImageBackground
        source={require("../assets/onboarding-first.png")}
        resizeMode="cover"
        style={styles.backgroundImage}
      >
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

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={styles.scrollContainer}
          >
            <View style={styles.contentContainer}>
              <View style={styles.topSection}>
                <Image
                  source={require("../assets/logo.png")}
                  resizeMode="contain"
                  style={styles.logo}
                />

                <Text style={styles.title}>{t("getStarted")}</Text>

                <Text style={styles.description}>{t("signupDesc")}</Text>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <Feather
                    name="mail"
                    size={moderateScale(16)}
                    color={colors.textSecondary}
                  />

                  <TextInput
                     placeholder={t("enterEmail")}
                     placeholderTextColor={colors.textMuted}
                     style={styles.input}
                     value={email}
                     onChangeText={setEmail}
                  />
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.signInButton, { backgroundColor: primaryColor }]}
                  onPress={handleEmailSignUp}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <Text style={styles.signInText}>{t("signup")}</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.orContainer}>
                  <View style={styles.line} />
                  <Text style={styles.orText}>{t("orContinueWith")}</Text>
                  <View style={styles.line} />
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.socialButton}
                  onPress={() => handleSocialSignUp(startGoogleOAuth, "google")}
                  disabled={socialLoading !== null}
                >
                  {socialLoading === "google" ? (
                    <ActivityIndicator color={colors.text} size="small" />
                  ) : (
                    <>
                  <Image
                    source={require("../assets/google.png")}
                    resizeMode="contain"
                    style={styles.socialIcon}
                  />

                  <Text style={styles.socialText}>{t("continueGoogle")}</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.socialButton}
                  onPress={() => handleSocialSignUp(startFacebookOAuth, "facebook")}
                  disabled={socialLoading !== null}
                >
                  {socialLoading === "facebook" ? (
                    <ActivityIndicator color={colors.text} size="small" />
                  ) : (
                    <>
                  <Image
                    source={require("../assets/facebook.png")}
                    resizeMode="contain"
                    style={styles.socialIcon}
                  />

                  <Text style={styles.socialText}>{t("continueFacebook")}</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.socialButton}
                  onPress={() => handleSocialSignUp(startAppleOAuth, "apple")}
                  disabled={socialLoading !== null}
                >
                  {socialLoading === "apple" ? (
                    <ActivityIndicator color={colors.text} size="small" />
                  ) : (
                    <>
                  <MaterialCommunityIcons
                    name="apple"
                    size={moderateScale(24)}
                    color={colors.text}
                    style={styles.appleIcon}
                  />

                  <Text style={styles.socialText}>{t("continueApple")}</Text>
                    </>
                  )}
                </TouchableOpacity>

                <View style={styles.signupContainer}>
                  <Text style={styles.accountText}>
                    {t("haveAccount")}{" "}
                  </Text>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate("Signin")}
                  >
                    <Text style={styles.signupText}>{t("signin")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
};

export default SignupScreen;

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    backgroundImage: {
      flex: 1,
      width: responsiveWidth(100),
      height: responsiveHeight(100),
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

    scrollContainer: {
      flexGrow: 1,
      paddingBottom: responsiveHeight(4),
    },

    contentContainer: {
      flex: 1,
      paddingTop: responsiveHeight(10),
      paddingHorizontal: responsiveWidth(4),
    },

    topSection: {
      alignItems: "center",
    },

    logo: {
      width: responsiveWidth(25),
      height: responsiveHeight(6),
      marginBottom: responsiveHeight(1),
    },

    title: {
      color: colors.white,
      fontSize: moderateScale(25),
      fontFamily: "Poppins-Medium",
    },

    description: {
      width: responsiveWidth(70),
      color: colors.textSecondary,
      fontSize: moderateScale(12),
      textAlign: "center",
      lineHeight: moderateScale(18),
      fontFamily: "Poppins-Regular",
    },

    formContainer: {
      marginTop: responsiveHeight(3),
    },

    inputContainer: {
      width: responsiveWidth(92),
      height: responsiveHeight(6.8),
      borderWidth: 1,
      borderColor: colors.borderStrong,
      borderRadius: moderateScale(12),
      backgroundColor: colors.backgroundCard,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: responsiveWidth(4),
      marginBottom: responsiveHeight(2.2),
      alignSelf: "center",
      color: colors.textSecondary,
    },

    input: {
      flex: 1,
      color: colors.text,
      fontSize: moderateScale(12),
      marginLeft: responsiveWidth(2),
      fontFamily: "Poppins-Medium",
      marginTop: responsiveHeight(0.5),
    },

    signInButton: {
      width: responsiveWidth(92),
      height: responsiveHeight(6.5),
      backgroundColor: "#E50914",
      borderRadius: moderateScale(12),
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "center",
      marginBottom: responsiveHeight(2.5),
    },

    signInText: {
      color: colors.white,
      fontSize: moderateScale(15),
      fontFamily: "Inter-Medium",
    },

    orContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: responsiveHeight(2),
    },

    line: {
      width: responsiveWidth(34),
      height: 1,
      backgroundColor: colors.border,
    },

    orText: {
      color: colors.textSecondary,
      marginHorizontal: responsiveWidth(3),
      fontSize: moderateScale(14),
      fontFamily: "Inter-Medium",
    },

    socialButton: {
      width: responsiveWidth(92),
      height: responsiveHeight(6.8),
      backgroundColor: colors.backgroundInput,
      borderRadius: moderateScale(12),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      marginBottom: responsiveHeight(1),
    },

    socialIcon: {
      width: responsiveWidth(5.5),
      height: responsiveWidth(5.5),
      marginRight: responsiveWidth(2),
      resizeMode: "contain",
    },

    appleIcon: {
      marginRight: responsiveWidth(3),
    },

    socialText: {
      color: colors.text,
      fontSize: moderateScale(14),
      fontFamily: "Inter-MEdium",
    },

    signupContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: responsiveHeight(1.5),
    },

    accountText: {
      color: colors.textSecondary,
      fontSize: moderateScale(14),
      fontFamily: "Inter-Medium",
    },

    signupText: {
      color: colors.white,
      fontSize: moderateScale(14),
      fontFamily: "Inter-Medium",
    },
  });
