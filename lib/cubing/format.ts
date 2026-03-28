// Shared formatting utilities for cubing times.
// Used by practice timer, tournament pages, leaderboards, etc.

import { DNF_SENTINEL } from "@/lib/cubing/stats";

// Format milliseconds to a human-readable time string.
// Examples: 9230 → "9.23", 62100 → "1:02.10", Infinity/DNF_SENTINEL → "DNF"
export function formatTime(ms: number): string {
  if (ms >= DNF_SENTINEL || ms === Infinity) return "DNF";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);

  if (minutes > 0) {
    return `${minutes}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
  }
  return `${seconds}.${String(centiseconds).padStart(2, "0")}`;
}

// Format a solve's time accounting for penalties.
// plus_two: adds 2s and appends "+", dnf: returns "DNF"
export function formatSolveTime(solve: { timeMs: number; penalty: string | null }): string {
  if (solve.penalty === "dnf") return "DNF";
  const time = formatTime(
    solve.penalty === "plus_two" ? solve.timeMs + 2000 : solve.timeMs
  );
  return solve.penalty === "plus_two" ? `${time}+` : time;
}
