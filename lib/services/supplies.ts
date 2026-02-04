import { Supply } from "@prisma/client";
import { prisma } from "@/lib/db";

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

/**
 * Search supplies by name (partial, case-insensitive) or code (partial match)
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
            code: {
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
    orderBy: [{ name: "asc" }, { code: "asc" }],
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
 * Get a single supply by code
 */
export async function getSupplyByCode(code: string): Promise<Supply | null> {
  return prisma.supply.findUnique({
    where: { code },
  });
}

export interface GetAllSuppliesResult {
  supplies: Supply[];
  total: number;
  page: number;
  totalPages: number;
}

export interface GetAllSuppliesOptions {
  page?: number;
  limit?: number;
}

/**
 * Get all supplies with pagination
 * Returns a list of all supplies ordered by name
 */
export async function getAllSupplies({
  page = 1,
  limit = 20,
}: GetAllSuppliesOptions = {}): Promise<GetAllSuppliesResult> {
  // Get total count for pagination
  const total = await prisma.supply.count();

  // Fetch supplies with pagination
  const supplies = await prisma.supply.findMany({
    orderBy: [{ name: "asc" }, { code: "asc" }],
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
