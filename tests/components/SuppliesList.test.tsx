import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SuppliesList } from "@/app/components/SuppliesList";
import type { SupplyDTO } from "@/lib/types/supplies";

describe("SuppliesList Component", () => {
  const mockSupplies: SupplyDTO[] = [
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
      name: "Dental Masks",
      code: "MSK-002",
      description: "Surgical masks",
      quantity: 50,
      minStock: 10,
      createdAt: "2024-01-02T00:00:00.000Z",
      updatedAt: "2024-01-16T00:00:00.000Z",
    },
    {
      id: "3",
      name: "Sterilization Pouches",
      code: "STP-003",
      quantity: 200,
      minStock: 75,
      createdAt: "2024-01-03T00:00:00.000Z",
      updatedAt: "2024-01-17T00:00:00.000Z",
    },
  ];

  describe("Loading State", () => {
    it("displays loading message when isLoading is true", () => {
      render(<SuppliesList supplies={[]} isLoading={true} />);

      expect(screen.getByTestId("supplies-loading")).toBeInTheDocument();
      expect(screen.getByText("Loading supplies...")).toBeInTheDocument();
    });

    it("does not display table when loading", () => {
      render(<SuppliesList supplies={mockSupplies} isLoading={true} />);

      expect(screen.queryByTestId("supplies-list")).not.toBeInTheDocument();
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    it("displays error message when error is provided", () => {
      const errorMessage = "Failed to fetch supplies";
      render(<SuppliesList supplies={[]} error={errorMessage} />);

      expect(screen.getByTestId("supplies-error")).toBeInTheDocument();
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });

    it("does not display table when there is an error", () => {
      render(<SuppliesList supplies={mockSupplies} error="Some error" />);

      expect(screen.queryByTestId("supplies-list")).not.toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("displays default empty message when no supplies exist", () => {
      render(<SuppliesList supplies={[]} />);

      expect(screen.getByTestId("supplies-empty")).toBeInTheDocument();
      expect(screen.getByText("No supplies found")).toBeInTheDocument();
    });

    it("displays custom empty message when provided", () => {
      const customMessage = "No dental supplies in inventory";
      render(<SuppliesList supplies={[]} emptyMessage={customMessage} />);

      expect(screen.getByTestId("supplies-empty")).toBeInTheDocument();
      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    it("does not display table when supplies array is empty", () => {
      render(<SuppliesList supplies={[]} />);

      expect(screen.queryByTestId("supplies-list")).not.toBeInTheDocument();
    });
  });

  describe("Populated State", () => {
    it("renders table with correct headers", () => {
      render(<SuppliesList supplies={mockSupplies} />);

      expect(screen.getByTestId("supplies-list")).toBeInTheDocument();

      // Check table headers
      const headers = screen.getAllByRole("columnheader");
      expect(headers).toHaveLength(4);
      expect(headers[0]).toHaveTextContent("Name");
      expect(headers[1]).toHaveTextContent("Category");
      expect(headers[2]).toHaveTextContent("Stock");
      expect(headers[3]).toHaveTextContent("Minimum Stock");
    });

    it("renders correct number of supply rows", () => {
      render(<SuppliesList supplies={mockSupplies} />);

      const rows = screen.getAllByRole("row").slice(1); // Skip header row
      expect(rows).toHaveLength(3);
    });

    it("renders supply data correctly in each row", () => {
      render(<SuppliesList supplies={mockSupplies} />);

      // Check first supply
      expect(screen.getByTestId("supply-row-1")).toBeInTheDocument();
      expect(screen.getByText("Nitrile Gloves")).toBeInTheDocument();
      expect(screen.getByText("GLV-001")).toBeInTheDocument();
      expect(screen.getByText("100")).toBeInTheDocument();
      expect(screen.getByText("20")).toBeInTheDocument();

      // Check second supply
      expect(screen.getByTestId("supply-row-2")).toBeInTheDocument();
      expect(screen.getByText("Dental Masks")).toBeInTheDocument();
      expect(screen.getByText("MSK-002")).toBeInTheDocument();
      expect(screen.getByText("50")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument();

      // Check third supply
      expect(screen.getByTestId("supply-row-3")).toBeInTheDocument();
      expect(screen.getByText("Sterilization Pouches")).toBeInTheDocument();
      expect(screen.getByText("STP-003")).toBeInTheDocument();
      expect(screen.getByText("200")).toBeInTheDocument();
      expect(screen.getByText("75")).toBeInTheDocument();
    });

    it("uses code as category display", () => {
      render(<SuppliesList supplies={mockSupplies} />);

      // Verify that codes are displayed in the Category column
      const categoryCells = screen.getAllByClassName?.("supply-category") ||
        document.querySelectorAll(".supply-category");
      expect(categoryCells.length).toBe(3);
    });

    it("renders rows with unique keys", () => {
      render(<SuppliesList supplies={mockSupplies} />);

      mockSupplies.forEach((supply) => {
        expect(screen.getByTestId(`supply-row-${supply.id}`)).toBeInTheDocument();
      });
    });
  });

  describe("State Priority", () => {
    it("shows loading state over error state", () => {
      render(<SuppliesList supplies={[]} isLoading={true} error="Some error" />);

      expect(screen.getByTestId("supplies-loading")).toBeInTheDocument();
      expect(screen.queryByTestId("supplies-error")).not.toBeInTheDocument();
    });

    it("shows error state over empty state", () => {
      render(<SuppliesList supplies={[]} error="Some error" />);

      expect(screen.getByTestId("supplies-error")).toBeInTheDocument();
      expect(screen.queryByTestId("supplies-empty")).not.toBeInTheDocument();
    });

    it("shows loading state over populated state", () => {
      render(<SuppliesList supplies={mockSupplies} isLoading={true} />);

      expect(screen.getByTestId("supplies-loading")).toBeInTheDocument();
      expect(screen.queryByTestId("supplies-list")).not.toBeInTheDocument();
    });
  });
});
