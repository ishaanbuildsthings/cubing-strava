import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  await prisma.user.createMany({
    data: [
      {
        email: "max@example.com",
        username: "maxpark",
        firstName: "Max",
        lastName: "Park",
      },
      {
        email: "feliks@example.com",
        username: "feliks",
        firstName: "Feliks",
        lastName: "Zemdegs",
      },
      {
        email: "tymon@example.com",
        username: "tymon",
        firstName: "Tymon",
        lastName: "Kolasinski",
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seeded 3 users");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
