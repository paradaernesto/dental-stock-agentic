import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/supplies/route";
import { NextRequest } from "next/server";

// Mock the supplies service
const mockGetAllSupplies = vi.fn();

vi.mock("@/lib/services/supplies", () => ({
  getAllSupplies: (...args: unknown[]) => mockGetAllSupplies(...args),
}));

describe("GET /api/supplies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createRequest(url: string): NextRequest {
    return new NextRequest(url);
  }

  it("returns supplies with default pagination", async () => {
    const mockResult = {
      supplies: [
        {
          id: "1",
          name: "Gloves",
          code: "SUP-001",
          description: "Nitrile gloves",
          quantity: 100,
          minStock: 20,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-15"),
        },
        {
          id: "2",
          name: "Masks",
          code: "SUP-002",
          description: "Surgical masks",
          quantity: 50,
          minStock: 10,
          createdAt: new Date("2024-01-02"),
          updatedAt: new Date("2024-01-16"),
        },
      ],
      total: 2,
      page: 1,
      totalPages: 1,
    };

    mockGetAllSupplies.mockResolvedValue(mockResult);

    const request = createRequest("http://localhost/api/supplies");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.supplies).toHaveLength(2);
    expect(data.total).toBe(2);
    expect(data.page).toBe(1);
    expect(data.totalPages).toBe(1);

    // Verify dates are serialized as strings
    expect(typeof data.supplies[0].createdAt).toBe("string");
    expect(typeof data.supplies[0].updatedAt).toBe("string");

    expect(mockGetAllSupplies).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
    });
  });

  it("returns paginated results with custom page and limit", async () => {
    const mockResult = {
      supplies: [
        {
          id: "3",
          name: "Syringes",
          code: "SUP-003",
          quantity: 200,
          minStock: 50,
          createdAt: new Date("2024-01-03"),
          updatedAt: new Date("2024-01-17"),
        },
      ],
      total: 50,
      page: 2,
      totalPages: 5,
    };

    mockGetAllSupplies.mockResolvedValue(mockResult);

    const request = createRequest("http://localhost/api/supplies?page=2&limit=10");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.supplies).toHaveLength(1);
    expect(data.total).toBe(50);
    expect(data.page).toBe(2);
    expect(data.totalPages).toBe(5);

    expect(mockGetAllSupplies).toHaveBeenCalledWith({
      page: 2,
      limit: 10,
    });
  });

  it("returns empty array when no supplies exist", async () => {
    mockGetAllSupplies.mockResolvedValue({
      supplies: [],
      total: 0,
      page: 1,
      totalPages: 0,
    });

    const request = createRequest("http://localhost/api/supplies");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.supplies).toEqual([]);
    expect(data.total).toBe(0);
    expect(data.totalPages).toBe(0);
  });

  it("returns 400 for invalid page parameter", async () => {
    const request = createRequest("http://localhost/api/supplies?page=invalid");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid query parameters");
    expect(data.details).toBeDefined();
  });

  it("returns 400 for negative page number", async () => {
    const request = createRequest("http://localhost/api/supplies?page=-1");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid query parameters");
  });

  it("returns 400 for zero page number", async () => {
    const request = createRequest("http://localhost/api/supplies?page=0");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid query parameters");
  });

  it("returns 400 for limit exceeding maximum", async () => {
    const request = createRequest("http://localhost/api/supplies?limit=200");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid query parameters");
  });

  it("returns 400 for zero limit", async () => {
    const request = createRequest("http://localhost/api/supplies?limit=0");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid query parameters");
  });

  it("returns 400 for negative limit", async () => {
    const request = createRequest("http://localhost/api/supplies?limit=-5");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid query parameters");
  });

  it("returns 500 on internal server error", async () => {
    mockGetAllSupplies.mockRejectedValue(new Error("Database connection failed"));

    const request = createRequest("http://localhost/api/supplies");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });

  it("correctly serializes supply data to DTO format", async () => {
    const mockResult = {
      supplies: [
        {
          id: "abc-123",
          name: "Test Supply",
          code: "TST-001",
          description: "Test description",
          quantity: 100,
          minStock: 20,
          createdAt: new Date("2024-06-15T10:30:00.000Z"),
          updatedAt: new Date("2024-06-20T14:45:00.000Z"),
        },
      ],
      total: 1,
      page: 1,
      totalPages: 1,
    };

    mockGetAllSupplies.mockResolvedValue(mockResult);

    const request = createRequest("http://localhost/api/supplies");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.supplies[0]).toEqual({
      id: "abc-123",
      name: "Test Supply",
      code: "TST-001",
      description: "Test description",
      quantity: 100,
      minStock: 20,
      createdAt: "2024-06-15T10:30:00.000Z",
      updatedAt: "2024-06-20T14:45:00.000Z",
    });
  });

  it("handles supplies without description", async () => {
    const mockResult = {
      supplies: [
        {
          id: "def-456",
          name: "Supply Without Description",
          code: "SWD-001",
          description: null,
          quantity: 50,
          minStock: 10,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-02"),
        },
      ],
      total: 1,
      page: 1,
      totalPages: 1,
    };

    mockGetAllSupplies.mockResolvedValue(mockResult);

    const request = createRequest("http://localhost/api/supplies");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.supplies[0].description).toBeNull();
  });
});
