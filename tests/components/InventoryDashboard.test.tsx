import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { InventoryDashboard } from "@/app/components/InventoryDashboard";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("InventoryDashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up a fresh matchMedia mock for each test
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches and displays supplies data with low stock indicators", async () => {
    const mockSupplies = [
      {
        id: "1",
        name: "Nitrile Gloves",
        code: "GLV-001",
        description: "Blue nitrile examination gloves",
        quantity: 100,
        minStock: 20,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-15T00:00:00.000Z",
      },
      {
        id: "2",
        name: "Low Stock Item",
        code: "LOW-002",
        description: "An item with low stock",
        quantity: 5,
        minStock: 20,
        createdAt: "2024-01-02T00:00:00.000Z",
        updatedAt: "2024-01-16T00:00:00.000Z",
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        supplies: mockSupplies,
        total: 2,
        page: 1,
        totalPages: 1,
      }),
    });

    render(<InventoryDashboard />);

    // Wait for the data to be loaded and rendered
    await waitFor(() => {
      expect(screen.getByText("Nitrile Gloves")).toBeInTheDocument();
    });

    // Verify API was called correctly
    expect(mockFetch).toHaveBeenCalledWith("/api/supplies?page=1&limit=100");

    // Check table content
    expect(screen.getByText("GLV-001")).toBeInTheDocument();
    expect(screen.getByText("Low Stock Item")).toBeInTheDocument();
    
    // Check dashboard title
    expect(screen.getByText("Inventory Dashboard")).toBeInTheDocument();
  });
});
