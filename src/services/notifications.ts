import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

import { registerPushToken } from "./api";

// This file only works in development/production builds (Expo Go removed
// remote push support in SDK 53). Running it inside Expo Go logs an error.
if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

async function requestPermissions() {
  if (!Device.isDevice) return null;

  const current = await Notifications.getPermissionsAsync();
  if (current.status === "granted") return current;
  if (current.status === "undetermined") {
    return Notifications.requestPermissionsAsync();
  }
  return current;
}

export async function setupPushNotifications() {
  if (Platform.OS === "web") return;

  try {
    const permissions = await requestPermissions();
    if (!permissions || permissions.status !== "granted") return;

    if (Device.isDevice) {
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ||
        process.env.EXPO_PUBLIC_EXPO_PROJECT_ID;

      const token = await Notifications.getExpoPushTokenAsync({
        ...(projectId ? { projectId } : {}),
      });

      if (token?.data) {
        await registerPushToken(token.data).catch(() => {});
      }
    }
  } catch (error) {
    console.warn("Push notification setup failed:", error);
  }
}
