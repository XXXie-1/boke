// Performance monitoring utilities for Core Web Vitals and custom metrics

interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  
  // Custom metrics
  routeChangeTime?: number;
  apiResponseTime?: number;
  bundleSize?: number;
  memoryUsage?: number;
}

interface PerformanceEntry {
  name: string;
  value: number;
  timestamp: number;
  url?: string;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private entries: PerformanceEntry[] = [];
  private observers: PerformanceObserver[] = [];
  
  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
      this.trackPageLoad();
    }
  }

  private initializeObservers(): void {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformancePaintTiming;
        if (lastEntry) {
          this.metrics.lcp = lastEntry.startTime;
          this.addEntry('lcp', lastEntry.startTime);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    }

    // First Input Delay (FID) and Event Timing
    if ('PerformanceObserver' in window) {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry instanceof PerformanceEventTiming && entry.startTime < 100) { // Only count quick interactions
            this.metrics.fid = entry.processingStart - entry.startTime;
            this.addEntry('fid', this.metrics.fid, { inputType: entry.name });
          }
        });
      });
      fidObserver.observe({ entryTypes: ['first-input', 'event'] });
      this.observers.push(fidObserver);
    }

    // Cumulative Layout Shift (CLS)
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.metrics.cls = clsValue;
            this.addEntry('cls', clsValue);
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    }

    // First Contentful Paint (FCP)
    if ('PerformanceObserver' in window) {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: PerformancePaintTiming) => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime;
            this.addEntry('fcp', entry.startTime);
          }
        });
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(fcpObserver);
    }

    // Navigation Timing
    if ('PerformanceObserver' in window) {
      const navObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry instanceof PerformanceNavigationTiming) {
            this.metrics.ttfb = entry.responseStart - entry.requestStart;
            this.addEntry('ttfb', this.metrics.ttfb);
          }
        });
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);
    }
  }

  private trackPageLoad(): void {
    // Track page load time
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const loadTime = navigation.loadEventEnd - (navigation.activationStart || 0);
        this.addEntry('pageLoad', loadTime);
      }
    });
  }

  public addEntry(name: string, value: number, metadata?: Record<string, any>): void {
    const entry: PerformanceEntry = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.href,
      metadata
    };
    this.entries.push(entry);
    
    // Keep only last 100 entries to prevent memory issues
    if (this.entries.length > 100) {
      this.entries = this.entries.slice(-100);
    }

    // Send to analytics if configured
    this.sendToAnalytics(entry);
  }

  public trackRouteChange(startTime: number): void {
    const endTime = performance.now();
    const routeChangeTime = endTime - startTime;
    this.metrics.routeChangeTime = routeChangeTime;
    this.addEntry('routeChange', routeChangeTime);
  }

  public trackApiResponse(url: string, startTime: number, endTime: number): void {
    const responseTime = endTime - startTime;
    this.metrics.apiResponseTime = responseTime;
    this.addEntry('apiResponse', responseTime, { url });
  }

  public trackBundleSize(size: number): void {
    this.metrics.bundleSize = size;
    this.addEntry('bundleSize', size);
  }

  public trackMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize;
      this.addEntry('memoryUsage', memory.usedJSHeapSize, {
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      });
    }
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getEntries(): PerformanceEntry[] {
    return [...this.entries];
  }

  public getPerformanceScore(): number {
    const metrics = this.metrics;
    let score = 100;

    // LCP scoring (good: <2.5s, needs improvement: 2.5s-4s, poor: >4s)
    if (metrics.lcp) {
      if (metrics.lcp > 4000) score -= 30;
      else if (metrics.lcp > 2500) score -= 15;
    }

    // FID scoring (good: <100ms, needs improvement: 100-300ms, poor: >300ms)
    if (metrics.fid) {
      if (metrics.fid > 300) score -= 25;
      else if (metrics.fid > 100) score -= 10;
    }

    // CLS scoring (good: <0.1, needs improvement: 0.1-0.25, poor: >0.25)
    if (metrics.cls) {
      if (metrics.cls > 0.25) score -= 25;
      else if (metrics.cls > 0.1) score -= 10;
    }

    // FCP scoring (good: <1.8s, needs improvement: 1.8s-3s, poor: >3s)
    if (metrics.fcp) {
      if (metrics.fcp > 3000) score -= 20;
      else if (metrics.fcp > 1800) score -= 10;
    }

    return Math.max(0, score);
  }

  private sendToAnalytics(entry: PerformanceEntry): void {
    // Send to analytics service (Google Analytics, custom endpoint, etc.)
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'performance_metric', {
        metric_name: entry.name,
        metric_value: entry.value,
        custom_map: entry.metadata
      });
    }

    // Also send to custom analytics endpoint if configured
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      }).catch(() => {
        // Silently fail to not affect user experience
      });
    }
  }

  public generateReport(): string {
    const metrics = this.metrics;
    const score = this.getPerformanceScore();
    
    return `
Performance Report - ${new Date().toISOString()}
Overall Score: ${score}/100

Core Web Vitals:
- Largest Contentful Paint (LCP): ${metrics.lcp ? `${metrics.lcp.toFixed(0)}ms` : 'N/A'}
- First Input Delay (FID): ${metrics.fid ? `${metrics.fid.toFixed(0)}ms` : 'N/A'}
- Cumulative Layout Shift (CLS): ${metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}
- First Contentful Paint (FCP): ${metrics.fcp ? `${metrics.fcp.toFixed(0)}ms` : 'N/A'}
- Time to First Byte (TTFB): ${metrics.ttfb ? `${metrics.ttfb.toFixed(0)}ms` : 'N/A'}

Custom Metrics:
- Route Change Time: ${metrics.routeChangeTime ? `${metrics.routeChangeTime.toFixed(0)}ms` : 'N/A'}
- API Response Time: ${metrics.apiResponseTime ? `${metrics.apiResponseTime.toFixed(0)}ms` : 'N/A'}
- Bundle Size: ${metrics.bundleSize ? `${(metrics.bundleSize / 1024).toFixed(2)}KB` : 'N/A'}
- Memory Usage: ${metrics.memoryUsage ? `${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB` : 'N/A'}
    `.trim();
  }

  public cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Global performance monitor instance
let performanceMonitor: PerformanceMonitor;

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor();
  }
  return performanceMonitor;
}

