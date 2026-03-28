import type { PrismaClient } from "@/app/generated/prisma/client";

export type EventServiceContext = {
  prisma: PrismaClient;
};

export function eventService({ prisma }: EventServiceContext) {
  return {
    getByName: (name: string) =>
      prisma.event.findUnique({ where: { name } }),
  };
}
