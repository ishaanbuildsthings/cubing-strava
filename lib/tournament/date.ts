// Tournament day rollover: midnight PST = 8 AM UTC.
// The tournament date equals the PST calendar date.
const ROLLOVER_HOUR_UTC = 8;

// Grace window: users who started before rollover get this long to finish.
const GRACE_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Returns the current tournament date as a "YYYY-MM-DD" string.
 * Since rollover is midnight PST (8 AM UTC), the tournament date
 * is simply the current date in PST/America-Los_Angeles.
 */
export function getTournamentDate(now: Date = new Date()): string {
  // Format as YYYY-MM-DD in PST (America/Los_Angeles handles PST/PDT).
  const parts = now.toLocaleDateString("en-CA", {
    timeZone: "America/Los_Angeles",
  });
  return parts; // "en-CA" locale returns "YYYY-MM-DD" format.
}

/**
 * Returns the Date object for the next rollover (when the current
 * tournament day ends and the next one begins).
 */
export function getNextRollover(now: Date = new Date()): Date {
  const next = new Date(now);
  next.setUTCMinutes(0, 0, 0);

  if (now.getUTCHours() >= ROLLOVER_HOUR_UTC) {
    // Rollover is tomorrow at 8 AM UTC.
    next.setUTCDate(next.getUTCDate() + 1);
  }

  next.setUTCHours(ROLLOVER_HOUR_UTC);
  return next;
}

/**
 * Checks if a tournament entry that started at `startedAt` is still
 * within the grace window for the given tournament date.
 */
export function isWithinGraceWindow(
  startedAt: Date,
  tournamentDate: string,
  now: Date = new Date()
): boolean {
  const currentDate = getTournamentDate(now);

  // Still the same tournament day — always valid.
  if (currentDate === tournamentDate) return true;

  // The day has rolled over. Check if we're within the grace window.
  const rollover = getNextRollover(startedAt);
  const msSinceRollover = now.getTime() - rollover.getTime();
  return msSinceRollover <= GRACE_WINDOW_MS;
}
