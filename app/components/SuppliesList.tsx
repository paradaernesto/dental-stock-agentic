"use client";

import React from "react";
import type { Supply } from "@/lib/types";

export interface SuppliesListProps {
  supplies: Supply[];
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
}

/**
 * Component to display a list of supplies
 */
export function SuppliesList({
  supplies,
  isLoading = false,
  error = null,
  emptyMessage = "No supplies found",
}: SuppliesListProps) {
  if (isLoading) {
    return (
      <div className="supplies-list loading" data-testid="supplies-loading">
        <p>Loading supplies...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="supplies-list error" data-testid="supplies-error">
        <p className="error-message">Error: {error}</p>
      </div>
    );
  }

  if (supplies.length === 0) {
    return (
      <div className="supplies-list empty" data-testid="supplies-empty">
        <p className="empty-message">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="supplies-list" data-testid="supplies-list">
      <table className="supplies-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Unit</th>
            <th>Stock</th>
            <th>Minimum Stock</th>
          </tr>
        </thead>
        <tbody>
          {supplies.map((supply) => (
            <tr key={supply.id} data-testid={`supply-row-${supply.id}`}>
              <td className="supply-name">{supply.name}</td>
              <td className="supply-category">{supply.category}</td>
              <td className="supply-unit">{supply.unit}</td>
              <td className="supply-stock">{supply.stock}</td>
              <td className="supply-minimum-stock">{supply.minimumStock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
