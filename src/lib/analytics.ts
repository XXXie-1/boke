// Analytics configuration for performance monitoring and user behavior tracking

export interface AnalyticsConfig {
  // Google Analytics 4 configuration
  gtag: {
    measurementId: string;
    enabled: boolean;
    sampleRate: number;
    debugMode: boolean;
  };
  
  // Custom analytics endpoint
  custom: {
    endpoint?: string;
    apiKey?: string;
    batchSize: number;
    flushInterval: number;
    retryAttempts: number;
  };
  
  // Performance monitoring
  performance: {
    enabled: boolean;
    coreWebVitals: boolean;
    routeChanges: boolean;
    apiCalls: boolean;
    userInteractions: boolean;
    errors: boolean;
  };
  
  // User behavior tracking
  behavior: {
    enabled: boolean;
    pageViews: boolean;
    clicks: boolean;
    scrolls: boolean;
    formSubmissions: boolean;
    searchQueries: boolean;
  };
  
  // Privacy settings
  privacy: {
    anonymizeIp: boolean;
    respectDoNotTrack: boolean;
    cookieConsent: boolean;
    dataRetention: number; // days
  };
}

// Default analytics configuration
export const defaultAnalyticsConfig: AnalyticsConfig = {
  gtag: {
    measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
    enabled: !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    sampleRate: 10, // 10% sampling in production
    debugMode: process.env.NODE_ENV === 'development',
  },
  
  custom: {
    endpoint: process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT,
    apiKey: process.env.NEXT_PUBLIC_ANALYTICS_API_KEY,
    batchSize: 10,
    flushInterval: 30000, // 30 seconds
    retryAttempts: 3,
  },
  
  performance: {
    enabled: true,
    coreWebVitals: true,
    routeChanges: true,
    apiCalls: true,
    userInteractions: true,
    errors: true,
  },
  
  behavior: {
    enabled: true,
    pageViews: true,
    clicks: false, // Disabled by default for privacy
    scrolls: false, // Disabled by default for privacy
    formSubmissions: true,
    searchQueries: true,
  },
  
  privacy: {
    anonymizeIp: true,
    respectDoNotTrack: true,
    cookieConsent: true,
    dataRetention: 90, // 90 days
  },
};

// Analytics event types
export interface AnalyticsEvent {
  name: string;
  parameters?: Record<string, any>;
  timestamp: number;
  url: string;
  userAgent?: string;
  userId?: string;
  sessionId?: string;
}

// Performance-specific events
export interface PerformanceEvent extends AnalyticsEvent {
  metric_name: string;
  metric_value: number;
  metric_unit?: string;
  custom_map?: Record<string, any>;
}

// User behavior events
export interface BehaviorEvent extends AnalyticsEvent {
  action: string;
  category?: string;
  label?: string;
  value?: number;
}

// Analytics manager class
export class AnalyticsManager {
  private config: AnalyticsConfig;
  private eventQueue: AnalyticsEvent[] = [];
  private flushTimer?: NodeJS.Timeout;
  private sessionId: string;
  private userId?: string;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = { ...defaultAnalyticsConfig, ...config };
    this.sessionId = this.generateSessionId();
    
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private initialize(): void {
    // Initialize Google Analytics
    if (this.config.gtag.enabled && this.config.gtag.measurementId) {
      this.initializeGoogleAnalytics();
    }

    // Start batch flushing if custom analytics is enabled
    if (this.config.custom.endpoint) {
      this.startBatchFlushing();
    }

    // Track page view
    if (this.config.behavior.pageViews) {
      this.trackPageView();
    }

    // Setup performance monitoring
    if (this.config.performance.enabled) {
      this.setupPerformanceMonitoring();
    }
  }

  private initializeGoogleAnalytics(): void {
    // Load gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.gtag.measurementId}`;
    document.head.appendChild(script);

    // Initialize gtag
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).gtag = function gtag() {
      (window as any).dataLayer.push(arguments);
    };

