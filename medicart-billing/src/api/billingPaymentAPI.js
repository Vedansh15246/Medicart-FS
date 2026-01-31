/**
 * MediCart Payment Integration API
 * 
 * This file provides integration between the MediCart Billing module
 * and the backend payment service
 */

import axios from 'axios';

// Use the same base URL as the main frontend
const API_BASE_URL = 'http://localhost:8080';

const paymentClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
paymentClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }
  return config;
});

export const billingPaymentAPI = {
  /**
   * Process payment for an order
   * @param {number} orderId - The order ID
   * @param {number} amount - Amount to pay
   * @param {string} paymentMethod - Payment method (CREDIT_CARD, DEBIT_CARD, NET_BANKING, UPI)
   * @returns {Promise} Payment response with paymentId and status
   */
  processPayment: async (orderId, amount, paymentMethod = 'CREDIT_CARD') => {
    try {
      const response = await paymentClient.post('/api/payment/process', null, {
        params: {
          orderId,
          amount,
          paymentMethod
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get payment status
   * @param {number} paymentId - Payment ID
   * @returns {Promise} Payment object with status
   */
  getPaymentStatus: async (paymentId) => {
    try {
      const response = await paymentClient.get(`/api/payment/${paymentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get payment by order ID
   * @param {number} orderId - Order ID
   * @returns {Promise} Payment object
   */
  getPaymentByOrderId: async (orderId) => {
    try {
      const response = await paymentClient.get(`/api/payment/order/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get user's payment history
   * @returns {Promise} Array of payment objects
   */
  getPaymentHistory: async () => {
    try {
      const response = await paymentClient.get('/api/payment/user/history');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Refund a payment
   * @param {number} paymentId - Payment ID
   * @returns {Promise} Refunded payment object
   */
  refundPayment: async (paymentId) => {
    try {
      const response = await paymentClient.post(`/api/payment/${paymentId}/refund`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get payment transactions
   * @param {number} paymentId - Payment ID
   * @returns {Promise} Array of transaction objects
   */
  getPaymentTransactions: async (paymentId) => {
    try {
      const response = await paymentClient.get(`/api/payment/${paymentId}/transactions`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default billingPaymentAPI;
