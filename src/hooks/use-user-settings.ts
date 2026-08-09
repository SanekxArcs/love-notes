import { useState, useEffect } from 'react';
import { toast } from "sonner";

interface Settings {
  dailyMessageLimit: number;
  contactNumber: string;
  partnerIdToReceiveFrom: string;
  partnerIdToSend: string;
  userName: string;
}

const DEFAULT_SETTINGS: Settings = {
  dailyMessageLimit: 1,
  contactNumber: "",
  partnerIdToReceiveFrom: "",
  partnerIdToSend: "",
  userName: "",
};

export function useUserSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const sessionResponse = await fetch("/api/auth/session");
        if (!sessionResponse.ok) {
          throw new Error("Failed to fetch session");
        }

        const sessionData = await sessionResponse.json();
        if (!sessionData?.user?.login) {
          throw new Error("No user login found in session");
        }

        const userLogin = sessionData.user.login;

        const userProfileResponse = await fetch(
          `/api/users/profile?login=${userLogin}`
        );
        if (!userProfileResponse.ok) {
          throw new Error("Не вдалося отримати профіль користувача");
        }

        const userData = await userProfileResponse.json();

        if (!userData) {
          toast.error("Не вдалося завантажити дані користувача");
          return;
        }

        const partnerIdToReceiveFrom = userData.partnerIdToReceiveFrom;

        if (!partnerIdToReceiveFrom) {
          setSettings({
            dailyMessageLimit: 0,
            contactNumber: userData.phone || "",
            partnerIdToReceiveFrom: "",
            partnerIdToSend: userData.partnerIdToSend || "",
            userName: userData.name || "",
          });
          setIsLoading(false);
          return;
        }

        const partnerResponse = await fetch(
          `/api/users/partner?partnerId=${partnerIdToReceiveFrom}`
        );
        if (!partnerResponse.ok) {
          throw new Error("Не вдалося отримати профіль користувача");
        }

        const partnerData = await partnerResponse.json();

        if (!partnerData) {
          toast.error("Партнера з наданим ідентифікатором не знайдено");
          setSettings({
            dailyMessageLimit: 0,
            contactNumber: userData.phone || "",
            partnerIdToReceiveFrom: partnerIdToReceiveFrom,
            partnerIdToSend: userData.partnerIdToSend || "",
            userName: userData.name || "",
          });
          setIsLoading(false);
          return;
        }

        setSettings({
          dailyMessageLimit:
            partnerData.dayMessageLimit || DEFAULT_SETTINGS.dailyMessageLimit,
          contactNumber: partnerData.phone || DEFAULT_SETTINGS.contactNumber,
          partnerIdToReceiveFrom: partnerIdToReceiveFrom,
          partnerIdToSend: userData.partnerIdToSend || "",
          userName: userData.name || "",
        });
      } catch (error) {
        console.error("Error fetching user settings:", error);
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettings();
  }, []);

  return { settings, isLoading };
}
