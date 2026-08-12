import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Text,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { Alert, ActivityIndicator } from "react-native";
import { updateMe } from "../../services/api";
import { useBranding } from "../../context/BrandingContext";
import { ThemeColors, darkColors } from "../../context/ThemeContext";

const ITEM_HEIGHT = responsiveHeight(6.5);

const heights = Array.from({ length: 101 }, (_, i) => 120 + i);

const Height = () => {
  const navigation = useNavigation<any>();
  const { primaryColor } = useBranding();
  const colors = darkColors;
  const statusBarStyle = "light-content" as const;
  const styles = createStyles(colors);
  const flatListRef = useRef<FlatList>(null);
  const [selectedHeight, setSelectedHeight] = useState(164);
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async () => {
    setIsLoading(true);
    try {
      await updateMe({ height: selectedHeight });
      navigation.navigate("OnboardingExperienceLevel");
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Something went wrong";
      Alert.alert("Error", msg);
    } finally {
      setIsLoading(false);
    }
  };
  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const value = heights[index];

    if (value) {
      setSelectedHeight(value);

      flatListRef.current?.scrollToOffset({
        offset: index * ITEM_HEIGHT,
        animated: true,
      });
    }
  };

  const getTextStyle = (item: number) => {
    const distance = Math.abs(item - selectedHeight);

    if (distance === 0) {
      return {
        fontSize: moderateScale(48),
        color: colors.text,
        opacity: 1,
        fontWeight: "700" as const,
      };
    }

    if (distance === 1) {
      return {
        fontSize: moderateScale(38),
        color: colors.text,
        opacity: 0.95,
        fontWeight: "600" as const,
      };
    }

    if (distance === 2) {
      return {
        fontSize: moderateScale(30),
        color: colors.textMuted,
        opacity: 0.7,
        fontWeight: "500" as const,
      };
    }

    if (distance === 3) {
      return {
        fontSize: moderateScale(24),
        color: colors.textMuted,
        opacity: 0.5,
        fontWeight: "500" as const,
      };
    }

    return {
      fontSize: moderateScale(18),
      color: colors.textSecondary,
      opacity: 0.3,
      fontWeight: "400" as const,
    };
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
          "rgba(0,0,0,0.70)",
          "rgba(0,0,0,0.25)",
          "rgba(0,0,0,0.05)",
          "rgba(0,0,0,0.25)",
          "rgba(0,0,0,0.70)",
        ]}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.sideOverlay}
      />

      <LinearGradient
        colors={[
          "transparent",
          "rgba(0,0,0,0.05)",
          "rgba(0,0,0,0.12)",
          "rgba(0,0,0,0.20)",
          "rgba(0,0,0,0.35)",
          "rgba(0,0,0,0.50)",
          "rgba(0,0,0,0.75)",
          "#000",
        ]}
        locations={[0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.bottomOverlay}
      />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={moderateScale(19)} color={colors.text} />
          </TouchableOpacity>

          <Text style={styles.step}>Step 2 of 5</Text>

          <View style={{ width: responsiveWidth(8) }} />
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.fill, { width: "40%", backgroundColor: primaryColor }]} />
        </View>

        <Text style={styles.title}>What's your height</Text>

        <Text style={styles.subtitle}>A few quick details and you're in.</Text>

        <View style={styles.pickerWrapper}>
          <View style={styles.lineTop} />

          <View style={styles.lineBottom} />

          <Animatable.Text
            animation="fadeIn"
            duration={1000}
            useNativeDriver
            style={styles.cmText}
          >
            cm
          </Animatable.Text>

          <FlatList
            ref={flatListRef}
            data={heights}
            keyExtractor={(item) => item.toString()}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            bounces={false}
            initialScrollIndex={44}
            getItemLayout={(_, index) => ({
              length: ITEM_HEIGHT,
              offset: ITEM_HEIGHT * index,
              index,
            })}
            contentContainerStyle={{
              paddingVertical: responsiveHeight(11.5),
            }}
            onMomentumScrollEnd={onScrollEnd}
            renderItem={({ item }) => {
              const isSelected = item === selectedHeight;

              return (
                <View style={styles.itemContainer}>
                  <Animatable.Text
                    animation={isSelected ? "pulse" : undefined}
                    iterationCount={1}
                    duration={400}
                    useNativeDriver
                    style={[styles.heightText, getTextStyle(item)]}
                  >
                    {item}
                  </Animatable.Text>
                </View>
              );
            }}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: primaryColor }]}
          onPress={handleNext}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <>
              <Text style={styles.buttonText}>Next</Text>
              <Feather
                name="arrow-right"
                size={moderateScale(17)}
                style={{ marginTop: responsiveHeight(0.5) }}
                color={colors.white}
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Height;

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      flex: 1,
      paddingHorizontal: responsiveWidth(5),
      paddingTop: responsiveHeight(7),
    },

    redHorizontal: {
      position: "absolute",
      top: 0,
      width: responsiveWidth(100),
      height: responsiveHeight(30),
    },

    redVertical: {
      position: "absolute",
      top: 0,
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
      height: responsiveHeight(40),
    },

    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: responsiveHeight(2),
    },

    backButton: {
      width: responsiveWidth(8),
      justifyContent: "center",
      alignItems: "flex-start",
    },

    step: {
      color: colors.text,
      fontSize: moderateScale(12.5),
      textAlign: "center",
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

    fill: {
      height: "100%",
      backgroundColor: "#FF1F2D",
    },

    title: {
      color: colors.text,
      fontSize: moderateScale(17),
      fontFamily: "Poppins-Medium",
    },

    subtitle: {
      color: colors.textSecondary,
      fontSize: moderateScale(12),
      marginBottom: responsiveHeight(2.5),
      fontFamily: "Poppins-Regular",
    },

    pickerWrapper: {
      height: responsiveHeight(40),
      justifyContent: "center",
      marginTop: responsiveHeight(6),
    },

    itemContainer: {
      height: ITEM_HEIGHT,
      justifyContent: "center",
      alignItems: "center",
    },

    heightText: {
      textAlign: "center",
      includeFontPadding: false,
      fontFamily: "Inter-Medium",
    },

    lineTop: {
      position: "absolute",
      top: "27%",
      width: responsiveWidth(42),
      alignSelf: "center",
      height: responsiveHeight(0.25),
      backgroundColor: "#FF002B",
      borderRadius: moderateScale(20),
      zIndex: 10,
    },

    lineBottom: {
      position: "absolute",
      top: "46%",
      width: responsiveWidth(42),
      alignSelf: "center",
      height: responsiveHeight(0.25),
      backgroundColor: "#FF002B",
      borderRadius: moderateScale(20),
      zIndex: 10,
    },

    cmText: {
      position: "absolute",
      right: responsiveWidth(25),
      top: "36%",
      color: colors.text,
      fontSize: moderateScale(18),
      fontWeight: "600",
      zIndex: 20,
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
