import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { loadPreferences } from "../../services/preferences";
import { useBranding } from "../../context/BrandingContext";
import { useAppTheme, ThemeColors } from "../../context/ThemeContext";

type prefrenceItemProps = {
  title: string;
  image: any;
  onPress?: () => void;
  isDarkMode?: boolean;
  darkModeValue?: boolean;
  onToggleDarkMode?: (value: boolean) => void;
  language?: string;
};

const prefrenceData = [
  {
    id: "1",
    title: "Dark mode",
    image: require("../../assets/theme.png"),
    isDarkMode: true,
  },
  {
    id: "2",
    title: "Language",
    image: require("../../assets/lang.png"),
    screen: "Language",
    language: "English",
  },
  {
    id: "3",
    title: "Notification preferences",
    image: require("../../assets/noti.png"),
    screen: "NotificationPrefrence",
  },
];

const PrefrenceItem = ({
  title,
  image,
  onPress,
  isDarkMode,
  darkModeValue,
  onToggleDarkMode,
  language,
}: prefrenceItemProps) => {
  const { accentColor } = useBranding();
  const { colors } = useAppTheme();
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: darkModeValue ? moderateScale(13) : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [darkModeValue, translateX]);

  const handleToggle = () => {
    Animated.timing(translateX, {
      toValue: darkModeValue ? 0 : moderateScale(13),
      duration: 200,
      useNativeDriver: true,
    }).start();

    onToggleDarkMode?.(!darkModeValue);
  };

  const styles = createStyles(colors);

  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.card} onPress={onPress}>
      <View style={styles.leftContainer}>
        <View style={styles.iconContainer}>
          <Image source={image} style={styles.iconImage} />
        </View>

        <Text style={styles.title}>{title}</Text>
      </View>

      {isDarkMode ? (
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.customSwitch,
            {
              backgroundColor: darkModeValue ? accentColor : colors.switchTrack,
            },
          ]}
          onPress={handleToggle}
        >
          <Animated.View
            style={[
              styles.switchCircle,
              {
                transform: [{ translateX }],
              },
            ]}
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.rightContainer}>
          {language && <Text style={styles.languageText}>{language}</Text>}

          <Ionicons
            name="chevron-forward"
            size={moderateScale(16)}
            color={colors.textSecondary}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

const Prefrence = () => {
  const navigation = useNavigation<any>();
  const { isDarkMode, setDarkMode, colors, statusBarStyle } = useAppTheme();
  const [language, setLanguage] = useState("English");

  useFocusEffect(
    useCallback(() => {
      loadPreferences().then((prefs) => {
        setLanguage(prefs.language);
      });
    }, [])
  );

  const handleToggleDarkMode = (value: boolean) => {
    setDarkMode(value);
  };

  const styles = createStyles(colors);

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

        <Text style={styles.headerTitle}>App preference</Text>
      </View>

      <View style={styles.listContainer}>
        {prefrenceData.map((item) => (
          <PrefrenceItem
            key={item.id}
            title={item.title}
            image={item.image}
            language={language}
            isDarkMode={item.isDarkMode}
            darkModeValue={isDarkMode}
            onToggleDarkMode={handleToggleDarkMode}
            onPress={() =>
              item.screen ? navigation.navigate(item.screen) : null
            }
          />
        ))}
      </View>
    </SafeAreaView>
  );
};

export default Prefrence;

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

    listContainer: {
      marginTop: responsiveHeight(2),
      paddingHorizontal: responsiveWidth(4),
    },

    card: {
      width: "100%",
      minHeight: responsiveHeight(8.5),
      backgroundColor: colors.backgroundCard,
      borderRadius: moderateScale(14),

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",

      paddingHorizontal: responsiveWidth(2),
      marginBottom: responsiveHeight(0.8),
    },

    leftContainer: {
      flexDirection: "row",
      alignItems: "center",
    },

    rightContainer: {
      flexDirection: "row",
      alignItems: "center",
    },

    customSwitch: {
      width: moderateScale(35),
      height: moderateScale(22),
      borderRadius: moderateScale(100),
      justifyContent: "center",
      paddingHorizontal: moderateScale(3),
    },

    switchCircle: {
      width: moderateScale(14),
      height: moderateScale(14),
      borderRadius: moderateScale(100),
      backgroundColor: "#fff",
    },

    iconContainer: {
      width: moderateScale(42),
      height: moderateScale(42),
      borderRadius: moderateScale(100),
      backgroundColor: colors.backgroundInput,
      justifyContent: "center",
      alignItems: "center",
    },

    iconImage: {
      width: moderateScale(20),
      height: moderateScale(20),
      resizeMode: "contain",
    },

    title: {
      color: colors.text,
      fontSize: moderateScale(13),
      marginLeft: responsiveWidth(2),
      fontFamily: "Inter-Medium",
    },

    languageText: {
      color: colors.textSecondary,
      fontSize: moderateScale(12),
      fontFamily: "Inter-Medium",
      marginRight: responsiveWidth(2),
    },
  });
