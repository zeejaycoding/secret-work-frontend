import axios from "axios";
import * as SecureStore from "expo-secure-store";

declare module "axios" {
  export interface AxiosRequestConfig {
    skipAuthLogout?: boolean;
  }
}

const api = axios.create({
  baseURL: `${process.env.EXPO_PUBLIC_API_URL}/api`,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync("auth-token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const apiError = error.response?.data?.error;
    // Diagnostic: log every failed request so we can identify the exact call
    // that triggers an issue (visible in the Metro / `adb logcat` console).
    const url = (error.config as any)?.url || "";
    const method = ((error.config as any)?.method || "").toUpperCase();
    if (status) {
      console.warn(`API ${status} ${method} ${url}`, apiError || "");
    } else {
      console.warn(`API network error ${method} ${url}`, error.message);
    }
    // A 401 must NOT wipe the session. A single failed/unauthorized request
    // (transient error, a protected endpoint, an expired read, etc.) was
    // deleting the auth token, logging the user out and dropping every screen
    // to mock/fallback data — e.g. opening Live Chat. Logout only happens via
    // an explicit sign-out (or an account suspension below).
    if (status === 403 && apiError === "Your account has been suspended") {
      await SecureStore.deleteItemAsync("auth-token").catch(() => {});
      error.message = apiError;
    }
    return Promise.reject(error);
  }
);

export async function getMe() {
  const { data } = await api.get("/users/me");
  return data.user;
}

export interface ProAthlete {
  _id: string;
  name: string;
  team?: string;
  imageUrl?: string;
  sessions?: number;
  featured?: boolean;
  homepageBanner?: boolean;
}

export async function getPros() {
  const { data } = await api.get("/users/pros");
  return data.pros as ProAthlete[];
}

export async function getDrills() {
  const { data } = await api.get("/drills");
  return data.drills;
}

export interface DrillOfTheWeek {
  _id: string;
  title: string;
  coach: string;
  videoUrl: string;
  imageUrl?: string;
  views: number;
  category: string;
  level: string;
  duration: string;
  weeklyViews: number;
}

export async function getDrillOfTheWeek() {
  const { data } = await api.get("/drills/drill-of-the-week");
  return data.drill as DrillOfTheWeek | null;
}

export async function markDrillComplete(drillId: string) {
  const { data } = await api.post("/users/progress/completed-drills", { drillId });
  return data;
}

export async function recordDrillView(drillId: string) {
  const { data } = await api.post(`/drills/${drillId}/view`);
  return data;
}

export interface WorkoutCardItem {
  id: string;
  name: string;
  level: string;
  duration: string;
  image: string;
}

export interface WorkoutSection {
  id: string;
  title: string;
  workouts: WorkoutCardItem[];
}

export async function getWorkouts() {
  const { data } = await api.get("/workouts");
  return data.workouts as WorkoutSection[];
}

export interface WorkoutVideo {
  id: string;
  title: string;
  category: string;
  duration: string;
  reps: string;
  image: string;
  videoUrl?: string;
}

export interface WorkoutProfile {
  id: string;
  coachName: string;
  team: string;
  description: string;
  image: string;
  stats: {
    followers: string;
    videos: number;
    yearsExp: number;
  };
  videos: WorkoutVideo[];
}

export async function getWorkout(id: string) {
  const { data } = await api.get(`/workouts/${id}`);
  return data.workout as WorkoutProfile;
}

export interface QuickDrill {
  id: string;
  title: string;
  subTitle: string;
  category: string;
  level: string;
  duration: string;
  image: string;
  videoUrl: string;
  reps: string;
}

export interface QuickWorkoutResult {
  drills: QuickDrill[];
  availableLevels?: string[];
}

export async function getQuickWorkout(params: {
  level?: string;
  categories?: string;
  coach?: string;
}) {
  const { data } = await api.get("/workouts/quick", { params });
  return data as QuickWorkoutResult;
}

export interface TopCoach {
  coachName: string;
  followers: number;
  stats: { followers: number; videos: number; yearsExp: number };
  videos: QuickDrill[];
}

export async function getTopCoach() {
  const { data } = await api.get("/workouts/top-coach");
  return data as TopCoach;
}

export interface FollowStatus {
  following: boolean;
  followers: number;
}

export async function toggleFollow(coach: string) {
  const { data } = await api.post("/users/follows", { coach });
  return data as FollowStatus;
}

export async function getFollowStatus(coach: string) {
  const { data } = await api.get("/users/follows/status", { params: { coach } });
  return data as FollowStatus;
}

export async function reportWatchTime(seconds: number, drillId?: string) {
  const { data } = await api.post("/users/progress/watch", {
    seconds,
    ...(drillId ? { drillId } : {}),
  });
  return data;
}

export async function toggleDrillLike(drillId: string) {
  const { data } = await api.post(`/drills/${drillId}/like`);
  return data as { liked: boolean; likes: number };
}

export async function getLikedDrills() {
  const { data } = await api.get("/drills/liked");
  return data.drillIds as string[];
}

export async function getPlans() {
  const { data } = await api.get("/plans");
  return data.plans;
}

export interface PodcastEpisode {
  _id: string;
  title: string;
  host: string;
  guest?: string;
  type: string;
  date: string;
  plays: number;
  completion: number;
  watchTimeSec?: number;
  status: string;
  duration: string;
  description: string;
  imageUrl?: string;
  mediaUrl?: string;
  mediaType?: string;
  mediaName?: string;
}

export async function getPodcasts() {
  const { data } = await api.get("/podcasts");
  return data.podcasts as PodcastEpisode[];
}

export async function getPodcast(id: string) {
  const { data } = await api.get(`/podcasts/${id}`);
  return data.podcast as PodcastEpisode;
}

export async function incrementPodcastPlays(id: string) {
  const { data } = await api.post(`/podcasts/${id}/play`);
  return data.podcast as PodcastEpisode;
}

export async function reportPodcastProgress(
  id: string,
  payload: { listenedSec?: number; completion?: number }
) {
  const { data } = await api.post(`/podcasts/${id}/progress`, payload);
  return data.podcast as PodcastEpisode;
}

export async function updateMe(updates: Record<string, any>) {
  const { data } = await api.patch("/users/me", updates);
  return data.user;
}

export async function uploadProfilePic(formData: FormData) {
  const { data } = await api.post("/users/me/avatar", formData, {
    timeout: 120000,
    headers: {
      // Must override the instance's "application/json" default: axios's
      // transformRequest JSON-serializes FormData when the Content-Type is
      // application/json, destroying the multipart file before it is sent.
      "Content-Type": "multipart/form-data",
    },
  });
  return data.user;
}

export async function deleteProfilePic() {
  const { data } = await api.delete("/users/me/avatar");
  return data.user;
}

export interface UserPreferences {
  darkMode: boolean;
  language: string;
  autoplayVideos: boolean;
  dataSaver: boolean;
  videoQuality: string;
  notifications: {
    push: boolean;
    email: boolean;
    inApp: boolean;
  };
}

export async function getPreferences() {
  const { data } = await api.get("/users/preferences");
  return data.preferences as Partial<UserPreferences>;
}

export async function updatePreferences(patch: Partial<UserPreferences>) {
  const { data } = await api.patch("/users/preferences", patch);
  return data.preferences as Partial<UserPreferences>;
}

export async function completeOnboarding() {
  const { data } = await api.post("/users/onboarding/complete");
  return data.user;
}

export async function setPassword(password: string) {
  const { data } = await api.post("/users/password", { password });
  return data;
}

export async function createCheckoutSession(plan: "monthly" | "annual", discountCode?: string) {
  const payload: any = { plan };
  if (discountCode) {
    payload.discountCode = discountCode;
  }
  const { data } = await api.post("/payments/checkout", payload);
  return data;
}

export async function createSetupIntent() {
  const { data } = await api.post("/payments/setup-intent");
  return data as { clientSecret: string; setupIntentId: string; customerId: string };
}

export async function createSubscription(plan: "monthly" | "annual", discountCode?: string) {
  const payload: any = { plan };
  if (discountCode) {
    payload.discountCode = discountCode;
  }
  const { data } = await api.post("/payments/subscription", payload);
  return data as {
    subscriptionId: string;
    clientSecret?: string;
    clientSecretType?: "payment_intent" | "setup_intent";
    alreadyPaid?: boolean;
    error?: string;
  };
}

export async function confirmSubscription() {
  const { data } = await api.post("/payments/confirm-subscription");
  return data as { ok: boolean; isActive?: boolean; alreadyActive?: boolean; status?: string; error?: string };
}

export interface DiscountValidation {
  valid: boolean;
  code?: string;
  discountAmount?: number;
  message?: string;
  error?: string;
}

export async function validateDiscountCode(
  code: string,
  plan: string
): Promise<DiscountValidation> {
  try {
    const { data } = await api.post("/payments/discount/validate", {
      code,
      plan,
    });
    return data as DiscountValidation;
  } catch (error: any) {
    return {
      valid: false,
      message: error.response?.data?.message || error.response?.data?.error || "Validation failed",
    };
  }
}

export interface SubscriptionStatus {
  tier: string;
  expiry: string | null;
  isActive: boolean;
  plan: string | null;
  amount: number | null;
  label: string | null;
}

export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  const { data } = await api.get("/payments/subscription");
  return data;
}

