import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../utils/axios'

// Get wishlist
export const getWishlist = createAsyncThunk(
  'wishlist/get',
  async (_, { rejectWithValue }) => {
    try {
      const config = { withCredentials: true }
      const { data } = await api.get('/wishlist', config)
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

// Toggle wishlist
export const toggleWishlist = createAsyncThunk(
  'wishlist/toggle',
  async ({ 
    type, 
    productId, 
    accessoryId, 
    modelIndex = 0, 
    accessoryVariantIndex = 0,
    productVariantIndex = 0,
    productColorIndex = 0
  }, { rejectWithValue }) => {
    try {
      const config = {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      }
      const { data } = await api.post('/wishlist/toggle', { 
        type, 
        productId, 
        accessoryId, 
        modelIndex, 
        accessoryVariantIndex,
        productVariantIndex,
        productColorIndex
      }, config)
      return data.wishlist
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

// Remove by item._id - KEY FIX 1: Remove dispatch getWishlist
export const removeWishlistItem = createAsyncThunk(
  'wishlist/removeItem',
  async (itemId, { rejectWithValue }) => {
    try {
      const config = { withCredentials: true }
      await api.delete(`/wishlist/${itemId}`, config)
      return itemId // just return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

// Clear all - KEY FIX 2: Remove dispatch getWishlist
export const clearWishlist = createAsyncThunk(
  'wishlist/clear',
  async (_, { rejectWithValue }) => {
    try {
      const config = { withCredentials: true }
      await api.delete('/wishlist', config)
      return { items: [] }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    wishlist: { items: [] },
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetWishlist: (state) => {
      state.wishlist = { items: [] }
      state.loading = false
      state.error = null
      state.success = false
    },
  },
  extraReducers: (builder) => {
    builder
      // Get
      .addCase(getWishlist.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getWishlist.fulfilled, (state, action) => {
        state.loading = false
        state.wishlist = action.payload
      })
      .addCase(getWishlist.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Toggle
      .addCase(toggleWishlist.pending, (state) => {
        state.loading = true
        state.success = false
        state.error = null
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.wishlist = action.payload
      })
      .addCase(toggleWishlist.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Remove - KEY FIX 3: Optimistic delete
      .addCase(removeWishlistItem.pending, (state) => {
        state.loading = false // don't show loader
        state.error = null
      })
      .addCase(removeWishlistItem.fulfilled, (state, action) => {
        state.loading = false
        // INSTANT DELETE: remove from UI immediately
        state.wishlist.items = state.wishlist.items.filter(
          (item) => item._id !== action.payload
        )
      })
      .addCase(removeWishlistItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Clear - KEY FIX 4: Clear instantly
      .addCase(clearWishlist.pending, (state) => {
        state.loading = false
      })
      .addCase(clearWishlist.fulfilled, (state) => {
        state.loading = false
        state.wishlist = { items: [] } // clear instantly
      })
      .addCase(clearWishlist.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { resetWishlist } = wishlistSlice.actions
export default wishlistSlice.reducer