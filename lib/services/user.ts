import type { PrismaClient } from "@/app/generated/prisma/client";
import type { ViewerContext } from "@/lib/viewer-context";
import { NotFoundError } from "@/lib/errors";

export type ServiceContext = {
  prisma: PrismaClient;
  viewer: ViewerContext;
};

export function userService(ctx: ServiceContext) {
  const { prisma } = ctx;
  return {
    list: () => prisma.user.findMany({ orderBy: { createdAt: "desc" } }),

    getById: async (id: string) => {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) throw new NotFoundError("User not found");
      return user;
    },

    getByUsername: async (username: string) => {
      const user = await prisma.user.findUnique({ where: { username } });
      if (!user) throw new NotFoundError("User not found");
      return user;
    },

    update: (id: string, data: { username?: string; firstName?: string; lastName?: string; wcaId?: string | null; profilePictureUrl?: string | null; country?: string | null; bio?: string }) =>
      prisma.user.update({ where: { id }, data }),

    delete: (id: string) => prisma.user.delete({ where: { id } }),
  };
}
