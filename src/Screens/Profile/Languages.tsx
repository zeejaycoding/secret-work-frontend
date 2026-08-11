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

const languageData = [
  "English",
  "Spanish",
  "French",
  "German",
  "Arabic",
  "Urdu",
];

const Languages = () => {
  const navigation = useNavigation<any>();
  const { primaryColor } = useBranding();
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  useFocusEffect(
    useCallback(() => {
      loadPreferences().then((prefs) => setSelectedLanguage(prefs.language));
    }, [])
  );

  const handleSelect = (item: string) => {
    setSelectedLanguage(item);
    savePreferences({ language: item });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />

      <View style={styles.headerContainer}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={moderateScale(22)} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Language</Text>
      </View>

      <View style={styles.languageContainer}>
        {languageData.map((item, index) => {
          const isSelected = selectedLanguage === item;

          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.8}
              style={[
                styles.languageCard,
                index === languageData.length - 1 && {
                  borderBottomWidth: 0,
                },
              ]}
              onPress={() => handleSelect(item)}
            >
              <Text style={styles.languageText}>{item}</Text>

              <Ionicons
                name="checkmark-circle-sharp"
                size={moderateScale(18)}
                color={isSelected ? primaryColor : "#3c3b3b"}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

export default Languages;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
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
    backgroundColor: "#111111",
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    color: "#fff",
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
    borderBottomColor: "#111111",
  },

  languageText: {
    color: "#fff",
    fontSize: moderateScale(15),
    fontFamily: "Inter-Medium",
  },
});
