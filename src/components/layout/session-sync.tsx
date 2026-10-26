"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { persistPreferences } from "@/lib/db/persist-client";
import type { PlacedOrder, UserPreferences } from "@/lib/memory";
import { useDemoStore } from "@/lib/store";

export function SessionSync() {
  const { data } = useSession();
  const setPreferences = useDemoStore((state) => state.setPreferences);
  const hydrateFromServer = useDemoStore((state) => state.hydrateFromServer);

  useEffect(() => {
    if (!data?.user?.name) return;
    setPreferences({ displayName: data.user.name });
  }, [data?.user?.email, data?.user?.name, setPreferences]);

  useEffect(() => {
    if (!data?.user?.email) return;
    void fetch("/api/memory")
      .then((response) => response.json())
      .then((payload: { connected?: boolean; preferences?: UserPreferences | null; orders?: PlacedOrder[] }) => {
        if (!payload.connected) return;
        hydrateFromServer({
          preferences: payload.preferences ?? undefined,
          orders: payload.orders,
        });
        if (!payload.preferences) {
          void persistPreferences(useDemoStore.getState().preferences);
        }
      })
      .catch(() => undefined);
  }, [data?.user?.email, hydrateFromServer]);

  return null;
}
