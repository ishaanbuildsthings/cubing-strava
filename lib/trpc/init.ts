import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { getPrisma } from "@/lib/prisma";

export const createTRPCContext = async () => {
  return { prisma: getPrisma() };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const baseProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;
