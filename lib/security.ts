import DOMPurify from 'isomorphic-dompurify'
import CryptoJS from 'crypto-js'
import { Redis } from '@upstash/redis'

// Configuration for DOMPurify
const PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'p',
    'br',
    'strong',
    'em',
    'u',
    'ol',
    'ul',
    'li',
    'blockquote',
    'code',
    'pre',
    'a',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'span',
  ],
  ALLOWED_ATTR: ['href', 'title', 'class'],
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: [
    'script',
    'iframe',
    'object',
    'embed',
    'form',
    'input',
    'button',
  ],
  FORBID_ATTR: [
    'onclick',
    'onload',
    'onerror',
    'onmouseover',
    'onfocus',
    'onblur',
  ],
}

// Profanity filter word list (basic - can be expanded)
const PROFANITY_WORDS = [
  'damn',
  'hell',
  'shit',
  'fuck',
  'ass',
  'bitch',
  'bastard',
  'crap',
  'piss',
  'dick',
  'pussy',
  'cock',
  'cunt',
  'whore',
  'slut',
]

// IP hashing with salt
export function hashIPAddress(ip: string): string {
  const salt = process.env.IP_HASH_SALT || 'default-salt-change-in-production'
  return CryptoJS.SHA256(ip + salt).toString()
}

// HTML sanitization with DOMPurify
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: PURIFY_CONFIG.ALLOWED_TAGS,
    ALLOWED_ATTR: PURIFY_CONFIG.ALLOWED_ATTR,
    ALLOW_DATA_ATTR: PURIFY_CONFIG.ALLOW_DATA_ATTR,
    FORBID_TAGS: PURIFY_CONFIG.FORBID_TAGS,
    FORBID_ATTR: PURIFY_CONFIG.FORBID_ATTR,
  })
}

// Profanity filter
export function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase()
  return PROFANITY_WORDS.some((word) => lowerText.includes(word))
}

export function filterProfanity(text: string): string {
  let filtered = text
  PROFANITY_WORDS.forEach((word) => {
    const regex = new RegExp(word, 'gi')
    filtered = filtered.replace(regex, '*'.repeat(word.length))
  })
  return filtered
}

// Rate limiting with Upstash Redis
export class RateLimiter {
  private redis: Redis | null = null

  constructor() {
    if (
      process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN
    ) {
      this.redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    }
  }

  async isRateLimited(
    identifier: string,
    limit: number = 5,
    window: number = 60 // seconds
  ): Promise<{ limited: boolean; remaining: number; resetTime: number }> {
    if (!this.redis) {
      // Fallback: no rate limiting if Redis is not configured
      return {
        limited: false,
        remaining: limit,
        resetTime: Date.now() + window * 1000,
      }
    }

    const key = `rate_limit:${identifier}`
    const now = Math.floor(Date.now() / 1000)
    const windowStart = now - window

    try {
      // Remove expired entries
      await this.redis.zremrangebyscore(key, 0, windowStart)

      // Count current requests
      const current = await this.redis.zcard(key)

      if (current >= limit) {
        // Rate limited
        const oldestRequest = await this.redis.zrange(key, 0, 0)
        const resetTime =
          oldestRequest.length > 0
            ? parseInt(String((oldestRequest[0] as any).member)) + window
            : now + window

        return {
          limited: true,
          remaining: 0,
          resetTime: resetTime * 1000,
        }
      }

      // Add current request
      await this.redis.zadd(key, { score: now, member: now.toString() })

      // Set expiration
      await this.redis.expire(key, window)

      return {
        limited: false,
        remaining: limit - current - 1,
        resetTime: now + window,
      }
    } catch (error) {
      console.error('Rate limiting error:', error)
      // Fallback: allow request if Redis fails
      return {
        limited: false,
        remaining: limit,
        resetTime: Date.now() + window * 1000,
      }
    }
  }
}

// CSRF token generation and validation
export class CSRFProtection {
  private static readonly TOKEN_LENGTH = 32
  private static readonly HEADER_NAME = 'X-CSRF-Token'

  static generateToken(): string {
    const array = new Uint8Array(this.TOKEN_LENGTH)
    crypto.getRandomValues(array)
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
      ''
    )
  }

  static async validateToken(
    request: Request,
    sessionToken: string
  ): Promise<boolean> {
    const headerToken = request.headers.get(this.HEADER_NAME)
    const bodyToken = await this.extractTokenFromBody(request)

    const token = headerToken || bodyToken

    if (!token) {
      return false
    }

    // Use constant-time comparison to prevent timing attacks
    return this.constantTimeCompare(token, sessionToken)
  }

  private static async extractTokenFromBody(
    request: Request
  ): Promise<string | null> {
    try {
      const contentType = request.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        const body = await request.clone().json()
        return body.csrfToken || null
      } else if (contentType?.includes('application/x-www-form-urlencoded')) {
        const formData = await request.clone().formData()
        return (formData.get('csrfToken') as string) || null
      }
    } catch (error) {
      // If body parsing fails, return null
    }
    return null
  }

  private static constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false
    }

    let result = 0
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i)
    }

    return result === 0
  }
}

// Origin validation for CSRF protection
export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const host = request.headers.get('host')

  const allowedOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_VERCEL_URL &&
      `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
    `https://${host}`,
  ].filter(Boolean) as string[]

  const checkOrigin = (url: string | null): boolean => {
    if (!url) return false
    try {
      const urlObj = new URL(url)
      return allowedOrigins.some((allowed) => {
        const allowedObj = new URL(allowed)
        return urlObj.origin === allowedObj.origin
      })
    } catch {
      return false
    }
  }

  return checkOrigin(origin) || checkOrigin(referer)
}

// Export instances
export const rateLimiter = new RateLimiter()
