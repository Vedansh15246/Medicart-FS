import client from "./client";

// ============ PAYMENT SERVICE ============
// Routes through API Gateway to Payment Service (port 8086)

export const paymentService = {
  // Process payment for an order
  processPayment: async (orderId, amount, paymentMethod = "CREDIT_CARD", cardData = null) => {
    const payload = {
      orderId: orderId,
      amount: amount,
      paymentMethod: paymentMethod,
      ...cardData // Include card details if provided
    };
    
    const response = await client.post("/api/payment/process", payload);
    return response.data;
  },

  // Get payment status
  getPaymentStatus: async (paymentId) => {
    const response = await client.get(`/api/payment/${paymentId}`);
    return response.data;
  },

  // Get payment by order ID
  getPaymentByOrderId: async (orderId) => {
    const response = await client.get(`/api/payment/order/${orderId}`);
    return response.data;
  },

  // Get user's payment history
  getPaymentHistory: async () => {
    const response = await client.get("/api/payment/user/history");
    return response.data;
  },

  // Refund payment
  refundPayment: async (paymentId) => {
    const response = await client.post(`/api/payment/${paymentId}/refund`);
    return response.data;
  },

  // Get payment transactions
  getPaymentTransactions: async (paymentId) => {
    const response = await client.get(`/api/payment/${paymentId}/transactions`);
    return response.data;
  },
};

export default paymentService;
