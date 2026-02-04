import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  search: {
    q: "",
    category: "ALL",
  },
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setSearchQuery(state, action) {
      state.search.q = action.payload;
    },
    setCategory(state, action) {
      state.search.category = action.payload;
    },
  },
});

export const { setSearchQuery, setCategory } = productSlice.actions;
export default productSlice.reducer;
