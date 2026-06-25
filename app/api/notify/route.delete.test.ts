import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { DELETE } from './route';
import { Notification } from '@/models/Notification';

vi.mock('@/lib/mongodb', () => ({
  default: vi.fn(),
}));

vi.mock('@/models/Notification', () => ({
  Notification: {
    findOne: vi.fn(),
    deleteOne: vi.fn(),
  },
}));

vi.mock('@/lib/rate-limit', () => {
  const mockResult = { success: false, limit: 60, remaining: 0, reset: Date.now() + 60000 };
  return {
    notifyRateLimiter: {
      checkWithResult: vi.fn().mockResolvedValue(mockResult),
    },
    getRateLimitHeaders: vi.fn(() => ({
      'X-RateLimit-Limit': '60',
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': String(Date.now() + 60000),
      'Retry-After': '60',
    })),
  };
});

function makeRequest(query: string): NextRequest {
  return new NextRequest(`http://localhost/api/notify?${query}`, { method: 'DELETE' });
}

beforeEach(() => {
  vi.stubEnv('MONGODB_URI', 'mongodb://localhost:27017/test');
  vi.stubEnv('NODE_ENV', 'test');
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('DELETE /api/notify', () => {
  it('returns 429 when rate limited', async () => {
    const res = await DELETE(makeRequest('user=testuser'));

    expect(res.status).toBe(429);
  });

  it('bypasses gracefully when MONGODB_URI is not set in development', async () => {
    delete process.env.MONGODB_URI;

    vi.stubEnv('NODE_ENV', 'development');

    const res = await DELETE(makeRequest('user=testuser'));

    expect(res.status).toBe(200);

    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.message).toContain('bypassed');
  });

  it('returns 404 when notification preferences do not exist', async () => {
    vi.mocked(Notification.deleteOne).mockResolvedValue({
      deletedCount: 0,
    } as never);

    const res = await DELETE(makeRequest('user=testuser'));

    expect(res.status).toBe(404);

    const data = await res.json();

    expect(data.message).toContain('No notification preferences found');
  });

  it('returns 200 when notification preferences are deleted successfully', async () => {
    vi.mocked(Notification.deleteOne).mockResolvedValue({
      deletedCount: 1,
    } as never);

    const res = await DELETE(makeRequest('user=testuser'));

    expect(res.status).toBe(200);

    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.message).toContain('deleted successfully');
  });
});
