/**
 * Supply DTO (Data Transfer Object) - Type definitions independent of Prisma
 * These types are safe to use in client-side code without pulling @prisma/client
 */

/**
 * SupplyDTO represents a supply item returned from the API.
 * Dates are serialized as strings in JSON responses.
 */
export interface SupplyDTO {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  quantity: number;
  minStock: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Result type for paginated supply list API response
 */
export interface GetSuppliesResult {
  supplies: SupplyDTO[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Options for fetching supplies with pagination
 */
export interface GetSuppliesOptions {
  page?: number;
  limit?: number;
}

/**
 * StockMovementDTO represents a stock movement entry returned from the API.
 * Dates are serialized as strings in JSON responses.
 */
export interface StockMovementDTO {
  id: string;
  supplyId: string;
  type: "IN" | "OUT";
  quantity: number;
  reason?: string | null;
  createdAt: string;
}

/**
 * Result type for stock movement history API response
 */
export interface GetStockMovementsResult {
  movements: StockMovementDTO[];
}
