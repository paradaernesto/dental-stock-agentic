import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { GET } from '@/app/api/supplies/search/route'
import { NextRequest } from 'next/server'

const prisma = new PrismaClient()

// Mock supplies for testing
const testSupplies = [
  {
    code: 'TEST-001',
    name: 'Test Nitrile Gloves',
    description: 'Test gloves for unit testing',
    quantity: 100,
    unit: 'box',
    unitPrice: 10.00,
    supplier: 'TestSupplier',
    category: 'consumables',
  },
  {
    code: 'TEST-002',
    name: 'Test Dental Needles',
    description: 'Test needles for unit testing',
    quantity: 50,
    unit: 'box',
    unitPrice: 20.00,
    supplier: 'TestSupplier',
    category: 'consumables',
  },
  {
    code: 'TEST-003',
    name: 'Test Composite Resin',
    description: 'Test resin for unit testing',
    quantity: 25,
    unit: 'syringe',
    unitPrice: 45.00,
    supplier: 'TestSupplier',
    category: 'materials',
  },
]

describe('Supply Search API', () => {
  beforeAll(async () => {
    // Seed test data
    for (const supply of testSupplies) {
      await prisma.supply.upsert({
        where: { code: supply.code },
        update: supply,
        create: supply,
      })
    }
  })

  afterAll(async () => {
    // Clean up test data
    await prisma.supply.deleteMany({
      where: {
        code: {
          startsWith: 'TEST-',
        },
      },
    })
    await prisma.$disconnect()
  })

  describe('GET /api/supplies/search', () => {
    const createRequest = (searchParams: Record<string, string> = {}) => {
      const url = new URL('http://localhost:3000/api/supplies/search')
      Object.entries(searchParams).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
      return new NextRequest(url)
    }

    it('should return all supplies when no query params are provided', async () => {
      const request = createRequest()
      const response = await GET(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data).toHaveProperty('supplies')
      expect(data).toHaveProperty('total')
      expect(data).toHaveProperty('query')
      expect(Array.isArray(data.supplies)).toBe(true)
      expect(data.total).toBeGreaterThan(0)
    })

    it('should search supplies by name (case-insensitive partial match)', async () => {
      const request = createRequest({ name: 'gloves' })
      const response = await GET(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.supplies.length).toBeGreaterThan(0)

      const hasMatchingSupply = data.supplies.some(
        (s: { name: string }) => s.name.toLowerCase().includes('gloves')
      )
      expect(hasMatchingSupply).toBe(true)
    })

    it('should search supplies by code (case-insensitive partial match)', async () => {
      const request = createRequest({ code: 'TEST' })
      const response = await GET(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.supplies.length).toBeGreaterThan(0)

      const allMatchCode = data.supplies.every(
        (s: { code: string }) => s.code.includes('TEST')
      )
      expect(allMatchCode).toBe(true)
    })

    it('should search supplies by exact code', async () => {
      const request = createRequest({ code: 'TEST-001' })
      const response = await GET(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.supplies.length).toBeGreaterThanOrEqual(1)

      const exactMatch = data.supplies.find(
        (s: { code: string }) => s.code === 'TEST-001'
      )
      expect(exactMatch).toBeDefined()
      expect(exactMatch.name).toBe('Test Nitrile Gloves')
    })

    it('should search supplies by both name and code (OR logic)', async () => {
      const request = createRequest({ name: 'needles', code: 'TEST-003' })
      const response = await GET(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.supplies.length).toBeGreaterThan(0)

      // Should find supplies matching either name OR code
      const hasNeedles = data.supplies.some(
        (s: { name: string }) => s.name.toLowerCase().includes('needles')
      )
      const hasTestCode = data.supplies.some(
        (s: { code: string }) => s.code === 'TEST-003'
      )
      expect(hasNeedles || hasTestCode).toBe(true)
    })

    it('should return empty array for non-matching search', async () => {
      const request = createRequest({ name: 'NONEXISTENT-ITEM-XYZ' })
      const response = await GET(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.supplies).toEqual([])
      expect(data.total).toBe(0)
    })

    it('should respect the 50 results limit', async () => {
      const request = createRequest()
      const response = await GET(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.supplies.length).toBeLessThanOrEqual(50)
    })

    it('should include all required supply fields in response', async () => {
      const request = createRequest({ code: 'TEST-001' })
      const response = await GET(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      const supply = data.supplies[0]

      expect(supply).toHaveProperty('id')
      expect(supply).toHaveProperty('code')
      expect(supply).toHaveProperty('name')
      expect(supply).toHaveProperty('description')
      expect(supply).toHaveProperty('quantity')
      expect(supply).toHaveProperty('unit')
      expect(supply).toHaveProperty('unitPrice')
      expect(supply).toHaveProperty('supplier')
      expect(supply).toHaveProperty('category')
      expect(supply).toHaveProperty('createdAt')
      expect(supply).toHaveProperty('updatedAt')
    })

    it('should be case-insensitive for partial matches', async () => {
      const request1 = createRequest({ name: 'GLOVES' })
      const request2 = createRequest({ name: 'gloves' })
      const request3 = createRequest({ name: 'Gloves' })

      const response1 = await GET(request1)
      const response2 = await GET(request2)
      const response3 = await GET(request3)

      const data1 = await response1.json()
      const data2 = await response2.json()
      const data3 = await response3.json()

      expect(data1.total).toBe(data2.total)
      expect(data2.total).toBe(data3.total)
    })
  })
})
