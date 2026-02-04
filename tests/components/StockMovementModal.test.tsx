import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { StockMovementModal } from "@/app/components/StockMovementModal";
import type { SupplyDTO } from "@/lib/types/supplies";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock message from antd - define inside mock factory
vi.mock("antd", async () => {
  const actual = await vi.importActual("antd");
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

// Import mocked message to verify calls
import { message } from "antd";

describe("StockMovementModal Component", () => {
  const mockSupply: SupplyDTO = {
    id: "supply-1",
    name: "Nitrile Gloves",
    code: "GLV-001",
    description: "Blue nitrile examination gloves",
    quantity: 100,
    minStock: 20,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-15T00:00:00.000Z",
  };

  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

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

  it("renders modal with supply name in title when open", () => {
    render(
      <StockMovementModal
        supply={mockSupply}
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(
      screen.getByText(/Register Stock Movement - Nitrile Gloves/)
    ).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <StockMovementModal
        supply={mockSupply}
        open={false}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(
      screen.queryByText(/Register Stock Movement/)
    ).not.toBeInTheDocument();
  });

  it("renders form fields: movement type, quantity, and reason", () => {
    render(
      <StockMovementModal
        supply={mockSupply}
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText("Movement Type")).toBeInTheDocument();
    expect(screen.getByText("Quantity")).toBeInTheDocument();
    expect(screen.getByText("Reason (Optional)")).toBeInTheDocument();

    // Check radio buttons
    expect(screen.getByText("IN (Add Stock)")).toBeInTheDocument();
    expect(screen.getByText("OUT (Remove Stock)")).toBeInTheDocument();
  });

  it("submits IN movement successfully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        movement: {
          id: "movement-1",
          supplyId: "supply-1",
          type: "IN",
          quantity: 10,
          createdAt: new Date().toISOString(),
        },
        supply: {
          ...mockSupply,
          quantity: 110,
        },
      }),
    });

    render(
      <StockMovementModal
        supply={mockSupply}
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Change quantity
    const quantityInput = screen.getByPlaceholderText("Enter quantity");
    fireEvent.change(quantityInput, { target: { value: "10" } });

    // Click OK to submit
    const okButton = screen.getByRole("button", { name: /Submit/i });
    fireEvent.click(okButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/stock-movements",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            supplyId: "supply-1",
            type: "IN",
            quantity: 10,
            reason: undefined,
          }),
        })
      );
    });

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });

    expect(message.success).toHaveBeenCalledWith("Stock added successfully");
  });

  it("submits OUT movement with reason successfully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        movement: {
          id: "movement-1",
          supplyId: "supply-1",
          type: "OUT",
          quantity: 5,
          reason: "Used in surgery",
          createdAt: new Date().toISOString(),
        },
        supply: {
          ...mockSupply,
          quantity: 95,
        },
      }),
    });

    render(
      <StockMovementModal
        supply={mockSupply}
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Select OUT movement type
    const outRadio = screen.getByText("OUT (Remove Stock)");
    fireEvent.click(outRadio);

    // Change quantity
    const quantityInput = screen.getByPlaceholderText("Enter quantity");
    fireEvent.change(quantityInput, { target: { value: "5" } });

    // Add reason
    const reasonInput = screen.getByPlaceholderText(
      "Enter reason for this stock movement (optional)"
    );
    fireEvent.change(reasonInput, { target: { value: "Used in surgery" } });

    // Click OK to submit
    const okButton = screen.getByRole("button", { name: /Submit/i });
    fireEvent.click(okButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/stock-movements",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            supplyId: "supply-1",
            type: "OUT",
            quantity: 5,
            reason: "Used in surgery",
          }),
        })
      );
    });

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });

    expect(message.success).toHaveBeenCalledWith(
      "Stock removed successfully"
    );
  });

  it("displays error message when API returns insufficient stock error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: "Insufficient stock",
      }),
    });

    render(
      <StockMovementModal
        supply={mockSupply}
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Select OUT movement type
    const outRadio = screen.getByText("OUT (Remove Stock)");
    fireEvent.click(outRadio);

    // Change quantity to more than available
    const quantityInput = screen.getByPlaceholderText("Enter quantity");
    fireEvent.change(quantityInput, { target: { value: "200" } });

    // Click OK to submit
    const okButton = screen.getByRole("button", { name: /Submit/i });
    fireEvent.click(okButton);

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith("Insufficient stock");
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it("calls onClose when Cancel button is clicked", () => {
    render(
      <StockMovementModal
        supply={mockSupply}
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const cancelButton = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("validates quantity is required", async () => {
    render(
      <StockMovementModal
        supply={mockSupply}
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Clear quantity
    const quantityInput = screen.getByPlaceholderText("Enter quantity");
    fireEvent.change(quantityInput, { target: { value: "" } });

    // Click OK to submit
    const okButton = screen.getByRole("button", { name: /Submit/i });
    fireEvent.click(okButton);

    await waitFor(() => {
      expect(screen.getByText("Please enter quantity")).toBeInTheDocument();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("does not submit when supply is null", async () => {
    render(
      <StockMovementModal
        supply={null}
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Modal should still render but not crash
    expect(
      screen.getByText(/Register Stock Movement/)
    ).toBeInTheDocument();

    // Click OK to submit - should not call fetch because supply is null
    const okButton = screen.getByRole("button", { name: /Submit/i });
    fireEvent.click(okButton);

    // Wait a bit to ensure no API call is made
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockFetch).not.toHaveBeenCalled();
  });
});
