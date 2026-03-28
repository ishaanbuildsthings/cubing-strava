import { createTRPCRouter } from "../init";
import { authRouter } from "./auth";
import { userRouter } from "./user";
import { tournamentRouter } from "./tournament";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  tournament: tournamentRouter,
});

export type AppRouter = typeof appRouter;
