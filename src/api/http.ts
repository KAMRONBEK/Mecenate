import type { PostsResponse } from './types';

const DEFAULT_BASE = 'https://k8s.mectest.ru/test-app';
const DEFAULT_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

export function getApiBaseUrl(): string {
  return process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_BASE;
}

export function getUserId(): string {
  return process.env.EXPO_PUBLIC_USER_ID ?? DEFAULT_USER_ID;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiGetJson<T>(path: string, searchParams?: Record<string, string | undefined>): Promise<T> {
  const base = getApiBaseUrl().replace(/\/$/, '');
  const url = new URL(path.startsWith('/') ? `${base}${path}` : `${base}/${path}`);
  if (searchParams) {
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v !== undefined && v !== '') url.searchParams.set(k, v);
    });
  }

  const res = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${getUserId()}`,
    },
  });

  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    throw new ApiError('Invalid JSON response', res.status);
  }

  if (!res.ok) {
    const msg =
      typeof json === 'object' && json !== null && 'error' in json
        ? String((json as { error?: { message?: string } }).error?.message ?? res.statusText)
        : res.statusText;
    throw new ApiError(msg || 'Request failed', res.status);
  }

  return json as T;
}

export async function fetchPostsPage(params: {
  limit?: number;
  cursor?: string;
  simulateError?: boolean;
}): Promise<PostsResponse> {
  const { limit = 10, cursor, simulateError } = params;
  return apiGetJson<PostsResponse>('/posts', {
    limit: String(Math.min(limit, 20)),
    cursor: cursor ?? undefined,
    simulate_error: simulateError ? 'true' : undefined,
  });
}
