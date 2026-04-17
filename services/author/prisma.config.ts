import "dotenv/config";
import { defineConfig, env } from "prisma/config";

type AuthorPrismaEnv = {
  DB_URL: string;
};

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env<AuthorPrismaEnv>("DB_URL"),
  },
});