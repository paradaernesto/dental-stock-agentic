"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Typography, Alert } from "antd";
import { DashboardStats } from "./DashboardStats";
import { SuppliesTable } from "./SuppliesTable";
import { StockMovementModal } from "./StockMovementModal";
import { StockMovementHistoryModal } from "./StockMovementHistoryModal";
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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState<SupplyDTO | null>(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedSupplyForHistory, setSelectedSupplyForHistory] = useState<SupplyDTO | null>(null);

  const fetchSupplies = useCallback(async () => {
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
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSupplies();
  }, [fetchSupplies]);

  const handleRegisterMovement = (supply: SupplyDTO) => {
    setSelectedSupply(supply);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedSupply(null);
  };

  const handleViewHistory = (supply: SupplyDTO) => {
    setSelectedSupplyForHistory(supply);
    setHistoryModalOpen(true);
  };

  const handleHistoryModalClose = () => {
    setHistoryModalOpen(false);
    setSelectedSupplyForHistory(null);
  };

  const handleMovementSuccess = () => {
    setModalOpen(false);
    setSelectedSupply(null);
    fetchSupplies();
  };

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

      <SuppliesTable
        supplies={supplies}
        loading={loading}
        onRegisterMovement={handleRegisterMovement}
        onViewHistory={handleViewHistory}
      />

      <StockMovementModal
        supply={selectedSupply}
        open={modalOpen}
        onClose={handleModalClose}
        onSuccess={handleMovementSuccess}
      />

      <StockMovementHistoryModal
        supply={selectedSupplyForHistory}
        open={historyModalOpen}
        onClose={handleHistoryModalClose}
      />
    </div>
  );
}
