/**
 * Admin API — all calls to /api/admin/*
 * Token is auto-attached by the axios interceptor in api.js
 */
import api from "./api";

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const fetchDashboardStats = () => api.get("/admin/stats");
export const fetchAnalytics = (days = 30) => api.get(`/admin/analytics?days=${days}`);

// ─── Restaurants ─────────────────────────────────────────────────────────────
export const fetchAdminRestaurants = (params = {}) =>
  api.get("/admin/restaurants", { params });

export const createAdminRestaurant = (formData) =>
  api.post("/admin/restaurants", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateAdminRestaurant = (id, formData) =>
  api.put(`/admin/restaurants/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteAdminRestaurant = (id) => api.delete(`/admin/restaurants/${id}`);

export const toggleRestaurantStatus = (id) =>
  api.patch(`/admin/restaurants/${id}/toggle-status`);

// ─── Menu ─────────────────────────────────────────────────────────────────────
export const fetchAdminMenu = (params = {}) => api.get("/admin/menu", { params });

export const updateAdminMenuItem = (itemId, formData) =>
  api.put(`/admin/menu/${itemId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteAdminMenuItem = (itemId) => api.delete(`/admin/menu/${itemId}`);

// ─── Orders ──────────────────────────────────────────────────────────────────
export const fetchAdminOrders = (params = {}) => api.get("/admin/orders", { params });
export const fetchAdminOrderDetails = (id) => api.get(`/admin/orders/${id}`);

// ─── Users ───────────────────────────────────────────────────────────────────
export const fetchAdminUsers = (params = {}) => api.get("/admin/users", { params });
export const toggleUserBlock = (id) => api.patch(`/admin/users/${id}/toggle-block`);

// ─── Deals ───────────────────────────────────────────────────────────────────
export const fetchAdminDeals = (params = {}) => api.get("/admin/deals", { params });
export const deleteAdminDeal = (id) => api.delete(`/admin/deals/${id}`);
export const toggleDealFeatured = (id) => api.patch(`/admin/deals/${id}/toggle-featured`);

// ─── Top Brands ──────────────────────────────────────────────────────────────
export const fetchTopBrands = () => api.get("/admin/brands");

export const createTopBrand = (formData) =>
  api.post("/admin/brands", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateTopBrand = (id, formData) =>
  api.put(`/admin/brands/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteTopBrand = (id) => api.delete(`/admin/brands/${id}`);
