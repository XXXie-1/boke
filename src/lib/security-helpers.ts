/**
 * Sanitize headers to prevent security issues
 */
export function sanitizeHeaders(requestHeaders: any, responseHeaders: any): void {
  // Remove potentially sensitive headers from response
  const headersToRemove = [
    'X-Powered-By',
    'Server',
    'X-AspNet-Version',
    'X-AspNetMvc-Version',
    'X-Generator',
    'X-Drupal-Cache',
    'X-Varnish',
    'X-Drupal-Dynamic-Cache',
  ];

  headersToRemove.forEach(header => {
    responseHeaders.delete(header);
  });

  // Sanitize user input headers
  const userAgent = requestHeaders.get('user-agent');
  if (userAgent) {
    // Basic validation of user agent
    if (userAgent.length > 500 || /[\x00-\x1F\x7F]/.test(userAgent)) {
      responseHeaders.set('X-User-Agent-Sanitized', 'true');
    }
  }

  // Validate and sanitize referer
  const referer = requestHeaders.get('referer');
  if (referer) {
    try {
      const url = new URL(referer);
      // Only allow HTTP/HTTPS schemes
      if (!['http:', 'https:'].includes(url.protocol)) {
        responseHeaders.set('X-Referer-Sanitized', 'true');
      }
    } catch {
      responseHeaders.set('X-Referer-Sanitized', 'true');
    }
  }
}

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    // Remove potentially dangerous characters
    .replace(/[<>"'&]/g, (char) => {
      const escapeMap: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;',
      };
      return escapeMap[char] || char;
    })
    // Remove JavaScript event handlers
    .replace(/on\w+\s*=/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove vbscript: protocol
    .replace(/vbscript:/gi, '')
    // Remove data: URLs (except for allowed types)
    .replace(/data:(?!image\/(png|jpeg|jpg|gif|webp|svg))/gi, '')
    // Limit length
    .substring(0, 10000);
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  try {
    const parsedUrl = new URL(url);
    
    // Only allow HTTP/HTTPS protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return '';
    }

    // Remove dangerous parts
    parsedUrl.hash = '';
    parsedUrl.username = '';
    parsedUrl.password = '';

    // Validate against allowlist if provided (skip in test environment)
    const allowedDomains = [
      'localhost',
      'example.com',
      typeof window !== 'undefined' ? window.location.hostname : '',
      // Add your allowed domains here
    ].filter(Boolean);

    if (allowedDomains.length > 0) {
      const hostname = parsedUrl.hostname;
      if (!allowedDomains.some(domain => hostname === domain || hostname.endsWith(`.${domain}`))) {
        return '';
      }
    }

    // Return sanitized URL
    return `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}${parsedUrl.search}`;
  } catch {
    return '';
  }
}

/**
 * Validate email address
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Basic email validation - more comprehensive than the previous regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;
  
  // Additional validation
  if (email.length > 254) return false;
  
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return false;
  
  if (localPart.length > 64) return false;
  if (domain.length > 253) return false;
  
  // Check for invalid characters
  const invalidChars = /[\s<>()[\]\\.,;:'"]/;
  if (invalidChars.test(email)) return false;
  
  return true;
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  let array: Uint8Array;
  
  if (typeof window !== 'undefined' && window.crypto) {
    // Browser environment
    array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
  } else if (typeof require !== 'undefined') {
    // Node.js environment
    const crypto = require('crypto');
    array = new Uint8Array(crypto.randomBytes(length));
  } else {
    // Fallback (not secure, only for testing)
    array = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash a password securely (client-side simulation)
 * In production, this should be done server-side with bcrypt/argon2
 */
export async function hashPassword(password: string, salt?: string): Promise<string> {
  if (!salt) {
    salt = generateSecureToken(16);
  }
  
  // Use Node.js crypto module if available, otherwise Web Crypto API
  let hashBuffer: ArrayBuffer | Buffer;
  
  if (typeof window === 'undefined') {
    // Node.js environment
    const crypto = require('crypto');
    const encoder = require('util').TextEncoder;
    const data = encoder.encode(password + salt);
    hashBuffer = crypto.createHash('sha256').update(data).digest();
  } else {
    // Browser environment
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    hashBuffer = await crypto.subtle.digest('SHA-256', data);
  }
  
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  
  return `${salt}:${hashHex}`;
}

/**
 * Verify a password hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, hashHex] = hash.split(':');
  if (!salt || !hashHex) return false;
  
  const computedHash = await hashPassword(password, salt);
  return computedHash === hash;
}

/**
 * Rate limiting for form submissions
 */
export function createFormRateLimit(formId: string, maxSubmissions: number = 5, windowMs: number = 15 * 60 * 1000) {
  const storageKey = `form_rate_limit_${formId}`;
  
  return {
    canSubmit(): boolean {
      const submissions = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const now = Date.now();
      const recentSubmissions = submissions.filter((timestamp: number) => now - timestamp < windowMs);
      
      return recentSubmissions.length < maxSubmissions;
    },
    
    recordSubmission(): void {
      const submissions = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const now = Date.now();
      submissions.push(now);
      
      // Clean up old submissions
      const recentSubmissions = submissions.filter((timestamp: number) => now - timestamp < windowMs);
      localStorage.setItem(storageKey, JSON.stringify(recentSubmissions));
    },
    
    getRemainingTime(): number {
      const submissions = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const now = Date.now();
      const recentSubmissions = submissions.filter((timestamp: number) => now - timestamp < windowMs);
      
      if (recentSubmissions.length === 0) return 0;
      
      const oldestSubmission = Math.min(...recentSubmissions);
      return Math.max(0, windowMs - (now - oldestSubmission));
    }
  };
}

/**
 * CSRF protection utilities
 */
export function generateCSRFToken(): string {
  return generateSecureToken(32);
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  if (!token || !sessionToken) return false;
  
  // In a real implementation, you would validate against a stored token
  // This is a simplified version for demonstration
  return token.length === 32 && sessionToken.length === 32;
}