"use client";

import { useState, useEffect, useCallback } from "react";

interface Supply {
  id: string;
  name: string;
  code: string;
  stock: number;
  minStock: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface SearchResponse {
  data: Supply[];
  pagination: Pagination;
}

const DEBOUNCE_MS = 300;

export default function SupplySearch() {
  const [query, setQuery] = useState("");
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const searchSupplies = useCallback(async (searchQuery: string) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.set("q", searchQuery.trim());
      }

      const response = await fetch(`/api/supplies/search?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to search supplies");
      }

      const result: SearchResponse = await response.json();
      setSupplies(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setSupplies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      searchSupplies(query);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query, searchSupplies]);

  // Initial load
  useEffect(() => {
    searchSupplies("");
  }, [searchSupplies]);

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= minStock) {
      return { label: "Low", className: "status-low" };
    }
    if (stock <= minStock * 1.5) {
      return { label: "Medium", className: "status-medium" };
    }
    return { label: "Good", className: "status-good" };
  };

  return (
    <div className="supply-search">
      <div className="search-input-wrapper">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search supplies by name or code..."
          className="search-input"
          aria-label="Search supplies"
        />
        {loading && <span className="loading-indicator">Loading...</span>}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="results-container">
        {supplies.length === 0 && !loading && !error ? (
          <div className="no-results">No supplies found</div>
        ) : (
          <>
            <table className="supplies-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Stock</th>
                  <th>Min Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {supplies.map((supply) => {
                  const status = getStockStatus(supply.stock, supply.minStock);
                  return (
                    <tr key={supply.id}>
                      <td>{supply.name}</td>
                      <td>{supply.code}</td>
                      <td>{supply.stock}</td>
                      <td>{supply.minStock}</td>
                      <td>
                        <span className={`status-badge ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {pagination && pagination.totalPages > 1 && (
              <div className="pagination">
                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <span className="pagination-total">
                  ({pagination.total} total results)
                </span>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .supply-search {
          width: 100%;
        }

        .search-input-wrapper {
          position: relative;
          margin-bottom: 1.5rem;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem;
          font-size: 1rem;
          border: 1px solid #ddd;
          border-radius: 0.5rem;
          outline: none;
          transition: border-color 0.2s;
        }

        .search-input:focus {
          border-color: #0070f3;
        }

        .loading-indicator {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
          font-size: 0.875rem;
        }

        .error-message {
          padding: 1rem;
          background-color: #ffebee;
          color: #c62828;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }

        .no-results {
          padding: 2rem;
          text-align: center;
          color: #666;
          font-style: italic;
        }

        .supplies-table {
          width: 100%;
          border-collapse: collapse;
          background-color: white;
          border-radius: 0.5rem;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .supplies-table th,
        .supplies-table td {
          padding: 0.875rem 1rem;
          text-align: left;
          border-bottom: 1px solid #eee;
        }

        .supplies-table th {
          background-color: #f5f5f5;
          font-weight: 600;
          color: #333;
        }

        .supplies-table tr:last-child td {
          border-bottom: none;
        }

        .supplies-table tr:hover {
          background-color: #f9f9f9;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-good {
          background-color: #e8f5e9;
          color: #2e7d32;
        }

        .status-medium {
          background-color: #fff3e0;
          color: #ef6c00;
        }

        .status-low {
          background-color: #ffebee;
          color: #c62828;
        }

        .pagination {
          margin-top: 1rem;
          padding: 0.75rem;
          text-align: center;
          color: #666;
          font-size: 0.875rem;
        }

        .pagination-total {
          margin-left: 0.5rem;
        }
      `}</style>
    </div>
  );
}
