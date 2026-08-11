import api from "./api";

export interface Branding {
  appName: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  displayFont: string;
  bodyFont: string;
}

export interface PublicNotificationPrefs {
  push: boolean;
  email: boolean;
  inApp: boolean;
  insights: boolean;
  failed: boolean;
  reports: boolean;
}

export const DEFAULT_BRANDING: Branding = {
  appName: "Secret Work",
  tagline: "Train like the pros",
  primaryColor: "#E50914",
  accentColor: "#FF0015",
  displayFont: "Poppins",
  bodyFont: "Inter",
};

export const DEFAULT_NOTIFICATION_PREFS: PublicNotificationPrefs = {
  push: true,
  email: true,
  inApp: true,
  insights: true,
  failed: true,
  reports: true,
};

let cache: Branding = { ...DEFAULT_BRANDING };
let notifCache: PublicNotificationPrefs = { ...DEFAULT_NOTIFICATION_PREFS };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeBranding(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function loadBranding(): Promise<Branding> {
  try {
    const { data } = await api.get("/settings/branding");
    cache = {
      ...DEFAULT_BRANDING,
      ...(data.branding || {}),
    };
    notifCache = {
      ...DEFAULT_NOTIFICATION_PREFS,
      ...(data.notifications || {}),
    };
  } catch {
    cache = { ...DEFAULT_BRANDING };
    notifCache = { ...DEFAULT_NOTIFICATION_PREFS };
  }
  emit();
  return cache;
}

export function getCachedBranding(): Branding {
  return cache;
}

export function getCachedNotificationPrefs(): PublicNotificationPrefs {
  return notifCache;
}
