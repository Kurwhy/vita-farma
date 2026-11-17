const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
const TOKEN_KEY = 'vitafarma_token';
const USER_KEY = 'vitafarma_user';

export class ApiError extends Error {
  constructor(message, status, errors = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export const tokenStore = {
  getToken() {
    return window.localStorage.getItem(TOKEN_KEY);
  },
  getUser() {
    try {
      const raw = window.localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  set(token, user) {
    window.localStorage.setItem(TOKEN_KEY, token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  setUser(user) {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear() {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  },
};

export function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value);
    }
  });
  const text = query.toString();
  return text ? `?${text}` : '';
}

export async function apiRequest(path, options = {}) {
  const {
    method = 'GET',
    body,
    token = tokenStore.getToken(),
    auth = true,
    skipUnauthorized = false,
    signal,
  } = options;

  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.', 0);
  }

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    if (response.status === 401 && auth && !skipUnauthorized) {
      tokenStore.clear();
      window.dispatchEvent(new CustomEvent('vitafarma:unauthorized'));
    }

    const fallback =
      response.status === 404 ? 'Data tidak ditemukan.' : 'Permintaan tidak dapat diproses. Coba lagi.';

    throw new ApiError(
      response.status === 404 ? 'Data tidak ditemukan.' : data?.message || fallback,
      response.status,
      data?.errors || null,
    );
  }

  return data;
}
