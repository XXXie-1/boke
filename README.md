# Next.js Security & Performance Suite

A comprehensive Next.js application template with advanced security headers, rate limiting, performance monitoring, and optimized media handling.

## 🚀 Features

### 🔒 Security Features

- **Global Security Headers**: Content Security Policy (CSP), Referrer Policy, Permissions Policy
- **Advanced Rate Limiting**: Sliding window rate limiting with action-specific limits
- **Input Sanitization**: XSS protection, URL validation, email verification
- **CSRF Protection**: Token-based CSRF protection
- **Secure Authentication**: Password hashing, session management
- **Supabase Security**: Row-level security, permission validation

### ⚡ Performance Features

- **Core Web Vitals Monitoring**: Real-time LCP, FID, CLS tracking
- **Optimized Media Components**: Lazy-loaded images and videos with blur placeholders
- **Bundle Analysis**: Automated bundle size analysis and optimization
- **Caching Strategies**: Next.js revalidate and stale-while-revalidate patterns
- **Performance Budgets**: Configurable budgets and alerts
- **Analytics Integration**: Google Analytics 4 and custom analytics

### 🧪 Testing & Quality

- **Comprehensive Test Suite**: Jest/Testing Library tests for all utilities
- **Security Tests**: Input sanitization, rate limiting validation
- **Performance Tests**: Core Web Vitals monitoring tests
- **Type Safety**: Full TypeScript coverage
- **Code Quality**: ESLint with security rules

## 📋 Requirements

- Node.js 18+ 
- npm or yarn
- Supabase account (optional, for database features)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nextjs-security-performance
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables (see Configuration section)

5. Run the development server:
```bash
npm run dev
```

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Security
RATE_LIMIT_SECRET=your-super-secret-rate-limit-key

# Supabase (optional)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Analytics (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_ANALYTICS_ENDPOINT=https://your-analytics-endpoint.com/api/events

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Security Headers Configuration

Security headers are configured in `next.config.ts`:

```typescript
// Content Security Policy tailored for Supabase and DiceBear
"img-src 'self' data: blob: https://*.supabase.co https://api.dicebear.com"
"connect-src 'self' https://*.supabase.co https://api.dicebear.com wss://*.supabase.co"
```

### Rate Limiting Configuration

Rate limiting is configured in `src/middleware.ts`:

```typescript
const RATE_LIMITS = {
  '/api/': { windowMs: 15 * 60 * 1000, max: 100 }, // API endpoints
  '/api/auth': { windowMs: 15 * 60 * 1000, max: 5 }, // Auth endpoints
  '/public': { windowMs: 15 * 60 * 1000, max: 1000 }, // Public endpoints
  'default': { windowMs: 15 * 60 * 1000, max: 200 }, // Default
};
```

## 📊 Performance Monitoring

### Core Web Vitals

The application automatically tracks:

- **Largest Contentful Paint (LCP)**: Target < 2.5s
- **First Input Delay (FID)**: Target < 100ms  
- **Cumulative Layout Shift (CLS)**: Target < 0.1
- **First Contentful Paint (FCP)**: Target < 1.8s
- **Time to First Byte (TTFB)**: Target < 800ms

### Performance Budgets

Configure budgets in `src/lib/performance-budgets.ts`:

```typescript
export const PERFORMANCE_BUDGETS = {
  coreWebVitals: {
    lcp: 2500,    // 2.5s
    fcp: 1800,    // 1.8s
    fid: 100,     // 100ms
    cls: 0.1,     // 0.1
    ttfb: 800,    // 800ms
  },
  bundleSizes: {
    total: 250 * 1024,  // 250KB gzipped
    vendor: 100 * 1024,  // 100KB gzipped
  },
};
```

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

The test suite covers:

- Security helpers (`src/lib/__tests__/security-helpers.test.ts`)
- Rate limiting (`src/lib/__tests__/rate-limit.test.ts`)
- Performance monitoring (`src/lib/__tests__/performance-monitor.test.ts`)

## 📈 Analytics & Monitoring

### Google Analytics 4

Configure GA4 in your environment:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Custom Analytics

Set up a custom analytics endpoint:

```bash
NEXT_PUBLIC_ANALYTICS_ENDPOINT=https://your-analytics-endpoint.com/api/events
NEXT_PUBLIC_ANALYTICS_API_KEY=your-api-key
```

