import { NextResponse } from "next/server";
import {
  checkDatabaseHealth,
  initializeDatabase,
  getDatabaseInfo,
} from "@/lib/db";
import { isVercelEnvironment } from "@/lib/db-url";

/**
 * GET /api/health/db
 *
 * Database health check endpoint
 * Returns database connectivity status and diagnostic information
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // Get database info (sanitized for security)
    const dbInfo = getDatabaseInfo();

    // Ensure database is initialized (especially important on Vercel)
    const initResult = await initializeDatabase();

    if (!initResult.success) {
      return NextResponse.json(
        {
          status: "error",
          database: "uninitialized",
          error: "Failed to initialize database",
          details: initResult.error,
          path: dbInfo.path,
          environment: isVercelEnvironment() ? "vercel" : "local",
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    // Check database connectivity
    const health = await checkDatabaseHealth();

    if (!health.connected) {
      return NextResponse.json(
        {
          status: "error",
          database: "disconnected",
          error: health.error,
          path: dbInfo.path,
          environment: isVercelEnvironment() ? "vercel" : "local",
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    // Database is healthy
    return NextResponse.json(
      {
        status: "ok",
        database: "connected",
        path: dbInfo.path,
        latencyMs: health.latencyMs,
        totalLatencyMs: Date.now() - startTime,
        initialized: initResult.initialized,
        seeded: initResult.seeded,
        environment: isVercelEnvironment() ? "vercel" : "local",
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          // Prevent caching of health checks
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    console.error("[Health Check] Unexpected error:", errorMessage);

    return NextResponse.json(
      {
        status: "error",
        database: "unknown",
        error: "Health check failed",
        details:
          process.env.NODE_ENV === "development"
            ? errorMessage
            : "Internal error",
        environment: isVercelEnvironment() ? "vercel" : "local",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
