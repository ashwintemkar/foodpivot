"use client";

import { useEffect } from "react";
import { useDemoStore } from "@/lib/store";

export function StoreHydrate() {
  useEffect(() => {
    void useDemoStore.persist.rehydrate();
  }, []);
  return null;
}
