// Timer settings — stored as JSON in the UserSettings table.
// When adding new settings, just add them here with a default.
// Existing users won't have them in their stored JSON, so they
// get the default via the merge in applyDefaults().

export interface TimerSettings {
  /** How long (ms) the spacebar must be held before the timer is ready. */
  holdDelay: number;
  /** Whether to show WCA 15s inspection countdown before timing. */
  useInspection: boolean;
  /** Duration (ms) of inspection if enabled. */
  inspectionDuration: number;
  /** Whether to show the running time while timing (false = hide until stop). */
  showTimerWhileRunning: boolean;
}

export const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  holdDelay: 300,
  useInspection: false,
  inspectionDuration: 15000,
  showTimerWhileRunning: true,
};

/** Merge stored JSON (may be partial/outdated) with current defaults. */
export function applyTimerDefaults(stored: Partial<TimerSettings> | null | undefined): TimerSettings {
  return { ...DEFAULT_TIMER_SETTINGS, ...stored };
}
