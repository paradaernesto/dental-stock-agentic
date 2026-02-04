"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Modal, Table, Tag, Empty, Spin } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { SupplyDTO, StockMovementDTO } from "@/lib/types/supplies";

export interface StockMovementHistoryModalProps {
  supply: SupplyDTO | null;
  open: boolean;
  onClose: () => void;
}

interface MovementRecord {
  key: string;
  date: string;
  type: "IN" | "OUT";
  quantity: number;
  reason: string;
}

/**
 * Format date in a human-readable format (e.g., "Jan 15, 2024, 10:30 AM")
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Modal component to display stock movement history for a supply.
 * Shows all IN/OUT operations with date, type, quantity, and reason.
 */
export function StockMovementHistoryModal({
  supply,
  open,
  onClose,
}: StockMovementHistoryModalProps) {
  const [movements, setMovements] = useState<MovementRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMovements = useCallback(async () => {
    if (!supply) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/stock-movements?supplyId=${supply.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch movement history");
      }

      const mappedMovements: MovementRecord[] = (data.movements as StockMovementDTO[]).map(
        (movement) => ({
          key: movement.id,
          date: formatDate(movement.createdAt),
          type: movement.type,
          quantity: movement.quantity,
          reason: movement.reason || "-",
        })
      );

      setMovements(mappedMovements);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [supply]);

  useEffect(() => {
    if (open && supply) {
      fetchMovements();
    }
  }, [open, supply, fetchMovements]);

  const columns: ColumnsType<MovementRecord> = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 200,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (type: "IN" | "OUT") => (
        <Tag color={type === "IN" ? "green" : "red"}>{type}</Tag>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      render: (reason: string) => reason || "-",
    },
  ];

  const emptyContent = (
    <Empty
      description="No movement history for this supply"
      image={Empty.PRESENTED_IMAGE_SIMPLE}
    />
  );

  return (
    <Modal
      title={supply ? `Stock Movement History - ${supply.name}` : "Stock Movement History"}
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      destroyOnClose
    >
      <Spin spinning={loading} tip="Loading history...">
        {error ? (
          <div style={{ color: "#ff4d4f", textAlign: "center", padding: "24px 0" }}>
            {error}
          </div>
        ) : (
          <Table
            dataSource={movements}
            columns={columns}
            rowKey="key"
            pagination={false}
            scroll={{ y: 400 }}
            locale={{
              emptyText: emptyContent,
            }}
          />
        )}
      </Spin>
    </Modal>
  );
}
