import { z } from "zod";

/**
 * Zod schema for supply search input validation
 */
export const searchSuppliesSchema = z.object({
  query: z
    .string()
    .max(100, "Search query must be at most 100 characters")
    .optional()
    .default(""),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).default(1))
    .optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(100).default(20))
    .optional(),
});

export type SearchSuppliesInput = z.infer<typeof searchSuppliesSchema>;

/**
 * Zod schema for creating a new supply
 */
export const createSupplySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(200, "Name must be at most 200 characters"),
  category: z
    .string()
    .min(1, "Category is required")
    .max(100, "Category must be at most 100 characters"),
  unit: z
    .string()
    .min(1, "Unit is required")
    .max(50, "Unit must be at most 50 characters"),
  stock: z
    .number()
    .int("Stock must be an integer")
    .min(0, "Stock must be at least 0")
    .optional()
    .default(0),
  minimumStock: z
    .number()
    .int("Minimum stock must be an integer")
    .min(0, "Minimum stock must be at least 0")
    .optional()
    .default(0),
});

export type CreateSupplyInput = z.infer<typeof createSupplySchema>;

/**
 * Zod schema for pagination parameters
 */
export const paginationSchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).default(1))
    .optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(100).default(20))
    .optional(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

/**
 * Sanitize search query to prevent injection
 */
export function sanitizeSearchQuery(query: string): string {
  // Remove any potentially harmful characters
  // Allow alphanumeric, spaces, hyphens, and common punctuation
  return query
    .replace(/[<>"']/g, "")
    .trim()
    .slice(0, 100);
}
