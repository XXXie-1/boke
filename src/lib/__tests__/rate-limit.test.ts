import { NextRequest } from 'next/server';
import { rateLimit, slidingWindowRateLimit, actionRateLimit, isBlocked, blockUser } from '@/lib/rate-limit';

// Mock crypto module
jest.mock('crypto', () => ({
  createHash: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn(() => 'a1b2c3d4e5f6789012345678'),
  })),
}));

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Clear the rate limit store before each test
    const rateLimitStore = (require('@/lib/rate-limit') as any).rateLimitStore;
    rateLimitStore.clear();
    
    // Mock Date.now for consistent testing
    jest.spyOn(Date, 'now').mockReturnValue(1000000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('rateLimit', () => {
    it('should allow requests within limit', async () => {
      const request = createMockRequest();
      const config = { windowMs: 60000, max: 10 };
      
      for (let i = 0; i < 5; i++) {
        const result = await rateLimit(request, config);
        expect(result.success).toBe(true);
        expect(result.remaining).toBe(10 - i - 1);
      }
    });

    it('should block requests exceeding limit', async () => {
      const request = createMockRequest();
      const config = { windowMs: 60000, max: 3 };
      
      // First 3 requests should succeed
      for (let i = 0; i < 3; i++) {
        const result = await rateLimit(request, config);
        expect(result.success).toBe(true);
      }
      
      // 4th request should fail
      const result = await rateLimit(request, config);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should reset after window expires', async () => {
      const request = createMockRequest();
      const config = { windowMs: 60000, max: 2 };
      
      // Use up the limit
      for (let i = 0; i < 2; i++) {
        await rateLimit(request, config);
      }
      
      // Should be blocked
      let result = await rateLimit(request, config);
      expect(result.success).toBe(false);
      
      // Advance time beyond window
      jest.spyOn(Date, 'now').mockReturnValue(1000000 + 60001);
      
      // Should be allowed again
      result = await rateLimit(request, config);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(1);
    });

    it('should handle different clients separately', async () => {
      const request1 = createMockRequest('192.168.1.1', 'browser1');
      const request2 = createMockRequest('192.168.1.2', 'browser2');
      const config = { windowMs: 60000, max: 2 };
      
      // Use up limit for first client
      for (let i = 0; i < 2; i++) {
        await rateLimit(request1, config);
      }
      
      // First client should be blocked
      const result1 = await rateLimit(request1, config);
      expect(result1.success).toBe(false);
      
      // Second client should still be allowed
      const result2 = await rateLimit(request2, config);
      expect(result2.success).toBe(true);
    });
  });

  describe('slidingWindowRateLimit', () => {
    it('should implement sliding window correctly', async () => {
      const request = createMockRequest();
      const config = { windowMs: 60000, max: 3 };
      
      // Make requests at different times
      const times = [0, 10000, 20000, 30000, 40000]; // 0s, 10s, 20s, 30s, 40s
      
      for (let i = 0; i < times.length; i++) {
        jest.spyOn(Date, 'now').mockReturnValue(1000000 + times[i]);
        const result = await slidingWindowRateLimit(request, config);
        
        if (i < 3) {
          expect(result.success).toBe(true);
        } else {
          expect(result.success).toBe(false);
        }
      }
    });

    it('should allow requests as old ones fall out of window', async () => {
      const request = createMockRequest();
      const config = { windowMs: 30000, max: 2 };
      
      // Make 2 requests
      await slidingWindowRateLimit(request, config);
      await slidingWindowRateLimit(request, config);
      
      // Should be blocked
      let result = await slidingWindowRateLimit(request, config);
      expect(result.success).toBe(false);
      
      // Advance time beyond window for first request
      jest.spyOn(Date, 'now').mockReturnValue(1000000 + 31000);
      
      // Should be allowed again
      result = await slidingWindowRateLimit(request, config);
      expect(result.success).toBe(true);
    });
  });

  describe('actionRateLimit', () => {
    it('should rate limit specific actions separately', async () => {
      const request = createMockRequest();
      const config = { windowMs: 60000, max: 2 };
      
      // Use up login limit
      for (let i = 0; i < 2; i++) {
        const result = await actionRateLimit(request, 'login', config);
        expect(result.success).toBe(true);
      }
      
      // Login should be blocked
      let loginResult = await actionRateLimit(request, 'login', config);
      expect(loginResult.success).toBe(false);
      
      // Register should still be allowed
      let registerResult = await actionRateLimit(request, 'register', config);
      expect(registerResult.success).toBe(true);
    });
  });

  describe('blocking functionality', () => {
    it('should block and unblock users', () => {
      const request = createMockRequest();
      
      // Initially not blocked
      expect(isBlocked(request)).toBe(false);
      
      // Block user
      blockUser(request, 60000);
      expect(isBlocked(request)).toBe(true);
      
      // Unblock after time passes
      jest.spyOn(Date, 'now').mockReturnValue(1000000 + 60001);
      expect(isBlocked(request)).toBe(false);
    });

    it('should handle different blocking durations', () => {
      const request = createMockRequest();
      
      // Block for 5 minutes
      blockUser(request, 5 * 60 * 1000);
      expect(isBlocked(request)).toBe(true);
      
      // Still blocked after 4 minutes
      jest.spyOn(Date, 'now').mockReturnValue(1000000 + 4 * 60 * 1000);
      expect(isBlocked(request)).toBe(true);
      
      // Unblocked after 6 minutes
      jest.spyOn(Date, 'now').mockReturnValue(1000000 + 6 * 60 * 1000);
      expect(isBlocked(request)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle requests without IP address', async () => {
      const request = {
        headers: new Headers(),
        ip: null,
      } as any;
      
      const config = { windowMs: 60000, max: 10 };
      const result = await rateLimit(request, config);
      
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it('should handle requests without user agent', async () => {
      const request = {
        headers: new Headers(),
        ip: '127.0.0.1',
      } as any;
      
      const config = { windowMs: 60000, max: 10 };
      const result = await rateLimit(request, config);
      
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it('should handle forwarded IP addresses', async () => {
      const request = {
        headers: new Headers([['x-forwarded-for', '203.0.113.1, 192.168.1.1']]),
        ip: '127.0.0.1',
      } as any;
      
      const config = { windowMs: 60000, max: 10 };
      const result = await rateLimit(request, config);
      
      expect(result.success).toBe(true);
      // Should use the first IP in the forwarded header
      expect(result.remaining).toBe(9);
    });
  });
});

function createMockRequest(ip: string = '127.0.0.1', userAgent: string = 'test-browser'): NextRequest {
  const headers = new Headers();
  headers.set('user-agent', userAgent);
  headers.set('x-forwarded-for', ip);
  
  return {
    headers,
    ip,
  } as any;
}