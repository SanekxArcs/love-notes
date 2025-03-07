import { useState, useEffect } from 'react';
import { toast } from "sonner";

interface Settings {
  dailyMessageLimit: number;
  contactNumber: string;
  partnerIdToReceiveFrom: string;
}

export function useUserSettings() {
  const [settings, setSettings] = useState<Settings>({
    dailyMessageLimit: 1,
    contactNumber: "+380123456789",
    partnerIdToReceiveFrom: "", 
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        // First, get the current user's session data
        const sessionResponse = await fetch("/api/auth/session");
        if (!sessionResponse.ok) {
          throw new Error("Failed to fetch session");
        }
        
        const sessionData = await sessionResponse.json();
        if (!sessionData?.user?.login) {
          throw new Error("No user login found in session");
        }
        
        const userLogin = sessionData.user.login;
        
        // Now fetch current user profile
        const userProfileResponse = await fetch(`/api/users/profile?login=${userLogin}`);
        if (!userProfileResponse.ok) {
          throw new Error("Failed to fetch user profile");
        }
        
        const userData = await userProfileResponse.json();
        
        if (!userData) {
          toast.error("Failed to load user data");
          return;
        }
        
        // Get partner ID from current user profile
        const partnerIdToReceiveFrom = userData.partnerIdToReceiveFrom;
        
        if (!partnerIdToReceiveFrom) {
          setSettings({
            dailyMessageLimit: 0,
            contactNumber: userData.phone || "+380123456789",
            partnerIdToReceiveFrom: "",
          });
          
          toast.warning("Partner ID not set. Please go to profile settings to set your partner ID.");
          setIsLoading(false);
          return;
        }
        
        // Fetch partner data using partnerIdToSend
        const partnerResponse = await fetch(`/api/users/partner?partnerId=${partnerIdToReceiveFrom}`);
        if (!partnerResponse.ok) {
          throw new Error("Failed to fetch partner data");
        }
        
        const partnerData = await partnerResponse.json();
        
        if (!partnerData) {
          toast.error("Partner not found with the provided ID");
          setSettings({
            dailyMessageLimit: 0,
            contactNumber: userData.phone || "+380123456789",
            partnerIdToReceiveFrom: partnerIdToReceiveFrom,
          });
          setIsLoading(false);
          return;
        }
        
        // Use partner settings for messages
        setSettings({
          // Use the partner's message limit
          dailyMessageLimit: partnerData.dayMessageLimit || 3,
          // Use the partner's contact number
          contactNumber: partnerData.phone || "+380123456789",
          // Keep the partner ID for reference
          partnerIdToReceiveFrom: partnerIdToReceiveFrom,
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
