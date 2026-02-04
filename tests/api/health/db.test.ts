import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/health/db/route";

// Mock the db module
const mockInitializeDatabase = vi.fn();
const mockCheckDatabaseHealth = vi.fn();
const mockGetDatabaseInfo = vi.fn();
const mockIsVercelEnvironment = vi.fn();

vi.mock("@/lib/db", () => ({
  initializeDatabase: (...args: unknown[]) => mockInitializeDatabase(...args),
  checkDatabaseHealth: (...args: unknown[]) => mockCheckDatabaseHealth(...args),
  getDatabaseInfo: (...args: unknown[]) => mockGetDatabaseInfo(...args),
}));

vi.mock("@/lib/db-url", () => ({
  isVercelEnvironment: () => mockIsVercelEnvironment(),
}));

describe("GET /api/health/db", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsVercelEnvironment.mockReturnValue(false);
  });

  it("returns ok when database is connected and initialized", async () => {
    mockInitializeDatabase.mockResolvedValue({
      success: true,
      initialized: false,
      seeded: false,
    });
    mockCheckDatabaseHealth.mockResolvedValue({
      connected: true,
      latencyMs: 5,
    });
    mockGetDatabaseInfo.mockReturnValue({
      url: "file:[REDACTED]",
      path: "./prisma/dev.db",
      valid: true,
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("ok");
    expect(data.database).toBe("connected");
    expect(data.path).toBe("./prisma/dev.db");
    expect(data.environment).toBe("local");
    expect(data.latencyMs).toBe(5);
    expect(data.timestamp).toBeDefined();
  });

  it("returns initialized=true when database was just initialized", async () => {
    mockInitializeDatabase.mockResolvedValue({
      success: true,
      initialized: true,
      seeded: true,
    });
    mockCheckDatabaseHealth.mockResolvedValue({
      connected: true,
      latencyMs: 10,
    });
    mockGetDatabaseInfo.mockReturnValue({
      url: "file:[REDACTED]",
      path: "stock.db",
      valid: true,
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.initialized).toBe(true);
    expect(data.seeded).toBe(true);
  });

  it("returns 503 when database initialization fails", async () => {
    mockInitializeDatabase.mockResolvedValue({
      success: false,
      initialized: false,
      seeded: false,
      error: "Permission denied",
    });
    mockGetDatabaseInfo.mockReturnValue({
      url: "file:[REDACTED]",
      path: "stock.db",
      valid: true,
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe("error");
    expect(data.database).toBe("uninitialized");
    expect(data.error).toBe("Failed to initialize database");
    expect(data.details).toBe("Permission denied");
  });

  it("returns 503 when database is disconnected", async () => {
    mockInitializeDatabase.mockResolvedValue({
      success: true,
      initialized: false,
      seeded: false,
    });
    mockCheckDatabaseHealth.mockResolvedValue({
      connected: false,
      error: "Unable to open the database file",
    });
    mockGetDatabaseInfo.mockReturnValue({
      url: "file:[REDACTED]",
      path: "dev.db",
      valid: true,
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe("error");
    expect(data.database).toBe("disconnected");
    expect(data.error).toBe("Unable to open the database file");
  });

  it("returns environment=vercel when on Vercel", async () => {
    mockIsVercelEnvironment.mockReturnValue(true);
    mockInitializeDatabase.mockResolvedValue({
      success: true,
      initialized: false,
      seeded: false,
    });
    mockCheckDatabaseHealth.mockResolvedValue({
      connected: true,
      latencyMs: 3,
    });
    mockGetDatabaseInfo.mockReturnValue({
      url: "file:[REDACTED]",
      path: "stock.db",
      valid: true,
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.environment).toBe("vercel");
  });

  it("returns 500 on unexpected error", async () => {
    mockInitializeDatabase.mockRejectedValue(new Error("Unexpected error"));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.status).toBe("error");
    expect(data.database).toBe("unknown");
    expect(data.error).toBe("Health check failed");
  });

  it("includes cache-control headers to prevent caching", async () => {
    mockInitializeDatabase.mockResolvedValue({
      success: true,
      initialized: false,
      seeded: false,
    });
    mockCheckDatabaseHealth.mockResolvedValue({
      connected: true,
      latencyMs: 5,
    });
    mockGetDatabaseInfo.mockReturnValue({
      url: "file:[REDACTED]",
      path: "./prisma/dev.db",
      valid: true,
    });

    const response = await GET();

    expect(response.headers.get("Cache-Control")).toContain("no-store");
  });
});
