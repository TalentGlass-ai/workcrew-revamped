import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Reads DATABASE_URL from .env — defaults to SQLite for local dev.
    // For Postgres: set DATABASE_URL=postgresql://... and change schema provider to "postgresql".
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  },
});
