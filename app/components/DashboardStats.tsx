"use client";

import React from "react";
import { Row, Col, Card, Statistic } from "antd";
import { InboxOutlined, WarningOutlined } from "@ant-design/icons";

export interface DashboardStatsProps {
  totalSupplies: number;
  lowStockCount: number;
  loading?: boolean;
}

/**
 * Dashboard statistics cards component
 * Displays total supplies and low-stock item counts
 */
export function DashboardStats({
  totalSupplies,
  lowStockCount,
  loading = false,
}: DashboardStatsProps) {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12}>
        <Card loading={loading}>
          <Statistic
            title="Total Supplies"
            value={totalSupplies}
            prefix={<InboxOutlined style={{ marginRight: 8 }} />}
            valueStyle={{ color: "#1890ff" }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12}>
        <Card loading={loading}>
          <Statistic
            title="Low Stock Items"
            value={lowStockCount}
            prefix={<WarningOutlined style={{ marginRight: 8 }} />}
            valueStyle={{ color: lowStockCount > 0 ? "#cf1322" : "#52c41a" }}
          />
        </Card>
      </Col>
    </Row>
  );
}
