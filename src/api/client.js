/**
 * Backend (FastAPI) ពិតប្រាកដនៅលើ Render — ប្រើជា Default ដើម្បីឱ្យ Admin Panel
 * ដំណើរការបានទាំង Dev និង Production ដោយមិនចាំបាច់កំណត់ .env។
 * អាចប្តូរបានតាម `VITE_API_URL` ក្នុង `.env` / `.env.development` / `.env.production`
 * (ឧ. VITE_API_URL=http://localhost:8000 សម្រាប់ Backend ក្នុងម៉ាស៊ីនរបស់អ្នក)
 */
export const DEFAULT_API_BASE = "https://e-commerce-backend-long-lamyka.onrender.com";

export const API_BASE = (import.meta.env.VITE_API_URL || DEFAULT_API_BASE).replace(
  /\/$/,
  ""
);

// URL សម្រាប់ WebSocket — real-time ព្រឹត្តិការណ៍ (orders_changed, products_changed, ...)
export function getWsUrl(path = "/ws/products") {
  const wsBase = (import.meta.env.VITE_WS_URL || "").replace(/\/$/, "");
  if (wsBase) return `${wsBase}${path}`;
  if (API_BASE) return `${API_BASE.replace(/^http/i, "ws")}${path}`;
  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${window.location.host}${path}`;
}

const TOKEN_KEY = "admin_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Token ផុតកំណត់ -> ត្រឡប់ទៅ Login
    if (res.status === 401) {
      setToken(null);
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    const msg =
      typeof data.detail === "string"
        ? data.detail
        : `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return absolutizeMedia(data);
}

/**
 * ប្រែក្លាយ URL រូបភាពដែលមានផ្លូវខ្លី (/uploads/...) ឲ្យទៅជា URL ពេញ
 * សំខាន់នៅពេល Deploy Frontend លើ Vercel ប៉ុន្តែ API/រូបភាពនៅលើ Render
 */
function absolutizeMedia(data) {
  if (Array.isArray(data)) {
    data.forEach(absolutizeMedia);
  } else if (data && typeof data === "object") {
    Object.keys(data).forEach((k) => {
      const v = data[k];
      if (typeof v === "string" && v.startsWith("/uploads/")) {
        data[k] = API_BASE ? `${API_BASE}${v}` : v;
      } else if (v && typeof v === "object") {
        absolutizeMedia(v);
      }
    });
  }
  return data;
}

