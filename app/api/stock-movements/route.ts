import { NextRequest, NextResponse } from "next/server";
import {
  createStockMovement,
  getStockMovementsBySupplyId,
  InsufficientStockError,
  SupplyNotFoundError,
} from "@/lib/services/stock-movements";
import { createStockMovementSchema } from "@/lib/validations/stock-movements";
import { ZodError } from "zod";
import {
  initializeDatabase,
  formatDatabaseError,
  isPrismaConnectionError,
} from "@/lib/db";

/**
 * POST /api/stock-movements
 *
 * Create a new stock movement (IN or OUT) for a supply.
 * Updates supply quantity atomically.
 */
export async function POST(request: NextRequest) {
  try {
    // Ensure database is initialized (especially important on first request in serverless)
    const initResult = await initializeDatabase();
    if (!initResult.success) {
      console.error("[API /stock-movements] Database initialization failed:", initResult.error);
      return NextResponse.json(
        {
          error: "Database unavailable",
          details: "Failed to initialize database connection",
        },
        { status: 503 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input using Zod
    const validationResult = createStockMovementSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { supplyId, type, quantity, reason } = validationResult.data;

    // Create the stock movement
    const result = await createStockMovement({
      supplyId,
      type,
      quantity,
      reason,
    });

    return NextResponse.json(
      {
        movement: result.movement,
        supply: {
          id: result.supply.id,
          name: result.supply.name,
          code: result.supply.code,
          quantity: result.supply.quantity,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle specific error types
    if (error instanceof SupplyNotFoundError) {
      return NextResponse.json(
        { error: "Supply not found" },
        { status: 404 }
      );
    }

    if (error instanceof InsufficientStockError) {
      return NextResponse.json(
        { error: "Insufficient stock" },
        { status: 400 }
      );
    }

    // Handle Zod validation errors from service layer (if any)
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Handle database-specific errors
    if (isPrismaConnectionError(error)) {
      const dbError = formatDatabaseError(error);
      return NextResponse.json(
        { error: dbError.error, details: dbError.details },
        { status: 500 }
      );
    }

    // Log unexpected errors
    console.error("Create stock movement error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/stock-movements?supplyId={id}
 *
 * Fetch stock movement history for a specific supply.
 * Returns movements ordered by creation date descending (most recent first).
 */
export async function GET(request: NextRequest) {
  try {
    // Ensure database is initialized (especially important on first request in serverless)
    const initResult = await initializeDatabase();
    if (!initResult.success) {
      console.error("[API /stock-movements] Database initialization failed:", initResult.error);
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
    const supplyId = searchParams.get("supplyId");

    // Validate supplyId parameter
    if (!supplyId || supplyId.trim() === "") {
      return NextResponse.json(
        { error: "Invalid input", details: { supplyId: "Supply ID is required" } },
        { status: 400 }
      );
    }

    // Fetch stock movements for the supply
    const movements = await getStockMovementsBySupplyId(supplyId);

    return NextResponse.json(
      { movements },
      { status: 200 }
    );
  } catch (error) {
    // Handle database-specific errors
    if (isPrismaConnectionError(error)) {
      const dbError = formatDatabaseError(error);
      return NextResponse.json(
        { error: dbError.error, details: dbError.details },
        { status: 500 }
      );
    }

    // Log unexpected errors
    console.error("Get stock movements error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
