import React, { useState } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import { Feather, Ionicons, Octicons } from "@expo/vector-icons";
import { Alert, ActivityIndicator } from "react-native";
import { updateMe, setPassword } from "../../services/api";
import { useBranding } from "../../context/BrandingContext";
import { ThemeColors, darkColors } from "../../context/ThemeContext";

const Details = () => {
  const navigation = useNavigation<any>();
  const { primaryColor } = useBranding();
  const colors = darkColors;
  const statusBarStyle = "light-content" as const;
  const styles = createStyles(colors);
  const currentStep = 1;
  const totalSteps = 5;
  const progressWidth = (currentStep / totalSteps) * 100;
  const [genderDropdown, setGenderDropdown] = useState(false);
  const [selectedGender, setSelectedGender] = useState("Gender");
  const [fullName, setFullName] = useState("");
  const [password, setPwd] = useState("");
  const [age, setAge] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const genderOptions = ["Male", "Female", "Others"];

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      const updates: Record<string, any> = {};
      if (fullName.trim()) updates.firstName = fullName.trim();
      if (age.trim()) updates.age = parseInt(age.trim(), 10) || undefined;
      if (selectedGender !== "Gender") updates.gender = selectedGender;
      if (Object.keys(updates).length > 0) await updateMe(updates);
      if (password.length >= 6) await setPassword(password);
      navigation.navigate("OnboardingHeight");
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Something went wrong";
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.stepText}>
          Step {currentStep} of {totalSteps}
        </Text>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressWidth}%`,
              },
            ]}
          />
        </View>

        <Text style={styles.heading}>Let's get you started</Text>

        <Text style={styles.subHeading}>
          A few quick details and you're in.
        </Text>

        <View style={styles.inputContainer}>
          <Octicons name="person" size={moderateScale(18)} color={colors.textSecondary} />

          <TextInput
            placeholder="Full name"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Feather name="lock" size={moderateScale(18)} color={colors.textSecondary} />

          <TextInput
            placeholder="Password (min 6 chars)"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPwd}
          />
        </View>

        <View style={styles.inputContainer}>
          <Feather name="calendar" size={moderateScale(18)} color={colors.textSecondary} />

          <TextInput
            placeholder="Age"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
          />

          <Feather name="calendar" size={moderateScale(18)} color={colors.text} />
        </View>

        <View style={styles.dropdownWrapper}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.inputContainer}
            onPress={() => setGenderDropdown(!genderDropdown)}
          >
            <Ionicons
              name="male-female-outline"
              size={moderateScale(18)}
              color={colors.textSecondary}
            />

            <Text
              style={[
                styles.genderText,
                {
                  color: selectedGender === "Gender" ? colors.textSecondary : colors.text,
                },
              ]}
            >
              {selectedGender}
            </Text>

            <Feather
              name={genderDropdown ? "chevron-up" : "chevron-down"}
              size={moderateScale(18)}
              color={colors.switchTrack}
            />
          </TouchableOpacity>

          {genderDropdown && (
            <View style={styles.dropdownContainer}>
              {genderOptions.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  style={[
                    styles.dropdownItem,
                    index === genderOptions.length - 1 && {
                      borderBottomWidth: 0,
                    },
                  ]}
                  onPress={() => {
                    setSelectedGender(item);
                    setGenderDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.button, { backgroundColor: primaryColor }]}
          onPress={handleContinue}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <>
              <Text style={styles.buttonText}>Continue</Text>
              <Feather
                name="arrow-right"
                size={moderateScale(17)}
                style={{ marginTop: responsiveHeight(0.5) }}
                color={colors.white}
              />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default Details;

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    scrollContent: {
      paddingTop: responsiveHeight(7),
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
      height: responsiveHeight(35),
    },

    stepText: {
      color: colors.text,
      fontSize: moderateScale(12.5),
      textAlign: "center",
      marginBottom: responsiveHeight(2),
      fontFamily: "Poppins-Medium",
    },

    progressBar: {
      width: "100%",
      height: responsiveHeight(1),
      backgroundColor: colors.backgroundInput,
      borderRadius: moderateScale(100),
      overflow: "hidden",
      marginBottom: responsiveHeight(2.5),
    },

    progressFill: {
      height: "100%",
      backgroundColor: "#FF1F2D",
    },

    heading: {
      color: colors.text,
      fontSize: moderateScale(17),
      fontFamily: "Poppins-Medium",
    },

    subHeading: {
      color: colors.textSecondary,
      fontSize: moderateScale(12),
      marginBottom: responsiveHeight(2.5),
      fontFamily: "Poppins-Regular",
    },

    inputContainer: {
      width: responsiveWidth(92),
      height: responsiveHeight(6.8),
      borderWidth: 1,
      borderColor: colors.borderStrong,
      borderRadius: moderateScale(12),
      backgroundColor: colors.backgroundElevated,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: responsiveWidth(4),
      marginBottom: responsiveHeight(1.2),
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

    genderText: {
      flex: 1,
      marginLeft: responsiveWidth(3),
      fontSize: moderateScale(14),
      fontFamily: "Poppins-Medium",
    },

    dropdownWrapper: {
      width: responsiveWidth(92),
      alignSelf: "center",
      position: "relative",
      zIndex: 999,
      marginBottom: responsiveHeight(1.2),
    },

    dropdownContainer: {
      position: "absolute",
      top: responsiveHeight(7.2),
      width: "100%",
      backgroundColor: colors.backgroundElevated,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      borderRadius: moderateScale(12),
      overflow: "hidden",
      zIndex: 9999,
    },

    dropdownItem: {
      paddingVertical: responsiveHeight(1.8),
      paddingHorizontal: responsiveWidth(4),
      borderBottomWidth: 1,
      borderBottomColor: colors.borderStrong,
    },

    dropdownText: {
      color: colors.text,
      fontSize: moderateScale(13),
      fontFamily: "Poppins-Medium",
    },

    button: {
      flexDirection: "row",
      gap: responsiveWidth(2),
      width: responsiveWidth(92),
      height: responsiveHeight(6.5),
      borderRadius: moderateScale(12),
      justifyContent: "center",
      alignItems: "center",
      marginBottom: responsiveHeight(3),
      backgroundColor: "#E50914",
    },

    buttonText: {
      color: colors.white,
      fontSize: moderateScale(15),
      fontFamily: "Inter-Medium",
    },
  });
