import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          data: [],
        })),
        data: [],
      })),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
  },
  createServerSupabaseClient: jest.fn(),
}));

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    getEntriesByType: jest.fn(() => []),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByName: jest.fn(() => []),
  },
});

// Mock crypto API
const mockCrypto = {
  getRandomValues: jest.fn(() => {
    const array = new Uint8Array(32);
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  }),
  subtle: {
    digest: jest.fn(() => Promise.resolve(new ArrayBuffer(32))),
  },
};

Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
});

// Mock Node.js crypto module for testing
jest.mock('crypto', () => ({
  randomBytes: jest.fn((size) => {
    const array = Array.from({length: size}, () => Math.floor(Math.random() * 256));
    return Buffer.from(array);
  }),
  createHash: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn(() => {
      // Generate a deterministic hash based on input for testing
      const hashArray = Array.from({length: 32}, () => Math.floor(Math.random() * 256));
      return Buffer.from(hashArray);
    }),
  })),
}));

// Add TextEncoder/TextDecoder for Node.js environment
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock fetch
global.fetch = jest.fn();

// Mock Image for Next.js Image component
Object.defineProperty(window, 'Image', {
  value: jest.fn(() => ({
    onload: null,
    onerror: null,
    src: '',
    width: 0,
    height: 0,
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock URL constructor for tests
const { URL: ActualURL } = require('url');

global.URL = class URL {
  constructor(url, base) {
    try {
      // Use actual URL constructor for valid URLs
      const actualUrl = new ActualURL(url, base);
      this.href = actualUrl.href;
      this.protocol = actualUrl.protocol;
      this.host = actualUrl.host;
      this.hostname = actualUrl.hostname;
      this.port = actualUrl.port;
      this.pathname = actualUrl.pathname;
      this.search = actualUrl.search;
      this.hash = actualUrl.hash;
      this.username = actualUrl.username;
      this.password = actualUrl.password;
      this.origin = actualUrl.origin;
    } catch (e) {
      // Still set basic properties for error cases
      this.href = url;
      this.protocol = '';
      this.host = '';
      this.hostname = '';
      this.port = '';
      this.pathname = '';
      this.search = '';
      this.hash = '';
      this.username = '';
      this.password = '';
      this.origin = '';
      throw e;
    }
  }
  
  toString() {
    return this.href;
  }
};