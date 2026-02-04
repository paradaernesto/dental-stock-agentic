"use client";

import React, { useState, useCallback, useEffect } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
  initialValue?: string;
}

/**
 * Debounced search input component
 */
export function SearchBar({
  onSearch,
  placeholder = "Search supplies...",
  debounceMs = 300,
  initialValue = "",
}: SearchBarProps) {
  const [inputValue, setInputValue] = useState(initialValue);
  const [isTyping, setIsTyping] = useState(false);

  // Debounced search effect
  useEffect(() => {
    setIsTyping(true);
    const timer = setTimeout(() => {
      onSearch(inputValue);
      setIsTyping(false);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [inputValue, debounceMs, onSearch]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    },
    []
  );

  const handleClear = useCallback(() => {
    setInputValue("");
    onSearch("");
  }, [onSearch]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSearch(inputValue);
    },
    [inputValue, onSearch]
  );

  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <div className="search-input-wrapper">
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="search-input"
          aria-label="Search supplies"
          data-testid="search-input"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="clear-button"
            aria-label="Clear search"
            data-testid="clear-button"
          >
            ×
          </button>
        )}
        <button
          type="submit"
          className="search-button"
          aria-label="Search"
          data-testid="search-button"
        >
          Search
        </button>
      </div>
      {isTyping && (
        <span className="typing-indicator" data-testid="typing-indicator">
          Typing...
        </span>
      )}
    </form>
  );
}
