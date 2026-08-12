import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // PostgreSQL — set DATABASE_URL=postgresql://... in .env
    url: process.env.DATABASE_URL,
  },
});