### Performance Reports

Generate detailed performance reports:

```typescript
import { getPerformanceMonitor } from '@/lib/performance-monitor';

const monitor = getPerformanceMonitor();
const report = monitor.generateReport();
console.log(report);
```

## 🔧 Usage

### Security Helpers

```typescript
import { sanitizeHtml, sanitizeUrl, validateEmail } from '@/lib/security-helpers';

// Sanitize HTML input
const cleanHtml = sanitizeHtml(userInput);

// Validate URLs
const safeUrl = sanitizeUrl(userUrl);

// Validate emails
const isValidEmail = validateEmail(userEmail);
```

### Rate Limiting

```typescript
import { rateLimit } from '@/lib/rate-limit';

// Apply rate limiting in API routes
const result = await rateLimit(request, {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests
});

if (!result.success) {
  return new Response('Too Many Requests', { status: 429 });
}
```

### Performance Monitoring

```typescript
import { usePerformanceMonitor } from '@/lib/performance-monitor';

function MyComponent() {
  const { trackPerformance, getPerformanceScore } = usePerformanceMonitor();
  
  useEffect(() => {
    trackPerformance('component_load', performance.now());
  }, []);
  
  return <div>Performance Score: {getPerformanceScore()}</div>;
}
```

### Optimized Media

```typescript
import { OptimizedImage, OptimizedVideo } from '@/components/OptimizedMedia';

// Lazy-loaded image with blur placeholder
<OptimizedImage
  src="/image.jpg"
  alt="Description"
  width={300}
  height={200}
  lazy
  fadeInDuration={300}
/>

// Lazy-loaded video
<OptimizedVideo
  src="/video.mp4"
  poster="/poster.jpg"
  width={640}
  height={360}
  controls
  lazy
/>
```

## 📦 Bundle Analysis

Analyze your bundle size:

```bash
# Generate bundle analysis
npm run analyze

# Or with environment variable
ANALYZE=true npm run build
```

## 🚀 Deployment

### Environment Setup

1. Set production environment variables
2. Configure your domain in CSP headers
3. Set up analytics endpoints
4. Configure Supabase if using database features

### Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start

# Type check before deployment
npm run type-check
```

## 🔍 Security Best Practices

### Content Security Policy

The CSP is configured to allow:
- Self-hosted resources
- Supabase domains (`*.supabase.co`)
- DiceBear API (`api.dicebear.com`)
- Google Fonts
- Vercel live preview

### Rate Limiting

- API endpoints: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes  
- Public endpoints: 1000 requests per 15 minutes
- Default: 200 requests per 15 minutes

### Input Validation

All user inputs are validated and sanitized:
- HTML content is escaped
- URLs are validated against allowlist
- Emails follow RFC 5322 format
- File uploads are restricted by type and size

## 📚 API Reference

### Security Helpers

- `sanitizeHtml(input: string): string` - Sanitize HTML content
- `sanitizeUrl(url: string): string` - Validate and sanitize URLs
- `validateEmail(email: string): boolean` - Validate email format
- `generateSecureToken(length?: number): string` - Generate secure random tokens
- `hashPassword(password: string, salt?: string): Promise<string>` - Hash passwords
- `verifyPassword(password: string, hash: string): Promise<boolean>` - Verify passwords

### Rate Limiting

- `rateLimit(request: NextRequest, config: RateLimitConfig): Promise<RateLimitResult>` - Basic rate limiting
- `slidingWindowRateLimit(request: NextRequest, config: RateLimitConfig): Promise<RateLimitResult>` - Sliding window rate limiting
- `actionRateLimit(request: NextRequest, action: string, config: RateLimitConfig): Promise<RateLimitResult>` - Action-specific rate limiting
- `isBlocked(request: NextRequest): boolean` - Check if user is blocked
- `blockUser(request: NextRequest, durationMs?: number): void` - Block a user temporarily

### Performance Monitoring

- `getPerformanceMonitor(): PerformanceMonitor` - Get singleton monitor instance
- `usePerformanceMonitor()` - React hook for performance monitoring
- `validatePerformanceBudget(metrics: Partial<PerformanceMetrics>): BudgetValidation` - Validate against budgets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Web Vitals Guide](https://web.dev/vitals/)
- [CSP Guide](https://csp-evaluator.withgoogle.com/)

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check the documentation
- Review the test files for usage examples