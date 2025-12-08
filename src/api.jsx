import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

export const setApiToken = (token) => {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
};

export const collectionAPI = {
  create: (data) => api.post("/api/collections", data),
  getAll: () => api.get("/api/collections"),
  getOne: (id) => api.get(`/api/collections/${id}`),
  update: (id, data) => api.put(`/api/collections/${id}`, data),
  delete: (id) => api.delete(`/api/collections/${id}`),
  addItem: (id, data) => api.post(`/api/collections/${id}/items`, data),
  removeItem: (id, tmdbId) => api.delete(`/api/collections/${id}/items/${tmdbId}`),
};

export default api;





