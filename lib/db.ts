import { PrismaClient } from "@prisma/client";

/**
 * Global Prisma client singleton with safe DATABASE_URL handling
 * 
 * This module provides a centralized Prisma client that:
 * 1. Uses a singleton pattern to prevent multiple instances in dev (hot reload)
 * 2. Provides a fallback DATABASE_URL for environments without the env var
 * 3. Ensures Prisma works on Vercel without crashing at runtime
 */

// Determine the database URL with fallback for missing env var
const databaseUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create PrismaClient with explicit datasource URL
// This ensures the DATABASE_URL is always set, even if env var is missing
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

// Store in global for hot-reload protection in development
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
