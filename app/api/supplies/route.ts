import { NextRequest, NextResponse } from "next/server";
import { getSupplies, createSupply } from "@/lib/services/supplies";
import {
  createSupplySchema,
  paginationSchema,
} from "@/lib/validations/supplies";

/**
 * GET /api/supplies?page={page}&limit={limit}
 *
 * Get all supplies with pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const rawPage = searchParams.get("page") ?? "1";
    const rawLimit = searchParams.get("limit") ?? "20";

    // Validate input using Zod
    const validationResult = paginationSchema.safeParse({
      page: rawPage,
      limit: rawLimit,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid pagination parameters",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { page, limit } = validationResult.data;

    // Fetch supplies with pagination
    const result = await getSupplies(page, limit);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Get supplies error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/supplies
 *
 * Create a new supply
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input using Zod
    const validationResult = createSupplySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const supplyData = validationResult.data;

    // Create the supply
    const supply = await createSupply(supplyData);

    return NextResponse.json(supply, { status: 201 });
  } catch (error) {
    console.error("Create supply error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
