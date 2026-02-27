import dotenv from "dotenv";
import { defineConfig, env } from "prisma/config";

// Next.js commonly uses `.env.local`. Prisma config env() only reads `process.env`,
// so we explicitly load `.env` + `.env.local` for CLI commands like `prisma migrate`.
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
