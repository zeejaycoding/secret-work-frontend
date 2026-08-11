import React, { createContext, useContext, useEffect, useState } from "react";
import { AppState } from "react-native";
import {
  Branding,
  PublicNotificationPrefs,
  DEFAULT_BRANDING,
  DEFAULT_NOTIFICATION_PREFS,
  loadBranding,
  getCachedBranding,
  getCachedNotificationPrefs,
} from "../services/branding";

interface BrandingContextType {
  brand: Branding;
  notifPrefs: PublicNotificationPrefs;
  primaryColor: string;
  accentColor: string;
  displayFont: string;
  bodyFont: string;
  appName: string;
  tagline: string;
  loading: boolean;
}

const BrandingContext = createContext<BrandingContextType>({
  brand: { ...DEFAULT_BRANDING },
  notifPrefs: { ...DEFAULT_NOTIFICATION_PREFS },
  primaryColor: DEFAULT_BRANDING.primaryColor,
  accentColor: DEFAULT_BRANDING.accentColor,
  displayFont: DEFAULT_BRANDING.displayFont,
  bodyFont: DEFAULT_BRANDING.bodyFont,
  appName: DEFAULT_BRANDING.appName,
  tagline: DEFAULT_BRANDING.tagline,
  loading: true,
});

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [brand, setBrand] = useState<Branding>({ ...getCachedBranding() });
  const [notifPrefs, setNotifPrefs] = useState<PublicNotificationPrefs>({
    ...getCachedNotificationPrefs(),
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const refresh = () =>
      loadBranding().then((b) => {
        if (!mounted) return;
        setBrand({ ...b });
        setNotifPrefs({ ...getCachedNotificationPrefs() });
        setLoading(false);
      });
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });
    refresh();
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  const value: BrandingContextType = {
    brand,
    notifPrefs,
    primaryColor: brand.primaryColor || DEFAULT_BRANDING.primaryColor,
    accentColor: brand.accentColor || DEFAULT_BRANDING.accentColor,
    displayFont: brand.displayFont || DEFAULT_BRANDING.displayFont,
    bodyFont: brand.bodyFont || DEFAULT_BRANDING.bodyFont,
    appName: brand.appName || DEFAULT_BRANDING.appName,
    tagline: brand.tagline || DEFAULT_BRANDING.tagline,
    loading,
  };

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  return useContext(BrandingContext);
}
