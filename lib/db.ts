import { PrismaClient, Prisma } from "@prisma/client";
import {
  getDatabaseUrl,
  validateDatabaseUrl,
  getSanitizedDbPath,
} from "./db-url";
import { ensureDbDirectory, ensureDatabase } from "./db-bootstrap";

/**
 * Global Prisma client singleton with safe DATABASE_URL handling
 *
 * This module provides a centralized Prisma client that:
 * 1. Uses a singleton pattern to prevent multiple instances in dev (hot reload)
 * 2. Provides environment-aware DATABASE_URL (local vs Vercel)
 * 3. Ensures parent directory exists before connection
 * 4. Auto-initializes database on Vercel serverless
 * 5. Provides clear error messages for connection failures
 */

// Get the resolved database URL based on environment
const databaseUrl = getDatabaseUrl();

// Validate the database URL format
const validation = validateDatabaseUrl(databaseUrl);
if (!validation.valid) {
  console.error(`[Prisma] Invalid DATABASE_URL: ${validation.error}`);
}

// Ensure parent directory exists before Prisma tries to connect
ensureDbDirectory(databaseUrl);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create PrismaClient with explicit datasource URL
// This ensures the DATABASE_URL is always set correctly
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    // Log queries in development for debugging
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

// Store in global for hot-reload protection in development
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Initialize the database if needed (for serverless environments)
 * Call this in API routes before first database query
 */
export async function initializeDatabase(): Promise<{
  success: boolean;
  initialized: boolean;
  seeded: boolean;
  error?: string;
}> {
  try {
    const result = await ensureDatabase(prisma);
    return {
      success: true,
      initialized: result.initialized,
      seeded: result.seeded,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    console.error("[Prisma] Database initialization failed:", errorMessage);
    return {
      success: false,
      initialized: false,
      seeded: false,
      error: errorMessage,
    };
  }
}

/**
 * Check if Prisma is connected and database is accessible
 */
export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  error?: string;
  latencyMs?: number;
}> {
  const startTime = Date.now();

  try {
    // Try a simple query to verify connection
    await prisma.$queryRaw`SELECT 1`;

    return {
      connected: true,
      latencyMs: Date.now() - startTime,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    return {
      connected: false,
      error: errorMessage,
    };
  }
}

/**
 * Get sanitized database info for logging/health checks
 * Safe to expose in API responses (doesn't leak full paths)
 */
export function getDatabaseInfo(): {
  url: string;
  path: string;
  valid: boolean;
} {
  return {
    url: databaseUrl.replace(/\/[^/]+$/, "/[REDACTED]"),
    path: getSanitizedDbPath(databaseUrl),
    valid: validation.valid,
  };
}

/**
 * Check if an error is a Prisma initialization error
 * Used for detecting "Unable to open database file" errors
 */
export function isPrismaInitializationError(
  error: unknown
): error is Prisma.PrismaClientInitializationError {
  return (
    error instanceof Prisma.PrismaClientInitializationError ||
    (error instanceof Error &&
      error.name === "PrismaClientInitializationError")
  );
}

/**
 * Check if an error is a Prisma connection error
 */
export function isPrismaConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const connectionErrors = [
    "Can't reach database server",
    "Connection refused",
    "Connection timed out",
    "Unable to open the database file",
    "database is locked",
    "disk I/O error",
  ];

  return connectionErrors.some((msg) =>
    error.message.toLowerCase().includes(msg.toLowerCase())
  );
}

/**
 * Format database error for API response
 * Returns safe error message without exposing sensitive paths
 */
export function formatDatabaseError(error: unknown): {
  error: string;
  details: string;
  code?: string;
} {
  if (isPrismaInitializationError(error)) {
    return {
      error: "Database unavailable",
      details:
        "Unable to open database at configured path. Please check database configuration.",
      code: "DB_INIT_ERROR",
    };
  }

  if (isPrismaConnectionError(error)) {
    return {
      error: "Database connection failed",
      details: "Could not connect to the database. Please try again later.",
      code: "DB_CONNECTION_ERROR",
    };
  }

  // Generic error - don't expose internal details
  return {
    error: "Database error",
    details: "An unexpected database error occurred. Please try again later.",
    code: "DB_ERROR",
  };
}
