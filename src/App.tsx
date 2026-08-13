import React, { useEffect } from "react";
import { StatusBar } from "react-native";
import { useFonts } from "expo-font";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ClerkProvider } from "@clerk/clerk-expo";
import { AuthProvider } from "./context/AuthContext";
import { BrandingProvider } from "./context/BrandingContext";
import { ThemeProvider, useAppTheme } from "./context/ThemeContext";
import { LanguageProvider } from "./i18n";
import { useAuthContext } from "./context/AuthContext";
import { clerkTokenCache } from "./utils/clerkTokenCache";
import { setupPushNotifications } from "./services/notifications";

import WelcomeScreen from "./Screens/WelcomeScreen";
import OnboardingFirst from "./Screens/OnboardingFirst";
import OnboardingSecond from "./Screens/OnboardingSecond";
import OnboardingThird from "./Screens/OnboardingThird";
import SigninScreen from "./Screens/SigninScreen";
import SignupScreen from "./Screens/SignupScreen";
import ForgotPassword from "./Screens/ForgotPassword";
import OTPVerification from "./Screens/OTPVerification";
import NewPassword from "./Screens/NewPassword";
import SuccessScreen from "./Screens/SuccessScreen";
import Details from "./Screens/Onboarding/Details";
import Height from "./Screens/Onboarding/Height";
import ExperienceLevel from "./Screens/Onboarding/ExperienceLevel";
import OnboardingWorking from "./Screens/Onboarding/OnboardingWorking";
import OnboardingTrain from "./Screens/Onboarding/OnboardingTrain";
import Subscription from "./Screens/Onboarding/Subscription";
import PaymentInformation from "./Screens/Onboarding/PaymentInformation";
import PaymentSuccess from "./Screens/Onboarding/PaymentSuccess";
import Layout from "./Screens/Home/Layout";
import NotificationScreen from "./Screens/Home/NotificationScreen";
import QuickWorkoutFirst from "./Screens/Home/QuickWorkoutFirst";
import QuickWorkoutSecond from "./Screens/Home/QuickWorkoutSecond";
import StartWorkout from "./Screens/Home/StartWorkout";
import PracticeWorkout from "./Screens/Home/PracticeWorkout";
import LearnFromPros from "./Screens/Home/LearnFromPros";
import ProsDetails from "./Screens/Home/ProsDetails";
import DrilLibraryDetail from "./Screens/DrillLibrary/DrilLibraryDetail";
import WorkoutProfileDetail from "./Screens/WorkOut/WorkoutProfileDetail";
import HelpSupport from "./Screens/Profile/HelpSupport";
import HelpChat from "./Screens/Profile/HelpChat";
import BeforeSubscribedPlan from "./Screens/Profile/BeforeSubscribedPlan";
import AfterSubscribed from "./Screens/Profile/AfterSubscribed";
import MainSettings from "./Screens/Profile/MainSettings";
import SettingsChangePassword from "./Screens/Profile/SettingsChangePassword";
import Prefrence from "./Screens/Profile/Prefrence";
import Languages from "./Screens/Profile/Languages";
import NotificationPrefrence from "./Screens/Profile/NotificationPrefrence";
import PlaybackSettings from "./Screens/Profile/PlaybackSettings";
import VideoQuality from "./Screens/Profile/VideoQuality";
import EditProfileInformation from "./Screens/Profile/EditProfileInformation";
import PodcastDetail from "./Screens/Podcast/PodcastDetail";
import IntroductionVideo from "./Screens/IntroductionVideo";

export type RootStackParamList = {
  Welcome: undefined;
  OnboardingFirst: undefined;
  OnboardingSecond: undefined;
  OnboardingThird: undefined;
  Signin: undefined;
  Signup: undefined;
  IntroVideo: undefined;
  ForgotPassword: undefined;
  OTPVerify: undefined;
  NewPassword: undefined;
  Success: undefined;

  OnboardingDetail: undefined;
  OnboardingHeight: undefined;
  OnboardingExperienceLevel: undefined;
  OnboardingWorking: undefined;
  OnboardingTrain: undefined;
  Subscription: undefined;
  PaymentInformation: undefined;
  PaymentSuccess: undefined;
  BottomTabs: undefined;
  Notification: undefined;
  QuickWorkoutFirst: { coach?: string };
  QuickWorkoutSecond: { level?: string; coach?: string };
  StartWorkout: { drills?: any[] };
  PracticeWorkout: { drills?: any[] };
  LearnPros: undefined;
  ProsDetail: { pro?: any };
  DrilLibraryDetail: { drill?: any };
  WorkoutProfileDetail: { workoutId?: string };
  HelpSupport: undefined;
  HelpChat: undefined;
  BeforeSubscribe: undefined;
  AfterSubscribe: undefined;
  Settings: undefined;
  SettingsChangePassword: undefined;
  Prefrence: undefined;
  Language: undefined;
  NotificationPrefrence: undefined;
  PlaybackSettings: undefined;
  VideoQuality: undefined;
  EditProfileInformation: undefined;
  PodcastDetail: { id: string };
};

