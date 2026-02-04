import { NextRequest, NextResponse } from "next/server";
import {
  createStockMovement,
  InsufficientStockError,
  SupplyNotFoundError,
} from "@/lib/services/stock-movements";
import { createStockMovementSchema } from "@/lib/validations/stock-movements";
import { ZodError } from "zod";

/**
 * POST /api/stock-movements
 *
 * Create a new stock movement (IN or OUT) for a supply.
 * Updates supply quantity atomically.
 */
export async function POST(request: NextRequest) {
  try {
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

    const { supplyId, type, quantity } = validationResult.data;

    // Create the stock movement
    const result = await createStockMovement({
      supplyId,
      type,
      quantity,
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

    // Log unexpected errors
    console.error("Create stock movement error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
