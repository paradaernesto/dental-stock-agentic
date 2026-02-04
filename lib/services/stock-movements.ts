import { StockMovement, Supply } from "@prisma/client";
import { StockMovementType } from "@/lib/validations/stock-movements";
import { prisma } from "@/lib/db";

export interface CreateStockMovementInput {
  supplyId: string;
  type: typeof StockMovementType.IN | typeof StockMovementType.OUT;
  quantity: number;
  reason?: string;
}

export interface CreateStockMovementResult {
  movement: StockMovement;
  supply: Supply;
}

export class InsufficientStockError extends Error {
  constructor(message: string = "Insufficient stock") {
    super(message);
    this.name = "InsufficientStockError";
  }
}

export class SupplyNotFoundError extends Error {
  constructor(message: string = "Supply not found") {
    super(message);
    this.name = "SupplyNotFoundError";
  }
}

/**
 * Create a stock movement and update supply quantity atomically.
 * 
 * For IN movements: increases supply quantity
 * For OUT movements: decreases supply quantity (validates sufficient stock)
 * 
 * Uses Prisma $transaction to ensure atomicity.
 */
export async function createStockMovement(
  input: CreateStockMovementInput
): Promise<CreateStockMovementResult> {
  const { supplyId, type, quantity, reason } = input;

  // Perform the stock movement within a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Lock the supply row for update to prevent race conditions
    const supply = await tx.supply.findUnique({
      where: { id: supplyId },
    });

    if (!supply) {
      throw new SupplyNotFoundError();
    }

    // Calculate new quantity based on movement type
    const newQuantity =
      type === StockMovementType.IN
        ? supply.quantity + quantity
        : supply.quantity - quantity;

    // Validate: prevent negative stock for OUT movements
    if (type === StockMovementType.OUT && newQuantity < 0) {
      throw new InsufficientStockError();
    }

    // Update supply quantity
    const updatedSupply = await tx.supply.update({
      where: { id: supplyId },
      data: { quantity: newQuantity },
    });

    // Create the stock movement record
    const movement = await tx.stockMovement.create({
      data: {
        supplyId,
        type,
        quantity,
        reason,
      },
    });

    return { movement, supply: updatedSupply };
  });

  return result;
}

/**
 * Get stock movements for a supply (ordered by creation date descending)
 */
export async function getStockMovementsBySupplyId(
  supplyId: string,
  options?: { limit?: number; offset?: number }
): Promise<StockMovement[]> {
  return prisma.stockMovement.findMany({
    where: { supplyId },
    orderBy: { createdAt: "desc" },
    take: options?.limit,
    skip: options?.offset,
  });
}
