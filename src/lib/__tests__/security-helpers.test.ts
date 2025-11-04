import { sanitizeHtml, sanitizeUrl, validateEmail, generateSecureToken, hashPassword, verifyPassword } from '@/lib/security-helpers';

describe('Security Helpers', () => {
  describe('sanitizeHtml', () => {
    it('should escape HTML characters', () => {
      const input = '<script>alert("xss")</script>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });

    it('should remove JavaScript event handlers', () => {
      const input = '<div onclick="alert(\'xss\')">Click me</div>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('onclick');
    });

    it('should remove javascript: protocol', () => {
      const input = '<a href="javascript:alert(\'xss\')">Link</a>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('javascript:');
    });

    it('should handle empty or null input', () => {
      expect(sanitizeHtml('')).toBe('');
      expect(sanitizeHtml(null as any)).toBe('');
      expect(sanitizeHtml(undefined as any)).toBe('');
    });

    it('should limit input length', () => {
      const longInput = 'a'.repeat(15000);
      const result = sanitizeHtml(longInput);
      expect(result.length).toBeLessThanOrEqual(10000);
    });
  });

  describe('sanitizeUrl', () => {
    it('should allow valid HTTP/HTTPS URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://localhost:3000',
        'https://api.example.com/v1/users'
      ];
      
      validUrls.forEach(url => {
        const result = sanitizeUrl(url);
        expect(result).toBe(url);
      });
    });

    it('should reject dangerous protocols', () => {
      const dangerousUrls = [
        'javascript:alert("xss")',
        'data:text/html,<script>alert("xss")</script>',
        'vbscript:msgbox("xss")',
        'file:///etc/passwd'
      ];
      
      dangerousUrls.forEach(url => {
        const result = sanitizeUrl(url);
        expect(result).toBe('');
      });
    });

    it('should remove URL fragments and credentials', () => {
      const url = 'https://user:pass@example.com/path#fragment';
      const result = sanitizeUrl(url);
      expect(result).toBe('https://example.com/path');
      expect(result).not.toContain('user:pass');
      expect(result).not.toContain('#fragment');
    });

    it('should handle empty or null input', () => {
      expect(sanitizeUrl('')).toBe('');
      expect(sanitizeUrl(null as any)).toBe('');
      expect(sanitizeUrl(undefined as any)).toBe('');
    });

    it('should reject malformed URLs', () => {
      const malformedUrls = [
        'not-a-url',
        'http://',
        'https://',
        '://example.com'
      ];
      
      malformedUrls.forEach(url => {
        const result = sanitizeUrl(url);
        expect(result).toBe('');
      });
    });
  });

  describe('validateEmail', () => {
    it('should accept valid email addresses', () => {
      const validEmails = [
        'user@example.com',
        'test.email+tag@example.co.uk',
        'user123@test-domain.com',
        'a@b.co'
      ];
      
      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user..name@example.com',
        'user@.example.com',
        'user@example.',
        'user@example..com',
        'a'.repeat(250) + '@example.com' // Too long
      ];
      
      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });

    it('should handle empty or null input', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail(null as any)).toBe(false);
      expect(validateEmail(undefined as any)).toBe(false);
    });
  });

  describe('generateSecureToken', () => {
    it('should generate a token of default length', () => {
      const token = generateSecureToken();
      expect(token).toHaveLength(64); // 32 bytes * 2 hex chars
      expect(/^[a-f0-9]+$/.test(token)).toBe(true);
    });

    it('should generate a token of specified length', () => {
      const token = generateSecureToken(16);
      expect(token).toHaveLength(32); // 16 bytes * 2 hex chars
      expect(/^[a-f0-9]+$/.test(token)).toBe(true);
    });

    it('should generate unique tokens', () => {
      const token1 = generateSecureToken();
      const token2 = generateSecureToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('hashPassword', () => {
    it('should hash password with generated salt', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      
      expect(hash).toContain(':');
      expect(hash.split(':')).toHaveLength(2);
      expect(hash.split(':')[0]).toHaveLength(32); // Salt length
      expect(hash.split(':')[1]).toHaveLength(64); // Hash length
    });

    it('should hash password with provided salt', async () => {
      const password = 'testPassword123';
      const salt = 'a1b2c3d4e5f6789012345678901234ab';
      const hash = await hashPassword(password, salt);
      
      expect(hash).toBe(`${salt}:${hash.split(':')[1]}`);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'testPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);
      
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword456';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hash);
      
      expect(isValid).toBe(false);
    });

    it('should reject malformed hash', async () => {
      const password = 'testPassword123';
      const malformedHashes = [
        'invalid-hash',
        'salt-only',
        ':hash-only',
        'a1b2c3:',
        ':'
      ];
      
      for (const hash of malformedHashes) {
        const isValid = await verifyPassword(password, hash);
        expect(isValid).toBe(false);
      }
    });
  });
});