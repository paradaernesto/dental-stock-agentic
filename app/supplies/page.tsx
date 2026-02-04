"use client";

import React, { useState, useCallback } from "react";
import { SearchBar } from "@/app/components/SearchBar";
import { SuppliesList } from "@/app/components/SuppliesList";
import { Pagination } from "@/app/components/Pagination";
import type { Supply } from "@/lib/types";

interface SearchResult {
  supplies: Supply[];
  total: number;
  page: number;
  totalPages: number;
}

export default function SuppliesPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const performSearch = useCallback(
    async (searchQuery: string, page: number = 1) => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (searchQuery) {
          params.set("q", searchQuery);
        }
        params.set("page", page.toString());
        params.set("limit", "20");

        const response = await fetch(`/api/supplies/search?${params.toString()}`);

        if (!response.ok) {
          if (response.status === 400) {
            const data = await response.json();
            throw new Error(data.error || "Invalid search query");
          }
          throw new Error("Failed to search supplies");
        }

        const data: SearchResult = await response.json();
        setResults(data);
        setCurrentPage(page);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setResults(null);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleSearch = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);
      performSearch(newQuery, 1);
    },
    [performSearch]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      performSearch(query, newPage);
    },
    [query, performSearch]
  );

  return (
    <main className="supplies-page">
      <h1>Supplies Search</h1>
      <p>Search for dental supplies by name or category</p>

      <SearchBar
        onSearch={handleSearch}
        placeholder="Search by name or category..."
        debounceMs={300}
        initialValue={query}
      />

      <SuppliesList
        supplies={results?.supplies ?? []}
        isLoading={isLoading}
        error={error}
        emptyMessage={
          query
            ? `No supplies found for "${query}"`
            : "Start typing to search for supplies"
        }
      />

      {results && results.totalPages > 0 && (
        <Pagination
          page={results.page}
          totalPages={results.totalPages}
          total={results.total}
          onPageChange={handlePageChange}
        />
      )}
    </main>
  );
}
