import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock must be defined before imports
vi.mock("@prisma/client", () => {
  const mockFindUnique = vi.fn();
  const mockUpdate = vi.fn();
  const mockCreate = vi.fn();
  const mockTransaction = vi.fn();
  const mockFindMany = vi.fn();

  return {
    PrismaClient: vi.fn().mockImplementation(() => ({
      supply: {
        findUnique: mockFindUnique,
        update: mockUpdate,
      },
      stockMovement: {
        create: mockCreate,
        findMany: mockFindMany,
      },
      $transaction: mockTransaction,
    })),
    // Export mocks for test access
    __mockFindUnique: mockFindUnique,
    __mockUpdate: mockUpdate,
    __mockCreate: mockCreate,
    __mockTransaction: mockTransaction,
    __mockFindMany: mockFindMany,
  };
});

// Import the mocked module to access the mocks
import * as PrismaModule from "@prisma/client";

// Get the mock functions
const mockFindUnique = (PrismaModule as unknown as { __mockFindUnique: ReturnType<typeof vi.fn> }).__mockFindUnique;
const mockUpdate = (PrismaModule as unknown as { __mockUpdate: ReturnType<typeof vi.fn> }).__mockUpdate;
const mockCreate = (PrismaModule as unknown as { __mockCreate: ReturnType<typeof vi.fn> }).__mockCreate;
const mockTransaction = (PrismaModule as unknown as { __mockTransaction: ReturnType<typeof vi.fn> }).__mockTransaction;
const mockFindMany = (PrismaModule as unknown as { __mockFindMany: ReturnType<typeof vi.fn> }).__mockFindMany;

// Import the service after mocking
import {
  createStockMovement,
  InsufficientStockError,
  SupplyNotFoundError,
  getStockMovementsBySupplyId,
} from "@/lib/services/stock-movements";
import { StockMovementType } from "@/lib/validations/stock-movements";

