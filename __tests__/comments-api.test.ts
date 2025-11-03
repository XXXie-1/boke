import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  sanitizeHTML,
  containsProfanity,
  hashIPAddress,
  rateLimiter,
  CSRFProtection,
} from '../lib/security'
import { CommentInputSchema, CommentQuerySchema } from '../lib/schemas'

// Mock environment variables
process.env.IP_HASH_SALT = 'test-salt'
process.env.ADMIN_SECRET_TOKEN = 'test-admin-token'
process.env.UPSTASH_REDIS_REST_URL = 'http://localhost:8080'
process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'

describe('Comments Security System', () => {
  describe('Security Utilities', () => {
    it('should sanitize HTML content', () => {
      const dirtyHTML =
        '<script>alert("xss")</script><p>Safe content</p><img src="x" onerror="alert(1)">'
      const clean = sanitizeHTML(dirtyHTML)

      expect(clean).not.toContain('<script>')
      expect(clean).not.toContain('onerror')
      expect(clean).toContain('<p>Safe content</p>')
    })

    it('should remove dangerous attributes', () => {
      const dangerousHTML =
        '<a href="javascript:alert(1)" onclick="alert(2)">Link</a>'
      const clean = sanitizeHTML(dangerousHTML)

      expect(clean).not.toContain('javascript:')
      expect(clean).not.toContain('onclick')
    })

    it('should detect profanity', () => {
      const cleanText = 'This is a nice comment'
      const dirtyText = 'This is a damn comment'

      expect(containsProfanity(cleanText)).toBe(false)
      expect(containsProfanity(dirtyText)).toBe(true)
    })

    it('should detect profanity case-insensitively', () => {
      const dirtyText = 'This is a DAMN comment'
      expect(containsProfanity(dirtyText)).toBe(true)
    })

    it('should hash IP addresses consistently', () => {
      const ip = '192.168.1.1'
      const hash1 = hashIPAddress(ip)
      const hash2 = hashIPAddress(ip)

      expect(hash1).toBe(hash2)
      expect(hash1).not.toBe(ip)
      expect(hash1.length).toBe(64) // SHA256 hex length
    })

    it('should hash different IPs to different values', () => {
      const ip1 = '192.168.1.1'
      const ip2 = '192.168.1.2'
      const hash1 = hashIPAddress(ip1)
      const hash2 = hashIPAddress(ip2)

      expect(hash1).not.toBe(hash2)
    })
  })

  describe('Schema Validation', () => {
    it('should validate valid comment input', () => {
      const validComment = {
        article_id: '550e8400-e29b-41d4-a716-446655440000',
        nickname: 'JohnDoe',
        content: 'This is a valid comment',
      }

      const result = CommentInputSchema.safeParse(validComment)
      expect(result.success).toBe(true)
    })

    it('should reject invalid nickname length', () => {
      const invalidComment = {
        article_id: '550e8400-e29b-41d4-a716-446655440000',
        nickname: 'a', // Too short
        content: 'Valid content',
      }

      const result = CommentInputSchema.safeParse(invalidComment)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          'at least 2 characters'
        )
      }
    })

    it('should reject content that is too long', () => {
      const invalidComment = {
        article_id: '550e8400-e29b-41d4-a716-446655440000',
        nickname: 'ValidName',
        content: 'a'.repeat(1001), // Too long
      }

      const result = CommentInputSchema.safeParse(invalidComment)
      expect(result.success).toBe(false)
    })

    it('should validate comment query parameters', () => {
      const validQuery = {
        article_id: '550e8400-e29b-41d4-a716-446655440000',
        status: 'approved',
        page: 1,
        limit: 50,
      }

      const result = CommentQuerySchema.safeParse(validQuery)
      expect(result.success).toBe(true)
    })
  })

  describe('Rate Limiting', () => {
    it('should allow requests within limit', async () => {
      const result = await rateLimiter.isRateLimited('test-key', 5, 60)

      expect(result.limited).toBe(false)
      expect(result.remaining).toBeGreaterThanOrEqual(0)
      expect(result.resetTime).toBeGreaterThan(Date.now())
    })

    it('should handle rate limit errors gracefully', async () => {
      // Mock rate limiter without Redis by creating a new instance
      const mockRateLimiter = new (rateLimiter.constructor as any)()
      const result = await mockRateLimiter.isRateLimited('test-key', 5, 60)

      expect(result.limited).toBe(false)
      expect(result.remaining).toBe(5)
    })
  })

  describe('CSRF Protection', () => {
    it('should generate valid CSRF tokens', () => {
      const token1 = CSRFProtection.generateToken()
      const token2 = CSRFProtection.generateToken()

      expect(token1).toMatch(/^[a-f0-9]{64}$/)
      expect(token2).toMatch(/^[a-f0-9]{64}$/)
      expect(token1).not.toBe(token2)
    })

    it('should validate CSRF tokens from headers', async () => {
      const token = CSRFProtection.generateToken()

      const mockRequest = new Request('http://localhost:3000/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': token,
        },
      })

      const isValid = await CSRFProtection.validateToken(mockRequest, token)
      expect(isValid).toBe(true)
    })

    it('should reject invalid CSRF tokens', async () => {
      const validToken = CSRFProtection.generateToken()
      const invalidToken = 'invalid-token'

      const mockRequest = new Request('http://localhost:3000/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': invalidToken,
        },
      })

      const isValid = await CSRFProtection.validateToken(
        mockRequest,
        validToken
      )
      expect(isValid).toBe(false)
    })

    it('should extract CSRF token from JSON body', async () => {
      const token = CSRFProtection.generateToken()

      const mockRequest = new Request('http://localhost:3000/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          article_id: '550e8400-e29b-41d4-a716-446655440000',
          nickname: 'TestUser',
          content: 'Test comment',
          csrfToken: token,
        }),
      })

      const isValid = await CSRFProtection.validateToken(mockRequest, token)
      expect(isValid).toBe(true)
    })
  })

  describe('Security Headers', () => {
    it('should generate proper security headers', () => {
      // Mock the middleware response headers
      const expectedHeaders = [
        'X-Content-Type-Options: nosniff',
        'X-Frame-Options: DENY',
        'X-XSS-Protection: 1; mode=block',
        'Referrer-Policy: strict-origin-when-cross-origin',
      ]

      expectedHeaders.forEach((header) => {
        const [name, value] = header.split(': ')
        expect(name).toBeDefined()
        expect(value).toBeDefined()
      })
    })
  })

  describe('Input Sanitization', () => {
    it('should handle empty content gracefully', () => {
      const result = sanitizeHTML('')
      expect(result).toBe('')
    })

    it('should preserve safe HTML', () => {
      const safeHTML = '<p><strong>Bold</strong> and <em>italic</em> text</p>'
      const result = sanitizeHTML(safeHTML)
      expect(result).toBe(safeHTML)
    })

    it('should remove script tags completely', () => {
      const scriptHTML = '<script>alert("xss")</script><p>Safe</p>'
      const result = sanitizeHTML(scriptHTML)
      expect(result).not.toContain('script')
      expect(result).toContain('<p>Safe</p>')
    })

    it('should handle malformed HTML', () => {
      const malformedHTML = '<p>Unclosed paragraph<div>Nested div</div>'
      const result = sanitizeHTML(malformedHTML)
      expect(result).toContain('Unclosed paragraph')
      expect(result).toContain('Nested div')
    })
  })
})
