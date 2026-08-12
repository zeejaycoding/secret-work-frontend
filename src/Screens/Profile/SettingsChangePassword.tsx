import React, { useState } from "react";
import {
  View,
  StyleSheet,
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
import { moderateScale } from "react-native-size-matters";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { changePassword } from "../../services/api";
import { useBranding } from "../../context/BrandingContext";
import { useAppTheme, ThemeColors } from "../../context/ThemeContext";

const SettingsChangePassword = () => {
  const navigation = useNavigation<any>();
  const { primaryColor } = useBranding();
  const { colors, statusBarStyle } = useAppTheme();
  const styles = createStyles(colors);

  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!oldPassword.trim()) {
      Alert.alert("Required", "Please enter your current password");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Required", "Please enter a new password");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Too short", "New password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Mismatch", "New passwords do not match");
      return;
    }
    if (oldPassword === password) {
      Alert.alert("Same password", "New password must be different from current password");
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(oldPassword, password);
      Alert.alert("Success", "Password changed successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Failed to change password";
      Alert.alert("Error", msg);
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
            <View style={styles.headerContainer}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons
                  name="chevron-back"
                  size={moderateScale(22)}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.topSection}>
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
                  color={colors.textSecondary}
                />

                <TextInput
                  placeholder="Old password"
                  placeholderTextColor={colors.textSecondary}
                  style={styles.input}
                  secureTextEntry={!showOldPassword}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                />

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowOldPassword(!showOldPassword)}
                >
                  <Ionicons
                    name={showOldPassword ? "eye-outline" : "eye-off-outline"}
                    size={moderateScale(16)}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={moderateScale(16)}
                  color={colors.textSecondary}
                />

                <TextInput
                  placeholder="New password"
                  placeholderTextColor={colors.textSecondary}
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
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={moderateScale(16)}
                  color={colors.textSecondary}
                />

                <TextInput
                  placeholder="Confirm password"
                  placeholderTextColor={colors.textSecondary}
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
                    color={colors.textSecondary}
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
                style={[styles.confirmButton, { backgroundColor: primaryColor }]}
                onPress={handleChangePassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.confirmText}>Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SettingsChangePassword;

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContainer: {
    flexGrow: 1,
    paddingBottom: responsiveHeight(4),
  },

  contentContainer: {
    flex: 1,
    paddingTop: responsiveHeight(6),
    paddingHorizontal: responsiveWidth(4),
  },

  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: responsiveHeight(2),
  },

  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(19),
    backgroundColor: colors.backgroundElevated,
    justifyContent: "center",
    alignItems: "center",
  },

  topSection: {
    alignItems: "flex-start",
    paddingHorizontal: responsiveWidth(2),
  },

  title: {
    color: colors.text,
    fontSize: moderateScale(18),
    fontFamily: "Poppins-Medium",
  },

  description: {
    width: responsiveWidth(90),
    color: colors.textSecondary,
    fontSize: moderateScale(11),
    lineHeight: moderateScale(18),
    fontFamily: "Poppins-Regular",
  },

  formContainer: {
    marginTop: responsiveHeight(2),
  },

  inputContainer: {
    width: responsiveWidth(92),
    height: responsiveHeight(6.8),
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: moderateScale(14),
    backgroundColor: colors.backgroundCard,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: responsiveWidth(4),
    marginBottom: responsiveHeight(1),
    alignSelf: "center",
  },

  input: {
    flex: 1,
    color: colors.text,
    fontSize: moderateScale(12),
    marginLeft: responsiveWidth(1),
    fontFamily: "Poppins-Medium",
    marginTop: responsiveHeight(0.5),
  },

  hintsContainer: {
    width: responsiveWidth(92),
    alignSelf: "center",
    marginTop: responsiveHeight(1),
  },

  hintsTitle: {
    color: colors.text,
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
    color: colors.textMuted,
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
    color: colors.white,
    fontSize: moderateScale(15),
    fontFamily: "Inter-Medium",
  },
});