describe("createStockMovement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an IN movement and increases supply stock", async () => {
    const mockSupply = {
      id: "supply-1",
      name: "Gloves",
      code: "SUP-001",
      quantity: 100,
      minStock: 20,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockMovement = {
      id: "movement-1",
      supplyId: "supply-1",
      type: "IN",
      quantity: 10,
      createdAt: new Date(),
    };

    const mockUpdatedSupply = {
      ...mockSupply,
      quantity: 110,
    };

    // Mock the transaction callback execution
    mockTransaction.mockImplementation(async (callback) => {
      mockFindUnique.mockResolvedValue(mockSupply);
      mockUpdate.mockResolvedValue(mockUpdatedSupply);
      mockCreate.mockResolvedValue(mockMovement);

      return callback({
        supply: {
          findUnique: mockFindUnique,
          update: mockUpdate,
        },
        stockMovement: {
          create: mockCreate,
        },
      });
    });

    const result = await createStockMovement({
      supplyId: "supply-1",
      type: StockMovementType.IN,
      quantity: 10,
    });

    expect(result.movement).toEqual(mockMovement);
    expect(result.supply.quantity).toBe(110);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "supply-1" },
      data: { quantity: 110 },
    });
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        supplyId: "supply-1",
        type: "IN",
        quantity: 10,
      },
    });
  });

  it("creates an OUT movement and decreases supply stock", async () => {
    const mockSupply = {
      id: "supply-1",
      name: "Gloves",
      code: "SUP-001",
      quantity: 100,
      minStock: 20,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockMovement = {
      id: "movement-1",
      supplyId: "supply-1",
      type: "OUT",
      quantity: 5,
      createdAt: new Date(),
    };

    const mockUpdatedSupply = {
      ...mockSupply,
      quantity: 95,
    };

    mockTransaction.mockImplementation(async (callback) => {
      mockFindUnique.mockResolvedValue(mockSupply);
      mockUpdate.mockResolvedValue(mockUpdatedSupply);
      mockCreate.mockResolvedValue(mockMovement);

      return callback({
        supply: {
          findUnique: mockFindUnique,
          update: mockUpdate,
        },
        stockMovement: {
          create: mockCreate,
        },
      });
    });

    const result = await createStockMovement({
      supplyId: "supply-1",
      type: StockMovementType.OUT,
      quantity: 5,
    });

    expect(result.movement).toEqual(mockMovement);
    expect(result.supply.quantity).toBe(95);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "supply-1" },
      data: { quantity: 95 },
    });
  });

  it("throws SupplyNotFoundError when supply does not exist", async () => {
    mockTransaction.mockImplementation(async (callback) => {
      mockFindUnique.mockResolvedValue(null);

      return callback({
        supply: {
          findUnique: mockFindUnique,
          update: mockUpdate,
        },
        stockMovement: {
          create: mockCreate,
        },
      });
    });

    await expect(
      createStockMovement({
        supplyId: "non-existent",
        type: StockMovementType.IN,
        quantity: 10,
      })
    ).rejects.toThrow(SupplyNotFoundError);
  });

  it("throws InsufficientStockError when OUT quantity exceeds current stock", async () => {
    const mockSupply = {
      id: "supply-1",
      name: "Gloves",
      code: "SUP-001",
      quantity: 10,
      minStock: 20,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockTransaction.mockImplementation(async (callback) => {
      mockFindUnique.mockResolvedValue(mockSupply);

      return callback({
        supply: {
          findUnique: mockFindUnique,
          update: mockUpdate,
        },
        stockMovement: {
          create: mockCreate,
        },
      });
    });

    await expect(
      createStockMovement({
        supplyId: "supply-1",
        type: StockMovementType.OUT,
        quantity: 15, // More than current stock of 10
      })
    ).rejects.toThrow(InsufficientStockError);

    // Ensure no update or create was called
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("allows OUT movement when quantity equals current stock (results in zero)", async () => {
    const mockSupply = {
      id: "supply-1",
      name: "Gloves",
      code: "SUP-001",
      quantity: 10,
      minStock: 20,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockMovement = {
      id: "movement-1",
      supplyId: "supply-1",
      type: "OUT",
      quantity: 10,
      createdAt: new Date(),
    };

    const mockUpdatedSupply = {
      ...mockSupply,
      quantity: 0,
    };

    mockTransaction.mockImplementation(async (callback) => {
      mockFindUnique.mockResolvedValue(mockSupply);
      mockUpdate.mockResolvedValue(mockUpdatedSupply);
      mockCreate.mockResolvedValue(mockMovement);

      return callback({
        supply: {
          findUnique: mockFindUnique,
          update: mockUpdate,
        },
        stockMovement: {
          create: mockCreate,
        },
      });
    });

    const result = await createStockMovement({
      supplyId: "supply-1",
      type: StockMovementType.OUT,
      quantity: 10,
    });

    expect(result.movement).toEqual(mockMovement);
    expect(result.supply.quantity).toBe(0);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "supply-1" },
      data: { quantity: 0 },
    });
  });

  it("handles IN movement with zero initial stock", async () => {
    const mockSupply = {
      id: "supply-1",
      name: "Gloves",
      code: "SUP-001",
      quantity: 0,
      minStock: 20,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockMovement = {
      id: "movement-1",
      supplyId: "supply-1",
      type: "IN",
      quantity: 50,
      createdAt: new Date(),
    };

    const mockUpdatedSupply = {
      ...mockSupply,
      quantity: 50,
    };

    mockTransaction.mockImplementation(async (callback) => {
      mockFindUnique.mockResolvedValue(mockSupply);
      mockUpdate.mockResolvedValue(mockUpdatedSupply);
      mockCreate.mockResolvedValue(mockMovement);

      return callback({
        supply: {
          findUnique: mockFindUnique,
          update: mockUpdate,
        },
        stockMovement: {
          create: mockCreate,
        },
      });
    });

    const result = await createStockMovement({
      supplyId: "supply-1",
      type: StockMovementType.IN,
      quantity: 50,
    });

    expect(result.movement).toEqual(mockMovement);
    expect(result.supply.quantity).toBe(50);
  });

  it("throws InsufficientStockError when stock is zero and OUT is attempted", async () => {
    const mockSupply = {
      id: "supply-1",
      name: "Gloves",
      code: "SUP-001",
      quantity: 0,
      minStock: 20,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockTransaction.mockImplementation(async (callback) => {
      mockFindUnique.mockResolvedValue(mockSupply);

      return callback({
        supply: {
          findUnique: mockFindUnique,
          update: mockUpdate,
        },
        stockMovement: {
          create: mockCreate,
        },
      });
    });

    await expect(
      createStockMovement({
        supplyId: "supply-1",
        type: StockMovementType.OUT,
        quantity: 1,
      })
    ).rejects.toThrow(InsufficientStockError);
  });

  it("uses $transaction for atomic operations", async () => {
    const mockSupply = {
      id: "supply-1",
      name: "Gloves",
      code: "SUP-001",
      quantity: 100,
      minStock: 20,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockTransaction.mockImplementation(async (callback) => {
      mockFindUnique.mockResolvedValue(mockSupply);
      mockUpdate.mockResolvedValue(mockSupply);
      mockCreate.mockResolvedValue({
        id: "movement-1",
        supplyId: "supply-1",
        type: "IN",
        quantity: 10,
        createdAt: new Date(),
      });

      return callback({
        supply: {
          findUnique: mockFindUnique,
          update: mockUpdate,
        },
        stockMovement: {
          create: mockCreate,
        },
      });
    });

    await createStockMovement({
      supplyId: "supply-1",
      type: StockMovementType.IN,
      quantity: 10,
    });

    expect(mockTransaction).toHaveBeenCalled();
  });
});

describe("getStockMovementsBySupplyId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls findMany with correct parameters", async () => {
    const mockMovements = [
      {
        id: "movement-1",
        supplyId: "supply-1",
        type: "IN",
        quantity: 10,
        createdAt: new Date(),
      },
    ];

    mockFindMany.mockResolvedValue(mockMovements);

    const result = await getStockMovementsBySupplyId("supply-1");

    expect(mockFindMany).toHaveBeenCalledWith({
      where: { supplyId: "supply-1" },
      orderBy: { createdAt: "desc" },
      take: undefined,
      skip: undefined,
    });
    expect(result).toEqual(mockMovements);
  });

  it("passes limit and offset options to findMany", async () => {
    const mockMovements = [
      {
        id: "movement-1",
        supplyId: "supply-1",
        type: "IN",
        quantity: 10,
        createdAt: new Date(),
      },
    ];

    mockFindMany.mockResolvedValue(mockMovements);

    await getStockMovementsBySupplyId("supply-1", { limit: 10, offset: 5 });

    expect(mockFindMany).toHaveBeenCalledWith({
      where: { supplyId: "supply-1" },
      orderBy: { createdAt: "desc" },
      take: 10,
      skip: 5,
    });
  });
});
