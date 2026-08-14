import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as SecureStore from "expo-secure-store";
import { getMe } from "../services/api";
import api from "../services/api";
import { disconnectSocket } from "../services/socket";

interface IUser {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  onboarded: boolean;
  onboardingStep?: number;
  age?: number;
  gender?: string;
  height?: number;
  subscriptionTier?: "free" | "premium" | "pro";
  subscriptionExpiry?: string;
  createdAt?: string;
  completedDrills?: string[];
  watchTimeSec?: number;
}

interface AuthContextType {
  isSignedIn: boolean;
  isLoaded: boolean;
  user: IUser | null;
  dbUser: IUser | null;
  token: string | null;
  signOut: () => Promise<void>;
  refreshDbUser: () => Promise<void>;
  setAuthToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isSignedIn: false,
  isLoaded: false,
  user: null,
  dbUser: null,
  token: null,
  signOut: async () => {},
  refreshDbUser: async () => {},
  setAuthToken: async () => {},
});

const TOKEN_KEY = "auth-token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [dbUser, setDbUser] = useState<IUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync(TOKEN_KEY).then((stored) => {
      if (stored) setToken(stored);
      setIsLoaded(true);
    });
  }, []);

  const refreshDbUser = useCallback(async () => {
    try {
      const userData = await getMe();
      setDbUser(userData);
    } catch (error) {
      // Never wipe the user we already have. A single failed getMe (transient
      // network blip, backend cold start, etc.) used to set dbUser to null,
      // which made the UI fall back to "User" (e.g. after visiting Live Chat).
      // Only an explicit sign-out clears the user.
      console.warn(
        "refreshDbUser failed:",
        (error as any)?.message || error
      );
    }
  }, []);

  useEffect(() => {
    if (token) refreshDbUser();
    else setDbUser(null);
  }, [token, refreshDbUser]);

  async function signOut() {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch {
    }
    disconnectSocket();
    setToken(null);
    setDbUser(null);
  }

  async function setAuthToken(newToken: string) {
    await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    setToken(newToken);
  }

  const user: IUser | null = dbUser;

  const value: AuthContextType = {
    isSignedIn: !!token,
    isLoaded,
    user,
    dbUser,
    token,
    signOut,
    refreshDbUser,
    setAuthToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}

export { api as authApi };
