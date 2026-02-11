import { configureStore } from "@reduxjs/toolkit";
import productReducer from "../features/catalog/productSlice";
import cartReducer from "../components/cart/cartSlice";
import authReducer from "../features/auth/authSlice";

export const store = configureStore({
  reducer: {
    products: productReducer,
    cart: cartReducer,
    auth: authReducer,
  },
});
