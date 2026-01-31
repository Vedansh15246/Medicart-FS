import { configureStore } from "@reduxjs/toolkit";
import productReducer from "../features/catalog/productSlice";
import cartReducer from "../components/cart/cartSlice";
export const store = configureStore({
  reducer: {
    products: productReducer,
    cart:cartReducer
  },
});
