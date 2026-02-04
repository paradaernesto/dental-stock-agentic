"use client";

import React from "react";
import type { Supply } from "@prisma/client";

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
            <th>Code</th>
            <th>Description</th>
            <th>Quantity</th>
            <th>Min Stock</th>
          </tr>
        </thead>
        <tbody>
          {supplies.map((supply) => (
            <tr key={supply.id} data-testid={`supply-row-${supply.id}`}>
              <td className="supply-name">{supply.name}</td>
              <td className="supply-code">{supply.code}</td>
              <td className="supply-description">
                {supply.description || "-"}
              </td>
              <td className="supply-quantity">{supply.quantity}</td>
              <td className="supply-min-stock">{supply.minStock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
