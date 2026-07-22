const API_BASE = '/api';

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('lp_access_token');
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    // Attempt token refresh
    const refreshToken = localStorage.getItem('lp_refresh_token');
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          localStorage.setItem('lp_access_token', data.access_token);
          localStorage.setItem('lp_refresh_token', data.refresh_token);

          // Retry original request
          headers.set('Authorization', `Bearer ${data.access_token}`);
          return fetch(`${API_BASE}${url}`, { ...options, headers });
        }
      } catch (e) {
        console.error('Refresh token failed:', e);
      }
    }

    // Refresh failed or no refresh token -> logout
    localStorage.removeItem('lp_access_token');
    localStorage.removeItem('lp_refresh_token');
    window.location.href = '/login';
  }

  return res;
}

export async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetchWithAuth(url, options);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorData.detail || 'API request failed');
  }
  return res.json() as Promise<T>;
}
