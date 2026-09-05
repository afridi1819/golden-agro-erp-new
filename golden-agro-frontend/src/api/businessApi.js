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

export const customerApi = {
  getAll: () => BUSINESS_API.get('/customers'),
  getActive: () => BUSINESS_API.get('/customers/active'),
  getById: (id) => BUSINESS_API.get(`/customers/${id}`),
  create: (data) => BUSINESS_API.post('/customers', data),
  update: (id, data) => BUSINESS_API.put(`/customers/${id}`, data),
  delete: (id) => BUSINESS_API.delete(`/customers/${id}`),
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

  update: (id, data) =>
    BUSINESS_API.put(`/purchases/${id}`, data),

  cancel: (id) =>
    BUSINESS_API.post(`/purchases/${id}/cancel`),
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

export const activityLogApi = {
  getAll: (module = '', action = '') => {
    const params = new URLSearchParams();

    if (module) {
      params.append('module', module);
    }

    if (action) {
      params.append('action', action);
    }

    const query = params.toString();

    return BUSINESS_API.get(
      `/activity-logs${query ? `?${query}` : ''}`
    );
  },

  getById: (id) => {
    return BUSINESS_API.get(`/activity-logs/${id}`);
  }
};

export const rasnaEntryApi = {
  getAll: () =>
    BUSINESS_API.get('/rasna-entries'),

  getById: (id) =>
    BUSINESS_API.get(`/rasna-entries/${id}`),

  create: (data) =>
    BUSINESS_API.post('/rasna-entries', data),

  update: (id, data) =>
    BUSINESS_API.put(`/rasna-entries/${id}`, data),

  delete: (id) =>
    BUSINESS_API.delete(`/rasna-entries/${id}`),

  getCustomerSummary: (customerId) =>
    BUSINESS_API.get(`/rasna-entries/customer/${customerId}/summary`),
};


export const pioProductionApi = {
  getAll: () =>
    BUSINESS_API.get('/pio-productions'),

  getById: (id) =>
    BUSINESS_API.get(`/pio-productions/${id}`),

  create: (data) =>
    BUSINESS_API.post('/pio-productions', data),

  update: (id, data) =>
    BUSINESS_API.put(`/pio-productions/${id}`, data),

  delete: (id) =>
    BUSINESS_API.delete(`/pio-productions/${id}`),
};


export const pioSaleApi = {
  getAll: () =>
    BUSINESS_API.get('/pio-sales'),

  getById: (id) =>
    BUSINESS_API.get(`/pio-sales/${id}`),

  create: (data) =>
    BUSINESS_API.post('/pio-sales', data),

  update: (id, data) =>
    BUSINESS_API.put(`/pio-sales/${id}`, data),

  delete: (id) =>
    BUSINESS_API.delete(`/pio-sales/${id}`),

  getStockSummary: () =>
    BUSINESS_API.get('/pio-sales/stock-summary'),

  getCustomerSummary: (customerId, season) =>
    BUSINESS_API.get(
      `/pio-sales/customer/${customerId}/summary${season ? `?season=${season}` : ''
      }`
    ),
};

export const notificationApi = {

  // =========================
  // PIO INDIVIDUAL SALE
  // =========================

  sendPioSaleMessage: (saleId) =>
    BUSINESS_API.post(
      `/notifications/pio-sale/${saleId}`
    ),


  // =========================
  // PIO CUSTOMER SEASON SUMMARY
  // =========================

  sendPioCustomerSummary: (customerId, season) =>
    BUSINESS_API.post(
      `/notifications/pio-customer/${customerId}/summary?season=${season}`
    ),


  // =========================
  // RASNA INDIVIDUAL ENTRY
  // =========================

  sendRasnaEntry: (entryId) =>
    BUSINESS_API.post(
      `/notifications/rasna-entry/${entryId}`
    ),


  // =========================
  // RASNA CUSTOMER SEASON SUMMARY
  // =========================

  sendRasnaCustomerSummary: (customerId, season) =>
    BUSINESS_API.post(
      `/notifications/rasna-customer/${customerId}/summary?season=${season}`
    ),

};
