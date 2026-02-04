import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const DEFAULT_PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(
      searchParams.get("limit") || String(DEFAULT_PAGE_SIZE),
      10
    );

    // Validate pagination parameters
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(Math.max(1, limit), 100);
    const skip = (validatedPage - 1) * validatedLimit;

    // Build the where clause
    // Note: SQLite is case-insensitive by default with Prisma's contains
    const whereClause = query
      ? {
          OR: [
            { name: { contains: query } },
            { code: { contains: query } },
          ],
        }
      : {};

    // Get total count for pagination
    const total = await prisma.supply.count({ where: whereClause });

    // Fetch supplies
    const supplies = await prisma.supply.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        code: true,
        stock: true,
        minStock: true,
      },
      skip,
      take: validatedLimit,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      data: supplies,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        total,
        totalPages: Math.ceil(total / validatedLimit),
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search supplies" },
      { status: 500 }
    );
  }
}
