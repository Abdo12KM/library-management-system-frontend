"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store";

export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Wait for Zustand to rehydrate from localStorage
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return isHydrated;
}

export function useAuth() {
  const store = useAuthStore();
  const isHydrated = useHydration();

  return {
    ...store,
    isHydrated,
  };
}
