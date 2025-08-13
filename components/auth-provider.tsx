"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const { login } = useAuthStore();

  useEffect(() => {
    // Rehydrate auth state from localStorage
    const restoreAuth = () => {
      if (typeof window === "undefined") return;

      try {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");

        if (token && userStr) {
          const user = JSON.parse(userStr);
          login(user, token);
        }
      } catch (error) {
        console.error("Failed to restore auth state:", error);
        // Clear corrupted data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setIsHydrated(true);
      }
    };

    restoreAuth();
  }, [login]);

  // Show loading state until hydration is complete
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
