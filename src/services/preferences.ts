import {
  getPreferences,
  updatePreferences,
  UserPreferences,
} from "./api";

export const DEFAULT_PREFERENCES: UserPreferences = {
  darkMode: true,
  language: "English",
  autoplayVideos: true,
  dataSaver: false,
  videoQuality: "Auto Play",
  notifications: {
    push: true,
    email: true,
    inApp: true,
  },
};

let cache: UserPreferences = { ...DEFAULT_PREFERENCES };

export async function loadPreferences(): Promise<UserPreferences> {
  try {
    const saved = await getPreferences();
    cache = {
      ...DEFAULT_PREFERENCES,
      ...saved,
      notifications: { ...DEFAULT_PREFERENCES.notifications, ...(saved.notifications || {}) },
    };
  } catch {
    cache = { ...DEFAULT_PREFERENCES };
  }
  return cache;
}

export function getCachedPreferences(): UserPreferences {
  return cache;
}

export async function savePreferences(
  patch: Partial<UserPreferences>
): Promise<UserPreferences> {
  const next = {
    ...cache,
    ...patch,
    notifications: { ...cache.notifications, ...(patch.notifications || {}) },
  };
  cache = next;
  try {
    const saved = await updatePreferences(patch);
    cache = {
      ...cache,
      ...saved,
      notifications: { ...cache.notifications, ...(saved.notifications || {}) },
    };
  } catch { return cache; }
  return cache;
}