    (window as any).gtag('js', new Date());
    (window as any).gtag('config', this.config.gtag.measurementId, {
      sample_rate: this.config.gtag.sampleRate,
      debug_mode: this.config.gtag.debugMode,
      anonymize_ip: this.config.privacy.anonymizeIp,
    });
  }

  private startBatchFlushing(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, this.config.custom.flushInterval);
  }

  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    return `${timestamp}-${random}`;
  }

  // Public methods
  public trackEvent(event: AnalyticsEvent): void {
    // Respect Do Not Track
    if (this.config.privacy.respectDoNotTrack && navigator.doNotTrack === '1') {
      return;
    }

    const enrichedEvent = {
      ...event,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      sessionId: this.sessionId,
      userId: this.userId,
    };

    // Send to Google Analytics
    if (this.config.gtag.enabled) {
      this.sendToGoogleAnalytics(enrichedEvent);
    }

    // Add to queue for custom analytics
    if (this.config.custom.endpoint) {
      this.eventQueue.push(enrichedEvent);
      
      // Flush immediately if batch size reached
      if (this.eventQueue.length >= this.config.custom.batchSize) {
        this.flushEvents();
      }
    }
  }

  private sendToGoogleAnalytics(event: AnalyticsEvent): void {
    if (!(window as any).gtag) return;

    const { name, parameters } = event;
    (window as any).gtag('event', name, parameters);
  }

  public trackPageView(path?: string): void {
    const pageView: BehaviorEvent = {
      name: 'page_view',
      action: 'page_view',
      category: 'navigation',
      parameters: {
        page_path: path || window.location.pathname,
        page_title: document.title,
        page_location: window.location.href,
      },
      timestamp: Date.now(),
      url: window.location.href,
    };

    this.trackEvent(pageView);
  }

  public trackPerformance(metricName: string, value: number, metadata?: Record<string, any>): void {
    if (!this.config.performance.enabled) return;

    const performanceEvent: PerformanceEvent = {
      name: 'performance_metric',
      metric_name: metricName,
      metric_value: value,
      metric_unit: 'milliseconds',
      custom_map: metadata,
      timestamp: Date.now(),
      url: window.location.href,
    };

    this.trackEvent(performanceEvent);
  }

  public trackUserInteraction(action: string, category?: string, label?: string, value?: number): void {
    if (!this.config.behavior.enabled) return;

    const interactionEvent: BehaviorEvent = {
      name: 'user_interaction',
      action,
      category,
      label,
      value,
      timestamp: Date.now(),
      url: window.location.href,
    };

    this.trackEvent(interactionEvent);
  }

  public trackError(error: Error, context?: Record<string, any>): void {
    if (!this.config.performance.errors) return;

    const errorEvent: AnalyticsEvent = {
      name: 'error',
      parameters: {
        error_message: error.message,
        error_stack: error.stack,
        error_name: error.name,
        ...context,
      },
      timestamp: Date.now(),
      url: window.location.href,
    };

    this.trackEvent(errorEvent);
  }

  public setUserId(userId: string): void {
    this.userId = userId;
    
    // Set in Google Analytics
    if (this.config.gtag.enabled && (window as any).gtag) {
      (window as any).gtag('config', this.config.gtag.measurementId, {
        user_id: userId,
      });
    }
  }

  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0 || !this.config.custom.endpoint) {
      return;
    }

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const response = await fetch(this.config.custom.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.custom.apiKey || '',
        },
        body: JSON.stringify({
          events,
          timestamp: Date.now(),
          source: 'nextjs-app',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      
      // Retry logic
      if (this.config.custom.retryAttempts > 0) {
        setTimeout(() => {
          this.eventQueue.unshift(...events);
        }, 5000);
      }
    }
  }

  private setupPerformanceMonitoring(): void {
    if (!this.config.performance.enabled) return;

    // Core Web Vitals
    if (this.config.performance.coreWebVitals) {
      this.setupCoreWebVitalsTracking();
    }

    // Route changes
    if (this.config.performance.routeChanges) {
      this.setupRouteChangeTracking();
    }

    // API calls
    if (this.config.performance.apiCalls) {
      this.setupApiCallTracking();
    }

    // User interactions
    if (this.config.performance.userInteractions) {
      this.setupInteractionTracking();
    }
  }

  private setupCoreWebVitalsTracking(): void {
    import('web-vitals').then((webVitals: any) => {
      const { getCLS, getFID, getFCP, getLCP, getTTFB } = webVitals;
      getCLS((metric: any) => this.trackPerformance('CLS', metric.value * 1000, { id: metric.id }));
      getFID((metric: any) => this.trackPerformance('FID', metric.value, { id: metric.id }));
      getFCP((metric: any) => this.trackPerformance('FCP', metric.value, { id: metric.id }));
      getLCP((metric: any) => this.trackPerformance('LCP', metric.value, { id: metric.id }));
      getTTFB((metric: any) => this.trackPerformance('TTFB', metric.value, { id: metric.id }));
    }).catch(() => {
      console.warn('Web vitals library not available');
    });
  }

  private setupRouteChangeTracking(): void {
    // This would integrate with Next.js router
    // Implementation depends on router setup
  }

  private setupApiCallTracking(): void {
    // Intercept fetch calls for performance tracking
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const startTime = performance.now();
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        
        this.trackPerformance('api_call', endTime - startTime, {
          url: args[0] as string,
          status: response.status,
          method: args[1]?.method || 'GET',
        });
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        
        this.trackPerformance('api_call_error', endTime - startTime, {
          url: args[0] as string,
          error: (error as Error).message,
        });
        
        throw error;
      }
    };
  }

  private setupInteractionTracking(): void {
    // Track click events
    if (this.config.behavior.clicks) {
      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        this.trackUserInteraction('click', 'interaction', target.tagName.toLowerCase());
      });
    }

    // Track scroll events (throttled)
    if (this.config.behavior.scrolls) {
      let scrollTimeout: NodeJS.Timeout;
      
      document.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          const scrollDepth = Math.round(
            (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
          );
          
          this.trackUserInteraction('scroll', 'interaction', `depth_${scrollDepth}`);
        }, 100);
      });
    }
  }

  public cleanup(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    // Flush remaining events
    this.flushEvents();
  }
}

// Global analytics instance
let analyticsManager: AnalyticsManager;

export function getAnalytics(config?: Partial<AnalyticsConfig>): AnalyticsManager {
  if (!analyticsManager) {
    analyticsManager = new AnalyticsManager(config);
  }
  return analyticsManager;
}

// React hook for analytics
export function useAnalytics() {
  return {
    trackEvent: (event: AnalyticsEvent) => getAnalytics().trackEvent(event),
    trackPageView: (path?: string) => getAnalytics().trackPageView(path),
    trackPerformance: (name: string, value: number, metadata?: Record<string, any>) =>
      getAnalytics().trackPerformance(name, value, metadata),
    trackUserInteraction: (action: string, category?: string, label?: string, value?: number) =>
      getAnalytics().trackUserInteraction(action, category, label, value),
    trackError: (error: Error, context?: Record<string, any>) =>
      getAnalytics().trackError(error, context),
    setUserId: (userId: string) => getAnalytics().setUserId(userId),
  };
}