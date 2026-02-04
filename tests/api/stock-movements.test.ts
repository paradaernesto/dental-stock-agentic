import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/stock-movements/route";
import { NextRequest } from "next/server";
import { InsufficientStockError, SupplyNotFoundError } from "@/lib/services/stock-movements";

// Mock the stock-movements service
const mockCreateStockMovement = vi.fn();

vi.mock("@/lib/services/stock-movements", () => ({
  createStockMovement: (...args: unknown[]) => mockCreateStockMovement(...args),
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

function createRequest(body: object): NextRequest {
  return new NextRequest("http://localhost/api/stock-movements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/stock-movements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
    });
  });
});
