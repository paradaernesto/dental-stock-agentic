import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as searchGET } from "@/app/api/supplies/search/route";
import { GET, POST } from "@/app/api/supplies/route";
import { NextRequest } from "next/server";

// Mock the supplies service
const mockSearchSupplies = vi.fn();
const mockGetSupplies = vi.fn();
const mockCreateSupply = vi.fn();

vi.mock("@/lib/services/supplies", () => ({
  searchSupplies: (...args: unknown[]) => mockSearchSupplies(...args),
  getSupplies: (...args: unknown[]) => mockGetSupplies(...args),
  createSupply: (...args: unknown[]) => mockCreateSupply(...args),
}));

describe("GET /api/supplies/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createRequest(url: string): NextRequest {
    return new NextRequest(url);
  }

  it("returns supplies for valid query", async () => {
    const mockResult = {
      supplies: [
        {
          id: "1",
          name: "Nitrile Gloves",
          category: "PPE",
          unit: "box",
          stock: 500,
          minimumStock: 100,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      total: 1,
      page: 1,
      totalPages: 1,
    };

    mockSearchSupplies.mockResolvedValue(mockResult);

    const request = createRequest("http://localhost/api/supplies/search?q=gloves");
    const response = await searchGET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockResult);
    expect(mockSearchSupplies).toHaveBeenCalledWith({
      query: "gloves",
      page: 1,
      limit: 20,
    });
  });

  it("returns 400 for invalid page parameter", async () => {
    const request = createRequest(
      "http://localhost/api/supplies/search?q=test&page=invalid"
    );
    const response = await searchGET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid search parameters");
    expect(data.details).toBeDefined();
  });

  it("returns 400 for negative page number", async () => {
    const request = createRequest(
      "http://localhost/api/supplies/search?q=test&page=-1"
    );
    const response = await searchGET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid search parameters");
  });

  it("returns 400 for limit exceeding maximum", async () => {
    const request = createRequest(
      "http://localhost/api/supplies/search?q=test&limit=200"
    );
    const response = await searchGET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid search parameters");
  });

  it("sanitizes search queries with special characters", async () => {
    mockSearchSupplies.mockResolvedValue({
      supplies: [],
      total: 0,
      page: 1,
      totalPages: 0,
    });

    const request = createRequest(
      'http://localhost/api/supplies/search?q=gloves<script>alert("xss")</script>'
    );
    const response = await searchGET(request);

    expect(response.status).toBe(200);
    expect(mockSearchSupplies).toHaveBeenCalledWith({
      query: "glovesscriptalert(xss)/script", // sanitized (quotes removed)
      page: 1,
      limit: 20,
    });
  });

  it("handles empty query parameter", async () => {
    mockSearchSupplies.mockResolvedValue({
      supplies: [],
      total: 0,
      page: 1,
      totalPages: 0,
    });

    const request = createRequest("http://localhost/api/supplies/search");
    const response = await searchGET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.supplies).toEqual([]);
    expect(mockSearchSupplies).toHaveBeenCalledWith({
      query: "",
      page: 1,
      limit: 20,
    });
  });

  it("respects custom page and limit parameters", async () => {
    mockSearchSupplies.mockResolvedValue({
      supplies: [],
      total: 50,
      page: 2,
      totalPages: 5,
    });

    const request = createRequest(
      "http://localhost/api/supplies/search?q=test&page=2&limit=10"
    );
    const response = await searchGET(request);

    expect(response.status).toBe(200);
    expect(mockSearchSupplies).toHaveBeenCalledWith({
      query: "test",
      page: 2,
      limit: 10,
    });
  });

  it("returns 500 on internal server error", async () => {
    mockSearchSupplies.mockRejectedValue(new Error("Database error"));

    const request = createRequest("http://localhost/api/supplies/search?q=test");
    const response = await searchGET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });
});

