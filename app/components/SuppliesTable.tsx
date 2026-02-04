"use client";

import React from "react";
import { Table, Tag, Button } from "antd";
import { ArrowRightOutlined, HistoryOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { SupplyDTO } from "@/lib/types/supplies";

export interface SuppliesTableProps {
  supplies: SupplyDTO[];
  loading?: boolean;
  onRegisterMovement?: (supply: SupplyDTO) => void;
  onViewHistory?: (supply: SupplyDTO) => void;
}

/**
 * Check if a supply is low on stock
 */
function isLowStock(supply: SupplyDTO): boolean {
  return supply.quantity <= supply.minStock;
}

/**
 * AntD Table component for displaying supplies
 * Highlights low-stock items with a red tag
 */
export function SuppliesTable({
  supplies,
  loading = false,
  onRegisterMovement,
  onViewHistory,
}: SuppliesTableProps) {
  const columns: ColumnsType<SupplyDTO> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Category",
      dataIndex: "code",
      key: "code",
      render: (code: string) => code,
    },
    {
      title: "Current Stock",
      dataIndex: "quantity",
      key: "quantity",
      sorter: (a, b) => a.quantity - b.quantity,
      render: (quantity: number, record: SupplyDTO) => (
        <span>
          {quantity}
          {isLowStock(record) && (
            <Tag color="red" style={{ marginLeft: 8 }}>
              Low Stock
            </Tag>
          )}
        </span>
      ),
    },
    {
      title: "Minimum Stock",
      dataIndex: "minStock",
      key: "minStock",
      sorter: (a, b) => a.minStock - b.minStock,
    },
    {
      title: "Actions",
      key: "actions",
      width: 280,
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            type="primary"
            size="small"
            icon={<ArrowRightOutlined />}
            onClick={() => onRegisterMovement?.(record)}
            data-testid={`register-movement-btn-${record.id}`}
          >
            Register movement
          </Button>
          <Button
            size="small"
            icon={<HistoryOutlined />}
            onClick={() => onViewHistory?.(record)}
            data-testid={`view-history-btn-${record.id}`}
          >
            View history
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table
      dataSource={supplies}
      columns={columns}
      rowKey="id"
      loading={loading}
      pagination={false}
      scroll={{ x: true }}
      locale={{
        emptyText: "No supplies found",
      }}
    />
  );
}
