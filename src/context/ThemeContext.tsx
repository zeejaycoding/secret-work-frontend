import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { ColorValue } from "react-native";
import { loadPreferences, savePreferences, getCachedPreferences } from "../services/preferences";

export interface ThemeColors {
  background: string;
  backgroundCard: string;
  backgroundElevated: string;
  backgroundInput: string;
  border: string;
  borderStrong: string;
  text: string;
  textSoft: string;
  textSecondary: string;
  textMuted: string;
  textFaint: string;
  divider: string;
  overlay: string;
  switchTrack: string;
  white: string;
}

export const darkColors: ThemeColors = {
  background: "#000000",
  backgroundCard: "#0A0A0A",
  backgroundElevated: "#111111",
  backgroundInput: "#161616",
  border: "#1F1F1F",
  borderStrong: "#2A2A2A",
  text: "#FFFFFF",
  textSoft: "#D0D0D0",
  textSecondary: "#6B6B6B",
  textMuted: "#929292",
  textFaint: "#7B7B7B",
  divider: "rgba(255,255,255,0.08)",
  overlay: "rgba(0,0,0,0.5)",
  switchTrack: "#3A3A3A",
  white: "#FFFFFF",
};

export const lightColors: ThemeColors = {
  background: "#F7F7F8",
  backgroundCard: "#FFFFFF",
  backgroundElevated: "#FFFFFF",
  backgroundInput: "#F0F0F1",
  border: "#E7E7E9",
  borderStrong: "#D5D5D8",
  text: "#0D0D0D",
  textSoft: "#4A4A4A",
  textSecondary: "#6B6B6B",
  textMuted: "#8F8F93",
  textFaint: "#9C9CA1",
  divider: "rgba(0,0,0,0.08)",
  overlay: "rgba(0,0,0,0.35)",
  switchTrack: "#D5D5D8",
  white: "#FFFFFF",
};

export type StatusBarStyle = "light-content" | "dark-content";

export interface AmbientOverlay {
  side: { colors: readonly [ColorValue, ColorValue, ...ColorValue[]]; locations: readonly [number, number, ...number[]] };
  bottom: { colors: readonly [ColorValue, ColorValue, ...ColorValue[]]; locations: readonly [number, number, ...number[]] };
}

export function overlayGradient(isDarkMode: boolean): AmbientOverlay {
  if (isDarkMode) {
    return {
      side: {
        colors: [
          "rgba(0,0,0,0.55)",
          "rgba(0,0,0,0.20)",
          "rgba(0,0,0,0.05)",
          "rgba(0,0,0,0.20)",
          "rgba(0,0,0,0.55)",
        ],
        locations: [0, 0.25, 0.5, 0.75, 1],
      },
      bottom: {
        colors: [
          "transparent",
          "rgba(0,0,0,0.02)",
          "rgba(0,0,0,0.06)",
          "rgba(0,0,0,0.10)",
          "rgba(0,0,0,0.18)",
          "rgba(0,0,0,0.22)",
          "rgba(0,0,0,0.25)",
          "rgba(0,0,0,0.95)",
        ],
        locations: [0, 0.2, 0.35, 0.5, 0.65, 0.8, 0.9, 1],
      },
    };
  }
  return {
    side: {
      colors: [
        "rgba(0,0,0,0.16)",
        "rgba(0,0,0,0.05)",
        "rgba(0,0,0,0.02)",
        "rgba(0,0,0,0.05)",
        "rgba(0,0,0,0.16)",
      ],
      locations: [0, 0.25, 0.5, 0.75, 1],
    },
    bottom: {
      colors: [
        "transparent",
        "rgba(0,0,0,0.01)",
        "rgba(0,0,0,0.02)",
        "rgba(0,0,0,0.03)",
        "rgba(0,0,0,0.05)",
        "rgba(0,0,0,0.07)",
        "rgba(0,0,0,0.09)",
        "rgba(0,0,0,0.30)",
      ],
      locations: [0, 0.2, 0.35, 0.5, 0.65, 0.8, 0.9, 1],
    },
  };
}

interface ThemeContextType {
  isDarkMode: boolean;
  colors: ThemeColors;
  statusBarStyle: StatusBarStyle;
  setDarkMode: (value: boolean) => void;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: true,
  colors: darkColors,
  statusBarStyle: "light-content",
  setDarkMode: () => {},
  toggleDarkMode: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(getCachedPreferences().darkMode);

  useEffect(() => {
    loadPreferences().then((prefs) => setIsDarkMode(prefs.darkMode));
  }, []);

  const setDarkMode = useCallback((value: boolean) => {
    setIsDarkMode(value);
    savePreferences({ darkMode: value });
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(!isDarkMode);
  }, [isDarkMode, setDarkMode]);

  const colors = isDarkMode ? darkColors : lightColors;
  const statusBarStyle: StatusBarStyle = isDarkMode
    ? "light-content"
    : "dark-content";

  const value: ThemeContextType = {
    isDarkMode,
    colors,
    statusBarStyle,
    setDarkMode,
    toggleDarkMode,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
