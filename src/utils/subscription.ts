import { useAuthContext } from "../context/AuthContext";

export const isProTier = (tier?: string): boolean =>
  tier === "pro" || tier === "premium";

export const useIsPro = (): boolean => {
  const { user } = useAuthContext();
  return isProTier(user?.subscriptionTier);
};
