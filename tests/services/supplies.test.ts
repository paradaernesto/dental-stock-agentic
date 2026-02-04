import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock must be defined before imports
vi.mock("@prisma/client", () => {
  const mockFindMany = vi.fn();
  const mockCount = vi.fn();
  
  return {
    PrismaClient: vi.fn().mockImplementation(() => ({
      supply: {
        findMany: mockFindMany,
        count: mockCount,
      },
    })),
    // Export mocks for test access
    __mockFindMany: mockFindMany,
    __mockCount: mockCount,
  };
});

// Import the mocked module to access the mocks
import * as PrismaModule from "@prisma/client";

// Get the mock functions
const mockFindMany = (PrismaModule as unknown as { __mockFindMany: ReturnType<typeof vi.fn> }).__mockFindMany;
const mockCount = (PrismaModule as unknown as { __mockCount: ReturnType<typeof vi.fn> }).__mockCount;

// Import the service after mocking
import { searchSupplies } from "@/lib/services/supplies";

describe("searchSupplies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all supplies when query is empty", async () => {
    const mockSupplies = [
      {
        id: "1",
        name: "Gloves",
        code: "SUP-001",
        description: "Nitrile gloves",
        quantity: 100,
        minStock: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockCount.mockResolvedValue(1);
    mockFindMany.mockResolvedValue(mockSupplies);

    const result = await searchSupplies({ query: "" });

    expect(mockCount).toHaveBeenCalledWith({ where: {} });
    expect(mockFindMany).toHaveBeenCalledWith({
      where: {},
      orderBy: [{ name: "asc" }, { code: "asc" }],
      skip: 0,
      take: 20,
    });
    expect(result.supplies).toEqual(mockSupplies);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("searches by name with case-insensitive partial match", async () => {
    const mockSupplies = [
      {
        id: "1",
        name: "Nitrile Gloves",
        code: "SUP-001",
        description: "Blue nitrile gloves",
        quantity: 100,
        minStock: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockCount.mockResolvedValue(1);
    mockFindMany.mockResolvedValue(mockSupplies);

    const result = await searchSupplies({ query: "glove" });

    expect(mockCount).toHaveBeenCalledWith({
      where: {
        OR: [
          { name: { contains: "glove", mode: "insensitive" } },
          { code: { contains: "glove", mode: "insensitive" } },
        ],
      },
    });
    expect(result.supplies).toEqual(mockSupplies);
  });

  it("searches by code with partial match", async () => {
    const mockSupplies = [
      {
        id: "1",
        name: "Gloves",
        code: "SUP-001",
        description: null,
        quantity: 100,
        minStock: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockCount.mockResolvedValue(1);
    mockFindMany.mockResolvedValue(mockSupplies);

    const result = await searchSupplies({ query: "SUP-001" });

    expect(mockCount).toHaveBeenCalledWith({
      where: {
        OR: [
          { name: { contains: "SUP-001", mode: "insensitive" } },
          { code: { contains: "SUP-001", mode: "insensitive" } },
        ],
      },
    });
    expect(result.supplies).toEqual(mockSupplies);
  });

  it("handles pagination correctly", async () => {
    mockCount.mockResolvedValue(50);
    mockFindMany.mockResolvedValue([]);

    const result = await searchSupplies({ query: "", page: 2, limit: 10 });

    expect(mockFindMany).toHaveBeenCalledWith({
      where: {},
      orderBy: [{ name: "asc" }, { code: "asc" }],
      skip: 10, // (page - 1) * limit = (2-1) * 10 = 10
      take: 10,
    });
    expect(result.page).toBe(2);
    expect(result.totalPages).toBe(5);
  });

  it("trims whitespace from query", async () => {
    mockCount.mockResolvedValue(0);
    mockFindMany.mockResolvedValue([]);

    await searchSupplies({ query: "  gloves  " });

    expect(mockCount).toHaveBeenCalledWith({
      where: {
        OR: [
          { name: { contains: "gloves", mode: "insensitive" } },
          { code: { contains: "gloves", mode: "insensitive" } },
        ],
      },
    });
  });

  it("calculates totalPages correctly", async () => {
    mockCount.mockResolvedValue(25);
    mockFindMany.mockResolvedValue([]);

    const result = await searchSupplies({ query: "", limit: 10 });

    expect(result.totalPages).toBe(3); // Math.ceil(25/10) = 3
  });
});
