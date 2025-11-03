# Secure Comments System Implementation

This document provides an overview of the secure comments system implemented in this Next.js application.

## 🚀 Features

### Security Features
- **XSS Protection**: DOMPurify server-side sanitization with configurable HTML whitelist
- **Input Validation**: Zod schemas for strict validation (nickname: 2-20 chars, content: ≤1000 chars)
- **Rate Limiting**: Per-IP per-article limiting using Upstash Redis/Vercel KV
- **CSRF Protection**: Next.js middleware with origin checks and token validation
- **Profanity Filtering**: Automatic detection and rejection of inappropriate language
- **IP Privacy**: Salted SHA-256 hashing of IP addresses
- **SQL Injection Prevention**: Parameterized Supabase RPC functions
- **Content Moderation**: Admin-only approval workflow with audit trail

### API Features
- **Threaded Comments**: Support for replies with parent-child relationships
- **Pagination**: Efficient pagination for large comment threads
- **Caching**: Intelligent caching for approved comments
- **Moderation Queue**: Admin interface for pending comment review
- **Bulk Operations**: Efficient batch processing for moderation

## 📁 File Structure

```
├── app/api/
│   ├── comments/
│   │   └── route.ts              # Public comment endpoints
│   └── admin/
│       └── comments/
│           ├── route.ts            # Admin moderation queue
│           └── [id]/
│               └── route.ts        # Individual comment moderation
├── lib/
│   ├── security.ts               # Security utilities (XSS, CSRF, rate limiting)
│   ├── secure-comments.ts         # Secure comment service
│   ├── csrf-client.ts           # Client-side CSRF utilities
│   └── schemas.ts               # Zod validation schemas
├── supabase/migrations/
│   └── 002_update_comments_for_security.sql  # Database schema
└── __tests__/
    ├── security-unit.test.ts      # Security unit tests
    └── comments-api.test.ts      # API integration tests
```

## 🔐 Security Implementation

### XSS Protection
```typescript
// DOMPurify configuration
const PURIFY_CONFIG = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'blockquote', 'code', 'pre', 'a', 'h1-h6', 'span'],
  ALLOWED_ATTR: ['href', 'title', 'class'],
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
  FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur'],
}
```

### Rate Limiting
```typescript
// 3 comments per 5 minutes per IP per article
const rateLimitResult = await rateLimiter.isRateLimited(
  `comment:${articleId}:${hashedIP}`, 
  3, 
  300 // 5 minutes
)
```

### CSRF Protection
```typescript
// Middleware validates origin and CSRF tokens
const isValidToken = await CSRFProtection.validateToken(request, sessionToken)
const isValidOrigin = validateOrigin(request)
```

### IP Hashing
```typescript
// Salted SHA-256 hashing
export function hashIPAddress(ip: string): string {
  const salt = process.env.IP_HASH_SALT || 'default-salt'
  return CryptoJS.SHA256(ip + salt).toString()
}
```

## 🗄️ Database Schema

### Comments Table
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  nickname TEXT NOT NULL,
  content TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id),
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  moderation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Security Function
```sql
CREATE OR REPLACE FUNCTION create_comment_secure(
  p_article_id UUID,
  p_nickname TEXT,
  p_content TEXT,
  p_ip_hash TEXT,
  p_parent_id UUID DEFAULT NULL
) RETURNS TABLE(...) AS $$
BEGIN
  -- Validate article exists and is published
  -- Validate parent comment (if provided)
  -- Insert with parameterized query
  -- Return created comment
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🌐 API Endpoints

### Public Endpoints

#### POST /api/comments
Create a new comment (requires CSRF token)

**Request:**
```json
{
  "article_id": "uuid",
  "nickname": "JohnDoe",
  "content": "Great article!",
  "parent_id": "uuid" // optional for replies
}
```

**Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "nickname": "JohnDoe",
    "content": "Great article!",
    "status": "pending",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "message": "Comment submitted successfully and is pending approval."
}
```

#### GET /api/comments
Fetch threaded comments for an article

**Query Parameters:**
- `article_id` (required): Article UUID
- `status` (optional): 'approved', 'pending', 'rejected'
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

### Admin Endpoints

