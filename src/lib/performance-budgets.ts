export const PERFORMANCE_BUDGETS = {
  // Core Web Vitals budgets (based on Google recommendations)
  coreWebVitals: {
    lcp: 2500, // Largest Contentful Paint - 2.5s
    fcp: 1800, // First Contentful Paint - 1.8s
    fid: 100, // First Input Delay - 100ms
    cls: 0.1, // Cumulative Layout Shift - 0.1
    ttfb: 800, // Time to First Byte - 800ms
  },
  
  // Bundle size budgets
  bundleSizes: {
    total: 250 * 1024, // Total JavaScript - 250KB gzipped
    vendor: 100 * 1024, // Vendor libraries - 100KB gzipped
    common: 50 * 1024, // Common chunks - 50KB gzipped
    individual: 50 * 1024, // Individual chunks - 50KB gzipped
  },
  
  // Performance metrics
  performance: {
    routeChangeTime: 500, // Route changes - 500ms
    apiResponseTime: 1000, // API responses - 1s
    imageLoadTime: 2000, // Image loading - 2s
    fontLoadTime: 1000, // Font loading - 1s
  },
  
  // Resource loading
  resources: {
    maxConcurrentRequests: 6, // Maximum concurrent requests
    maxImageSize: 2 * 1024 * 1024, // Maximum image size - 2MB
    maxVideoSize: 50 * 1024 * 1024, // Maximum video size - 50MB
    compressionRatio: 0.3, // Minimum compression ratio (70% compression)
  },
  
  // Memory usage
  memory: {
    maxJSHeapSize: 100 * 1024 * 1024, // Maximum JS heap size - 100MB
    maxTotalMemory: 200 * 1024 * 1024, // Maximum total memory - 200MB
  }
};

export const PERFORMANCE_THRESHOLDS = {
  // Scoring thresholds
  scores: {
    excellent: 90, // 90-100
    good: 70, // 70-89
    needsImprovement: 50, // 50-69
    poor: 0, // 0-49
  },
  
  // Monitoring thresholds
  alerts: {
    slowApi: 2000, // Alert if API response > 2s
    highMemoryUsage: 150 * 1024 * 1024, // Alert if memory > 150MB
    frequentErrors: 10, // Alert if >10 errors in 5 minutes
    highErrorRate: 0.05, // Alert if error rate > 5%
  },
  
  // Performance regression detection
  regression: {
    lcpIncrease: 500, // Alert if LCP increases by >500ms
    bundleSizeIncrease: 50 * 1024, // Alert if bundle size increases by >50KB
    performanceScoreDrop: 10, // Alert if performance score drops by >10 points
  }
};

export const OPTIMIZATION_TARGETS = {
  // Target metrics for optimization
  targets: {
    lcp: 1500, // Target LCP - 1.5s
    fcp: 1000, // Target FCP - 1s
    fid: 50, // Target FID - 50ms
    cls: 0.05, // Target CLS - 0.05
    ttfb: 400, // Target TTFB - 400ms
    performanceScore: 95, // Target performance score - 95
  },
  
  // Resource optimization
  resources: {
    imageCompression: 0.8, // Target 80% image compression
    fontSubsetting: true, // Use font subsetting
    codeSplitting: true, // Enable code splitting
    treeShaking: true, // Enable tree shaking
    minification: true, // Enable minification
  },
  
  // Caching strategies
  caching: {
    staticAssets: 31536000, // 1 year for static assets
    apiResponses: 300, // 5 minutes for API responses
    images: 2592000, // 30 days for images
    fonts: 2592000, // 30 days for fonts
  }
};

export const MONITORING_CONFIG = {
  // What to monitor
  metrics: [
    'lcp', 'fid', 'cls', 'fcp', 'ttfb',
    'routeChangeTime', 'apiResponseTime',
    'bundleSize', 'memoryUsage'
  ],
  
  // Sampling rates
  sampling: {
    production: 0.1, // 10% sampling in production
    development: 1.0, // 100% sampling in development
    staging: 0.5, // 50% sampling in staging
  },
  
  // Data retention
  retention: {
    rawMetrics: 7, // 7 days for raw metrics
    aggregatedMetrics: 90, // 90 days for aggregated metrics
    reports: 365, // 1 year for reports
  },
  
  // Alerting
  alerts: {
    email: true,
    slack: true,
    webhook: true,
    thresholds: PERFORMANCE_THRESHOLDS.alerts
  }
};

export const BUNDLE_ANALYSIS_CONFIG = {
  // Bundle analyzer settings
  analyzer: {
    analyzerMode: 'server',
    analyzerPort: 8888,
    openAnalyzer: false,
    generateStatsFile: true,
    statsFilename: 'bundle-stats.json',
    reportFilename: 'bundle-report.html',
    defaultSizes: 'parsed',
    excludeAssets: null,
  },
  
  // Analysis thresholds
  thresholds: {
    maxAssetSize: 500 * 1024, // 500KB per asset
    maxChunkSize: 250 * 1024, // 250KB per chunk
    maxEntrypointSize: 300 * 1024, // 300KB per entrypoint
    maxAssetModules: 100, // Maximum modules per asset
  },
  
  // What to analyze
  analyze: [
    'javascript',
    'css',
    'images',
    'fonts',
    'other'
  ]
};