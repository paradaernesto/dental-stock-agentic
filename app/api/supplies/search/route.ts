import { NextRequest, NextResponse } from "next/server";
import { searchSupplies } from "@/lib/services/supplies";
import {
  searchSuppliesSchema,
  sanitizeSearchQuery,
} from "@/lib/validations/supplies";

/**
 * GET /api/supplies/search?q={query}&page={page}&limit={limit}
 *
 * Search supplies by name or code
 */
export async function GET(request: NextRequest) {
  try {
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

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Search supplies error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
