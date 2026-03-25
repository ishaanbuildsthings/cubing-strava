import { createTRPCRouter } from "../init";
import { authRouter } from "./auth";
import { userRouter } from "./user";
import { settingsRouter } from "./settings";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  settings: settingsRouter,
});

export type AppRouter = typeof appRouter;
