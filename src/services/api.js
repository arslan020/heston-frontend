// ---------------------------
// API Base URL Selection
// ---------------------------
// Priority:
// 1) REACT_APP_API_BASE (env override)
// 2) If running on appraise.hestonautomotive.com => use same-origin ''
// 3) If localhost => local backend
// 4) Fallback => same-origin ''
const PROD_FRONTEND_HOSTS = ['appraise.hestonautomotive.com'];
const PROD_API = ''; // ✅ same-origin for Vercel proxy

const inferApiBase = () => {
  try {
    const envBase = process.env.REACT_APP_API_BASE?.trim();
    if (envBase) return envBase;

    const host =
      (typeof window !== 'undefined' && window.location?.hostname) || '';

    if (PROD_FRONTEND_HOSTS.includes(host)) return PROD_API;

    if (host === 'localhost' || host === '127.0.0.1') {
      // Dev: direct local backend
      return 'http://localhost:5000';
    }

    // Safe default for previews/other hosts: same-origin
    return '';
  } catch {
    return '';
  }
};

export const API_BASE = inferApiBase();


// ---------------------------
// Internal helpers
// ---------------------------
const isFormData = (body) =>
  body &&
  typeof body === 'object' &&
  typeof body.append === 'function' &&
  body.constructor?.name === 'FormData';

const mergeHeaders = (base = {}, extra = {}) => {
  const clean = (obj) =>
    Object.fromEntries(
      Object.entries(obj || {}).filter(([, v]) => v !== undefined && v !== null)
    );
  return { ...clean(base), ...clean(extra) };
};

const parseResponse = async (res) => {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await res.json().catch(() => ({}));
    return data;
  }
  const text = await res.text();
  return text;
};

const buildError = (res, payload) => {
  const message =
    (payload && (payload.error || payload.message)) ||
    `Request failed with status ${res.status}`;
  const err = new Error(message);
  err.status = res.status;
  err.payload = payload;
  return err;
};

// ---------------------------
// Core HTTP wrapper (fetch)
// ---------------------------
export async function http(
  path,
  { method = 'GET', body, headers, signal } = {}
) {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;

  // Default headers: only set Content-Type for JSON bodies
  const defaultHeaders = {};
  let reqBody = body;

  if (body && !isFormData(body)) {
    defaultHeaders['Content-Type'] = 'application/json';
    reqBody = JSON.stringify(body);
  }

  const res = await fetch(url, {
    method,
    headers: mergeHeaders(defaultHeaders, headers),
    body: reqBody,
    credentials: 'include', // IMPORTANT for Safari/iOS cookies
    mode: 'cors',
    redirect: 'follow',
    cache: 'no-store',
    signal,
  });

  const payload = await parseResponse(res);

  if (!res.ok) {
    // (Optional) central auth handling
    // if (res.status === 401) window.location.assign('/login');
    throw buildError(res, payload);
  }
  return payload;
}

// ---------------------------
// Convenience methods
// ---------------------------
export const get = (path, opts) => http(path, { ...opts, method: 'GET' });
export const del = (path, opts) => http(path, { ...opts, method: 'DELETE' });
export const post = (path, body, opts) =>
  http(path, { ...opts, method: 'POST', body });
export const put = (path, body, opts) =>
  http(path, { ...opts, method: 'PUT', body });

// Upload helper for FormData (images/files). Do NOT pass Content-Type manually.
export const upload = async (path, formData, opts = {}) => {
  if (!isFormData(formData)) {
    throw new Error('upload() expects a FormData instance');
  }
  const res = await fetch(
    `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`,
    {
      method: opts.method || 'POST',
      body: formData,
      headers: mergeHeaders({}, opts.headers), // don’t set Content-Type for FormData
      credentials: 'include',
      mode: 'cors',
      redirect: 'follow',
      cache: 'no-store',
      signal: opts.signal,
    }
  );

  const payload = await parseResponse(res);
  if (!res.ok) throw buildError(res, payload);
  return payload;
};

// ---------------------------
// Typed API surface
// ---------------------------
// Auth
export const api = {
  me: () => get('/api/auth/me'),
  adminLogin: (username, password) =>
    post('/api/auth/admin/login', { username, password }),
  staffLogin: (username, password) =>
    post('/api/auth/staff/login', { username, password }),
  logout: () => post('/api/auth/logout'),

  // Staff
  listStaff: () => get('/api/staff'),
  createStaff: (payload) => post('/api/staff', payload),
  deleteStaff: (id) => del(`/api/staff/${id}`),

  updateStaff: (id, data) => put(`/api/staff/${id}`, data),

resetStaffPassword: (id) =>
  post(`/api/staff/${id}/reset-password`),

setStaffPassword: (id, { password }) =>
  put(`/api/staff/${id}/password`, { password }),

  // DVLA
  lookupVehicle: (reg) => post('/api/dvla/lookup', { reg }),

  // Appraisals
  createAppraisal: (payload) => post('/api/appraisals', payload),
  updateAppraisal: (id, payload) => put(`/api/appraisals/${id}`, payload),

  getAllAppraisals: () => get('/api/appraisals/admin'),
  getMyAppraisals: () => get('/api/appraisals/mine'),

};

export default api;
