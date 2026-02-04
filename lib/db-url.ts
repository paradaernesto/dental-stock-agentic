import path from "path";

/**
 * Environment-aware database URL resolver
 *
 * This module provides database URL normalization based on the runtime environment:
 * - Local development: Uses file:./prisma/dev.db (relative to project root)
 * - Vercel serverless: Uses file:/tmp/stock.db (writable ephemeral storage)
 *
 * Vercel's serverless functions have a read-only filesystem except for /tmp,
 * which is ephemeral and cleared between invocations.
 */

/**
 * Detect if running on Vercel serverless environment
 * Uses process.env.VERCEL which is set to "1" on Vercel
 */
export function isVercelEnvironment(): boolean {
  return process.env.VERCEL === "1";
}

/**
 * Get the base database URL based on environment
 */
export function getBaseDatabaseUrl(): string {
  // Use environment variable if explicitly set
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // Default based on environment
  if (isVercelEnvironment()) {
    return "file:/tmp/stock.db";
  }

  return "file:./prisma/dev.db";
}

/**
 * Extract the file path from a SQLite database URL
 * Handles both "file:./relative/path" and "file:/absolute/path" formats
 */
export function extractDbFilePath(databaseUrl: string): string {
  // Remove the "file:" prefix
  const pathPart = databaseUrl.replace(/^file:/, "");

  // Handle relative paths (starting with ./ or ../)
  if (pathPart.startsWith("./") || pathPart.startsWith("../")) {
    return path.resolve(process.cwd(), pathPart);
  }

  // Absolute path
  return pathPart;
}

/**
 * Get the directory containing the database file
 */
export function getDbDirectory(databaseUrl: string): string {
  const filePath = extractDbFilePath(databaseUrl);
  return path.dirname(filePath);
}

/**
 * Get a sanitized (safe to expose) version of the database path
 * Shows only the filename in production, full path in development
 */
export function getSanitizedDbPath(databaseUrl: string): string {
  const filePath = extractDbFilePath(databaseUrl);

  // In production/Vercel, only show the basename for security
  if (process.env.NODE_ENV === "production" || isVercelEnvironment()) {
    return path.basename(filePath);
  }

  // In development, show relative path from project root
  const cwd = process.cwd();
  if (filePath.startsWith(cwd)) {
    return "." + filePath.slice(cwd.length);
  }

  return filePath;
}

/**
 * Get the fully resolved database URL with environment-aware defaults
 * This is the main function to use when configuring Prisma
 */
export function getDatabaseUrl(): string {
  return getBaseDatabaseUrl();
}

/**
 * Check if the database URL is using an in-memory database
 */
export function isInMemoryDatabase(databaseUrl: string): boolean {
  return databaseUrl.includes(":memory:") || databaseUrl.includes("mode=memory");
}

/**
 * Validate that the database URL format is correct for SQLite
 */
export function validateDatabaseUrl(databaseUrl: string): {
  valid: boolean;
  error?: string;
} {
  if (!databaseUrl) {
    return { valid: false, error: "DATABASE_URL is not set" };
  }

  if (!databaseUrl.startsWith("file:")) {
    return { valid: false, error: "SQLite DATABASE_URL must start with 'file:'" };
  }

  if (isInMemoryDatabase(databaseUrl)) {
    return { valid: true };
  }

  const filePath = extractDbFilePath(databaseUrl);
  if (!filePath) {
    return { valid: false, error: "Invalid database file path" };
  }

  return { valid: true };
}
