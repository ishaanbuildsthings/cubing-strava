import { z } from "zod";
import { createTRPCRouter, authedProcedure } from "../init";
import { applyTimerDefaults, type TimerSettings } from "@/lib/settings/timer";

// Zod schema matching TimerSettings for runtime validation.
const timerSettingsSchema = z.object({
  holdDelay: z.number().min(0).max(5000),
  useInspection: z.boolean(),
  inspectionDuration: z.number().min(1000).max(60000),
  showTimerWhileRunning: z.boolean(),
});

export const settingsRouter = createTRPCRouter({
  // Get the current user's settings, creating a row if none exists.
  get: authedProcedure.query(async ({ ctx }) => {
    const row = await ctx.prisma.userSettings.findUnique({
      where: { userId: ctx.viewer.userId },
    });

    return {
      timerSettings: applyTimerDefaults(row?.timerSettings as Partial<TimerSettings> | null),
    };
  }),

  // Update timer settings. Upserts — creates the row if it doesn't exist.
  updateTimer: authedProcedure
    .input(z.object({ timerSettings: timerSettingsSchema }))
    .mutation(async ({ ctx, input }) => {
      const row = await ctx.prisma.userSettings.upsert({
        where: { userId: ctx.viewer.userId },
        create: {
          userId: ctx.viewer.userId,
          timerSettings: input.timerSettings as object,
        },
        update: {
          timerSettings: input.timerSettings as object,
        },
      });

      return {
        timerSettings: applyTimerDefaults(row.timerSettings as Partial<TimerSettings>),
      };
    }),
});
