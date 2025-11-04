'use client';

import { useEffect, useState } from 'react';
import { OptimizedImage, OptimizedVideo } from '@/components/OptimizedMedia';
import { usePerformanceMonitor } from '@/lib/performance-monitor';
import { useAnalytics } from '@/lib/analytics';
import { sanitizeHtml } from '@/lib/security-helpers';

export default function Home() {
  const [performanceScore, setPerformanceScore] = useState<number>(0);
  const [metrics, setMetrics] = useState<any>({});
  const { trackPerformance, trackPageView } = useAnalytics();
  const { getPerformanceScore, getMetrics, trackMemoryUsage } = usePerformanceMonitor();

  useEffect(() => {
    // Track page view
    trackPageView();
    
    // Get performance metrics
    const updateMetrics = () => {
      const score = getPerformanceScore();
      const currentMetrics = getMetrics();
      
      setPerformanceScore(score);
      setMetrics(currentMetrics);
      
      // Track performance score
      trackPerformance('performance_score', score);
      trackMemoryUsage();
    };

    // Initial metrics
    updateMetrics();

    // Update metrics periodically
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, [getPerformanceScore, getMetrics, trackPerformance, trackPageView, trackMemoryUsage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-black dark:to-zinc-900">
      {/* Header with performance indicator */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <OptimizedImage
                src="/next.svg"
                alt="Next.js logo"
                width={120}
                height={24}
                priority
                className="dark:invert"
              />
              <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Security & Performance Demo
              </h1>
            </div>
            
            {/* Performance Score Badge */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Performance Score:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                performanceScore >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                performanceScore >= 70 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {performanceScore}/100
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h2 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            Next.js Security & Performance Suite
          </h2>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto">
            Comprehensive security headers, rate limiting, performance monitoring, and optimized media handling
            for modern Next.js applications.
          </p>
        </section>

        {/* Security Features */}
        <section className="mb-16">
          <h3 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-8 text-center">
            🔒 Security Features
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Security Headers
              </h4>
              <p className="text-zinc-600 dark:text-zinc-400">
                Content Security Policy, Referrer Policy, Permissions Policy, and more configured globally.
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-700">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Rate Limiting
              </h4>
              <p className="text-zinc-600 dark:text-zinc-400">
                Advanced rate limiting with sliding windows, action-specific limits, and automatic blocking.
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-700">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Input Sanitization
              </h4>
              <p className="text-zinc-600 dark:text-zinc-400">
                XSS protection, URL validation, email verification, and secure token generation.
              </p>
            </div>
          </div>
        </section>

        {/* Performance Features */}
        <section className="mb-16">
          <h3 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-8 text-center">
            ⚡ Performance Features
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-700">
              <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                Core Web Vitals Monitoring
              </h4>
              <div className="space-y-3">
                {Object.entries(metrics).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 uppercase">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-sm text-zinc-900 dark:text-zinc-100">
                      {typeof value === 'number' ? `${value.toFixed(1)}ms` : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-700">
              <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                Optimized Media Components
              </h4>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Lazy-loaded Image:</p>
                  <OptimizedImage
                    src="https://picsum.photos/seed/demo/300/200.jpg"
                    alt="Demo image"
                    width={300}
                    height={200}
                    className="rounded-lg"
                    lazy
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testing Section */}
        <section className="mb-16">
          <h3 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-8 text-center">
            🧪 Testing & Quality
          </h3>
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-700">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              This application includes comprehensive tests for security helpers, rate limiting, and performance monitoring.
              Run the tests with:
            </p>
            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-lg p-4 font-mono text-sm">
              <div>npm test</div>
              <div>npm run test:coverage</div>
              <div>npm run bundle:analyze</div>
            </div>
          </div>
        </section>

        {/* Security Demo */}
        <section className="mb-16">
          <h3 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-8 text-center">
            🛡️ Security Demo
          </h3>
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-700">
            <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              HTML Sanitization Example
            </h4>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Unsafe Input:</p>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                  <code className="text-sm text-red-700 dark:text-red-400">
                    {'<script>alert("XSS Attack")</script>'}
                  </code>
                </div>
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Sanitized Output:</p>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3">
                  <code className="text-sm text-green-700 dark:text-green-400">
                    {sanitizeHtml('<script>alert("XSS Attack")</script>')}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            <p>Next.js Security & Performance Suite - Built with modern web standards</p>
            <p className="mt-2">Performance Score: {performanceScore}/100 | Security: Enabled | Monitoring: Active</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