export const api = {
  // Auth
  login: (payload) =>
    request("/api/auth/login", { method: "POST", body: payload }),

  // Dashboard
  getStats: () => request("/api/admin/stats", { auth: true }),

  // Payment (Bakong Wallet / KHQR) — សម្រាប់បង្ហាញស្ថានភាពក្នុង Settings
  getPaymentConfig: () => request("/api/payments/config"),

  // Products
  getProducts: () => request("/api/products", { auth: true }),
  createProduct: (p) =>
    request("/api/admin/products", { method: "POST", body: p, auth: true }),
  updateProduct: (id, p) =>
    request(`/api/admin/products/${id}`, { method: "PUT", body: p, auth: true }),
  deleteProduct: (id) =>
    request(`/api/admin/products/${id}`, { method: "DELETE", auth: true }),
  bulkAdjustPrice: (data) =>
    request("/api/admin/products/bulk-adjust-price", {
      method: "POST",
      body: data,
      auth: true,
    }),

  // Categories
  getCategories: () => request("/api/categories", { auth: true }),
  createCategory: (c) =>
    request("/api/admin/categories", { method: "POST", body: c, auth: true }),
  updateCategory: (id, c) =>
    request(`/api/admin/categories/${id}`, { method: "PUT", body: c, auth: true }),
  deleteCategory: (id) =>
    request(`/api/admin/categories/${id}`, { method: "DELETE", auth: true }),

  // Slides (banners)
  getSlides: () => request("/api/admin/slides", { auth: true }),
  createSlide: (s) =>
    request("/api/admin/slides", { method: "POST", body: s, auth: true }),
  updateSlide: (id, s) =>
    request(`/api/admin/slides/${id}`, { method: "PUT", body: s, auth: true }),
  deleteSlide: (id) =>
    request(`/api/admin/slides/${id}`, { method: "DELETE", auth: true }),
  uploadSlideMedia: async (file) => {
    const token = getToken();
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${API_BASE}/api/admin/slides/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg =
        typeof data.detail === "string"
          ? data.detail
          : `Upload failed (${res.status})`;
      throw new Error(msg);
    }
    return absolutizeMedia(data);
  },

  // Image / Video upload (from local PC)
  // kind = "image" (default) ឬ "video" សម្រាប់វីដេអូផលិតផល
  uploadImage: async (file, kind = "image") => {
    const token = getToken();
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(
      `${API_BASE}/api/admin/upload?kind=${encodeURIComponent(kind)}`,
      {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg =
        typeof data.detail === "string"
          ? data.detail
          : `Upload failed (${res.status})`;
      throw new Error(msg);
    }
    return absolutizeMedia(data);
  },

  // Orders
  getOrders: () => request("/api/admin/orders", { auth: true }),
  updateOrderStatus: (id, status) =>
    request(`/api/admin/orders/${id}/status`, {
      method: "PUT",
      body: { status },
      auth: true,
    }),

  // Discounts
  getDiscounts: () => request("/api/admin/discounts", { auth: true }),
  createDiscount: (d) =>
    request("/api/discounts/admin/create", { method: "POST", body: d, auth: true }),
  updateDiscount: (id, d) =>
    request(`/api/admin/discounts/${id}`, { method: "PUT", body: d, auth: true }),
  toggleDiscount: (id) =>
    request(`/api/admin/discounts/${id}/toggle`, {
      method: "PUT",
      body: {},
      auth: true,
    }),
  deleteDiscount: (id) =>
    request(`/api/admin/discounts/${id}`, { method: "DELETE", auth: true }),

  // Milestones / Delivery Goals (Free Sweet Delivery & Gift)
  getMilestones: () => request("/api/milestones"),
  getAdminMilestones: () => request("/api/milestones/admin", { auth: true }),
  createMilestone: (m) =>
    request("/api/milestones/admin", { method: "POST", body: m, auth: true }),
  updateMilestone: (id, m) =>
    request(`/api/milestones/admin/${id}`, { method: "PUT", body: m, auth: true }),
  toggleMilestone: (id) =>
    request(`/api/milestones/admin/${id}/toggle`, {
      method: "PUT",
      body: {},
      auth: true,
    }),
  deleteMilestone: (id) =>
    request(`/api/milestones/admin/${id}`, { method: "DELETE", auth: true }),


  // Users
  getUsers: () => request("/api/admin/users", { auth: true }),
  updateUserRole: (id, role) =>
    request(`/api/admin/users/${id}/role`, {
      method: "PUT",
      body: { role },
      auth: true,
    }),
  deleteUser: (id) =>
    request(`/api/admin/users/${id}`, { method: "DELETE", auth: true }),

  // Settings (public endpoint — សម្រាប់ Branding លើ Login Page ផង)
  getSettings: () => request("/api/settings/all"),
  updateSetting: (key, value) =>
    request("/api/settings/admin/update", {
      method: "PUT",
      body: { key, value },
      auth: true,
    }),

  // Alerts (popup / banner announcements)
  getAlerts: () => request("/api/admin/alerts", { auth: true }),
  createAlert: (a) =>
    request("/api/admin/alerts", { method: "POST", body: a, auth: true }),
  updateAlert: (id, a) =>
    request(`/api/admin/alerts/${id}`, { method: "PUT", body: a, auth: true }),
  deleteAlert: (id) =>
    request(`/api/admin/alerts/${id}`, { method: "DELETE", auth: true }),
  uploadAlertImage: async (file) => {
    const token = getToken();
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${API_BASE}/api/admin/alerts/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg =
        typeof data.detail === "string"
          ? data.detail
          : `Upload failed (${res.status})`;
      throw new Error(msg);
    }
    return absolutizeMedia(data);
  },
};
