import * as SecureStore from "expo-secure-store";
import { TokenCache } from "@clerk/clerk-expo";

export const clerkTokenCache: TokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, token: string) {
    try {
      await SecureStore.setItemAsync(key, token);
    } catch {
      return;
    }
  },
  async clearToken(key: string) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      return;
    }
  },
};
