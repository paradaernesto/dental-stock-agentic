// Test setup file
// Add global test setup here if needed
import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock window.matchMedia for Ant Design components
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver for Ant Design components
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;

// Suppress console warnings for Ant Design's getComputedStyle
const originalWarn = console.warn;
console.warn = (...args: unknown[]) => {
  const message = String(args[0]);
  if (
    message.includes("getComputedStyle") ||
    message.includes("Not implemented") ||
    message.includes("valueStyle is deprecated")
  ) {
    return;
  }
  originalWarn.apply(console, args);
};
