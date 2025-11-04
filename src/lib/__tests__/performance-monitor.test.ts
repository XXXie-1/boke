import { renderHook, act } from '@testing-library/react';
import { getPerformanceMonitor, usePerformanceMonitor, validatePerformanceBudget } from '@/lib/performance-monitor';

// Mock performance API
const mockPerformance = {
  now: jest.fn(() => 1000),
  getEntriesByType: jest.fn(() => []),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(() => []),
  navigation: {
    loadEventEnd: 2000,
    navigationStart: 0,
    responseStart: 300,
    requestStart: 200,
  },
  memory: {
    usedJSHeapSize: 50 * 1024 * 1024, // 50MB
    totalJSHeapSize: 100 * 1024 * 1024, // 100MB
    jsHeapSizeLimit: 2048 * 1024 * 1024, // 2GB
  },
};

Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  writable: true,
});

// Mock PerformanceObserver
const mockPerformanceObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
}));

Object.defineProperty(window, 'PerformanceObserver', {
  value: mockPerformanceObserver,
  writable: true,
});

// Mock fetch for analytics
global.fetch = jest.fn();

describe('Performance Monitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset performance monitor instance
    (getPerformanceMonitor as any).performanceMonitor = null;
  });

  describe('getPerformanceMonitor', () => {
    it('should create a singleton instance', () => {
      const monitor1 = getPerformanceMonitor();
      const monitor2 = getPerformanceMonitor();
      expect(monitor1).toBe(monitor2);
    });

    it('should track metrics correctly', () => {
      const monitor = getPerformanceMonitor();
      
      monitor.addEntry('test-metric', 100);
      
      const metrics = monitor.getMetrics();
      const entries = monitor.getEntries();
      
      expect(entries).toHaveLength(1);
      expect(entries[0].name).toBe('test-metric');
      expect(entries[0].value).toBe(100);
    });

    it('should limit entries to prevent memory issues', () => {
      const monitor = getPerformanceMonitor();
      
      // Add more than 100 entries
      for (let i = 0; i < 150; i++) {
        monitor.addEntry(`metric-${i}`, i);
      }
      
      const entries = monitor.getEntries();
      expect(entries).toHaveLength(100);
      expect(entries[0].name).toBe('metric-50'); // Should start from 50
      expect(entries[99].name).toBe('metric-149');
    });
  });

  describe('usePerformanceMonitor', () => {
    it('should provide performance monitoring functions', () => {
      const { result } = renderHook(() => usePerformanceMonitor());
      
      expect(typeof result.current.trackRouteChange).toBe('function');
      expect(typeof result.current.trackApiResponse).toBe('function');
      expect(typeof result.current.trackBundleSize).toBe('function');
      expect(typeof result.current.trackMemoryUsage).toBe('function');
      expect(typeof result.current.getMetrics).toBe('function');
      expect(typeof result.current.getPerformanceScore).toBe('function');
      expect(typeof result.current.generateReport).toBe('function');
    });

    it('should track route changes', () => {
      const { result } = renderHook(() => usePerformanceMonitor());
      
      act(() => {
        result.current.trackRouteChange(500);
      });
      
      // Should not throw and should record the metric
      expect(result.current.getMetrics()).toHaveProperty('routeChangeTime');
    });

    it('should track API responses', () => {
      const { result } = renderHook(() => usePerformanceMonitor());
      
      act(() => {
        result.current.trackApiResponse('/api/test', 1000, 1200);
      });
      
      expect(result.current.getMetrics()).toHaveProperty('apiResponseTime');
    });

    it('should track bundle size', () => {
      const { result } = renderHook(() => usePerformanceMonitor());
      
      act(() => {
        result.current.trackBundleSize(500 * 1024); // 500KB
      });
      
      const metrics = result.current.getMetrics();
      expect(metrics.bundleSize).toBe(500 * 1024);
    });

    it('should track memory usage', () => {
      const { result } = renderHook(() => usePerformanceMonitor());
      
      act(() => {
        result.current.trackMemoryUsage();
      });
      
      const metrics = result.current.getMetrics();
      expect(metrics.memoryUsage).toBe(50 * 1024 * 1024); // 50MB
    });
  });

  describe('Performance Score', () => {
    it('should calculate perfect score for good metrics', () => {
      const monitor = getPerformanceMonitor();
      
      // Set good metrics
      monitor.addEntry('lcp', 2000); // Good: <2.5s
      monitor.addEntry('fid', 80); // Good: <100ms
      monitor.addEntry('cls', 0.05); // Good: <0.1
      monitor.addEntry('fcp', 1500); // Good: <1.8s
      
      const score = monitor.getPerformanceScore();
      expect(score).toBe(100);
    });

    it('should calculate reduced score for poor metrics', () => {
      const monitor = getPerformanceMonitor();
      
      // Set poor metrics
      monitor.addEntry('lcp', 5000); // Poor: >4s
      monitor.addEntry('fid', 400); // Poor: >300ms
      monitor.addEntry('cls', 0.3); // Poor: >0.25
      monitor.addEntry('fcp', 4000); // Poor: >3s
      
      const score = monitor.getPerformanceScore();
      expect(score).toBeLessThan(100);
      expect(score).toBeGreaterThan(0);
    });

    it('should handle missing metrics gracefully', () => {
      const monitor = getPerformanceMonitor();
      
      // No metrics set
      const score = monitor.getPerformanceScore();
      expect(score).toBe(100); // Should default to perfect score
    });
  });

  describe('Performance Report', () => {
    it('should generate a detailed report', () => {
      const monitor = getPerformanceMonitor();
      
      // Add some metrics
      monitor.addEntry('lcp', 2000);
      monitor.addEntry('fid', 80);
      monitor.addEntry('cls', 0.05);
      monitor.addEntry('fcp', 1500);
      monitor.addEntry('ttfb', 300);
      monitor.addEntry('pageLoad', 2000);
      
      const report = monitor.generateReport();
      
      expect(report).toContain('Performance Report');
      expect(report).toContain('Overall Score');
      expect(report).toContain('Core Web Vitals');
      expect(report).toContain('Custom Metrics');
      expect(report).toContain('LCP: 2000ms');
      expect(report).toContain('FID: 80ms');
      expect(report).toContain('CLS: 0.050');
    });

    it('should handle missing data gracefully', () => {
      const monitor = getPerformanceMonitor();
      
      const report = monitor.generateReport();
      
      expect(report).toContain('Performance Report');
      expect(report).toContain('N/A');
    });
  });

  describe('Analytics Integration', () => {
    it('should send metrics to analytics when available', () => {
      // Mock gtag
      global.gtag = jest.fn();
      
      const monitor = getPerformanceMonitor();
      monitor.addEntry('test-metric', 100, { source: 'test' });
      
      expect(global.gtag).toHaveBeenCalledWith('event', 'performance_metric', {
        metric_name: 'test-metric',
        metric_value: 100,
        custom_map: { source: 'test' }
      });
    });

    it('should send to custom analytics endpoint when configured', () => {
      process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT = 'https://analytics.example.com/metrics';
      
      const monitor = getPerformanceMonitor();
      monitor.addEntry('test-metric', 100);
      
      expect(fetch).toHaveBeenCalledWith(
        'https://analytics.example.com/metrics',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('test-metric')
        })
      );
      
      delete process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;
    });

    it('should handle analytics failures gracefully', () => {
      // Mock fetch to reject
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      const monitor = getPerformanceMonitor();
      
      // Should not throw
      expect(() => monitor.addEntry('test-metric', 100)).not.toThrow();
    });
  });

  describe('Performance Budget Validation', () => {
    it('should pass when metrics are within budget', () => {
      const metrics = {
        lcp: 2000,
        fcp: 1500,
        fid: 80,
        cls: 0.05,
        ttfb: 500,
        bundleSize: 200 * 1024, // 200KB
        routeChangeTime: 400
      };
      
      const result = validatePerformanceBudget(metrics);
      
      expect(result.passed).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should fail when metrics exceed budget', () => {
      const metrics = {
        lcp: 5000, // Exceeds 2500 budget
        fcp: 4000, // Exceeds 1800 budget
        fid: 400, // Exceeds 100 budget
        cls: 0.3, // Exceeds 0.1 budget
        ttfb: 1000, // Exceeds 800 budget
        bundleSize: 500 * 1024, // Exceeds 250KB budget
        routeChangeTime: 1000 // Exceeds 500 budget
      };
      
      const result = validatePerformanceBudget(metrics);
      
      expect(result.passed).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.violations.some(v => v.includes('LCP'))).toBe(true);
      expect(result.violations.some(v => v.includes('FCP'))).toBe(true);
    });

    it('should handle partial metrics', () => {
      const metrics = {
        lcp: 5000, // Exceeds budget
        fcp: 1500 // Within budget
      };
      
      const result = validatePerformanceBudget(metrics);
      
      expect(result.passed).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0]).toContain('LCP');
    });
  });

  describe('Cleanup', () => {
    it('should cleanup observers', () => {
      const monitor = getPerformanceMonitor();
      
      monitor.cleanup();
      
      expect(mockPerformanceObserver).toHaveBeenCalled();
    });
  });
});