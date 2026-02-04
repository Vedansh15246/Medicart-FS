import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import client from "../../api/client";

// ✅ 1. Fetch full cart from Backend
export const fetchCart = createAsyncThunk("cart/fetch", async () => {
  const response = await client.get("/api/cart");
  return response.data; // Expecting an array of cart items
});

// ✅ 2. Add Item
export const addToCart = createAsyncThunk("cart/add", async (product, { dispatch }) => {
  // Send request with proper query parameters: medicineId and quantity
  await client.post(`/api/cart/add?medicineId=${product.id}&quantity=1`);
  dispatch(fetchCart());
  return product;
});

// ✅ 3. Increment
export const incrementQty = createAsyncThunk("cart/increment", async (medicineId, { dispatch }) => {
  // Increment by 1: add another unit to cart
  await client.post(`/api/cart/add?medicineId=${medicineId}&quantity=1`);
  dispatch(fetchCart());
  return medicineId;
});

// ✅ 4. Decrement
export const decrementQty = createAsyncThunk("cart/decrement", async (medicineId, { getState, dispatch }) => {
  const state = getState();
  const item = state.cart.items.find(i => i.product.id === medicineId);
  
  if (item && item.qty > 1) {
    // Update quantity to qty - 1
    const cartItemId = item.id; // Assuming cart item has an id field
    await client.put(`/api/cart/update/${cartItemId}?quantity=${item.qty - 1}`);
  } else {
    // Remove item completely
    const cartItemId = item.id;
    await client.delete(`/api/cart/remove/${cartItemId}`);
  }
  dispatch(fetchCart());
  return medicineId;
});

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [], status: "idle" },
  reducers: {
    // ✅ This allows manual updates from components (like Checkout refresh)
    setCart(state, action) {
      state.items = action.payload.map(item => ({
        id: item.id,
        product: item.medicine,
        qty: item.quantity
      }));
    },
    clearCart(state) { 
      state.items = []; 
      state.status = "idle";
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        // Map backend CartItem (medicine, quantity) to frontend format (product, qty)
        // Include id for update/delete operations
        state.items = action.payload.map(item => ({
          id: item.id,
          product: item.medicine,
          qty: item.quantity
        }));
        state.status = "succeeded";
      })
      .addCase(fetchCart.rejected, (state) => {
        state.status = "failed";
      });
  }
});

export const { clearCart, setCart } = cartSlice.actions; // ✅ Added setCart here
export default cartSlice.reducer;