import { AUTH_API } from './axios';

export const authApi = {
  login: (data) => AUTH_API.post('/auth/login', data),
  register: (data) => AUTH_API.post('/auth/register', data),
  refreshToken: (data) => AUTH_API.post('/auth/refresh-token', data),
  logout: () => AUTH_API.post('/auth/logout'),
  getMe: () => AUTH_API.get('/auth/me'),
  changePassword: (data) => AUTH_API.post('/auth/change-password', data),

  // Approvals (pending registrations)
  getPendingApprovals: () => AUTH_API.get('/approvals'),
  approveRequest: (id, data) => AUTH_API.post(`/approvals/${id}/approve`, data),
  rejectRequest: (id, data) => AUTH_API.post(`/approvals/${id}/reject`, data),

  // Admin: manufacturer management
  listManufacturers: () => AUTH_API.get('/admin/manufacturers'),
  createManufacturer: (data) => AUTH_API.post('/admin/manufacturers', data),
  updateManufacturer: (id, data) => AUTH_API.put(`/admin/manufacturers/${id}`, data),
  setManufacturerActive: (id, data) => AUTH_API.post(`/admin/manufacturers/${id}/active`, data),
};
