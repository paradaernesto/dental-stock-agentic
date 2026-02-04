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
 * Sanitize search query to prevent injection
 */
export function sanitizeSearchQuery(query: string): string {
  // Remove any potentially harmful characters
  // Allow alphanumeric, spaces, hyphens, and common punctuation
  return query
    .replace(/[<>\"']/g, "")
    .trim()
    .slice(0, 100);
}
