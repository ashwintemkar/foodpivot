"use client";

import { useEffect, useState } from "react";
import { useDemoStore } from "./store";

export function useHasHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const finish = () => setHydrated(true);
    const unsub = useDemoStore.persist.onFinishHydration(finish);
    if (useDemoStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  return hydrated;
}