// React hook for performance monitoring
export function usePerformanceMonitor() {
  if (typeof window !== 'undefined' && !performanceMonitor) {
    performanceMonitor = new PerformanceMonitor();
  }
  
  return {
    trackRouteChange: (startTime: number) => performanceMonitor?.trackRouteChange(startTime),
    trackApiResponse: (url: string, startTime: number, endTime: number) => 
      performanceMonitor?.trackApiResponse(url, startTime, endTime),
    trackBundleSize: (size: number) => performanceMonitor?.trackBundleSize(size),
    trackMemoryUsage: () => performanceMonitor?.trackMemoryUsage(),
    getMetrics: () => performanceMonitor?.getMetrics() || {},
    getPerformanceScore: () => performanceMonitor?.getPerformanceScore() || 0,
    generateReport: () => performanceMonitor?.generateReport() || 'No data available'
  };
}

// Performance budget validation
export function validatePerformanceBudget(metrics: Partial<PerformanceMetrics>): {
  passed: boolean;
  violations: string[];
} {
  const violations: string[] = [];
  
  const budgets = {
    lcp: 2500,
    fcp: 1800,
    fid: 100,
    cls: 0.1,
    ttfb: 800,
    bundleSize: 250 * 1024, // 250KB
    routeChangeTime: 500
  };

  Object.entries(budgets).forEach(([metric, budget]) => {
    const value = metrics[metric as keyof PerformanceMetrics];
    if (value !== undefined && value > budget) {
      violations.push(`${metric.toUpperCase()}: ${value} exceeds budget of ${budget}`);
    }
  });

  return {
    passed: violations.length === 0,
    violations
  };
}