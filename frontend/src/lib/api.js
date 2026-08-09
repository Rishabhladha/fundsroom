// Centralized API fetch wrapper
// - Reads base URL from the Vite proxy (empty string = same origin, proxied to :5000)
// - Injects Authorization header from localStorage token
// - Throws structured errors for non-2xx responses

const BASE_URL = '/api';

function getToken() {
  try {
    const state = JSON.parse(localStorage.getItem('auth-store') || '{}');
    return state?.state?.token || null;
  } catch {
    return null;
  }
}

async function request(method, path, body = null, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    method,
    headers,
    ...(body !== null ? { body: JSON.stringify(body) } : {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, config);

  // For PDF responses, return the blob directly
  if (options.blob) {
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Request failed' }));
      throw { statusCode: res.status, ...err };
    }
    return res.blob();
  }

  const data = await res.json().catch(() => ({ message: res.statusText }));

  if (!res.ok) {
    // Throw the error shape so React Query can surface it
    throw { statusCode: res.status, ...data };
  }

  return data;
}

export const api = {
  get:    (path, options)       => request('GET',    path, null, options),
  post:   (path, body, options) => request('POST',   path, body, options),
  patch:  (path, body, options) => request('PATCH',  path, body, options),
  delete: (path, options)       => request('DELETE', path, null, options),

  // Convenience: download a PDF blob
  downloadPdf: (path) => request('GET', path, null, { blob: true }),
};
