// Tournament day rollover: midnight PST = 8 AM UTC.
// The tournament date equals the PST calendar date.
export const ROLLOVER_HOUR_UTC = 8;

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
