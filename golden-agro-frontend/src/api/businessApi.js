import { BUSINESS_API } from './axios';

export const productApi = {
  getAll: () => BUSINESS_API.get('/products'),
  getActive: () => BUSINESS_API.get('/products/active'),
  getWithStock: () => BUSINESS_API.get('/products/with-stock'),
  getById: (id) => BUSINESS_API.get(`/products/${id}`),
  create: (data) => BUSINESS_API.post('/products', data),
  update: (id, data) => BUSINESS_API.put(`/products/${id}`, data),
  delete: (id) => BUSINESS_API.delete(`/products/${id}`),
};

export const categoryApi = {
  getAll: () => BUSINESS_API.get('/categories'),
  create: (data) => BUSINESS_API.post('/categories', data),
  update: (id, data) => BUSINESS_API.put(`/categories/${id}`, data),
  delete: (id) => BUSINESS_API.delete(`/categories/${id}`),
};

export const taxApi = {
  getAll: () => BUSINESS_API.get('/taxes'),
  getById: (id) => BUSINESS_API.get(`/taxes/${id}`),
  create: (data) => BUSINESS_API.post('/taxes', data),
  update: (id, data) => BUSINESS_API.put(`/taxes/${id}`, data),
  delete: (id) => BUSINESS_API.delete(`/taxes/${id}`),
};

export const unitApi = {
  getAll: () => BUSINESS_API.get('/units'),
  getById: (id) => BUSINESS_API.get(`/units/${id}`),
  create: (data) => BUSINESS_API.post('/units', data),
  update: (id, data) => BUSINESS_API.put(`/units/${id}`, data),
  delete: (id) => BUSINESS_API.delete(`/units/${id}`),
};

export const supplierApi = {
  getAll: () => BUSINESS_API.get('/suppliers'),
  getActive: () => BUSINESS_API.get('/suppliers/active'),
  create: (data) => BUSINESS_API.post('/suppliers', data),
  update: (id, data) => BUSINESS_API.put(`/suppliers/${id}`, data),
  delete: (id) => BUSINESS_API.delete(`/suppliers/${id}`),
};

export const rawMaterialApi = {
  getAll: () => BUSINESS_API.get('/raw-materials'),
  getLowStock: () => BUSINESS_API.get('/raw-materials/low-stock'),
  create: (data) => BUSINESS_API.post('/raw-materials', data),
  update: (id, data) => BUSINESS_API.put(`/raw-materials/${id}`, data),
  delete: (id) => BUSINESS_API.delete(`/raw-materials/${id}`),
};

export const purchaseApi = {
  getAll: () => BUSINESS_API.get('/purchases'),
  getById: (id) => BUSINESS_API.get(`/purchases/${id}`),
  create: (data) => BUSINESS_API.post('/purchases', data),
  complete: (id) => BUSINESS_API.post(`/purchases/${id}/complete`),
};

export const bomApi = {
  getAll: () => BUSINESS_API.get('/bom'),
  getById: (id) => BUSINESS_API.get(`/bom/${id}`),
  create: (data) => BUSINESS_API.post('/bom', data),
  update: (id, data) => BUSINESS_API.put(`/bom/${id}`, data),
  delete: (id) => BUSINESS_API.delete(`/bom/${id}`),
};

export const productionApi = {
  getAll: () => BUSINESS_API.get('/production'),
  getById: (id) => BUSINESS_API.get(`/production/${id}`),
  create: (data) => BUSINESS_API.post('/production', data),
  start: (id) => BUSINESS_API.post(`/production/${id}/start`),
  complete: (id) => BUSINESS_API.post(`/production/${id}/complete`),
};

export const retailerApi = {
  getAll: () => BUSINESS_API.get('/retailers'),
  getActive: () => BUSINESS_API.get('/retailers/active'),
  getById: (id) => BUSINESS_API.get(`/retailers/${id}`),
  create: (data) => BUSINESS_API.post('/retailers', data),
  update: (id, data) => BUSINESS_API.put(`/retailers/${id}`, data),
  delete: (id) => BUSINESS_API.delete(`/retailers/${id}`),
};

export const orderApi = {
  getAll: () => BUSINESS_API.get('/orders'),
  getMyOrders: () => BUSINESS_API.get('/orders/my-orders'),
  getById: (id) => BUSINESS_API.get(`/orders/${id}`),
  create: (data) => BUSINESS_API.post('/orders', data),
  confirm: (id) => BUSINESS_API.post(`/orders/${id}/confirm`),
  complete: (id) => BUSINESS_API.post(`/orders/${id}/complete`),
  updateStatus: (id, status) => BUSINESS_API.put(`/orders/${id}/status?status=${status}`),
};

export const invoiceApi = {
  getAll: () => BUSINESS_API.get('/invoices'),
  getById: (id) => BUSINESS_API.get(`/invoices/${id}`),
  getByRetailer: (retailerId) => BUSINESS_API.get(`/invoices/retailer/${retailerId}`),
  createFromOrder: (orderId) => BUSINESS_API.post(`/invoices/from-order/${orderId}`),
};

export const dashboardApi = {
  getStats: () => BUSINESS_API.get('/dashboard/stats'),
  getSalesTrend: () => BUSINESS_API.get('/dashboard/sales-trend'),
  getProfitTrend: () => BUSINESS_API.get('/dashboard/profit-trend'),
  getInventory: () => BUSINESS_API.get('/dashboard/inventory'),
  getRawMaterialsInventory: () => BUSINESS_API.get('/dashboard/raw-materials-inventory'),
  getOrderStatus: () => BUSINESS_API.get('/dashboard/order-status'),
  getTopProducts: () => BUSINESS_API.get('/dashboard/top-products'),
  getExpenseBreakdown: () => BUSINESS_API.get('/dashboard/expense-breakdown'),
};

export const expenseApi = {
  getAll: () => BUSINESS_API.get('/expenses'),
  getById: (id) => BUSINESS_API.get(`/expenses/${id}`),
  create: (data) => BUSINESS_API.post('/expenses', data),
  update: (id, data) => BUSINESS_API.put(`/expenses/${id}`, data),
  delete: (id) => BUSINESS_API.delete(`/expenses/${id}`),
};
