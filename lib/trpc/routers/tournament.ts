import { z } from "zod";
import { createTRPCRouter, authedProcedure } from "../init";
import { getTournamentDate } from "@/lib/tournament/date";

export const tournamentRouter = createTRPCRouter({
  // Get the viewer's status across all events for a given contest.
  // Returns entries, solves, ranks, and competitor counts.
  getContestStatus: authedProcedure
    .input(
      z.object({
        // Contest number. If omitted, returns the current contest.
        number: z.number().int().positive().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { prisma, viewer } = ctx;

      // Find the tournament by number, or get the current one by date.
      let tournament;
      if (input.number) {
        tournament = await prisma.tournament.findUnique({
          where: { number: input.number },
        });
      } else {
        const todayDate = getTournamentDate();
        tournament = await prisma.tournament.findFirst({
          where: { date: new Date(todayDate) },
        });
      }

      if (!tournament) {
        return { tournament: null, events: [] };
      }

      // Get all of the viewer's entries for this tournament.
      const myEntries = await prisma.tournamentEntry.findMany({
        where: { tournamentId: tournament.id, userId: viewer.userId },
        include: { scrambleSet: true },
      });

      // Get the viewer's solves for all scramble sets they've entered.
      const scrambleSetIds = myEntries.map((e) => e.scrambleSetId);
      const mySolves = scrambleSetIds.length > 0
        ? await prisma.solve.findMany({
            where: {
              scrambleSetId: { in: scrambleSetIds },
              userId: viewer.userId,
            },
            orderBy: { scrambleSetIndex: "asc" },
          })
        : [];

      // Group solves by scrambleSetId for easy lookup.
      const solvesByScrambleSet = new Map<string, typeof mySolves>();
      for (const solve of mySolves) {
        const existing = solvesByScrambleSet.get(solve.scrambleSetId) ?? [];
        existing.push(solve);
        solvesByScrambleSet.set(solve.scrambleSetId, existing);
      }

      // Get competitor counts and rank per event in one query.
      // For each event the viewer has entered, count total entries
      // and how many have a better result.
      const entryEventIds = myEntries.map((e) => e.eventId);

      const totalCounts = await prisma.tournamentEntry.groupBy({
        by: ["eventId"],
        where: { tournamentId: tournament.id },
        _count: true,
      });

      const totalCountMap = new Map(
        totalCounts.map((c) => [c.eventId, c._count])
      );

      // For rank, count entries with a non-null result better than ours per event.
      const rankMap = new Map<string, number>();
      for (const entry of myEntries) {
        if (entry.result !== null) {
          const betterCount = await prisma.tournamentEntry.count({
            where: {
              tournamentId: tournament.id,
              eventId: entry.eventId,
              result: { not: null, lt: entry.result },
            },
          });
          rankMap.set(entry.eventId, betterCount + 1);
        }
      }

      // Build per-event response.
      const events = myEntries.map((entry) => {
        const solves = solvesByScrambleSet.get(entry.scrambleSetId) ?? [];
        const scrambles = entry.scrambleSet.scrambles as string[];

        return {
          eventId: entry.eventId,
          entryId: entry.id,
          scrambleSetId: entry.scrambleSetId,
          scrambles,
          result: entry.result,
          solves: solves.map((s) => ({
            id: s.id,
            scrambleSetIndex: s.scrambleSetIndex,
            timeMs: s.time,
            penalty: s.penalty,
          })),
          rank: rankMap.get(entry.eventId) ?? null,
          totalCompetitors: totalCountMap.get(entry.eventId) ?? 0,
        };
      });

      // Also include competitor counts for events the viewer hasn't entered.
      const allEventCounts = totalCounts
        .filter((c) => !entryEventIds.includes(c.eventId))
        .map((c) => ({
          eventId: c.eventId,
          entryId: null,
          scrambleSetId: null,
          scrambles: null,
          result: null,
          solves: [],
          rank: null,
          totalCompetitors: c._count,
        }));

      return {
        tournament: {
          id: tournament.id,
          number: tournament.number,
          name: tournament.name,
          date: tournament.date.toISOString(),
        },
        events: [...events, ...allEventCounts],
      };
    }),

  // Get the leaderboard for a specific event in a contest.
  getLeaderboard: authedProcedure
    .input(
      z.object({
        tournamentNumber: z.number().int().positive(),
        eventId: z.string(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(25),
      })
    )
    .query(async ({ ctx, input }) => {
      const { prisma, viewer } = ctx;
      const { tournamentNumber, eventId, page, pageSize } = input;

      const tournament = await prisma.tournament.findUnique({
        where: { number: tournamentNumber },
      });

      if (!tournament) {
        return { entries: [], total: 0, viewerEntry: null, viewerRank: null };
      }

      // Total entries for this event (with results).
      const total = await prisma.tournamentEntry.count({
        where: {
          tournamentId: tournament.id,
          eventId,
          result: { not: null },
        },
      });

      // Paginated leaderboard entries, sorted by result.
      const entries = await prisma.tournamentEntry.findMany({
        where: {
          tournamentId: tournament.id,
          eventId,
          result: { not: null },
        },
        orderBy: { result: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profilePictureUrl: true,
              country: true,
            },
          },
          scrambleSet: true,
        },
      });

      // Get solves for all entries on this page.
      const scrambleSetIds = entries.map((e) => e.scrambleSetId);
      const userIds = entries.map((e) => e.userId);

      const solves = await prisma.solve.findMany({
        where: {
          scrambleSetId: { in: scrambleSetIds },
          userId: { in: userIds },
        },
        orderBy: { scrambleSetIndex: "asc" },
      });

      // Group solves by scrambleSetId + userId.
      const solvesMap = new Map<string, typeof solves>();
      for (const solve of solves) {
        const key = `${solve.scrambleSetId}:${solve.userId}`;
        const existing = solvesMap.get(key) ?? [];
        existing.push(solve);
        solvesMap.set(key, existing);
      }

      // Get viewer's entry and rank for this event.
      const viewerEntry = await prisma.tournamentEntry.findFirst({
        where: {
          tournamentId: tournament.id,
          eventId,
          userId: viewer.userId,
        },
      });

      let viewerRank: number | null = null;
      if (viewerEntry?.result !== null && viewerEntry?.result !== undefined) {
        const betterCount = await prisma.tournamentEntry.count({
          where: {
            tournamentId: tournament.id,
            eventId,
            result: { not: null, lt: viewerEntry.result },
          },
        });
        viewerRank = betterCount + 1;
      }

      // Get viewer's solves if they have an entry.
      let viewerSolves: typeof solves = [];
      if (viewerEntry) {
        viewerSolves = await prisma.solve.findMany({
          where: {
            scrambleSetId: viewerEntry.scrambleSetId,
            userId: viewer.userId,
          },
          orderBy: { scrambleSetIndex: "asc" },
        });
      }

      const offset = (page - 1) * pageSize;

      return {
        tournament: {
          id: tournament.id,
          number: tournament.number,
          name: tournament.name,
          date: tournament.date.toISOString(),
        },
        total,
        entries: entries.map((entry, i) => {
          const key = `${entry.scrambleSetId}:${entry.userId}`;
          const entrySolves = solvesMap.get(key) ?? [];

          return {
            rank: offset + i + 1,
            user: entry.user,
            result: entry.result,
            solves: entrySolves.map((s) => ({
              timeMs: s.time,
              penalty: s.penalty,
              scrambleSetIndex: s.scrambleSetIndex,
            })),
          };
        }),
        viewerEntry: viewerEntry
          ? {
              rank: viewerRank,
              result: viewerEntry.result,
              solves: viewerSolves.map((s) => ({
                timeMs: s.time,
                penalty: s.penalty,
                scrambleSetIndex: s.scrambleSetIndex,
              })),
            }
          : null,
      };
    }),
});
