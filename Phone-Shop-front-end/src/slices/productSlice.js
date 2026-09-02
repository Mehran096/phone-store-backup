import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
const API_URL = import.meta.env.VITE_API_URL

// GET ALL PRODUCTS - public
export const listProducts = createAsyncThunk(
  'product/listProducts',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_URL}/products`)
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

// GET PRODUCT BY ID - public
export const getProductDetails = createAsyncThunk(
  'product/getProductDetails',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_URL}/products/${id}`)
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

// DELETE PRODUCT - admin only
export const deleteProduct = createAsyncThunk(
  'product/deleteProduct',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth: { userInfo } }= getState()

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      }

      await axios.delete(`${API_URL}/products/${id}`, config)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const createProduct = createAsyncThunk(
  'product/createProduct',
  async (formData, { getState, rejectWithValue }) => {
    try {
      const { auth: { userInfo }} = getState()

      const config = {
        headers: {
          
          Authorization: `Bearer ${userInfo.token}`,
        },
      }

      const { data } = await axios.post(`${API_URL}/products`, formData, config)
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

// UPDATE PRODUCT - admin only
export const updateProduct = createAsyncThunk(
  'product/updateProduct',
  async ({ id, formData }, { getState, rejectWithValue }) => {
    try {
      const { auth: { userInfo } }= getState()

      const config = {
        headers: { 
          //'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      }

      const { data } = await axios.put(`${API_URL}/products/${id}`, formData, config)
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

// Create review
export const createProductReview = createAsyncThunk(
  'product/createReview',
  async ({ id, rating, comment }, { getState, rejectWithValue }) => {
    try {
      const { auth: { userInfo } } = getState()

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      }

      const { data } = await axios.post(
        `${API_URL}/products/${id}/reviews`,
        { rating, comment },
        config
      )
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

// 1. Add the thunk for specs
// export const updateProductSpecs = createAsyncThunk(
//   'product/updateSpecs',
//   async ({ id, specs }, { getState, rejectWithValue }) => {
//     try {
//       const { auth: { userInfo }} = getState()
//       const config = {
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${userInfo.token}`,
//         },
//       }
//       const { data } = await axios.put(
//         `${API_URL}/products/${id}/specs`,
//         { specs },
//         config
//       )
//       return data
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message)
//     }
//   }
// )

const productSlice = createSlice({
  name: 'product',
  initialState: {
    products: [],
    page: 1,
    pages: 1,
    product: null,
    loading: false,
    error: null,
    successDelete: false,
    successCreate: false,
    successUpdate: false,
    successReview: false,
    reviewError: null,
  },
  reducers: {
    resetProductCreate: (state) => {
      state.successCreate = false
      state.product = null
    },
    resetProductUpdate: (state) => {
      state.successUpdate = false
    },
    resetProductDelete: (state) => {
      state.successDelete = false
    },
    resetProductDetails: (state) => {
      state.product = null
    },
     resetReview: (state) => {
      state.successReview = false
      state.reviewError = null
    },
  },
  extraReducers: (builder) => {
    builder
      // List Products
      .addCase(listProducts.pending, (state) => { 
        state.loading = true 
        state.error = null
      })
      .addCase(listProducts.fulfilled, (state, action) => {
        state.loading = false
        state.products = action.payload.products 
        state.page = action.payload.page
        state.pages = action.payload.pages
      })
      .addCase(listProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Get Product Details
      .addCase(getProductDetails.pending, (state) => { 
        state.loading = true 
        state.error = null
      })
      .addCase(getProductDetails.fulfilled, (state, action) => {
        state.loading = false
        state.product = action.payload
      })
      .addCase(getProductDetails.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Delete Product
      .addCase(deleteProduct.pending, (state) => { 
        state.loading = true 
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false
        state.successDelete = true
        state.products = state.products.filter((p) => p._id !== action.payload)
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Create Product
      .addCase(createProduct.pending, (state) => { 
        state.loading = true 
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false
        state.successCreate = true
        state.product = action.payload
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Update Product
      .addCase(updateProduct.pending, (state) => { 
        state.loading = true 
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false
        state.successUpdate = true
        state.product = action.payload
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create Review
      .addCase(createProductReview.pending, (state) => {
        state.reviewError = null
      })
      .addCase(createProductReview.fulfilled, (state) => {
        state.successReview = true
      })
      .addCase(createProductReview.rejected, (state, action) => {
        state.reviewError = action.payload
      })
    //   .addCase(updateProductSpecs.pending, (state) => {
    //   state.loading = true
    // })
    // .addCase(updateProductSpecs.fulfilled, (state, action) => {
    //   state.loading = false
    //   state.product = action.payload // update the product in state
    //   state.successUpdate = true
    // })
    // .addCase(updateProductSpecs.rejected, (state, action) => {
    //   state.loading = false
    //   state.error = action.payload
    // })
  },
})

export const { 
  resetProductCreate, 
  resetProductUpdate, 
  resetProductDelete, 
  resetProductDetails,
  resetReview
} = productSlice.actions

export default productSlice.reducer