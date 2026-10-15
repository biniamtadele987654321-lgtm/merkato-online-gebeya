const configuredApiUrl = import.meta.env.VITE_API_URL || 'https://merkato-gebeya-api.onrender.com';
const apiBaseUrl = configuredApiUrl.replace(/\/+$/, '');
const API_URL = apiBaseUrl.endsWith('/api') ? apiBaseUrl : `${apiBaseUrl}/api`;
export const demoFallbackEnabled = import.meta.env.VITE_DEMO_FALLBACK !== 'false';

export function isNetworkError(error) {
  return error instanceof TypeError;
}

export async function api(path, options = {}) {
  const token = localStorage.getItem('merkato-token');
  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch (error) {
    const isPublicCatalogRead =
      (!options.method || options.method.toUpperCase() === 'GET') &&
      (path === '/products' || path.startsWith('/products?') || /^\/products\/[^/?]+(?:\?|$)/.test(path));
    if (isPublicCatalogRead && demoFallbackEnabled) {
      const { getDemoCatalog } = await import('./demoData');
      const result = getDemoCatalog(path);
      if (result) return result;
    }
    throw error;
  }
  const contentType = response.headers.get('content-type') || '';
  const result = contentType.includes('application/json') ? await response.json() : null;
  if (!response.ok) {
    const error = new Error(result?.message || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return result;
}

export function jsonBody(value) {
  return JSON.stringify(value);
}

export const money = (amount) =>
  new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 }).format(amount || 0);
