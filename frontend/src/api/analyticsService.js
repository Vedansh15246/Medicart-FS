import client from "./client";
import {
  fetchAnalyticsSummary,
  fetchSalesByCategory,
  fetchTopProducts,
  fetchOrderStatusDistribution,
  refreshAnalytics,
  fetchReportList,
  generateSalesReport,
  generateInventoryReport,
  generateUserActivityReport,
} from "../features/admin/analyticsSection/analyticsApi";

// Thin wrappers that reuse the canonical analytics API used by the admin section.
export const analyticsService = {
  getSummary: fetchAnalyticsSummary,
  getSalesByCategory: fetchSalesByCategory,
  getTopProducts: (limit = 6) => fetchTopProducts(limit),
  getOrderStatusDistribution: fetchOrderStatusDistribution,
  refresh: refreshAnalytics,
};

export const reportService = {
  getReports: fetchReportList,
  generateSalesReport: generateSalesReport,
  generateInventoryReport: generateInventoryReport,
  generateUserActivityReport: generateUserActivityReport,
};

export const paymentService = {
  processPayment: async (paymentData) => {
    const response = await client.post("/api/payment/process", paymentData);
    return response.data;
  },
  verifyPayment: async (transactionId) => {
    const response = await client.get(`/api/payment/verify/${transactionId}`);
    return response.data;
  },
  getPaymentMethods: async () => {
    const response = await client.get("/api/payment/methods");
    return response.data;
  },
  getTransactionHistory: async (params = {}) => {
    const response = await client.get("/api/payment/transactions", { params });
    return response.data;
  },
  refundPayment: async (transactionId) => {
    const response = await client.post(`/api/payment/${transactionId}/refund`);
    return response.data;
  },
};

export default { analyticsService, reportService, paymentService };
