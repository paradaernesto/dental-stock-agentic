"use client";

import React, { useState, useEffect, useCallback } from "react";
import { SuppliesList } from "@/app/components/SuppliesList";
import { Pagination } from "@/app/components/Pagination";
import type { SupplyDTO, GetSuppliesResult } from "@/lib/types/supplies";

export default function SuppliesListPage() {
  const [supplies, setSupplies] = useState<SupplyDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSupplies = useCallback(async (pageNum: number = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", pageNum.toString());
      params.set("limit", "20");

      const response = await fetch(`/api/supplies?${params.toString()}`);

      if (!response.ok) {
        if (response.status === 400) {
          const data = await response.json();
          throw new Error(data.error || "Invalid request");
        }
        throw new Error("Failed to fetch supplies");
      }

      const data: GetSuppliesResult = await response.json();
      setSupplies(data.supplies);
      setTotal(data.total);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setSupplies([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch supplies on mount and when page changes
  useEffect(() => {
    fetchSupplies(page);
  }, [page, fetchSupplies]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  return (
    <main className="supplies-list-page">
      <h1>Supplies Inventory</h1>
      <p>View all dental supplies and their stock levels</p>

      <SuppliesList
        supplies={supplies}
        isLoading={isLoading}
        error={error}
        emptyMessage="No supplies found. Add supplies to the inventory to see them here."
      />

      {!isLoading && !error && totalPages > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={handlePageChange}
        />
      )}
    </main>
  );
}
