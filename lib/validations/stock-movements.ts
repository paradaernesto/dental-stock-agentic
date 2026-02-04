import { z } from "zod";

/**
 * Enum for stock movement types
 */
export const StockMovementType = {
  IN: "IN",
  OUT: "OUT",
} as const;

/**
 * Zod schema for creating a stock movement
 */
export const createStockMovementSchema = z.object({
  supplyId: z
    .string()
    .min(1, "Supply ID is required"),
  type: z
    .enum([StockMovementType.IN, StockMovementType.OUT], {
      errorMap: () => ({ message: "Type must be either 'IN' or 'OUT'" }),
    }),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .positive("Quantity must be a positive number"),
  reason: z
    .string()
    .max(500, "Reason must be 500 characters or less")
    .optional(),
});

export type CreateStockMovementInput = z.infer<typeof createStockMovementSchema>;