export type RootStackNavProps<T extends keyof RootStackParamList> = {
  navigation: NativeStackNavigationProp<RootStackParamList, T>;
  route: RouteProp<RootStackParamList, T>;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppShell() {
  const { colors, isDarkMode, statusBarStyle } = useAppTheme();
  const { isSignedIn } = useAuthContext();

  useEffect(() => {
    if (isSignedIn) setupPushNotifications();
  }, [isSignedIn]);

  const navigationTheme = {
    ...(isDarkMode ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDarkMode ? DarkTheme.colors : DefaultTheme.colors),
      primary: "#E50914",
      background: colors.background,
      card: colors.backgroundCard,
      text: colors.text,
      border: colors.border,
      notification: "#E50914",
    },
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["bottom"]}
    >
      <StatusBar backgroundColor={colors.background} barStyle={statusBarStyle} />
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="OnboardingFirst" component={OnboardingFirst} />
          <Stack.Screen name="OnboardingSecond" component={OnboardingSecond} />
          <Stack.Screen name="OnboardingThird" component={OnboardingThird} />
          <Stack.Screen name="Signin" component={SigninScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="IntroVideo" component={IntroductionVideo} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          <Stack.Screen name="OTPVerify" component={OTPVerification} />
          <Stack.Screen name="NewPassword" component={NewPassword} />
          <Stack.Screen name="Success" component={SuccessScreen} />
          <Stack.Screen name="OnboardingDetail" component={Details} />
          <Stack.Screen name="OnboardingHeight" component={Height} />
          <Stack.Screen
            name="OnboardingExperienceLevel"
            component={ExperienceLevel}
          />
          <Stack.Screen
            name="OnboardingWorking"
            component={OnboardingWorking}
          />
          <Stack.Screen name="OnboardingTrain" component={OnboardingTrain} />
          <Stack.Screen name="Subscription" component={Subscription} />
          <Stack.Screen
            name="PaymentInformation"
            component={PaymentInformation}
          />
          <Stack.Screen name="PaymentSuccess" component={PaymentSuccess} />

          <Stack.Screen name="BottomTabs" component={Layout} />
          <Stack.Screen name="Notification" component={NotificationScreen} />
          <Stack.Screen
            name="QuickWorkoutFirst"
            component={QuickWorkoutFirst}
          />
          <Stack.Screen
            name="QuickWorkoutSecond"
            component={QuickWorkoutSecond}
          />
          <Stack.Screen name="StartWorkout" component={StartWorkout} />
          <Stack.Screen name="PracticeWorkout" component={PracticeWorkout} />
          <Stack.Screen name="LearnPros" component={LearnFromPros} />
          <Stack.Screen name="ProsDetail" component={ProsDetails} />
          <Stack.Screen
            name="DrilLibraryDetail"
            component={DrilLibraryDetail}
          />
          <Stack.Screen
            name="WorkoutProfileDetail"
            component={WorkoutProfileDetail}
          />
          <Stack.Screen name="HelpSupport" component={HelpSupport} />
          <Stack.Screen name="HelpChat" component={HelpChat} />
          <Stack.Screen
            name="BeforeSubscribe"
            component={BeforeSubscribedPlan}
          />
          <Stack.Screen name="AfterSubscribe" component={AfterSubscribed} />
          <Stack.Screen name="Settings" component={MainSettings} />
          <Stack.Screen
            name="SettingsChangePassword"
            component={SettingsChangePassword}
          />
          <Stack.Screen name="Prefrence" component={Prefrence} />
          <Stack.Screen name="Language" component={Languages} />
          <Stack.Screen name="NotificationPrefrence" component={NotificationPrefrence} />
          <Stack.Screen name="PlaybackSettings" component={PlaybackSettings} />
          <Stack.Screen name="VideoQuality" component={VideoQuality} />
          <Stack.Screen name="EditProfileInformation" component={EditProfileInformation} />
          <Stack.Screen name="PodcastDetail" component={PodcastDetail} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),

    "Inter-Regular": require("../assets/fonts/Inter_18pt-Regular.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter_18pt-Bold.ttf"),
    "Inter-Medium": require("../assets/fonts/Inter_18pt-Medium.ttf"),
  });

  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={clerkTokenCache}
    >
    <AuthProvider>
      <BrandingProvider>
        <ThemeProvider>
          <LanguageProvider>
            <AppShell />
          </LanguageProvider>
        </ThemeProvider>
      </BrandingProvider>
    </AuthProvider>
    </ClerkProvider>
  );
}
