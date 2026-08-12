import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { loadPreferences, savePreferences } from "../../services/preferences";
import { useBranding } from "../../context/BrandingContext";
import { useAppTheme, ThemeColors } from "../../context/ThemeContext";

const videoPlayData = ["Auto Play", "1080p", "720p"];

const VideoQuality = () => {
  const navigation = useNavigation<any>();
  const { primaryColor } = useBranding();
  const { colors, statusBarStyle } = useAppTheme();
  const styles = createStyles(colors);
  const [selectedOption, setSelectedOption] = useState("Auto Play");

  useFocusEffect(
    useCallback(() => {
      loadPreferences().then((prefs) =>
        setSelectedOption(prefs.videoQuality || "Auto Play")
      );
    }, [])
  );

  const handleSelect = (item: string) => {
    setSelectedOption(item);
    savePreferences({ videoQuality: item });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.background} barStyle={statusBarStyle} />

      <View style={styles.headerContainer}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={moderateScale(22)} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Video Play Settings</Text>
      </View>

      <View style={styles.languageContainer}>
        {videoPlayData.map((item, index) => {
          const isSelected = selectedOption === item;

          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.8}
              style={[
                styles.languageCard,
                index === videoPlayData.length - 1 && {
                  borderBottomWidth: 0,
                },
              ]}
              onPress={() => handleSelect(item)}
            >
              <Text style={styles.languageText}>{item}</Text>

              <Ionicons
                name="checkmark-circle-sharp"
                size={moderateScale(18)}
                color={isSelected ? primaryColor : colors.switchTrack}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

export default VideoQuality;

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

  languageContainer: {
    marginTop: responsiveHeight(2.2),
    paddingHorizontal: responsiveWidth(5),
  },

  languageCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: responsiveHeight(1.5),
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundElevated,
  },

  languageText: {
    color: colors.text,
    fontSize: moderateScale(15),
    fontFamily: "Inter-Medium",
  },
});
