"use client";

import React, { useState, useEffect } from "react";
import { Typography, Alert } from "antd";
import { DashboardStats } from "./DashboardStats";
import { SuppliesTable } from "./SuppliesTable";
import type { SupplyDTO, GetSuppliesResult } from "@/lib/types/supplies";

const { Title } = Typography;

/**
 * Main inventory dashboard component
 * Fetches data from /api/supplies and displays stats + table
 */
export function InventoryDashboard() {
  const [supplies, setSupplies] = useState<SupplyDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSupplies() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/supplies?page=1&limit=100");

        if (!response.ok) {
          throw new Error(`Failed to fetch supplies: ${response.statusText}`);
        }

        const data: GetSuppliesResult = await response.json();
        setSupplies(data.supplies);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchSupplies();
  }, []);

  // Calculate statistics
  const totalSupplies = supplies.length;
  const lowStockCount = supplies.filter(
    (supply) => supply.quantity <= supply.minStock
  ).length;

  if (error) {
    return (
      <Alert
        message="Error Loading Dashboard"
        description={error}
        type="error"
        showIcon
        style={{ marginTop: 24 }}
      />
    );
  }

  return (
    <div style={{ padding: "24px 0" }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        Inventory Dashboard
      </Title>

      <DashboardStats
        totalSupplies={totalSupplies}
        lowStockCount={lowStockCount}
        loading={loading}
      />

      <SuppliesTable supplies={supplies} loading={loading} />
    </div>
  );
}
