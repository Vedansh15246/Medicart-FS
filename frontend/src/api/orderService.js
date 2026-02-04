import client from "./client";

// ============ ORDERS & CART SERVICE ============
// Routes through API Gateway to Cart-Orders Service (port 8083)

export const orderService = {
  // ✅ FIXED: Place order with explicit validation
  placeOrder: async (addressId) => {
    console.log("📍 placeOrder called with addressId:", addressId, "type:", typeof addressId);
    
    // ✅ EXPLICIT VALIDATION
    if (addressId === null || addressId === undefined || addressId === '') {
      const errMsg = "Address ID is required but was not provided";
      console.error("❌", errMsg);
      throw new Error(errMsg);
    }
    
    // Ensure addressId is a number
    const addressIdNum = Number(addressId);
    if (isNaN(addressIdNum)) {
      const errMsg = `Invalid address ID format: ${addressId}`;
      console.error("❌", errMsg);
      throw new Error(errMsg);
    }
    
    if (addressIdNum <= 0) {
      const errMsg = `Invalid address ID: ${addressIdNum} (must be > 0)`;
      console.error("❌", errMsg);
      throw new Error(errMsg);
    }
    
    console.log("✅ Validated addressId:", addressIdNum);
    console.log("📤 Sending POST /api/orders/place with addressId:", addressIdNum);
    
    // ✅ FIX: Send addressId as request body (more reliable than query params with axios)
    const response = await client.post("/api/orders/place", {
      addressId: addressIdNum
    });
    
    console.log("✅ Order created successfully:", response.data);
    return response.data;
  },

  // Get user's orders
  getMyOrders: async () => {
    const response = await client.get("/api/orders");
    return response.data;
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    const response = await client.get(`/api/orders/${orderId}`);
    return response.data;
  },

  // Get all orders (admin only)
  getAllOrders: async (params = {}) => {
    const response = await client.get("/api/orders", { 
      params: { ...params, admin: true } 
    });
    return response.data;
  },

  // Update order status (admin only)
  updateOrderStatus: async (orderId, status) => {
    const response = await client.put(`/api/orders/${orderId}/status`, { status });
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    const response = await client.post(`/api/orders/${orderId}/cancel`);
    return response.data;
  },
};

// ============ CART SERVICE ============
export const cartService = {
  // Get cart items
  getCart: async () => {
    const response = await client.get("/api/cart");
    return response.data;
  },

  // Add item to cart
  addToCart: async (cartItem) => {
    const response = await client.post("/api/cart", cartItem);
    return response.data;
  },

  // Update cart item quantity
  updateCartItem: async (itemId, quantity) => {
    const response = await client.put(`/api/cart/${itemId}`, { quantity });
    return response.data;
  },

  // Remove item from cart
  removeFromCart: async (itemId) => {
    const response = await client.delete(`/api/cart/${itemId}`);
    return response.data;
  },

  // Clear entire cart
  clearCart: async () => {
    const response = await client.post("/api/cart/clear");
    return response.data;
  },

  // Get cart total
  getCartTotal: async () => {
    const response = await client.get("/api/cart/total");
    return response.data;
  },
};

// ============ ADDRESS SERVICE ============
export const addressService = {
  // Get all addresses for user
  getAddresses: async () => {
    const response = await client.get("/api/address");
    return response.data;
  },

  // Get single address
  getAddressById: async (addressId) => {
    const response = await client.get(`/api/address/${addressId}`);
    return response.data;
  },

  // Create new address
  createAddress: async (addressData) => {
    const response = await client.post("/api/address", addressData);
    return response.data;
  },

  // Update address
  updateAddress: async (addressId, addressData) => {
    const response = await client.put(`/api/address/${addressId}`, addressData);
    return response.data;
  },

  // Delete address
  deleteAddress: async (addressId) => {
    const response = await client.delete(`/api/address/${addressId}`);
    return response.data;
  },

  // Set as default address
  setDefaultAddress: async (addressId) => {
    const response = await client.put(`/api/address/${addressId}`, { isDefault: true });
    return response.data;
  },
};

// Add getAddresses method to orderService for convenience
orderService.getAddresses = addressService.getAddresses;

export default { orderService, cartService, addressService };
