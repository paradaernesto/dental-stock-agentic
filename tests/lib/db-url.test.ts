import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isVercelEnvironment,
  getBaseDatabaseUrl,
  extractDbFilePath,
  getDbDirectory,
  getSanitizedDbPath,
  getDatabaseUrl,
  isInMemoryDatabase,
  validateDatabaseUrl,
} from "@/lib/db-url";

describe("db-url", () => {
  beforeEach(() => {
    // Reset specific environment variables before each test
    vi.unstubAllEnvs();
    delete process.env.VERCEL;
    delete process.env.DATABASE_URL;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("isVercelEnvironment", () => {
    it("returns true when VERCEL=1", () => {
      vi.stubEnv("VERCEL", "1");
      expect(isVercelEnvironment()).toBe(true);
    });

    it("returns false when VERCEL is not set", () => {
      delete process.env.VERCEL;
      expect(isVercelEnvironment()).toBe(false);
    });

    it("returns false when VERCEL has other values", () => {
      vi.stubEnv("VERCEL", "0");
      expect(isVercelEnvironment()).toBe(false);

      vi.stubEnv("VERCEL", "true");
      expect(isVercelEnvironment()).toBe(false);
    });
  });

  describe("getBaseDatabaseUrl", () => {
    it("returns DATABASE_URL from environment when set", () => {
      vi.stubEnv("DATABASE_URL", "file:/custom/path.db");
      expect(getBaseDatabaseUrl()).toBe("file:/custom/path.db");
    });

    it("returns Vercel path when VERCEL=1 and no DATABASE_URL", () => {
      vi.stubEnv("VERCEL", "1");
      delete process.env.DATABASE_URL;
      expect(getBaseDatabaseUrl()).toBe("file:/tmp/stock.db");
    });

    it("returns local development path when not on Vercel", () => {
      delete process.env.VERCEL;
      delete process.env.DATABASE_URL;
      expect(getBaseDatabaseUrl()).toBe("file:./prisma/dev.db");
    });
  });

  describe("extractDbFilePath", () => {
    it("extracts path from file:./relative/path", () => {
      const result = extractDbFilePath("file:./prisma/dev.db");
      expect(result).toContain("prisma");
      expect(result).toContain("dev.db");
    });

    it("extracts path from file:/absolute/path", () => {
      const result = extractDbFilePath("file:/tmp/stock.db");
      expect(result).toBe("/tmp/stock.db");
    });

    it("handles paths with multiple slashes", () => {
      const result = extractDbFilePath("file:///tmp/stock.db");
      expect(result).toBe("///tmp/stock.db");
    });
  });

  describe("getDbDirectory", () => {
    it("returns parent directory for file path", () => {
      const result = getDbDirectory("file:/tmp/stock.db");
      expect(result).toBe("/tmp");
    });

    it("returns parent directory for relative path", () => {
      const result = getDbDirectory("file:./prisma/dev.db");
      expect(result).toContain("prisma");
    });
  });

  describe("getSanitizedDbPath", () => {
    it("returns basename in production", () => {
      vi.stubEnv("NODE_ENV", "production");
      const result = getSanitizedDbPath("file:/tmp/stock.db");
      expect(result).toBe("stock.db");
    });

    it("returns basename on Vercel", () => {
      vi.stubEnv("VERCEL", "1");
      const result = getSanitizedDbPath("file:/tmp/stock.db");
      expect(result).toBe("stock.db");
    });

    it("returns relative path in development", () => {
      vi.stubEnv("NODE_ENV", "development");
      delete process.env.VERCEL;
      const result = getSanitizedDbPath("file:./prisma/dev.db");
      expect(result).toBe("./prisma/dev.db");
    });
  });

  describe("getDatabaseUrl", () => {
    it("is an alias for getBaseDatabaseUrl", () => {
      vi.stubEnv("DATABASE_URL", "file:/test.db");
      expect(getDatabaseUrl()).toBe(getBaseDatabaseUrl());
    });
  });

  describe("isInMemoryDatabase", () => {
    it("returns true for :memory:", () => {
      expect(isInMemoryDatabase("file::memory:")).toBe(true);
    });

    it("returns true for mode=memory", () => {
      expect(isInMemoryDatabase("file:test.db?mode=memory")).toBe(true);
    });

    it("returns false for regular file paths", () => {
      expect(isInMemoryDatabase("file:./dev.db")).toBe(false);
      expect(isInMemoryDatabase("file:/tmp/stock.db")).toBe(false);
    });
  });

  describe("validateDatabaseUrl", () => {
    it("returns valid=false for empty string", () => {
      const result = validateDatabaseUrl("");
      expect(result.valid).toBe(false);
      expect(result.error).toBe("DATABASE_URL is not set");
    });

    it("returns valid=false for non-file URLs", () => {
      const result = validateDatabaseUrl("postgres://localhost/db");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("must start with 'file:'");
    });

    it("returns valid=true for file URLs", () => {
      const result = validateDatabaseUrl("file:./dev.db");
      expect(result.valid).toBe(true);
    });

    it("returns valid=true for in-memory databases", () => {
      const result = validateDatabaseUrl("file::memory:");
      expect(result.valid).toBe(true);
    });

    it("returns valid=false for empty path", () => {
      const result = validateDatabaseUrl("file:");
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Invalid database file path");
    });
  });
});
