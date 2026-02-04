import { prisma } from "@/lib/db";
import type { Supply } from "@prisma/client";

export interface SearchSuppliesResult {
  supplies: Supply[];
  total: number;
  page: number;
  totalPages: number;
}

export interface SearchSuppliesOptions {
  query?: string;
  page?: number;
  limit?: number;
}

export interface CreateSupplyInput {
  name: string;
  category: string;
  unit: string;
  stock?: number;
  minimumStock?: number;
}

/**
 * Search supplies by name (partial, case-insensitive) or category (partial match)
 */
export async function searchSupplies({
  query = "",
  page = 1,
  limit = 20,
}: SearchSuppliesOptions): Promise<SearchSuppliesResult> {
  const trimmedQuery = query.trim();

  // Build the where clause
  const where = trimmedQuery
    ? {
        OR: [
          {
            name: {
              contains: trimmedQuery,
              mode: "insensitive" as const,
            },
          },
          {
            category: {
              contains: trimmedQuery,
              mode: "insensitive" as const,
            },
          },
        ],
      }
    : {};

  // Get total count for pagination
  const total = await prisma.supply.count({ where });

  // Fetch supplies with pagination
  const supplies = await prisma.supply.findMany({
    where,
    orderBy: [{ name: "asc" }, { category: "asc" }],
    skip: (page - 1) * limit,
    take: limit,
  });

  const totalPages = Math.ceil(total / limit);

  return {
    supplies,
    total,
    page,
    totalPages,
  };
}

/**
 * Get all supplies with pagination
 */
export async function getSupplies(
  page: number = 1,
  limit: number = 20
): Promise<SearchSuppliesResult> {
  // Get total count for pagination
  const total = await prisma.supply.count();

  // Fetch supplies with pagination
  const supplies = await prisma.supply.findMany({
    orderBy: [{ name: "asc" }, { category: "asc" }],
    skip: (page - 1) * limit,
    take: limit,
  });

  const totalPages = Math.ceil(total / limit);

  return {
    supplies,
    total,
    page,
    totalPages,
  };
}

/**
 * Get a single supply by ID
 */
export async function getSupplyById(id: string): Promise<Supply | null> {
  return prisma.supply.findUnique({
    where: { id },
  });
}

/**
 * Create a new supply
 */
export async function createSupply(
  input: CreateSupplyInput
): Promise<Supply> {
  const { name, category, unit, stock = 0, minimumStock = 0 } = input;

  return prisma.supply.create({
    data: {
      name,
      category,
      unit,
      stock,
      minimumStock,
    },
  });
}
