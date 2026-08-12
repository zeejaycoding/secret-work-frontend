import React, { useRef, useState } from "react";
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import api from "../services/api";
import { useAppTheme, ThemeColors, overlayGradient } from "../context/ThemeContext";

const OTPVerification = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { colors, statusBarStyle, isDarkMode } = useAppTheme();
  const styles = createStyles(colors);
  const overlays = overlayGradient(isDarkMode);
  const email = route?.params?.email;

  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleChange = (text: string, index: number) => {
    if (text.length > 1) {
      text = text.slice(-1);
    }

    const updatedOtp = [...otp];
    updatedOtp[index] = text;
    setOtp(updatedOtp);

    if (text && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isOtpComplete = otp.every((item) => item !== "");

  const handleVerifyOtp = async () => {
    if (!email) {
      Alert.alert("Session expired", "Please start again from Forgot password");
      navigation.navigate("ForgotPassword");
      return;
    }

    if (!isOtpComplete) {
      Alert.alert("Code required", "Please enter the complete verification code");
      return;
    }

    const code = otp.join("");

    try {
      setIsVerifying(true);
      const { data } = await api.post("/auth/verify-reset-otp", {
        email,
        code,
      });

      navigation.navigate("NewPassword", {
        email,
        resetToken: data.resetToken,
      });
    } catch (err: any) {
      const message = err?.response?.data?.error || "Failed to verify code";
      Alert.alert("Verification failed", message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      Alert.alert("Session expired", "Please start again from Forgot password");
      navigation.navigate("ForgotPassword");
      return;
    }

    try {
      setIsResending(true);
      await api.post("/auth/forgot-password", { email });
      Alert.alert("Code sent", "A new verification code has been sent");
      setOtp(["", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      const message = err?.response?.data?.error || "Failed to resend code";
      Alert.alert("Resend failed", message);
    } finally {
      setIsResending(false);
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
        source={require("../assets/forgotpassword.png")}
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
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Image
              source={require("../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.heading}>OTP Verification</Text>

            <Text style={styles.subHeading}>
              Enter the code we sent to confirm if it’s you
            </Text>

            <View style={styles.otpContainer}>
              {otp.map((item, index) => (
                <LinearGradient
                  key={index}
                  colors={[
                    "rgba(255,255,255,0.08)",
                    "rgba(255,255,255,0.02)",
                    "rgba(0, 0, 0, 0)",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.inputGradient,
                    item !== "" && styles.activeInput,
                  ]}
                >
                  <TextInput
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    value={item}
                    onChangeText={(text) => handleChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    style={styles.otpInput}
                    placeholder="-"
                    placeholderTextColor={colors.textMuted}
                    textAlign="center"
                    selectionColor={colors.text}
                  />
                </LinearGradient>
              ))}
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              disabled={!isOtpComplete || isVerifying}
              onPress={handleVerifyOtp}
              style={[
                styles.verifyButton,
                {
                  backgroundColor:
                    isOtpComplete && !isVerifying ? "#B10010" : "#660008",
                },
              ]}
            >
              <Text
                style={[
                  styles.verifyButtonText,
                  {
                    opacity: isOtpComplete ? 1 : 0.6,
                  },
                ]}
              >
                Verify code
              </Text>
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              <Text style={styles.didntText}>Didn’t see code?</Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleResend}
                disabled={isResending}
              >
                <Text style={styles.resendText}> Resend</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
};

export default OTPVerification;

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    backgroundImage: {
      flex: 1,
      width: responsiveWidth(100),
      height: responsiveHeight(40),
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
      alignItems: "center",
      paddingTop: responsiveHeight(10),
      paddingHorizontal: responsiveWidth(5),
    },

    logo: {
      width: responsiveWidth(25),
      height: responsiveHeight(6),
      marginBottom: responsiveHeight(4.5),
    },

    heading: {
      color: colors.white,
      fontSize: moderateScale(25),
      fontFamily: "Poppins-Medium",
    },

    subHeading: {
      width: responsiveWidth(80),
      color: colors.textSecondary,
      fontSize: moderateScale(12),
      textAlign: "center",
      lineHeight: moderateScale(18),
      fontFamily: "Poppins-Regular",
      marginBottom: responsiveHeight(3),
    },

    otpContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: responsiveWidth(92),
      marginBottom: responsiveHeight(2.2),
    },

    inputGradient: {
      width: responsiveWidth(16.6),
      height: responsiveWidth(14),
      borderRadius: moderateScale(12),
      borderWidth: 1,
      borderColor: colors.borderStrong,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    },

    activeInput: {
      borderColor: colors.text,
    },

    otpInput: {
      width: "100%",
      height: "100%",
      color: colors.text,
      fontSize: moderateScale(24),
      fontWeight: "600",
      textAlign: "center",
    },

    verifyButton: {
      width: responsiveWidth(92),
      height: responsiveHeight(6.5),
      borderRadius: moderateScale(12),
      justifyContent: "center",
      alignItems: "center",
      marginBottom: responsiveHeight(3),
    },

    verifyButtonText: {
      color: colors.white,
      fontSize: moderateScale(16),
      fontFamily: "Inter-Medium",
    },

    resendContainer: {
      flexDirection: "row",
      alignItems: "center",
    },

    didntText: {
      color: colors.textFaint,
      fontSize: moderateScale(14),
      fontFamily: "Inter-Medium",
    },

    resendText: {
      color: colors.white,
      fontSize: moderateScale(14),
      fontFamily: "Inter-Medium",
    },
  });
