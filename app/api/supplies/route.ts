import { NextRequest, NextResponse } from "next/server";
import { getAllSupplies } from "@/lib/services/supplies";
import {
  getSuppliesSchema,
  sanitizePaginationParams,
} from "@/lib/validations/supplies";
import type { SupplyDTO, GetSuppliesResult } from "@/lib/types/supplies";

/**
 * GET /api/supplies?page={page}&limit={limit}
 *
 * List all supplies with pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const rawPage = searchParams.get("page") ?? "1";
    const rawLimit = searchParams.get("limit") ?? "20";

    // Validate input using Zod
    const validationResult = getSuppliesSchema.safeParse({
      page: rawPage,
      limit: rawLimit,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { page, limit } = validationResult.data;

    // Sanitize the pagination parameters
    const sanitizedParams = sanitizePaginationParams(page, limit);

    // Fetch supplies
    const result = await getAllSupplies({
      page: sanitizedParams.page,
      limit: sanitizedParams.limit,
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
    console.error("Get supplies error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
