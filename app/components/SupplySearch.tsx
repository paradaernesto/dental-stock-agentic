'use client'

import { useState, useEffect, useCallback } from 'react'

interface SupplySearchProps {
  onSearch: (params: { name?: string; code?: string }) => void
  isLoading: boolean
}

export default function SupplySearch({ onSearch, isLoading }: SupplySearchProps) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')

  // Debounce search with 300ms delay
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params: { name?: string; code?: string } = {}

      if (name.trim()) {
        params.name = name.trim()
      }

      if (code.trim()) {
        params.code = code.trim()
      }

      onSearch(params)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [name, code, onSearch])

  const handleClear = useCallback(() => {
    setName('')
    setCode('')
  }, [])

  return (
    <div className="supply-search">
      <div className="search-container">
        <div className="search-header">
          <h2>Search Dental Supplies</h2>
          {(name || code) && (
            <button
              onClick={handleClear}
              className="clear-button"
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </div>

        <div className="search-inputs">
          <div className="input-group">
            <label htmlFor="name-search">
              Search by Name
            </label>
            <input
              id="name-search"
              type="text"
              placeholder="e.g., Gloves, Needles..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              aria-label="Search by supply name"
            />
          </div>

          <div className="input-group">
            <label htmlFor="code-search">
              Search by Code
            </label>
            <input
              id="code-search"
              type="text"
              placeholder="e.g., SUP-001"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isLoading}
              aria-label="Search by supply code"
            />
          </div>
        </div>

        {isLoading && (
          <div className="loading-indicator" role="status" aria-live="polite">
            Searching...
          </div>
        )}
      </div>

      <style jsx>{`
        .supply-search {
          width: 100%;
          margin-bottom: 2rem;
        }

        .search-container {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1.5rem;
        }

        .search-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .search-header h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: #111827;
        }

        .clear-button {
          padding: 0.5rem 1rem;
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s;
        }

        .clear-button:hover {
          background: #e5e7eb;
        }

        .search-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        @media (max-width: 768px) {
          .search-inputs {
            grid-template-columns: 1fr;
          }
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        .input-group input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .input-group input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .input-group input:disabled {
          background: #f9fafb;
          color: #9ca3af;
          cursor: not-allowed;
        }

        .loading-indicator {
          margin-top: 1rem;
          padding: 0.75rem;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 6px;
          text-align: center;
          color: #1e40af;
          font-size: 0.875rem;
          font-weight: 500;
        }
      `}</style>
    </div>
  )
}
