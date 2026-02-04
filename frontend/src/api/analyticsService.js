import client from "./client";

// ============ ANALYTICS SERVICE ============
// Routes through API Gateway to Analytics Service (port 8085)

export const analyticsService = {
  // Get analytics summary
  getSummary: async () => {
    const response = await client.get("/api/analytics/summary");
    return response.data;
  },

  // Get revenue timeseries
  getRevenueTimeseries: async (days = 365) => {
    const response = await client.get("/api/analytics/revenue-timeseries", {
      params: { days },
    });
    return response.data;
  },

  // Get orders timeseries
  getOrdersTimeseries: async (days = 30) => {
    const response = await client.get("/api/analytics/orders-timeseries", {
      params: { days },
    });
    return response.data;
  },

  // Get top products
  getTopProducts: async (limit = 6) => {
    const response = await client.get("/api/analytics/top-products", {
      params: { limit },
    });
    return response.data;
  },

  // Get dashboard overview
  getDashboard: async () => {
    const response = await client.get("/api/analytics/dashboard");
    return response.data;
  },

  // Get sales report
  getSalesReport: async (params = {}) => {
    const response = await client.get("/api/analytics/sales", { params });
    return response.data;
  },

  // Get inventory report
  getInventoryReport: async () => {
    const response = await client.get("/api/analytics/inventory");
    return response.data;
  },

  // Subscribe to real-time analytics stream
  subscribeToStream: (onMessage, onError) => {
    const eventSource = new EventSource("/api/analytics/stream");
    eventSource.onmessage = onMessage;
    eventSource.onerror = onError;
    return eventSource;
  },
};

// ============ REPORTS SERVICE ============
export const reportService = {
  // Get all reports
  getReports: async (params = {}) => {
    const response = await client.get("/api/reports", { params });
    return response.data;
  },

  // Get report by ID
  getReportById: async (reportId) => {
    const response = await client.get(`/api/reports/${reportId}`);
    return response.data;
  },

  // Generate sales report
  generateSalesReport: async (params = {}) => {
    const response = await client.post("/api/reports/sales", null, { params });
    return response.data;
  },

  // Generate inventory report
  generateInventoryReport: async (params = {}) => {
    const response = await client.post("/api/reports/inventory", null, { params });
    return response.data;
  },

  // Generate compliance report
  generateComplianceReport: async (params = {}) => {
    const response = await client.post("/api/reports/compliance", null, { params });
    return response.data;
  },

  // Generate custom report
  generateReport: async (params = {}) => {
    const response = await client.post("/api/reports/generate", null, { params });
    return response.data;
  },

  // Export report
  exportReport: async (reportId, format = "json") => {
    const response = await client.get(`/api/reports/${reportId}/export`, {
      params: { format },
      responseType: format === "pdf" ? "blob" : "json",
    });
    return response.data;
  },

  // Delete report
  deleteReport: async (reportId) => {
    const response = await client.delete(`/api/reports/${reportId}`);
    return response.data;
  },
};

// ============ PAYMENT SERVICE ============
export const paymentService = {
  // Process payment
  processPayment: async (paymentData) => {
    const response = await client.post("/api/payment/process", paymentData);
    return response.data;
  },

  // Verify payment
  verifyPayment: async (transactionId) => {
    const response = await client.get(`/api/payment/verify/${transactionId}`);
    return response.data;
  },

  // Get payment methods
  getPaymentMethods: async () => {
    const response = await client.get("/api/payment/methods");
    return response.data;
  },

  // Get transaction history
  getTransactionHistory: async (params = {}) => {
    const response = await client.get("/api/payment/transactions", { params });
    return response.data;
  },

  // Refund payment
  refundPayment: async (transactionId) => {
    const response = await client.post(`/api/payment/${transactionId}/refund`);
    return response.data;
  },
};

export default { analyticsService, reportService, paymentService };
