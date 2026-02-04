import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the db module with factory function
vi.mock("@/lib/db", () => {
  const mockFindMany = vi.fn();
  const mockCount = vi.fn();
  const mockCreate = vi.fn();

  return {
    prisma: {
      supply: {
        findMany: mockFindMany,
        count: mockCount,
        create: mockCreate,
      },
    },
    // Export mocks for test access
    __mockFindMany: mockFindMany,
    __mockCount: mockCount,
    __mockCreate: mockCreate,
  };
});

// Import the mocked module to access the mocks
import * as dbModule from "@/lib/db";

// Get the mock functions
const mockFindMany = (dbModule as unknown as { __mockFindMany: ReturnType<typeof vi.fn> }).__mockFindMany;
const mockCount = (dbModule as unknown as { __mockCount: ReturnType<typeof vi.fn> }).__mockCount;
const mockCreate = (dbModule as unknown as { __mockCreate: ReturnType<typeof vi.fn> }).__mockCreate;

// Import the service after mocking
import {
  searchSupplies,
  getSupplies,
  createSupply,
} from "@/lib/services/supplies";

describe("searchSupplies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all supplies when query is empty", async () => {
    const mockSupplies = [
      {
        id: "1",
        name: "Nitrile Gloves",
        category: "PPE",
        unit: "box",
        stock: 500,
        minimumStock: 100,
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
      orderBy: [{ name: "asc" }, { category: "asc" }],
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
        category: "PPE",
        unit: "box",
        stock: 500,
        minimumStock: 100,
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
          { category: { contains: "glove", mode: "insensitive" } },
        ],
      },
    });
    expect(result.supplies).toEqual(mockSupplies);
  });

  it("searches by category with partial match", async () => {
    const mockSupplies = [
      {
        id: "1",
        name: "Nitrile Gloves",
        category: "PPE",
        unit: "box",
        stock: 500,
        minimumStock: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockCount.mockResolvedValue(1);
    mockFindMany.mockResolvedValue(mockSupplies);

    const result = await searchSupplies({ query: "PPE" });

    expect(mockCount).toHaveBeenCalledWith({
      where: {
        OR: [
          { name: { contains: "PPE", mode: "insensitive" } },
          { category: { contains: "PPE", mode: "insensitive" } },
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
      orderBy: [{ name: "asc" }, { category: "asc" }],
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
          { category: { contains: "gloves", mode: "insensitive" } },
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

describe("getSupplies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all supplies with pagination", async () => {
    const mockSupplies = [
      {
        id: "1",
        name: "Nitrile Gloves",
        category: "PPE",
        unit: "box",
        stock: 500,
        minimumStock: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        name: "Dental Masks",
        category: "PPE",
        unit: "box",
        stock: 1000,
        minimumStock: 200,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockCount.mockResolvedValue(2);
    mockFindMany.mockResolvedValue(mockSupplies);

    const result = await getSupplies(1, 20);

    expect(mockCount).toHaveBeenCalledWith();
    expect(mockFindMany).toHaveBeenCalledWith({
      orderBy: [{ name: "asc" }, { category: "asc" }],
      skip: 0,
      take: 20,
    });
    expect(result.supplies).toEqual(mockSupplies);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("handles pagination parameters correctly", async () => {
    mockCount.mockResolvedValue(50);
    mockFindMany.mockResolvedValue([]);

    const result = await getSupplies(2, 10);

    expect(mockFindMany).toHaveBeenCalledWith({
      orderBy: [{ name: "asc" }, { category: "asc" }],
      skip: 10,
      take: 10,
    });
    expect(result.page).toBe(2);
    expect(result.totalPages).toBe(5);
  });
});

describe("createSupply", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a new supply with all fields", async () => {
    const input = {
      name: "Test Supply",
      category: "Test Category",
      unit: "piece",
      stock: 100,
      minimumStock: 20,
    };

    const mockSupply = {
      id: "test-id",
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockCreate.mockResolvedValue(mockSupply);

    const result = await createSupply(input);

    expect(mockCreate).toHaveBeenCalledWith({
      data: input,
    });
    expect(result).toEqual(mockSupply);
  });

  it("creates a supply with default values for optional fields", async () => {
    const input = {
      name: "Test Supply",
      category: "Test Category",
      unit: "piece",
    };

    const mockSupply = {
      id: "test-id",
      name: "Test Supply",
      category: "Test Category",
      unit: "piece",
      stock: 0,
      minimumStock: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockCreate.mockResolvedValue(mockSupply);

    const result = await createSupply(input);

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        name: "Test Supply",
        category: "Test Category",
        unit: "piece",
        stock: 0,
        minimumStock: 0,
      },
    });
    expect(result.stock).toBe(0);
    expect(result.minimumStock).toBe(0);
  });

  it("creates a supply with partial optional fields", async () => {
    const input = {
      name: "Test Supply",
      category: "Test Category",
      unit: "box",
      stock: 50,
    };

    const mockSupply = {
      id: "test-id",
      name: "Test Supply",
      category: "Test Category",
      unit: "box",
      stock: 50,
      minimumStock: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockCreate.mockResolvedValue(mockSupply);

    const result = await createSupply(input);

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        name: "Test Supply",
        category: "Test Category",
        unit: "box",
        stock: 50,
        minimumStock: 0,
      },
    });
    expect(result.stock).toBe(50);
    expect(result.minimumStock).toBe(0);
  });
});
