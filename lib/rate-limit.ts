import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter
// In production, use Redis
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60; // 60 requests per minute

export function rateLimit(request: NextRequest): NextResponse | null {
  const ip = request.ip || 'unknown';
  const key = `${ip}:${request.nextUrl.pathname}`;
  const now = Date.now();

  const current = rateLimitMap.get(key);
  if (current && current.resetAt > now) {
    if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((current.resetAt - now) / 1000)) } }
      );
    }
    current.count++;
  } else {
    rateLimitMap.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
  }

  return null;
}

// Stricter rate limit for auth endpoints
const AUTH_RATE_LIMIT_MAX = 10; // 10 per minute

export function rateLimitAuth(request: NextRequest): NextResponse | null {
  const ip = request.ip || 'unknown';
  const key = `auth:${ip}`;
  const now = Date.now();

  const current = rateLimitMap.get(key);
  if (current && current.resetAt > now) {
    if (current.count >= AUTH_RATE_LIMIT_MAX) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((current.resetAt - now) / 1000)) } }
      );
    }
    current.count++;
  } else {
    rateLimitMap.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
  }

  return null;
}

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetAt < now) {
      rateLimitMap.delete(key);
    }
  }
}, 10 * 60 * 1000);
