"use client";

import React, { useState } from "react";
import { Modal, Form, Input, Radio, InputNumber, message } from "antd";
import type { SupplyDTO } from "@/lib/types/supplies";

const { TextArea } = Input;

export interface StockMovementFormValues {
  type: "IN" | "OUT";
  quantity: number;
  reason?: string;
}

export interface StockMovementModalProps {
  supply: SupplyDTO | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Modal form for registering stock movements (IN/OUT) for a supply.
 * Submits to /api/stock-movements and calls onSuccess callback on completion.
 */
export function StockMovementModal({
  supply,
  open,
  onClose,
  onSuccess,
}: StockMovementModalProps) {
  const [form] = Form.useForm<StockMovementFormValues>();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: StockMovementFormValues) => {
    if (!supply) return;

    setSubmitting(true);

    try {
      const response = await fetch("/api/stock-movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplyId: supply.id,
          type: values.type,
          quantity: values.quantity,
          reason: values.reason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register stock movement");
      }

      message.success(
        `Stock ${values.type === "IN" ? "added" : "removed"} successfully`
      );

      form.resetFields();
      onSuccess();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        supply
          ? `Register Stock Movement - ${supply.name}`
          : "Register Stock Movement"
      }
      open={open}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      okText="Submit"
      cancelText="Cancel"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={submitting}
        initialValues={{ type: "IN", quantity: 1 }}
      >
        <Form.Item
          name="type"
          label="Movement Type"
          rules={[{ required: true, message: "Please select movement type" }]}
        >
          <Radio.Group>
            <Radio.Button value="IN">IN (Add Stock)</Radio.Button>
            <Radio.Button value="OUT">OUT (Remove Stock)</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="quantity"
          label="Quantity"
          rules={[
            { required: true, message: "Please enter quantity" },
            {
              type: "integer",
              min: 1,
              message: "Quantity must be a positive integer",
            },
          ]}
        >
          <InputNumber
            min={1}
            precision={0}
            style={{ width: "100%" }}
            placeholder="Enter quantity"
          />
        </Form.Item>

        <Form.Item
          name="reason"
          label="Reason (Optional)"
          rules={[
            { max: 500, message: "Reason must be 500 characters or less" },
          ]}
        >
          <TextArea
            rows={3}
            placeholder="Enter reason for this stock movement (optional)"
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
