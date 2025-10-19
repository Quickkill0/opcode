import { afterEach, vi, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// Set Tauri environment before anything else
beforeEach(() => {
  // Mock __TAURI_INTERNALS__ to simulate Tauri environment
  const mockInvoke = vi.fn().mockResolvedValue({});

  (window as any).__TAURI__ = {
    invoke: mockInvoke,
  };
  (window as any).__TAURI_INTERNALS__ = {
    invoke: mockInvoke,
    metadata: {
      currentWindow: {
        label: 'test-window'
      }
    }
  };
  (window as any).__TAURI_METADATA__ = {
    currentWindow: {
      label: 'test-window'
    }
  };

  // Reset navigator to include Tauri in user agent
  Object.defineProperty(navigator, 'userAgent', {
    value: 'Mozilla/5.0 Tauri/2.0',
    configurable: true,
  });

  // Re-setup matchMedia for each test to ensure it's properly mocked
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation(query => {
      const listeners: Array<(e: any) => void> = [];
      const mockMediaQueryList = {
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn((callback: any) => {
          listeners.push(callback);
        }),
        removeListener: vi.fn((callback: any) => {
          const index = listeners.indexOf(callback);
          if (index > -1) listeners.splice(index, 1);
        }),
        addEventListener: vi.fn((event: string, callback: any) => {
          if (event === 'change') listeners.push(callback);
        }),
        removeEventListener: vi.fn((event: string, callback: any) => {
          if (event === 'change') {
            const index = listeners.indexOf(callback);
            if (index > -1) listeners.splice(index, 1);
          }
        }),
        dispatchEvent: vi.fn(() => true),
      };
      return mockMediaQueryList;
    }),
  });
});

// Mock Tauri API
vi.mock('@tauri-apps/api', () => ({
  invoke: vi.fn(),
  event: {
    listen: vi.fn(),
    emit: vi.fn(),
  },
}));

vi.mock('@tauri-apps/plugin-dialog', () => ({
  open: vi.fn(),
  save: vi.fn(),
}));

vi.mock('@tauri-apps/plugin-shell', () => ({
  Command: vi.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
  takeRecords() {
    return [];
  }
  root = null;
  rootMargin = '';
  thresholds = [];
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
} as any;

// Mock PointerEvent methods for Radix UI components
if (typeof Element !== 'undefined') {
  Element.prototype.hasPointerCapture = Element.prototype.hasPointerCapture || function() {
    return false;
  };
  Element.prototype.setPointerCapture = Element.prototype.setPointerCapture || function() {};
  Element.prototype.releasePointerCapture = Element.prototype.releasePointerCapture || function() {};
  Element.prototype.scrollIntoView = Element.prototype.scrollIntoView || function() {};
}
