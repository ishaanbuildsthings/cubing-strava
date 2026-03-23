import "server-only";

import { createTRPCContext } from "./init";
import { createCallerFactory } from "./init";
import { appRouter } from "./routers/_app";

const createCaller = createCallerFactory(appRouter);

export async function caller() {
  const ctx = await createTRPCContext();
  return createCaller(ctx);
}
