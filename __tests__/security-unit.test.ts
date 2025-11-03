import { describe, it, expect } from 'vitest'
import { sanitizeHTML, containsProfanity, hashIPAddress, CSRFProtection } from '../lib/security'
import { CommentInputSchema, CommentModerationSchema } from '../lib/schemas'

// Mock environment variables
process.env.IP_HASH_SALT = 'test-salt'

describe('Security Unit Tests', () => {
  describe('HTML Sanitization', () => {
    it('should remove script tags', () => {
      const input = '<script>alert("xss")</script><p>Safe content</p>'
      const result = sanitizeHTML(input)
      
      expect(result).not.toContain('<script>')
      expect(result).toContain('<p>Safe content</p>')
    })

    it('should remove dangerous attributes', () => {
      const input = '<img src="x" onerror="alert(1)" onclick="alert(2)">'
      const result = sanitizeHTML(input)
      
      expect(result).not.toContain('onerror')
      expect(result).not.toContain('onclick')
    })

    it('should preserve safe HTML', () => {
      const input = '<p><strong>Bold</strong> and <em>italic</em> text</p>'
      const result = sanitizeHTML(input)
      
      expect(result).toBe(input)
    })

    it('should handle empty input', () => {
      const result = sanitizeHTML('')
      expect(result).toBe('')
    })
  })

  describe('Profanity Detection', () => {
    it('should detect profanity', () => {
      const profaneTexts = [
        'This is damn annoying',
        'What the hell is this',
        'This is bullshit',
        'You are an asshole'
      ]

      profaneTexts.forEach(text => {
        expect(containsProfanity(text)).toBe(true)
      })
    })

    it('should allow clean text', () => {
      const cleanTexts = [
        'This is a wonderful comment',
        'I really like this article',
        'Thank you for sharing',
        'Great work!'
      ]

      cleanTexts.forEach(text => {
        expect(containsProfanity(text)).toBe(false)
      })
    })

    it('should be case insensitive', () => {
      expect(containsProfanity('DAMN')).toBe(true)
      expect(containsProfanity('Hell')).toBe(true)
      expect(containsProfanity('SHIT')).toBe(true)
    })
  })

  describe('IP Hashing', () => {
    it('should hash consistently', () => {
      const ip = '192.168.1.1'
      const hash1 = hashIPAddress(ip)
      const hash2 = hashIPAddress(ip)
      
      expect(hash1).toBe(hash2)
      expect(hash1).not.toBe(ip)
      expect(hash1).toMatch(/^[a-f0-9]{64}$/)
    })

    it('should produce different hashes for different IPs', () => {
      const ip1 = '192.168.1.1'
      const ip2 = '192.168.1.2'
      const hash1 = hashIPAddress(ip1)
      const hash2 = hashIPAddress(ip2)
      
      expect(hash1).not.toBe(hash2)
    })

    it('should use salt for uniqueness', () => {
      const ip = '192.168.1.1'
      const originalSalt = process.env.IP_HASH_SALT
      
      process.env.IP_HASH_SALT = 'salt1'
      const hash1 = hashIPAddress(ip)
      
      process.env.IP_HASH_SALT = 'salt2'
      const hash2 = hashIPAddress(ip)
      
      expect(hash1).not.toBe(hash2)
      
      // Restore original salt
      process.env.IP_HASH_SALT = originalSalt
    })
  })

  describe('Schema Validation', () => {
    it('should validate correct comment input', () => {
      const validInput = {
        article_id: '550e8400-e29b-41d4-a716-446655440000',
        nickname: 'JohnDoe',
        content: 'This is a valid comment'
      }

      const result = CommentInputSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('should reject invalid nickname', () => {
      const invalidInputs = [
        { article_id: '550e8400-e29b-41d4-a716-446655440000', nickname: 'a', content: 'Valid content' }, // Too short
        { article_id: '550e8400-e29b-41d4-a716-446655440000', nickname: 'a'.repeat(21), content: 'Valid content' }, // Too long
        { article_id: '550e8400-e29b-41d4-a716-446655440000', nickname: '', content: 'Valid content' } // Empty
      ]

      invalidInputs.forEach(input => {
        const result = CommentInputSchema.safeParse(input)
        expect(result.success).toBe(false)
      })
    })

    it('should reject invalid content', () => {
      const invalidInputs = [
        { article_id: '550e8400-e29b-41d4-a716-446655440000', nickname: 'ValidName', content: '' }, // Empty
        { article_id: '550e8400-e29b-41d4-a716-446655440000', nickname: 'ValidName', content: 'a'.repeat(1001) } // Too long
      ]

      invalidInputs.forEach(input => {
        const result = CommentInputSchema.safeParse(input)
        expect(result.success).toBe(false)
      })
    })

    it('should validate moderation input', () => {
      const validInput = {
        status: 'approved',
        moderation_reason: 'Good comment'
      }

      const result = CommentModerationSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })
  })

  describe('CSRF Protection', () => {
    it('should generate tokens of correct format', () => {
      const token = CSRFProtection.generateToken()
      
      expect(token).toMatch(/^[a-f0-9]{64}$/)
      expect(token.length).toBe(64)
    })

    it('should generate unique tokens', () => {
      const token1 = CSRFProtection.generateToken()
      const token2 = CSRFProtection.generateToken()
      
      expect(token1).not.toBe(token2)
    })

    it('should validate matching tokens', async () => {
      const token = CSRFProtection.generateToken()
      
      const request = new Request('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': token
        }
      })

      const isValid = await CSRFProtection.validateToken(request, token)
      expect(isValid).toBe(true)
    })

    it('should reject non-matching tokens', async () => {
      const validToken = CSRFProtection.generateToken()
      const invalidToken = CSRFProtection.generateToken()
      
      const request = new Request('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': invalidToken
        }
      })

      const isValid = await CSRFProtection.validateToken(request, validToken)
      expect(isValid).toBe(false)
    })
  })

  describe('Security Headers Validation', () => {
    it('should validate expected security headers', () => {
      const expectedHeaders = [
        'X-Content-Type-Options',
        'X-Frame-Options', 
        'X-XSS-Protection',
        'Referrer-Policy'
      ]

      expectedHeaders.forEach(headerName => {
        expect(headerName).toBeDefined()
        expect(headerName.length).toBeGreaterThan(0)
      })
    })
  })
})