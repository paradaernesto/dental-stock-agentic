'use client'

import { useState, useCallback } from 'react'
import SupplySearch from '@/app/components/SupplySearch'
import SearchResults from '@/app/components/SearchResults'
import type { Supply, SearchResponse } from '@/lib/types'

export default function SuppliesPage() {
  const [supplies, setSupplies] = useState<Supply[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState<{ name?: string; code?: string }>({})

  const handleSearch = useCallback(async (params: { name?: string; code?: string }) => {
    setIsLoading(true)
    setError(null)
    setQuery(params)

    try {
      const searchParams = new URLSearchParams()

      if (params.name) {
        searchParams.append('name', params.name)
      }

      if (params.code) {
        searchParams.append('code', params.code)
      }

      const url = `/api/supplies/search?${searchParams.toString()}`
      const response = await fetch(url)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch supplies')
      }

      const data: SearchResponse = await response.json()
      setSupplies(data.supplies)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setSupplies([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <div className="supplies-page">
      <div className="page-container">
        <header className="page-header">
          <h1>Dental Supplies Inventory</h1>
          <p>Search and manage your dental clinic supplies</p>
        </header>

        <SupplySearch onSearch={handleSearch} isLoading={isLoading} />

        {error && (
          <div className="error-message" role="alert">
            <svg
              className="error-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <SearchResults supplies={supplies} isLoading={isLoading} query={query} />
      </div>

      <style jsx>{`
        .supplies-page {
          min-height: 100vh;
          background: #f9fafb;
          padding: 2rem 1rem;
        }

        .page-container {
          max-width: 1280px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 2rem;
          text-align: center;
        }

        .page-header h1 {
          margin: 0 0 0.5rem;
          font-size: 2.25rem;
          font-weight: 700;
          color: #111827;
        }

        .page-header p {
          margin: 0;
          font-size: 1.125rem;
          color: #6b7280;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          margin-bottom: 1.5rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #991b1b;
        }

        .error-icon {
          width: 1.5rem;
          height: 1.5rem;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .supplies-page {
            padding: 1rem 0.5rem;
          }

          .page-header h1 {
            font-size: 1.75rem;
          }

          .page-header p {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  )
}
