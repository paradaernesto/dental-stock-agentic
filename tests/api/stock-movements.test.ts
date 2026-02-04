import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, GET } from "@/app/api/stock-movements/route";
import { NextRequest } from "next/server";
import { InsufficientStockError, SupplyNotFoundError } from "@/lib/services/stock-movements";

// Mock the stock-movements service
const mockCreateStockMovement = vi.fn();
const mockGetStockMovementsBySupplyId = vi.fn();

vi.mock("@/lib/services/stock-movements", () => ({
  createStockMovement: (...args: unknown[]) => mockCreateStockMovement(...args),
  getStockMovementsBySupplyId: (...args: unknown[]) => mockGetStockMovementsBySupplyId(...args),
  InsufficientStockError: class InsufficientStockError extends Error {
    constructor(message: string = "Insufficient stock") {
      super(message);
      this.name = "InsufficientStockError";
    }
  },
  SupplyNotFoundError: class SupplyNotFoundError extends Error {
    constructor(message: string = "Supply not found") {
      super(message);
      this.name = "SupplyNotFoundError";
    }
  },
}));

function createPostRequest(body: object): NextRequest {
  return new NextRequest("http://localhost/api/stock-movements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function createGetRequest(supplyId?: string): NextRequest {
  const url = supplyId
    ? `http://localhost/api/stock-movements?supplyId=${supplyId}`
    : "http://localhost/api/stock-movements";
  return new NextRequest(url, {
    method: "GET",
  });
}

describe("POST /api/stock-movements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createRequest(body: object): NextRequest {
    return createPostRequest(body);
  }

  it("returns 201 with movement data for successful IN movement", async () => {
    const mockMovement = {
      id: "movement-1",
      supplyId: "supply-1",
      type: "IN",
      quantity: 10,
      createdAt: new Date().toISOString(),
    };

    const mockSupply = {
      id: "supply-1",
      name: "Gloves",
      code: "SUP-001",
      quantity: 110,
    };

    mockCreateStockMovement.mockResolvedValue({
      movement: mockMovement,
      supply: mockSupply,
    });

    const request = createRequest({
      supplyId: "supply-1",
      type: "IN",
      quantity: 10,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.movement).toEqual(mockMovement);
    expect(data.supply.quantity).toBe(110);
    expect(mockCreateStockMovement).toHaveBeenCalledWith({
      supplyId: "supply-1",
      type: "IN",
      quantity: 10,
    });
  });

  it("returns 201 with movement data for successful OUT movement", async () => {
    const mockMovement = {
      id: "movement-1",
      supplyId: "supply-1",
      type: "OUT",
      quantity: 5,
      createdAt: new Date().toISOString(),
    };

    const mockSupply = {
      id: "supply-1",
      name: "Gloves",
      code: "SUP-001",
      quantity: 95,
    };

    mockCreateStockMovement.mockResolvedValue({
      movement: mockMovement,
      supply: mockSupply,
    });

    const request = createRequest({
      supplyId: "supply-1",
      type: "OUT",
      quantity: 5,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.movement).toEqual(mockMovement);
    expect(data.supply.quantity).toBe(95);
  });

  it("returns 400 when OUT quantity exceeds current stock", async () => {
    mockCreateStockMovement.mockRejectedValue(new InsufficientStockError());

    const request = createRequest({
      supplyId: "supply-1",
      type: "OUT",
      quantity: 100,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Insufficient stock");
  });

  it("returns 404 when supply does not exist", async () => {
    mockCreateStockMovement.mockRejectedValue(new SupplyNotFoundError());

    const request = createRequest({
      supplyId: "non-existent",
      type: "IN",
      quantity: 10,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Supply not found");
  });

  it("returns 400 for missing supplyId", async () => {
    const request = createRequest({
      type: "IN",
      quantity: 10,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid input");
    expect(data.details).toBeDefined();
    expect(data.details.supplyId).toBeDefined();
  });

  it("returns 400 for missing type", async () => {
    const request = createRequest({
      supplyId: "supply-1",
      quantity: 10,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid input");
    expect(data.details).toBeDefined();
    expect(data.details.type).toBeDefined();
  });

  it("returns 400 for missing quantity", async () => {
    const request = createRequest({
      supplyId: "supply-1",
      type: "IN",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid input");
    expect(data.details).toBeDefined();
    expect(data.details.quantity).toBeDefined();
  });

  it("returns 400 for invalid type", async () => {
    const request = createRequest({
      supplyId: "supply-1",
      type: "INVALID",
      quantity: 10,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid input");
    expect(data.details.type).toBeDefined();
  });

  it("returns 400 for negative quantity", async () => {
    const request = createRequest({
      supplyId: "supply-1",
      type: "IN",
      quantity: -5,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid input");
    expect(data.details.quantity).toBeDefined();
  });

  it("returns 400 for zero quantity", async () => {
    const request = createRequest({
      supplyId: "supply-1",
      type: "IN",
      quantity: 0,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid input");
    expect(data.details.quantity).toBeDefined();
  });

  it("returns 400 for non-integer quantity", async () => {
    const request = createRequest({
      supplyId: "supply-1",
      type: "IN",
      quantity: 10.5,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid input");
    expect(data.details.quantity).toBeDefined();
  });

  it("returns 400 for empty supplyId", async () => {
    const request = createRequest({
      supplyId: "",
      type: "IN",
      quantity: 10,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid input");
    expect(data.details.supplyId).toBeDefined();
  });

  it("returns 500 for unexpected errors", async () => {
    mockCreateStockMovement.mockRejectedValue(new Error("Database error"));

    const request = createRequest({
      supplyId: "supply-1",
      type: "IN",
      quantity: 10,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });

  it("accepts valid IN movement request", async () => {
    mockCreateStockMovement.mockResolvedValue({
      movement: {
        id: "movement-1",
        supplyId: "supply-1",
        type: "IN",
        quantity: 10,
        createdAt: new Date().toISOString(),
      },
      supply: {
        id: "supply-1",
        name: "Gloves",
        code: "SUP-001",
        quantity: 110,
      },
    });

    const request = createRequest({
      supplyId: "supply-1",
      type: "IN",
      quantity: 10,
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(mockCreateStockMovement).toHaveBeenCalledWith({
      supplyId: "supply-1",
      type: "IN",
      quantity: 10,
    });
  });

  it("accepts valid OUT movement request", async () => {
    mockCreateStockMovement.mockResolvedValue({
      movement: {
        id: "movement-1",
        supplyId: "supply-1",
        type: "OUT",
        quantity: 5,
        createdAt: new Date().toISOString(),
      },
      supply: {
        id: "supply-1",
        name: "Gloves",
        code: "SUP-001",
        quantity: 95,
      },
    });

    const request = createRequest({
      supplyId: "supply-1",
      type: "OUT",
      quantity: 5,
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(mockCreateStockMovement).toHaveBeenCalledWith({
      supplyId: "supply-1",
      type: "OUT",
      quantity: 5,
      reason: undefined,
    });
  });

  it("accepts movement request with reason field", async () => {
    mockCreateStockMovement.mockResolvedValue({
      movement: {
        id: "movement-1",
        supplyId: "supply-1",
        type: "IN",
        quantity: 10,
        reason: "Restocked from supplier",
        createdAt: new Date().toISOString(),
      },
      supply: {
        id: "supply-1",
        name: "Gloves",
        code: "SUP-001",
        quantity: 110,
      },
    });

    const request = createRequest({
      supplyId: "supply-1",
      type: "IN",
      quantity: 10,
      reason: "Restocked from supplier",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.movement.reason).toBe("Restocked from supplier");
    expect(mockCreateStockMovement).toHaveBeenCalledWith({
      supplyId: "supply-1",
      type: "IN",
      quantity: 10,
      reason: "Restocked from supplier",
    });
  });

  it("accepts movement request without reason field", async () => {
    mockCreateStockMovement.mockResolvedValue({
      movement: {
        id: "movement-1",
        supplyId: "supply-1",
        type: "OUT",
        quantity: 5,
        createdAt: new Date().toISOString(),
      },
      supply: {
        id: "supply-1",
        name: "Gloves",
        code: "SUP-001",
        quantity: 95,
      },
    });

    const request = createRequest({
      supplyId: "supply-1",
      type: "OUT",
      quantity: 5,
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(mockCreateStockMovement).toHaveBeenCalledWith({
      supplyId: "supply-1",
      type: "OUT",
      quantity: 5,
      reason: undefined,
    });
  });

  it("returns 400 for reason exceeding 500 characters", async () => {
    const request = createRequest({
      supplyId: "supply-1",
      type: "IN",
      quantity: 10,
      reason: "a".repeat(501),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid input");
    expect(data.details.reason).toBeDefined();
  });
});

describe("GET /api/stock-movements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with movements array for successful fetch", async () => {
    const mockMovements = [
      {
        id: "movement-1",
        supplyId: "supply-1",
        type: "IN",
        quantity: 10,
        reason: "Initial stock",
        createdAt: new Date("2024-01-15T10:30:00Z"),
      },
      {
        id: "movement-2",
        supplyId: "supply-1",
        type: "OUT",
        quantity: 5,
        reason: "Used in surgery",
        createdAt: new Date("2024-01-16T14:20:00Z"),
      },
    ];

    mockGetStockMovementsBySupplyId.mockResolvedValue(mockMovements);

    const request = createGetRequest("supply-1");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.movements).toHaveLength(2);
    expect(data.movements[0].id).toBe("movement-1");
    expect(data.movements[1].id).toBe("movement-2");
    expect(mockGetStockMovementsBySupplyId).toHaveBeenCalledWith("supply-1");
  });

  it("returns 200 with empty array when no movements exist", async () => {
    mockGetStockMovementsBySupplyId.mockResolvedValue([]);

    const request = createGetRequest("supply-1");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.movements).toEqual([]);
    expect(mockGetStockMovementsBySupplyId).toHaveBeenCalledWith("supply-1");
  });

  it("returns 400 when supplyId query parameter is missing", async () => {
    const request = createGetRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid input");
    expect(data.details.supplyId).toBeDefined();
    expect(mockGetStockMovementsBySupplyId).not.toHaveBeenCalled();
  });

  it("returns 400 when supplyId is empty string", async () => {
    const request = createGetRequest("");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid input");
    expect(data.details.supplyId).toBeDefined();
    expect(mockGetStockMovementsBySupplyId).not.toHaveBeenCalled();
  });

  it("returns 200 with empty array for non-existent supply", async () => {
    mockGetStockMovementsBySupplyId.mockResolvedValue([]);

    const request = createGetRequest("non-existent-supply");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.movements).toEqual([]);
    expect(mockGetStockMovementsBySupplyId).toHaveBeenCalledWith("non-existent-supply");
  });

  it("returns 500 for database errors", async () => {
    mockGetStockMovementsBySupplyId.mockRejectedValue(new Error("Database connection failed"));

    const request = createGetRequest("supply-1");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });

  it("includes all movement fields in response", async () => {
    const mockMovements = [
      {
        id: "movement-1",
        supplyId: "supply-1",
        type: "IN",
        quantity: 10,
        reason: null,
        createdAt: new Date("2024-01-15T10:30:00Z"),
      },
    ];

    mockGetStockMovementsBySupplyId.mockResolvedValue(mockMovements);

    const request = createGetRequest("supply-1");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.movements[0]).toMatchObject({
      id: "movement-1",
      supplyId: "supply-1",
      type: "IN",
      quantity: 10,
      reason: null,
    });
    expect(data.movements[0].createdAt).toBeDefined();
  });
});