All admin endpoints require authentication:
- `Authorization: Bearer <ADMIN_SECRET_TOKEN>` header, or
- `?token=<ADMIN_SECRET_TOKEN>` query parameter

#### GET /api/admin/comments
Get pending comments for moderation

#### PUT /api/admin/comments/[id]
Moderate a comment (approve/reject)

**Request:**
```json
{
  "status": "approved", // or "rejected"
  "moderation_reason": "Optional reason"
}
```

#### DELETE /api/admin/comments/[id]
Delete a comment (no replies allowed)

## 🧪 Testing

### Running Tests
```bash
# Run all security unit tests
npm run test

# Run specific test file
npx vitest run __tests__/security-unit.test.ts

# Run with coverage
npm run test:coverage
```

### Test Coverage
- ✅ HTML sanitization (XSS protection)
- ✅ Profanity detection
- ✅ IP hashing consistency
- ✅ Schema validation
- ✅ CSRF token generation/validation
- ✅ Rate limiting functionality
- ✅ Security headers
- ✅ Input sanitization edge cases

## 🔧 Configuration

### Environment Variables
```env
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Security
IP_HASH_SALT=your_random_salt_for_ip_hashing
ADMIN_SECRET_TOKEN=your_admin_secret_token_for_moderation

# Rate Limiting
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

# CSRF Protection
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Database Migration
```bash
# Apply the secure comments migration
supabase db push
```

## 🚀 Deployment

### Vercel Deployment
1. Set all environment variables in Vercel dashboard
2. Deploy with `vercel --prod`
3. Run database migrations
4. Configure Upstash Redis for rate limiting

### Security Headers
The middleware automatically adds these security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## 📊 Performance

### Caching Strategy
- Approved comments: 5-minute cache
- Pending comments: No cache (real-time moderation)
- Rate limiting: Redis-based distributed cache

### Database Optimization
- Indexed columns: article_id, status, parent_id, ip_hash, created_at
- Efficient pagination with OFFSET/LIMIT
- Threaded queries with JOIN optimization

### Rate Limiting
- Sliding window algorithm
- Distributed Redis storage
- Graceful fallback if Redis unavailable

## 🛡️ Security Considerations

### Threats Mitigated
1. **XSS Attacks**: DOMPurify sanitization
2. **CSRF Attacks**: Token-based protection
3. **SQL Injection**: Parameterized queries
4. **Spam/Abuse**: Rate limiting and profanity filtering
5. **Privacy Issues**: IP address hashing
6. **Unauthorized Access**: Admin token authentication
7. **Data Injection**: Zod schema validation

### Best Practices
- ✅ Server-side validation only (client can be bypassed)
- ✅ Principle of least privilege (RLS policies)
- ✅ Secure by default (comments start pending)
- ✅ Audit trail (moderation reasons)
- ✅ Defense in depth (multiple security layers)
- ✅ Fail securely (rate limiting fallback)

## 🔍 Monitoring & Logging

### Error Handling
- Structured error responses with appropriate HTTP codes
- Security errors logged for monitoring
- Rate limit violations tracked

### Audit Trail
- All moderation actions logged with reasons
- IP hashes stored for abuse detection
- Timestamp tracking for analysis

## 📈 Scalability

### Horizontal Scaling
- Redis-based rate limiting works across multiple instances
- Database connection pooling
- CDN-friendly caching headers

### Performance Optimization
- Efficient database queries with proper indexing
- Minimal memory usage with streaming responses
- Optimized for high-traffic scenarios

## 🔄 Future Enhancements

### Planned Features
- Advanced spam detection with ML
- Comment voting/flagging system
- Email notifications
- Rich text editor with limited formatting
- Real-time updates with WebSockets
- Comment analytics dashboard

### Security Improvements
- Advanced bot detection
- Geographic rate limiting
- Behavioral analysis
- Honeypot fields
- Advanced CAPTCHA integration

## 📞 Support

For questions about the secure comments system:
1. Check the [API Documentation](./comments-security.md)
2. Review the [Security Tests](../../__tests__/security-unit.test.ts)
3. Examine the [Database Schema](../../supabase/migrations/)
4. Consult the [Implementation Guide](./comments-security.md)