export async function changePassword(oldPassword: string, newPassword: string) {
  const { data } = await api.post("/users/password/change", { oldPassword, newPassword });
  return data;
}

export async function socialLogin(payload: {
  clerkToken: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  provider: "google" | "facebook" | "apple";
}) {
  const { data } = await api.post("/auth/social-login", payload);
  return data;
}

export async function createPortalSession() {
  const { data } = await api.post("/payments/portal");
  return data;
}

export interface InAppNotification {
  _id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export async function getInAppNotifications() {
  const { data } = await api.get("/users/notifications", {
    skipAuthLogout: true,
  });
  return data.notifications as InAppNotification[];
}

export async function getUnreadNotificationCount() {
  const { data } = await api.get("/users/notifications/unread-count", {
    skipAuthLogout: true,
  });
  return data.count as number;
}

export async function markNotificationRead(id: string) {
  const { data } = await api.patch(`/users/notifications/${id}/read`, null, {
    skipAuthLogout: true,
  });
  return data;
}

export async function markAllNotificationsRead() {
  const { data } = await api.post(
    "/users/notifications/read-all",
    {},
    { skipAuthLogout: true }
  );
  return data;
}

export async function registerPushToken(token: string) {
  const { data } = await api.post("/users/push-token", { token });
  return data;
}

export interface NotificationPrefs {
  push: boolean;
  email: boolean;
  inApp: boolean;
}

export async function getNotificationPrefs() {
  const { data } = await api.get("/users/notification-prefs");
  return data.prefs as NotificationPrefs;
}

export async function saveNotificationPrefs(prefs: NotificationPrefs) {
  const { data } = await api.post("/users/notification-prefs", { prefs });
  return data.prefs as NotificationPrefs;
}

export interface ChatMessage {
  _id: string;
  room: string;
  from: string | null;
  text: string;
  isAgent: boolean;
  createdAt: string;
}

export async function getChatHistory() {
  const { data } = await api.get("/chat/history", { skipAuthLogout: true });
  return data.messages as ChatMessage[];
}

export default api;
