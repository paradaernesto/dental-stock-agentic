import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Validation schema for search parameters
const searchParamsSchema = z.object({
  name: z.string().optional(),
  code: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const name = searchParams.get('name') || undefined
    const code = searchParams.get('code') || undefined

    // Validate search parameters
    const validationResult = searchParamsSchema.safeParse({ name, code })

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid search parameters',
          message: validationResult.error.message,
          statusCode: 400,
        },
        { status: 400 }
      )
    }

    // Build search query with case-insensitive partial matching
    // Note: SQLite doesn't support mode: 'insensitive', but LIKE operator is case-insensitive by default
    const whereClause: {
      OR?: Array<{
        name?: { contains: string }
        code?: { contains: string }
      }>
    } = {}

    if (name || code) {
      whereClause.OR = []

      if (name) {
        whereClause.OR.push({
          name: {
            contains: name,
          },
        })
      }

      if (code) {
        whereClause.OR.push({
          code: {
            contains: code,
          },
        })
      }
    }

    // Execute search query with pagination
    const supplies = await prisma.supply.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      take: 50, // Limit to 50 results as per requirements
      orderBy: [
        { code: 'asc' },
      ],
    })

    // Return search results
    return NextResponse.json({
      supplies,
      total: supplies.length,
      query: { name, code },
    })
  } catch (error) {
    console.error('Search API error:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        statusCode: 500,
      },
      { status: 500 }
    )
  }
}
