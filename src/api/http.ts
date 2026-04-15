import type {
  CommentCreatedResponse,
  CommentsResponse,
  FeedTierFilter,
  LikeResponse,
  PostDetailResponse,
  PostsResponse,
} from './types';

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

export async function apiPostJson<T>(path: string, body?: unknown): Promise<T> {
  const base = getApiBaseUrl().replace(/\/$/, '');
  const url = new URL(path.startsWith('/') ? `${base}${path}` : `${base}/${path}`);

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getUserId()}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
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

/** WebSocket URL for real-time events (same UUID as Bearer). */
export function getWsUrl(): string {
  const base = getApiBaseUrl().replace(/\/$/, '');
  const u = new URL(base);
  u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
  u.pathname = `${u.pathname.replace(/\/$/, '')}/ws`;
  u.searchParams.set('token', getUserId());
  return u.toString();
}

export async function fetchPostsPage(params: {
  limit?: number;
  cursor?: string;
  tier?: FeedTierFilter;
  simulateError?: boolean;
}): Promise<PostsResponse> {
  const { limit = 10, cursor, tier, simulateError } = params;
  return apiGetJson<PostsResponse>('/posts', {
    limit: String(Math.min(limit, 20)),
    cursor: cursor ?? undefined,
    tier: tier && tier !== 'all' ? tier : undefined,
    simulate_error: simulateError ? 'true' : undefined,
  });
}

export async function fetchPostById(postId: string): Promise<PostDetailResponse> {
  return apiGetJson<PostDetailResponse>(`/posts/${encodeURIComponent(postId)}`);
}

export async function togglePostLike(postId: string): Promise<LikeResponse> {
  return apiPostJson<LikeResponse>(`/posts/${encodeURIComponent(postId)}/like`);
}

export async function fetchCommentsPage(params: {
  postId: string;
  limit?: number;
  cursor?: string;
}): Promise<CommentsResponse> {
  const { postId, limit = 20, cursor } = params;
  return apiGetJson<CommentsResponse>(`/posts/${encodeURIComponent(postId)}/comments`, {
    limit: String(limit),
    cursor: cursor ?? undefined,
  });
}

export async function postComment(postId: string, text: string): Promise<CommentCreatedResponse> {
  return apiPostJson<CommentCreatedResponse>(`/posts/${encodeURIComponent(postId)}/comments`, { text });
}
