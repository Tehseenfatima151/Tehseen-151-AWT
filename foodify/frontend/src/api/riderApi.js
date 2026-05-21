import api from "./api";

export const fetchRiderStats       = ()       => api.get("/riders/stats");
export const fetchRiders           = (p = {}) => api.get("/riders", { params: p });
export const fetchRiderById        = (id)     => api.get(`/riders/${id}`);
export const createRider           = (fd)     => api.post("/riders", fd, { headers: { "Content-Type": "multipart/form-data" } });
export const updateRider           = (id, fd) => api.put(`/riders/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
export const deleteRider           = (id)     => api.delete(`/riders/${id}`);
export const toggleRiderActive     = (id)     => api.patch(`/riders/${id}/toggle-active`);
export const toggleRiderAvailability = (id)   => api.patch(`/riders/${id}/toggle-availability`);
export const assignRiderToOrder    = (orderId, rider_id) => api.patch(`/riders/orders/${orderId}/assign`, { rider_id });
export const updateDeliveryStatus  = (orderId, delivery_status) => api.patch(`/riders/orders/${orderId}/delivery-status`, { delivery_status });
