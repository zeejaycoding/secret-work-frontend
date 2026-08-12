import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import { useAppTheme, ThemeColors } from "../../context/ThemeContext";

type SettingItemProps = {
  title: string;
  image: any;
  onPress?: () => void;
};

const settingsData = [
  {
    id: "1",
    title: "Change password",
    image: require("../../assets/changepassword.png"),
    screen: "SettingsChangePassword",
  },
  {
    id: "2",
    title: "App Preferences",
    image: require("../../assets/app.png"),
    screen: "Prefrence",
  },
  {
    id: "3",
    title: "Playback settings",
    image: require("../../assets/play.png"),
    screen: "PlaybackSettings",
  },
];

const SettingItem = ({ title, image, onPress }: SettingItemProps) => {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.card} onPress={onPress}>
      <View style={styles.leftContainer}>
        <View style={styles.iconContainer}>
          <Image source={image} style={styles.iconImage} />
        </View>

        <Text style={styles.title}>{title}</Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={moderateScale(16)}
        color={colors.textSecondary}
      />
    </TouchableOpacity>
  );
};

const MainSettings = () => {
  const navigation = useNavigation<any>();
  const { colors, statusBarStyle } = useAppTheme();
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

        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.listContainer}>
        {settingsData.map((item) => (
          <SettingItem
            key={item.id}
            title={item.title}
            image={item.image}
            onPress={() => navigation.navigate(item.screen)}
          />
        ))}
      </View>
    </SafeAreaView>
  );
};

export default MainSettings;

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
  });
