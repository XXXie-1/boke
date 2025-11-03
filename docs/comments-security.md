# Secure Comments System Documentation

This document describes the secure comments backend system implemented with Next.js, Zod validation, DOMPurify sanitization, rate limiting, and Supabase.

## Overview

The secure comments system provides:

- **Input Validation**: Zod schemas for nickname (2-20 chars), content (≤1000 chars), and optional parent_id
- **XSS Protection**: DOMPurify server-side sanitization with Markdown whitelist
- **Rate Limiting**: Per-IP per-article rate limiting using Upstash Redis/Vercel KV
- **CSRF Protection**: Next.js middleware with origin checks and CSRF tokens
- **Profanity Filtering**: Automatic detection and filtering of inappropriate language
- **IP Privacy**: Salted hashing of IP addresses before storage
- **Moderation**: Admin endpoints for approving/deleting comments
- **Database Security**: Parameterized RPC functions and RLS policies

## API Endpoints

### Public Endpoints

#### GET /api/comments

Fetch comments for an article with threading and pagination.

**Query Parameters:**

- `article_id` (required): UUID of the article
- `status` (optional): 'approved', 'pending', 'rejected' (default: 'approved')
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50, max: 100)

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "nickname": "John Doe",
      "content": "Sanitized comment content",
      "parent_id": null,
      "status": "approved",
      "created_at": "2024-01-01T00:00:00Z",
      "replies": [
        {
          "id": "uuid",
          "nickname": "Jane Smith",
          "content": "Reply content",
          "parent_id": "uuid",
          "status": "approved",
          "created_at": "2024-01-01T01:00:00Z"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  }
}
```

#### POST /api/comments

Create a new comment (starts as pending approval).

**Request Body:**

```json
{
  "article_id": "uuid",
  "nickname": "John Doe",
  "content": "This is my comment",
  "parent_id": "uuid" // optional for replies
}
```

**Response (201):**

```json
{
  "data": {
    "id": "uuid",
    "nickname": "John Doe",
    "content": "Sanitized content",
    "parent_id": null,
    "status": "pending",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "message": "Comment submitted successfully and is pending approval."
}
```

### Admin Endpoints

All admin endpoints require authentication via:

- `Authorization: Bearer <ADMIN_SECRET_TOKEN>` header, or
- `?token=<ADMIN_SECRET_TOKEN>` query parameter

#### GET /api/admin/comments

Get pending comments for moderation.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

#### PUT /api/admin/comments/[id]

Moderate a comment (approve or reject).

**Request Body:**

```json
{
  "status": "approved", // or "rejected"
  "moderation_reason": "Optional reason for rejection"
}
```

#### DELETE /api/admin/comments/[id]

Delete a comment (only if no replies exist).

## Security Features

### Input Validation

- Nickname: 2-20 characters, sanitized HTML
- Content: 1-1000 characters, sanitized HTML, profanity check
- Parent ID: Valid UUID, belongs to same article, approved status

### XSS Protection

DOMPurify configuration:

```javascript
{
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'blockquote', 'code', 'pre', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span'],
  ALLOWED_ATTR: ['href', 'title', 'class'],
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
  FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur']
}
```

### Rate Limiting

- **General API**: 10 requests per minute per IP per endpoint
- **Comments**: 3 comments per 5 minutes per IP per article
- Uses Upstash Redis/Vercel KV for distributed rate limiting
- Fallback to no limiting if Redis unavailable

### CSRF Protection

- Origin validation for all API requests
- CSRF token validation for POST/PUT/DELETE requests
- Security headers: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection

### IP Privacy

- IP addresses are hashed using SHA-256 with salt
- Original IPs are never stored
- Hashes used for rate limiting and abuse detection

### Profanity Filtering

- Basic profanity word list (can be expanded)
- Automatic rejection of comments with inappropriate language
- Server-side filtering only (client can be bypassed)

## Database Schema

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

### Security Functions

- `create_comment_secure()`: Parameterized RPC for secure comment insertion
- Row Level Security (RLS) policies for data access control
- Indexes for performance and security

## Environment Variables

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

## Testing

Run the test suite to verify security measures:

```bash
npm test
```

Tests cover:

- HTML sanitization
- Profanity detection
- IP hashing
- Rate limiting
- Input validation
- Authentication
- CSRF protection

## Migration

Run the database migration to update the comments table:

```sql
-- This will drop existing comments and recreate with security features
-- Run: supabase db push
```

## Error Handling

### Common Error Responses

**400 Bad Request:**

- Invalid input data
- Profanity detected
- Article not published
- Invalid parent comment

**401 Unauthorized:**

- Missing or invalid admin token

**403 Forbidden:**

- Invalid CSRF token
- Invalid origin

**404 Not Found:**

- Article not found
- Comment not found

**429 Too Many Requests:**

- Rate limit exceeded
- Includes `Retry-After` header

**500 Internal Server Error:**

- Database errors
- Unexpected server errors

## Performance Considerations

- Comments are cached for 5 minutes (approved comments only)
- Database indexes for optimal query performance
- Rate limiting uses Redis for horizontal scaling
- Content sanitization is optimized for performance

## Future Enhancements

- Advanced profanity filtering with context awareness
- Comment voting/flagging system
- Email notifications for new comments
- Comment editing functionality
- Rich text editor with limited formatting options
- Spam detection using machine learning
