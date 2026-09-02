import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
};

const compareSlice = createSlice({
  name: 'compare',
  initialState,
  reducers: {
    addToCompare: (state, action) => {
  const product = action.payload;

  const exists = state.products.find(
    (x) => x?._id === product._id
  );

  if (exists) return;

  // Reuse an empty slot first
  const emptyIndex = state.products.findIndex((x) => x === null);

  if (emptyIndex !== -1) {
    state.products[emptyIndex] = product;
    return;
  }

  // Maximum 4 real phones
  if (state.products.filter(Boolean).length >= 4) return;

  state.products.push(product);
},

    clearCompareSlot: (state, action) => {
  state.products[action.payload] = null;
},

    removeFromCompare: (state, action) => {
      state.products = state.products.filter(
        (x) => x._id !== action.payload
      );
    },

    replaceCompareProduct: (state, action) => {
  const { index, product } = action.payload;

  state.products[index] = product;
},

setCompareProducts: (state, action) => {
  state.products = action.payload;
},

    clearCompare: (state) => {
      state.products = [];
    },
  },
});

export const {
  addToCompare,
  removeFromCompare,
  replaceCompareProduct,
  clearCompareSlot,
  setCompareProducts,
  clearCompare,
} = compareSlice.actions;

export default compareSlice.reducer;