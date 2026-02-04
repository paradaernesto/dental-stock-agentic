import { NextRequest, NextResponse } from "next/server";
import { searchSupplies } from "@/lib/services/supplies";
import {
  searchSuppliesSchema,
  sanitizeSearchQuery,
} from "@/lib/validations/supplies";
import type { SupplyDTO, GetSuppliesResult } from "@/lib/types/supplies";
import {
  initializeDatabase,
  formatDatabaseError,
  isPrismaConnectionError,
} from "@/lib/db";

/**
 * GET /api/supplies/search?q={query}&page={page}&limit={limit}
 *
 * Search supplies by name or code
 */
export async function GET(request: NextRequest) {
  try {
    // Ensure database is initialized (especially important on first request in serverless)
    const initResult = await initializeDatabase();
    if (!initResult.success) {
      console.error("[API /supplies/search] Database initialization failed:", initResult.error);
      return NextResponse.json(
        {
          error: "Database unavailable",
          details: "Failed to initialize database connection",
        },
        { status: 503 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get("q") ?? "";
    const rawPage = searchParams.get("page") ?? "1";
    const rawLimit = searchParams.get("limit") ?? "20";

    // Validate input using Zod
    const validationResult = searchSuppliesSchema.safeParse({
      query: rawQuery,
      page: rawPage,
      limit: rawLimit,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid search parameters",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { query, page, limit } = validationResult.data;

    // Sanitize the search query
    const sanitizedQuery = sanitizeSearchQuery(query ?? "");

    // Perform the search
    const result = await searchSupplies({
      query: sanitizedQuery,
      page,
      limit,
    });

    // Convert Supply objects to SupplyDTO (serialize dates to strings)
    const suppliesDTO: SupplyDTO[] = result.supplies.map((supply) => ({
      id: supply.id,
      name: supply.name,
      code: supply.code,
      description: supply.description,
      quantity: supply.quantity,
      minStock: supply.minStock,
      createdAt: supply.createdAt.toISOString(),
      updatedAt: supply.updatedAt.toISOString(),
    }));

    const response: GetSuppliesResult = {
      supplies: suppliesDTO,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Search supplies error:", error);

    // Handle database-specific errors
    if (isPrismaConnectionError(error)) {
      const dbError = formatDatabaseError(error);
      return NextResponse.json(
        { error: dbError.error, details: dbError.details },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
