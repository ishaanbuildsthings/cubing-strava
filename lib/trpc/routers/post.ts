import { z } from "zod/v4";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, authedProcedure } from "../init";
import { recomputeStats } from "@/lib/cubing/stats";
import { EVENT_MAP } from "@/lib/cubing/events";

// Maps client-side penalty strings to Prisma enum values.
const PENALTY_MAP = {
  "+2": "plus_two" as const,
  "dnf": "dnf" as const,
};

// Infinity (all-DNF average) can't be stored as Int — treat as null.
function finiteOrNull(n: number | null): number | null {
  if (n === null || !isFinite(n)) return null;
  return n;
}

const solveSchema = z.object({
  timeMs: z.number().int().positive(),
  penalty: z.enum(["+2", "dnf"]).optional(),
  scramble: z.string().min(1),
});

export const postRouter = createTRPCRouter({
  createPracticeSessionPost: authedProcedure
    .input(
      z.object({
        event: z.string(),
        solves: z.array(solveSchema).min(1).max(1000),
        caption: z.string().max(500).default(""),
        youtubeUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const eventConfig = EVENT_MAP[input.event as keyof typeof EVENT_MAP];
      if (!eventConfig) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Unknown event" });
      }

      const dbEvent = await ctx.prisma.event.findUnique({
        where: { name: input.event },
      });
      if (!dbEvent) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Event not found" });
      }

      // Compute stats server-side so clients can't forge them.
      const stats = recomputeStats(
        input.event,
        input.solves.map((s) => ({ timeMs: s.timeMs, penalty: s.penalty ?? null })),
        eventConfig.stats
      );

      // displaySolves: times of the most recent solves that form the key average.
      const displayCount = eventConfig.stats.includes("ao5") ? 5
        : eventConfig.stats.includes("mo3") ? 3
        : 1;
      const displaySolves = input.solves.slice(0, displayCount).map((s) => s.timeMs);

      return ctx.prisma.$transaction(async (tx) => {
        const scrambleSet = await tx.scrambleSet.create({
          data: {
            eventId: dbEvent.id,
            scrambles: input.solves.map((s) => s.scramble),
          },
        });

        await tx.solve.createMany({
          data: input.solves.map((s, i) => ({
            userId: ctx.viewer.userId,
            eventId: dbEvent.id,
            scrambleSetId: scrambleSet.id,
            scrambleSetIndex: i,
            time: s.timeMs,
            penalty: s.penalty ? PENALTY_MAP[s.penalty] : undefined,
          })),
        });

        return tx.practicePost.create({
          data: {
            userId: ctx.viewer.userId,
            eventId: dbEvent.id,
            scrambleSetId: scrambleSet.id,
            caption: input.caption,
            youtubeUrl: input.youtubeUrl,
            bestSingle: finiteOrNull(stats.bestSingle),
            bestAo5: finiteOrNull(stats.bestAo5),
            bestAo12: finiteOrNull(stats.bestAo12),
            bestAo100: finiteOrNull(stats.bestAo100),
            bestMo3: finiteOrNull(stats.bestMo3),
            displaySolves,
            numSolves: input.solves.length,
            numLikes: 0,
            numComments: 0,
          },
        });
      });
    }),
});
