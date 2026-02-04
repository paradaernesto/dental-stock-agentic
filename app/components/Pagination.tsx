"use client";

import React from "react";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

/**
 * Pagination component for navigating through search results
 */
export function Pagination({
  page,
  totalPages,
  total,
  onPageChange,
}: PaginationProps) {
  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  const handlePrevious = () => {
    if (canGoPrevious) {
      onPageChange(page - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onPageChange(page + 1);
    }
  };

  if (totalPages <= 1) {
    return (
      <div className="pagination" data-testid="pagination">
        <span className="total-results">{total} result(s)</span>
      </div>
    );
  }

  return (
    <div className="pagination" data-testid="pagination">
      <button
        onClick={handlePrevious}
        disabled={!canGoPrevious}
        className="pagination-button previous"
        aria-label="Previous page"
        data-testid="previous-page-button"
      >
        ← Previous
      </button>
      <span className="page-info" data-testid="page-info">
        Page {page} of {totalPages} ({total} results)
      </span>
      <button
        onClick={handleNext}
        disabled={!canGoNext}
        className="pagination-button next"
        aria-label="Next page"
        data-testid="next-page-button"
      >
        Next →
      </button>
    </div>
  );
}
