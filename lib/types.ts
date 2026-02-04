/**
 * Shared types for client components
 * These types mirror the Prisma Supply model but are safe to use in client-side code
 */

export interface Supply {
  id: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  minimumStock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchSuppliesResult {
  supplies: Supply[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateSupplyInput {
  name: string;
  category: string;
  unit: string;
  stock?: number;
  minimumStock?: number;
}