describe("GET /api/supplies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createRequest(url: string): NextRequest {
    return new NextRequest(url);
  }

  it("returns all supplies with pagination", async () => {
    const mockResult = {
      supplies: [
        {
          id: "1",
          name: "Nitrile Gloves",
          category: "PPE",
          unit: "box",
          stock: 500,
          minimumStock: 100,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Dental Masks",
          category: "PPE",
          unit: "box",
          stock: 1000,
          minimumStock: 200,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      total: 2,
      page: 1,
      totalPages: 1,
    };

    mockGetSupplies.mockResolvedValue(mockResult);

    const request = createRequest("http://localhost/api/supplies");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockResult);
    expect(mockGetSupplies).toHaveBeenCalledWith(1, 20);
  });

  it("respects custom page and limit parameters", async () => {
    const mockResult = {
      supplies: [],
      total: 50,
      page: 2,
      totalPages: 5,
    };

    mockGetSupplies.mockResolvedValue(mockResult);

    const request = createRequest("http://localhost/api/supplies?page=2&limit=10");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockGetSupplies).toHaveBeenCalledWith(2, 10);
    expect(data.page).toBe(2);
    expect(data.totalPages).toBe(5);
  });

  it("returns 400 for invalid page parameter", async () => {
    const request = createRequest("http://localhost/api/supplies?page=invalid");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid pagination parameters");
    expect(data.details).toBeDefined();
  });

  it("returns 400 for negative page number", async () => {
    const request = createRequest("http://localhost/api/supplies?page=-1");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid pagination parameters");
  });

  it("returns 400 for limit exceeding maximum", async () => {
    const request = createRequest("http://localhost/api/supplies?limit=200");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid pagination parameters");
  });

  it("returns 500 on internal server error", async () => {
    mockGetSupplies.mockRejectedValue(new Error("Database error"));

    const request = createRequest("http://localhost/api/supplies");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });
});

describe("POST /api/supplies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createRequest(body: unknown): NextRequest {
    return new NextRequest("http://localhost/api/supplies", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  it("creates a new supply with valid input", async () => {
    const input = {
      name: "New Supply",
      category: "Test Category",
      unit: "piece",
      stock: 100,
      minimumStock: 20,
    };

    const mockSupply = {
      id: "new-id",
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockCreateSupply.mockResolvedValue(mockSupply);

    const request = createRequest(input);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toEqual(mockSupply);
    expect(mockCreateSupply).toHaveBeenCalledWith(input);
  });

  it("creates a supply with default values for optional fields", async () => {
    const input = {
      name: "New Supply",
      category: "Test Category",
      unit: "box",
    };

    const mockSupply = {
      id: "new-id",
      name: "New Supply",
      category: "Test Category",
      unit: "box",
      stock: 0,
      minimumStock: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockCreateSupply.mockResolvedValue(mockSupply);

    const request = createRequest(input);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.stock).toBe(0);
    expect(data.minimumStock).toBe(0);
  });

  it("returns 400 for missing required fields", async () => {
    const input = {
      name: "New Supply",
      // missing category and unit
    };

    const request = createRequest(input);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid input");
    expect(data.details).toBeDefined();
  });

  it("returns 400 for empty name", async () => {
    const input = {
      name: "",
      category: "Test Category",
      unit: "piece",
    };

    const request = createRequest(input);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid input");
    expect(data.details.name).toBeDefined();
  });

  it("returns 400 for negative stock", async () => {
    const input = {
      name: "New Supply",
      category: "Test Category",
      unit: "piece",
      stock: -10,
    };

    const request = createRequest(input);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid input");
    expect(data.details.stock).toBeDefined();
  });

  it("returns 400 for negative minimumStock", async () => {
    const input = {
      name: "New Supply",
      category: "Test Category",
      unit: "piece",
      minimumStock: -5,
    };

    const request = createRequest(input);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid input");
    expect(data.details.minimumStock).toBeDefined();
  });

  it("returns 400 for name exceeding max length", async () => {
    const input = {
      name: "a".repeat(201),
      category: "Test Category",
      unit: "piece",
    };

    const request = createRequest(input);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid input");
    expect(data.details.name).toBeDefined();
  });

  it("returns 500 on internal server error", async () => {
    mockCreateSupply.mockRejectedValue(new Error("Database error"));

    const input = {
      name: "New Supply",
      category: "Test Category",
      unit: "piece",
    };

    const request = createRequest(input);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });
});
