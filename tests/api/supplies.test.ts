import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/supplies/search/route";
import { NextRequest } from "next/server";

// Mock the supplies service
const mockSearchSupplies = vi.fn();

vi.mock("@/lib/services/supplies", () => ({
  searchSupplies: (...args: unknown[]) => mockSearchSupplies(...args),
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
          name: "Gloves",
          code: "SUP-001",
          description: "Nitrile gloves",
          quantity: 100,
          minStock: 20,
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
    const response = await GET(request);
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
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid search parameters");
    expect(data.details).toBeDefined();
  });

  it("returns 400 for negative page number", async () => {
    const request = createRequest(
      "http://localhost/api/supplies/search?q=test&page=-1"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid search parameters");
  });

  it("returns 400 for limit exceeding maximum", async () => {
    const request = createRequest(
      "http://localhost/api/supplies/search?q=test&limit=200"
    );
    const response = await GET(request);
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
    const response = await GET(request);

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
    const response = await GET(request);
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
    const response = await GET(request);

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
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });
});
