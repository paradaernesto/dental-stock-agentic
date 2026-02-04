// TypeScript types for Supply Search Feature
// Spec 002: [ADW] Agregar feature de búsqueda de supplies

export interface Supply {
  id: string
  code: string
  name: string
  description: string | null
  quantity: number
  unit: string
  unitPrice: number
  supplier: string | null
  category: string
  createdAt: Date
  updatedAt: Date
}

export interface SearchParams {
  name?: string
  code?: string
}

export interface SearchResponse {
  supplies: Supply[]
  total: number
  query: SearchParams
}

export interface ApiError {
  error: string
  message: string
  statusCode: number
}
