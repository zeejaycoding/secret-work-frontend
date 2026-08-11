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
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import api from "../services/api";

const NewPassword = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const email = route?.params?.email;
  const resetToken = route?.params?.resetToken;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResetPassword = async () => {
    if (!email || !resetToken) {
      Alert.alert("Session expired", "Please verify code again");
      navigation.navigate("ForgotPassword");
      return;
    }

    if (!password || !confirmPassword) {
      Alert.alert("Fields required", "Please enter and confirm your password");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Weak password", "Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Mismatch", "Passwords do not match");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post("/auth/reset-password", {
        email,
        resetToken,
        newPassword: password,
      });
      navigation.navigate("Success");
    } catch (err: any) {
      const message = err?.response?.data?.error || "Failed to reset password";
      Alert.alert("Reset failed", message);
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

                <Text style={styles.title}>Create new password</Text>

                <Text style={styles.description}>
                  Choose a secure password to protect your account
                </Text>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons
                    name="lock-outline"
                    size={moderateScale(16)}
                    color="#6B6B6B"
                  />

                  <TextInput
                    placeholder="New password"
                    placeholderTextColor="rgba(255,255,255,0.45)"
                    style={styles.input}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={moderateScale(16)}
                      color="#6B6B6B"
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons
                    name="lock-outline"
                    size={moderateScale(16)}
                    color="#6B6B6B"
                  />

                  <TextInput
                    placeholder="Confirm password"
                    placeholderTextColor="rgba(255,255,255,0.45)"
                    style={styles.input}
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? "eye-outline" : "eye-off-outline"
                      }
                      size={moderateScale(16)}
                      color="#6B6B6B"
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.hintsContainer}>
                  <Text style={styles.hintsTitle}>Password hints</Text>

                  <View style={styles.hintRow}>
                    <Ionicons
                      name="checkmark-circle"
                      size={moderateScale(16)}
                      color="#34C759"
                    />

                    <Text style={styles.hintText}>At least 8 characters</Text>
                  </View>

                  <View style={styles.hintRow}>
                    <Ionicons
                      name="checkmark-circle"
                      size={moderateScale(16)}
                      color="#34C759"
                    />

                    <Text style={styles.hintText}>
                      Includes a number or symbol
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.confirmButton}
                  onPress={handleResetPassword}
                  disabled={isSubmitting}
                >
                  <Text style={styles.confirmText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
};

export default NewPassword;

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
    marginBottom: responsiveHeight(4),
  },

  title: {
    color: "#FFFFFF",
    fontSize: moderateScale(22),
    fontFamily: "Poppins-Medium",
    textAlign: "center",
  },

  description: {
    width: responsiveWidth(70),
    color: "#6B6B6B",
    fontSize: moderateScale(12),
    textAlign: "center",
    lineHeight: moderateScale(18),
    fontFamily: "Poppins-Regular",
  },

  formContainer: {
    marginTop: responsiveHeight(4),
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
    marginBottom: responsiveHeight(1.5),
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

  hintsContainer: {
    width: responsiveWidth(92),
    alignSelf: "center",
    marginTop: responsiveHeight(1),
  },

  hintsTitle: {
    color: "#FFFFFF",
    fontSize: moderateScale(13),
    fontFamily: "Poppins-Medium",
    marginBottom: responsiveHeight(1),
  },

  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: responsiveHeight(1),
  },

  hintText: {
    color: "#AEB3B7",
    fontSize: moderateScale(12),
    marginLeft: responsiveWidth(2),
    fontFamily: "Inter-Medium",
  },

  confirmButton: {
    width: responsiveWidth(92),
    height: responsiveHeight(6.5),
    backgroundColor: "#E50914",
    borderRadius: moderateScale(12),
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: responsiveHeight(2),
  },

  confirmText: {
    color: "#FFFFFF",
    fontSize: moderateScale(15),
    fontFamily: "Inter-Medium",
  },
});
