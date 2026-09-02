import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  credentials: 'include', // ← Add this. Critical for cookies
  // Delete the entire prepareHeaders block. You don't need it.
})

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: [
        'Product', 
        'Order', 
        'User', 
        'Accessories',     // for list page
        'Accessory',       // for single product + header rating
        'AccessoryReviews',// for review list with pagination
        'Replies'          // for replies to reviews
    ],
  endpoints: () => ({}),
})