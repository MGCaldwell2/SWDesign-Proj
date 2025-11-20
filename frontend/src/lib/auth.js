export function getToken() {
  const t = localStorage.getItem("token") ?? sessionStorage.getItem("token");
  if (!t) return null;
  try { return JSON.parse(t); } catch { return t; }
}
export function authHeaders(extra = {}) {
  const token = getToken();
  return { ...extra, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}
