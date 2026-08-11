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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import api from "../services/api";

const ForgotPassword = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendOtp = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      Alert.alert("Email required", "Please enter your email address");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post("/auth/forgot-password", { email: normalizedEmail });
      navigation.navigate("OTPVerify", { email: normalizedEmail });
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        "Unable to send verification code. Please try again.";
      Alert.alert("Request failed", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
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
            "rgba(0,0,0,0.95)",
          ]}
          locations={[0, 0.2, 0.35, 0.5, 0.65, 0.8, 0.9, 1]}
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

                <Text style={styles.title}>Forgot password</Text>

                <Text style={styles.description}>
                  Enter your email and we’ll send you a link to get back into
                  your account.
                </Text>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <Feather
                    name="mail"
                    size={moderateScale(16)}
                    color="#6B6B6B"
                  />

                  <TextInput
                    placeholder="Enter your email address"
                    placeholderTextColor="rgba(255,255,255,0.45)"
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.signInButton}
                  onPress={handleSendOtp}
                  disabled={isSubmitting}
                >
                  <Text style={styles.signInText}>Verify code</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
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
    marginBottom: responsiveHeight(5),
  },

  title: {
    color: "#FFFFFF",
    fontSize: moderateScale(25),
    fontFamily: "Poppins-Medium",
  },

  description: {
    width: responsiveWidth(62),
    color: "#6B6B6B",
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
    borderColor: "#2A2A2A",
    borderRadius: moderateScale(12),
    backgroundColor: "#0A0A0A",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: responsiveWidth(4),
    marginBottom: responsiveHeight(2.2),
    alignSelf: "center",
    color: "#6B6B6B",
  },

  input: {
    flex: 1,
    color: "#FFFFFF",
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
    color: "#FFFFFF",
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
    backgroundColor: "#1F1F1F",
  },
});
