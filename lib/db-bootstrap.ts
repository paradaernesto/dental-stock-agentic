import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import {
  getDatabaseUrl,
  getDbDirectory,
  extractDbFilePath,
  isVercelEnvironment,
} from "./db-url";

/**
 * Database bootstrap utilities
 *
 * This module handles database initialization for serverless environments
 * where the database needs to be set up on the first request.
 */

// Sample supplies for seeding (subset of prisma/seed.ts for lightweight Vercel deploy)
const sampleSupplies = [
  {
    name: "Nitrile Gloves",
    code: "SUP-001",
    description: "Blue nitrile examination gloves, powder-free",
    quantity: 500,
    minStock: 100,
  },
  {
    name: "Dental Masks",
    code: "SUP-002",
    description: "Surgical masks with ear loops, 3-ply",
    quantity: 1000,
    minStock: 200,
  },
  {
    name: "Dental Bibs",
    code: "SUP-003",
    description: "Patient bibs, 2-ply paper + 1-ply poly",
    quantity: 2000,
    minStock: 500,
  },
  {
    name: "Composite Resin",
    code: "SUP-004",
    description: "Universal composite resin, shade A2",
    quantity: 25,
    minStock: 10,
  },
  {
    name: "Anesthetic Cartridges",
    code: "SUP-005",
    description: "Lidocaine 2% with epinephrine 1:100,000",
    quantity: 200,
    minStock: 50,
  },
];

/**
 * Ensure the database parent directory exists
 * Creates the directory if it doesn't exist (for local development)
 * On Vercel, /tmp always exists so this is a no-op
 */
export function ensureDbDirectory(databaseUrl?: string): void {
  const url = databaseUrl ?? getDatabaseUrl();
  const dirPath = getDbDirectory(url);

  // /tmp always exists on Vercel, skip
  if (dirPath === "/tmp") {
    return;
  }

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Check if the database file exists
 */
export function databaseFileExists(databaseUrl?: string): boolean {
  const url = databaseUrl ?? getDatabaseUrl();
  const filePath = extractDbFilePath(url);
  return fs.existsSync(filePath);
}

/**
 * Check if the database is initialized by querying for tables
 * This is more reliable than checking if the file exists (file may exist but be empty)
 */
export async function isDatabaseInitialized(
  prisma: PrismaClient
): Promise<boolean> {
  try {
    // Try to count supplies - this will fail if tables don't exist
    await prisma.supply.count();
    return true;
  } catch {
    return false;
  }
}

/**
 * Initialize database schema using Prisma's db push
 * This creates tables without running full migrations (faster for serverless)
 */
export async function initializeSchema(prisma: PrismaClient): Promise<void> {
  try {
    // Execute raw SQL to create tables based on schema
    // This is a lightweight alternative to running prisma db push at runtime

    // Create Supply table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS Supply (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE,
        description TEXT,
        quantity INTEGER NOT NULL DEFAULT 0,
        minStock INTEGER NOT NULL DEFAULT 0,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create index on Supply.name
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_supply_name ON Supply(name)
    `;

    // Create index on Supply.code
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_supply_code ON Supply(code)
    `;

    // Create StockMovement table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS StockMovement (
        id TEXT PRIMARY KEY,
        supplyId TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('IN', 'OUT')),
        quantity INTEGER NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (supplyId) REFERENCES Supply(id) ON DELETE CASCADE
      )
    `;

    // Create index on StockMovement.supplyId
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_stockmovement_supplyId ON StockMovement(supplyId)
    `;

    // Create index on StockMovement.createdAt
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_stockmovement_createdAt ON StockMovement(createdAt)
    `;
  } catch (error) {
    console.error("Failed to initialize database schema:", error);
    throw new Error(
      `Database schema initialization failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Seed the database with sample data
 */
export async function seedDatabase(prisma: PrismaClient): Promise<void> {
  try {
    // Check if already has data
    const count = await prisma.supply.count();
    if (count > 0) {
      return; // Already seeded
    }

    // Insert sample supplies
    for (const supply of sampleSupplies) {
      await prisma.supply.create({
        data: supply,
      });
    }

    console.log(`[DB Bootstrap] Seeded ${sampleSupplies.length} supplies`);
  } catch (error) {
    console.error("Failed to seed database:", error);
    throw new Error(
      `Database seeding failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Full database bootstrap process
 * Ensures directory exists, initializes schema, and seeds data if needed
 *
 * This should be called before the first database query in serverless environments
 */
export async function bootstrapDatabase(
  prisma: PrismaClient
): Promise<{ initialized: boolean; seeded: boolean }> {
  // Ensure directory exists
  ensureDbDirectory();

  // Check if already initialized
  const isInitialized = await isDatabaseInitialized(prisma);
  if (isInitialized) {
    return { initialized: false, seeded: false };
  }

  // Initialize schema
  await initializeSchema(prisma);

  // Seed with sample data
  await seedDatabase(prisma);

  return { initialized: true, seeded: true };
}

/**
 * Check if bootstrap is needed (for Vercel environment)
 * In local development, migrations should be run manually
 */
export function shouldAutoBootstrap(): boolean {
  // Only auto-bootstrap on Vercel serverless
  return isVercelEnvironment();
}

/**
 * Safely run bootstrap if needed
 * This is a no-op in local development (where migrations should be run manually)
 * On Vercel, it initializes the database automatically
 */
export async function ensureDatabase(
  prisma: PrismaClient
): Promise<{ initialized: boolean; seeded: boolean }> {
  if (!shouldAutoBootstrap()) {
    // In local dev, just ensure directory exists
    ensureDbDirectory();
    return { initialized: false, seeded: false };
  }

  // On Vercel, run full bootstrap
  return bootstrapDatabase(prisma);
}
