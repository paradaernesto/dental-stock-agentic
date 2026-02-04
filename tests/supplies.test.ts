import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/db";
import { GET } from "@/app/api/supplies/search/route";
import { NextRequest } from "next/server";

// Helper to create a mock request
function createMockRequest(url: string): NextRequest {
  return new NextRequest(url);
}

describe("Supplies Search API", () => {
  // Seed test data before all tests
  beforeAll(async () => {
    // Clean up existing data
    await prisma.supply.deleteMany();

    // Create test supplies
    await prisma.supply.createMany({
      data: [
        { name: "Nitrile Gloves", code: "GLV-001", stock: 100, minStock: 20 },
        { name: "Latex Gloves", code: "GLV-002", stock: 50, minStock: 15 },
        { name: "Surgical Masks", code: "MSK-001", stock: 200, minStock: 50 },
        { name: "Dental Floss", code: "FLO-001", stock: 30, minStock: 25 },
        { name: "Cotton Rolls", code: "CTR-001", stock: 500, minStock: 100 },
        { name: "Anesthetic", code: "ANE-001", stock: 10, minStock: 15 },
      ],
    });
  });

  // Clean up after all tests
  afterAll(async () => {
    await prisma.supply.deleteMany();
    await prisma.$disconnect();
  });

  describe("GET /api/supplies/search", () => {
    it("returns all supplies when no query is provided", async () => {
      const request = createMockRequest("http://localhost:3000/api/supplies/search");
      const response = await GET(request);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.data).toHaveLength(6);
      expect(result.pagination.total).toBe(6);
    });

    it("searches supplies by partial name match (case-insensitive)", async () => {
      const request = createMockRequest("http://localhost:3000/api/supplies/search?q=glove");
      const response = await GET(request);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.data).toHaveLength(2);
      expect(result.data.map((s: { name: string }) => s.name)).toContain(
        "Nitrile Gloves"
      );
      expect(result.data.map((s: { name: string }) => s.name)).toContain(
        "Latex Gloves"
      );
    });

    it("searches supplies by partial code match (case-insensitive)", async () => {
      const request = createMockRequest("http://localhost:3000/api/supplies/search?q=GLV");
      const response = await GET(request);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.data).toHaveLength(2);
      expect(result.data.map((s: { code: string }) => s.code)).toContain(
        "GLV-001"
      );
      expect(result.data.map((s: { code: string }) => s.code)).toContain(
        "GLV-002"
      );
    });

    it("is case-insensitive for name search", async () => {
      const request1 = createMockRequest("http://localhost:3000/api/supplies/search?q=gloves");
      const request2 = createMockRequest("http://localhost:3000/api/supplies/search?q=GLOVES");
      const request3 = createMockRequest("http://localhost:3000/api/supplies/search?q=GlOvEs");

      const response1 = await GET(request1);
      const response2 = await GET(request2);
      const response3 = await GET(request3);

      const lowerResult = await response1.json();
      const upperResult = await response2.json();
      const mixedResult = await response3.json();

      expect(lowerResult.data).toHaveLength(2);
      expect(upperResult.data).toHaveLength(2);
      expect(mixedResult.data).toHaveLength(2);
    });

    it("is case-insensitive for code search", async () => {
      const request1 = createMockRequest("http://localhost:3000/api/supplies/search?q=glv-001");
      const request2 = createMockRequest("http://localhost:3000/api/supplies/search?q=GLV-001");

      const response1 = await GET(request1);
      const response2 = await GET(request2);

      const lowerResult = await response1.json();
      const upperResult = await response2.json();

      expect(lowerResult.data).toHaveLength(1);
      expect(upperResult.data).toHaveLength(1);
      expect(lowerResult.data[0].code).toBe("GLV-001");
    });

    it("returns supplies matching name OR code in single query", async () => {
      // "MSK" should match code MSK-001
      const request = createMockRequest("http://localhost:3000/api/supplies/search?q=MSK");
      const response = await GET(request);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.data.length).toBeGreaterThanOrEqual(1);
    });

    it("returns correct fields for each supply", async () => {
      const request = createMockRequest("http://localhost:3000/api/supplies/search?q=Nitrile");
      const response = await GET(request);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.data).toHaveLength(1);

      const supply = result.data[0];
      expect(supply).toHaveProperty("id");
      expect(supply).toHaveProperty("name");
      expect(supply).toHaveProperty("code");
      expect(supply).toHaveProperty("stock");
      expect(supply).toHaveProperty("minStock");

      // Verify types
      expect(typeof supply.id).toBe("string");
      expect(typeof supply.name).toBe("string");
      expect(typeof supply.code).toBe("string");
      expect(typeof supply.stock).toBe("number");
      expect(typeof supply.minStock).toBe("number");
    });

    it("supports pagination with default 20 items", async () => {
      const request = createMockRequest("http://localhost:3000/api/supplies/search");
      const response = await GET(request);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.pagination.limit).toBe(20);
      expect(result.pagination.page).toBe(1);
    });

    it("respects custom pagination parameters", async () => {
      const request = createMockRequest("http://localhost:3000/api/supplies/search?page=1&limit=2");
      const response = await GET(request);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.data).toHaveLength(2);
      expect(result.pagination.limit).toBe(2);
      expect(result.pagination.totalPages).toBe(3); // 6 items / 2 per page
    });

    it("returns empty array when no matches found", async () => {
      const request = createMockRequest("http://localhost:3000/api/supplies/search?q=nonexistent12345");
      const response = await GET(request);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });

    it("handles partial matches correctly", async () => {
      const request = createMockRequest("http://localhost:3000/api/supplies/search?q=dent");
      const response = await GET(request);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.data.map((s: { name: string }) => s.name)).toContain(
        "Dental Floss"
      );
    });
  });
});

describe("Supply Model", () => {
  it("should have unique code constraint", async () => {
    // Create a supply
    const supply = await prisma.supply.create({
      data: {
        name: "Test Supply",
        code: "UNIQUE-TEST-001",
        stock: 10,
        minStock: 5,
      },
    });

    expect(supply.code).toBe("UNIQUE-TEST-001");

    // Try to create another with same code
    await expect(
      prisma.supply.create({
        data: {
          name: "Another Test",
          code: "UNIQUE-TEST-001",
          stock: 20,
          minStock: 10,
        },
      })
    ).rejects.toThrow();

    // Clean up
    await prisma.supply.delete({ where: { id: supply.id } });
  });
});
