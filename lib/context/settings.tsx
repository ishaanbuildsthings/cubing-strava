"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { useTRPC } from "@/lib/trpc/client";
import { useMutation } from "@tanstack/react-query";
import type { TimerSettings } from "@/lib/settings/timer";

interface SettingsContextValue {
  timerSettings: TimerSettings;
  updateTimerSettings: (updates: Partial<TimerSettings>) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({
  initialTimerSettings,
  children,
}: {
  initialTimerSettings: TimerSettings;
  children: React.ReactNode;
}) {
  const [timerSettings, setTimerSettings] = useState(initialTimerSettings);
  const trpc = useTRPC();

  const mutation = useMutation(
    trpc.settings.updateTimer.mutationOptions()
  );

  const updateTimerSettings = useCallback(
    (updates: Partial<TimerSettings>) => {
      const merged = { ...timerSettings, ...updates };
      // Optimistic update — instant UI response.
      setTimerSettings(merged);
      // Persist to database in the background.
      mutation.mutate({ timerSettings: merged });
    },
    [timerSettings, mutation]
  );

  return (
    <SettingsContext.Provider value={{ timerSettings, updateTimerSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return ctx;
}
