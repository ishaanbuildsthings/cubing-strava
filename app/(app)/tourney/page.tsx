"use client";

import { useState } from "react";
import { CubeEvent, EVENT_CONFIGS, EVENT_MAP } from "@/lib/cubing/events";
import { EventIcon } from "@/lib/components/event-icon";
import { UserAvatar } from "@/lib/components/user-avatar";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type TourneyStatus = "not-started" | "in-progress" | "completed";
type Tab = "compete" | "leaderboard";

// Mock leaderboard data — will be replaced with real API data.
const MOCK_LEADERBOARD = [
  { rank: 1, username: "cubegod99", firstName: "Max", lastName: "Chen", country: "US", profilePictureUrl: null, average: "7.23", isSelf: false },
  { rank: 2, username: "speedyfingers", firstName: "Yuki", lastName: "Tanaka", country: "JP", profilePictureUrl: null, average: "8.41", isSelf: false },
  { rank: 3, username: "713dream", firstName: "ishaan", lastName: "agrawal", country: "US", profilePictureUrl: null, average: "9.87", isSelf: true },
  { rank: 4, username: "cubemaster", firstName: "Lena", lastName: "Schmidt", country: "DE", profilePictureUrl: null, average: "10.12", isSelf: false },
  { rank: 5, username: "rubiksfan", firstName: "Carlos", lastName: "Rivera", country: "MX", profilePictureUrl: null, average: "11.54", isSelf: false },
  { rank: 6, username: "puzzle_pro", firstName: "Emma", lastName: "Lee", country: "KR", profilePictureUrl: null, average: "12.03", isSelf: false },
  { rank: 7, username: "twistandturn", firstName: "Ollie", lastName: "Brown", country: "GB", profilePictureUrl: null, average: "12.89", isSelf: false },
  { rank: 8, username: "algmaster", firstName: "Sophie", lastName: "Martin", country: "FR", profilePictureUrl: null, average: "13.21", isSelf: false },
];

export default function TourneyPage() {
  const [tab, setTab] = useState<Tab>("compete");
  const [leaderboardEvent, setLeaderboardEvent] = useState<CubeEvent>(CubeEvent.THREE);

  const eventConfig = EVENT_MAP[leaderboardEvent];

  return (
    <div className="flex flex-col flex-1 p-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold">Daily Tournament</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Compete against everyone. Same scrambles, same day.
          </p>
        </div>

        {/* Countdown */}
        <div className="rounded-lg bg-card border border-border p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Next tournament in
            </p>
            <p className="text-2xl font-extrabold font-mono tabular-nums mt-1">
              --:--:--
            </p>
          </div>
          <span className="text-3xl" suppressHydrationWarning>🏆</span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border">
          <button
            className={`px-4 py-2 text-sm font-bold transition-colors relative ${
              tab === "compete"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setTab("compete")}
          >
            Compete
            {tab === "compete" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            className={`px-4 py-2 text-sm font-bold transition-colors relative ${
              tab === "leaderboard"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setTab("leaderboard")}
          >
            Leaderboard
            {tab === "leaderboard" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        {/* Tab content */}
        {tab === "compete" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {EVENT_CONFIGS.map((config) => {
              const status: TourneyStatus = "not-started";
              return (
                <button
                  key={config.id}
                  className="rounded-lg bg-card border border-border p-4 flex items-center gap-3 hover:bg-muted transition-colors text-left"
                >
                  <EventIcon event={config} size={32} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{config.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {config.tournamentSolveCount === 5 ? "Ao5" : "Mo3"}
                      {" · "}
                      {config.tournamentSolveCount} solves
                    </p>
                  </div>
                  <StatusBadge status={status} />
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Event selector */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-md bg-card border border-border hover:bg-muted transition-colors">
                <EventIcon event={eventConfig} size={20} />
                <span className="font-bold text-sm">{eventConfig.name}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {EVENT_CONFIGS.map((config) => (
                  <DropdownMenuItem
                    key={config.id}
                    onClick={() => setLeaderboardEvent(config.id)}
                    className={leaderboardEvent === config.id ? "bg-accent" : ""}
                  >
                    <EventIcon event={config} size={16} />
                    <span>{config.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Leaderboard table */}
            <div className="rounded-lg bg-card border border-border overflow-hidden">
              {/* Header row */}
              <div className="grid grid-cols-[2.5rem_1fr_4rem] px-4 py-2 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <span>#</span>
                <span>Player</span>
                <span className="text-right">
                  {eventConfig.tournamentSolveCount === 5 ? "Ao5" : "Mo3"}
                </span>
              </div>

              {/* Rows */}
              {MOCK_LEADERBOARD.map((entry) => (
                <div
                  key={entry.rank}
                  className={`grid grid-cols-[2.5rem_1fr_4rem] px-4 py-3 items-center border-b border-border/40 last:border-0 ${
                    entry.isSelf ? "bg-primary/5" : ""
                  }`}
                >
                  <span className={`text-sm font-bold ${
                    entry.rank === 1 ? "text-yellow-500" :
                    entry.rank === 2 ? "text-zinc-400" :
                    entry.rank === 3 ? "text-amber-700" :
                    "text-muted-foreground"
                  }`}>
                    {entry.rank}
                  </span>
                  <div className="flex items-center gap-2 min-w-0">
                    <UserAvatar
                      user={{
                        username: entry.username,
                        firstName: entry.firstName,
                        lastName: entry.lastName,
                        profilePictureUrl: entry.profilePictureUrl,
                      }}
                      size="sm"
                      rounded="full"
                    />
                    <span className={`text-sm font-semibold truncate ${entry.isSelf ? "text-primary" : ""}`}>
                      {entry.username}
                    </span>
                    {entry.country && (
                      <span className="text-xs text-muted-foreground">{entry.country}</span>
                    )}
                  </div>
                  <span className="text-sm font-mono tabular-nums font-bold text-right">
                    {entry.average}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: TourneyStatus }) {
  if (status === "completed") {
    return (
      <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
        Done
      </span>
    );
  }
  if (status === "in-progress") {
    return (
      <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">
        In progress
      </span>
    );
  }
  return null;
}
