'use client'

import { formatCurrency } from '@/lib/utils'
import type { Supply } from '@/lib/types'

interface SearchResultsProps {
  supplies: Supply[]
  isLoading: boolean
  query: { name?: string; code?: string }
}

export default function SearchResults({ supplies, isLoading, query }: SearchResultsProps) {
  const hasQuery = query.name || query.code
  const isEmpty = supplies.length === 0

  if (isLoading) {
    return null
  }

  if (isEmpty && hasQuery) {
    return (
      <div className="no-results">
        <div className="no-results-content">
          <svg
            className="no-results-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h3>No supplies found</h3>
          <p>Try adjusting your search terms or clearing filters</p>
        </div>

        <style jsx>{`
          .no-results {
            padding: 3rem 1.5rem;
            text-align: center;
          }

          .no-results-content {
            max-width: 24rem;
            margin: 0 auto;
          }

          .no-results-icon {
            width: 4rem;
            height: 4rem;
            margin: 0 auto 1rem;
            color: #9ca3af;
          }

          .no-results h3 {
            margin: 0 0 0.5rem;
            font-size: 1.25rem;
            font-weight: 600;
            color: #111827;
          }

          .no-results p {
            margin: 0;
            font-size: 0.875rem;
            color: #6b7280;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="search-results">
      <div className="results-header">
        <h3>
          {isEmpty ? 'All Supplies' : 'Search Results'}{' '}
          <span className="count">({supplies.length})</span>
        </h3>
      </div>

      <div className="table-container">
        <table className="results-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Price</th>
              <th>Supplier</th>
            </tr>
          </thead>
          <tbody>
            {supplies.map((supply) => (
              <tr key={supply.id}>
                <td className="code-cell">
                  <code>{supply.code}</code>
                </td>
                <td className="name-cell">
                  <div className="name-content">
                    <span className="name">{supply.name}</span>
                    {supply.description && (
                      <span className="description">{supply.description}</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className="category-badge">{supply.category}</span>
                </td>
                <td className="quantity-cell">
                  <span className={supply.quantity < 50 ? 'low-stock' : ''}>
                    {supply.quantity}
                  </span>
                </td>
                <td>{supply.unit}</td>
                <td className="price-cell">{formatCurrency(supply.unitPrice)}</td>
                <td>{supply.supplier || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .search-results {
          width: 100%;
        }

        .results-header {
          margin-bottom: 1rem;
        }

        .results-header h3 {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
        }

        .count {
          font-weight: 400;
          color: #6b7280;
        }

        .table-container {
          overflow-x: auto;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }

        .results-table {
          width: 100%;
          border-collapse: collapse;
        }

        .results-table thead {
          background: #f9fafb;
        }

        .results-table th {
          padding: 0.75rem 1rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #6b7280;
          border-bottom: 1px solid #e5e7eb;
        }

        .results-table td {
          padding: 1rem;
          border-bottom: 1px solid #f3f4f6;
          font-size: 0.875rem;
          color: #374151;
        }

        .results-table tbody tr:last-child td {
          border-bottom: none;
        }

        .results-table tbody tr:hover {
          background: #f9fafb;
        }

        .code-cell code {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          background: #f3f4f6;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.8125rem;
          font-weight: 600;
          color: #1f2937;
        }

        .name-cell {
          max-width: 20rem;
        }

        .name-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .name {
          font-weight: 500;
          color: #111827;
        }

        .description {
          font-size: 0.8125rem;
          color: #6b7280;
          line-height: 1.4;
        }

        .category-badge {
          display: inline-block;
          padding: 0.25rem 0.625rem;
          background: #dbeafe;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
          color: #1e40af;
          text-transform: capitalize;
        }

        .quantity-cell {
          font-weight: 500;
        }

        .low-stock {
          color: #dc2626;
          font-weight: 600;
        }

        .price-cell {
          font-weight: 600;
          color: #059669;
        }

        @media (max-width: 1024px) {
          .results-table {
            font-size: 0.8125rem;
          }

          .results-table th,
          .results-table td {
            padding: 0.625rem;
          }

          .name-cell {
            max-width: 15rem;
          }
        }

        @media (max-width: 768px) {
          .table-container {
            border-radius: 0;
            border-left: none;
            border-right: none;
          }

          .results-table th:nth-child(7),
          .results-table td:nth-child(7) {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
