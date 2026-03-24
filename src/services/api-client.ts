import { API_BASE_URL } from '@/constants/config';
import { ApiClientError, type ApiResponse } from '@/types/api';

import { getStoredToken } from './auth-storage';

type FetchOptions = RequestInit & { skipAuth?: boolean };

export async function apiFetch<T>(path: string, init?: FetchOptions): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...((init?.headers as Record<string, string>) ?? {}),
  };

  if (!init?.skipAuth) {
    const token = await getStoredToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...init,
    headers,
  });

  const text = await res.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      parsed = null;
    }
  }

  const wrapped =
    parsed && typeof parsed === 'object' && 'ok' in parsed
      ? (parsed as ApiResponse<T>)
      : null;

  if (res.ok) {
    if (wrapped && wrapped.ok === true) return wrapped.data;
    if (wrapped && wrapped.ok === false) {
      throw new ApiClientError(
        res.status,
        wrapped.error?.message || 'Request failed',
        wrapped.error?.code,
        wrapped.error?.details,
      );
    }
    return parsed as T;
  }

  const message =
    wrapped && wrapped.ok === false && wrapped.error?.message
      ? wrapped.error.message
      : typeof (parsed as { message?: string })?.message === 'string'
        ? (parsed as { message: string }).message
        : `Request failed (${res.status})`;

  const code = wrapped && wrapped.ok === false ? wrapped.error?.code : undefined;
  const details = wrapped && wrapped.ok === false ? wrapped.error?.details : undefined;
  throw new ApiClientError(res.status, message, code, details);
}
