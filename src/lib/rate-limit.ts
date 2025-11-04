import { NextRequest } from 'next/server';

// In-memory rate limit store (in production, use Redis or similar)
const rateLimitStore = new Map<string, {
  count: number;
  resetTime: number;
  windowMs: number;
}>();

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum number of requests allowed
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = Date.now();
  const key = getRateLimitKey(request);
  
  // Get existing rate limit data
  let rateLimitData = rateLimitStore.get(key);
  
  // If no existing data or window has expired, create new entry
  if (!rateLimitData || now > rateLimitData.resetTime) {
    rateLimitData = {
      count: 0,
      resetTime: now + config.windowMs,
      windowMs: config.windowMs
    };
    rateLimitStore.set(key, rateLimitData);
  }
  
  // Increment request count
  rateLimitData.count++;
  
  // Calculate remaining requests
  const remaining = Math.max(0, config.max - rateLimitData.count);
  const success = rateLimitData.count <= config.max;
  
  // Update the store
  rateLimitStore.set(key, rateLimitData);
  
  return {
    success,
    remaining,
    resetTime: rateLimitData.resetTime
  };
}

function getRateLimitKey(request: NextRequest): string {
  // Use IP address and user agent for rate limiting
  // In production, you might want to use user ID if authenticated
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : (request as any).ip || '127.0.0.1';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // Create a hash of IP and user agent for privacy
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256');
  hash.update(ip + userAgent + process.env.RATE_LIMIT_SECRET || 'default-secret');
  
  return hash.digest('hex').substring(0, 16);
}

// Advanced rate limiting with sliding window
export async function slidingWindowRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = Date.now();
  const key = getRateLimitKey(request);
  
  // Get existing request timestamps
  let timestamps: number[] = [];
  const existing = rateLimitStore.get(key);
  
  if (existing && Array.isArray(existing.count)) {
    timestamps = existing.count as number[];
  }
  
  // Remove timestamps outside the current window
  timestamps = timestamps.filter(timestamp => now - timestamp < config.windowMs);
  
  // Add current request timestamp
  timestamps.push(now);
  
  // Calculate remaining requests
  const remaining = Math.max(0, config.max - timestamps.length);
  const success = timestamps.length <= config.max;
  
  // Store updated timestamps
  rateLimitStore.set(key, {
    count: timestamps as any,
    resetTime: now + config.windowMs,
    windowMs: config.windowMs
  });
  
  return {
    success,
    remaining,
    resetTime: now + config.windowMs
  };
}

// Rate limiting for specific actions (e.g., login attempts)
export async function actionRateLimit(
  request: NextRequest,
  action: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const key = getRateLimitKey(request) + ':' + action;
  return rateLimit(request, { ...config, max: config.max });
}

// Check if user is temporarily blocked (for repeated violations)
export function isBlocked(request: NextRequest): boolean {
  const key = getRateLimitKey(request) + ':blocked';
  const blocked = rateLimitStore.get(key);
  
  if (!blocked) return false;
  
  const now = Date.now();
  if (now > blocked.resetTime) {
    rateLimitStore.delete(key);
    return false;
  }
  
  return true;
}

// Block a user temporarily
export function blockUser(request: NextRequest, durationMs: number = 60 * 60 * 1000): void {
  const key = getRateLimitKey(request) + ':blocked';
  rateLimitStore.set(key, {
    count: 1,
    resetTime: Date.now() + durationMs,
    windowMs: durationMs
  });
}