import { apiSlice } from './apiSlice';

export const productsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ keyword, pageNumber, category, brand, minPrice, maxPrice, sort, isLatest, limit }) => ({
        url: '/products',
        params: { keyword, pageNumber, category, brand, minPrice, maxPrice, sort, isLatest, limit },
      }),
      providesTags: ['Products'],
      keepUnusedDataFor: 5,
    }),
    getSearchSuggestions: builder.query({
      query: (keyword) => ({
        url: '/products',
        params: {
          keyword,
          pageSize: 6,
          suggestions: true,
        },
      }),
      keepUnusedDataFor: 5,
    }),

 getProductsForDropdown: builder.query({
      query: (keyword = '') => ({
        url: '/products/dropdown',
        params: { keyword },
      }),
      keepUnusedDataFor: 5,
    }),

    getProductDetails: builder.query({
      query: (id) => `/products/${id}`,
      keepUnusedDataFor: 5,
    }),
    getProductBySlug: builder.query({
      query: (slug) => `/products/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Product', id: slug }],
      keepUnusedDataFor: 5,
    }),
    createProduct: builder.mutation({
      query: (data) => ({
        url: '/products',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Products'],
    }),
    updateProduct: builder.mutation({
      query: (data) => ({
        url: `/products/${data._id}`, // V38.66 KEY: use _id not id
        method: 'PUT',
        body: data, // <-- V9.8: JSON only. Frontend already uploaded to Cloudinary
      }),
      invalidatesTags: (result, error, arg) => [
        'Products',
        { type: 'Product', id: arg._id }, // V38.66 KEY: use _id not id
        { type: 'Product', id: result?.slug },
      ],
    }),
    getBestSellerProducts: builder.query({
  query: ({ limit = 8 } = {}) => ({  
    url: '/products/bestsellers',
    params: { limit }
  }),
  providesTags: ['Products'],
  keepUnusedDataFor: 5,
}),
    getDealsProducts: builder.query({
      query: ({ limit = 12, minDiscount = 0 } = {}) => ({
        url: '/products/deals',
        params: { limit, minDiscount },
      }),
      providesTags: ['Products'],
      keepUnusedDataFor: 5,
    }),
    getNewArrivalProducts: builder.query({
  query: ({ limit = 8 } = {}) => ({ 
    url: '/products/new-arrivals',
    params: { limit }
  }),
  providesTags: ['Products'],
  keepUnusedDataFor: 5,
}),
    getCompareProducts: builder.query({
  query: (slugs) => ({
    url: "/products/compare",
    params: {
      slugs: Array.isArray(slugs)
        ? slugs.join(",")
        : slugs,
    },
  }),
  providesTags: ["Products"],
  keepUnusedDataFor: 5,
}),
getRecommendedProducts: builder.query({
  query: (productId) => `/products/${productId}/recommendations`,
  providesTags: ['Products'],
  keepUnusedDataFor: 5,
}),
getFrequentlyBoughtTogether: builder.query({
  query: ({ productId, model }) => ({  
    url: `/products/${productId}/frequently-bought`,
    params: { model },  
  }),
  providesTags: ["Products"],
  keepUnusedDataFor: 5,
}),
    updateProductSpecs: builder.mutation({
      query: ({ slug, specs }) => ({
        url: `/products/slug/${slug}/specs`,
        method: 'PUT',
        body: specs,
      }),
      invalidatesTags: (result, error, { slug }) => [
        { type: 'Product', id: slug },
      ],
    }),
    deleteProduct: builder.mutation({
      query: (productId) => ({
        url: `/products/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Products'],
    }),
    getProductReviews: builder.query({
      query: ({
        slug,
        page = 1,
        limit = 10,
        color = '',
        storage = '',
        sort = 'newest',
        keyword = '',
        rating = "",
      }) => ({
        url: `/products/slug/${slug}/reviews`,
        params: { page, limit, color, storage, sort, keyword, rating },
      }),
      providesTags: (result, error, { slug }) => [{ type: 'ProductReviews', id: slug }],

      serializeQueryArgs: ({ queryArgs }) => {
        const { page, ...rest } = queryArgs;
        return JSON.stringify(rest);
      },
      merge: (currentCache, newItems, { arg }) => {  
    if (arg.page === 1) return newItems;  
    
    const merged = [...currentCache.reviews, ...newItems.reviews];
    const unique = Array.from(new Map(merged.map(r => [r._id, r])).values());
    
    return { ...newItems, reviews: unique };
  },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page;
      },
      keepUnusedDataFor: 300,
    }),

    createProductReview: builder.mutation({
      query: ({ slug, ...data }) => ({ 
        url: `/products/slug/${slug}/reviews`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { slug }) => [
        { type: 'Product', id: slug },
        { type: 'ProductReviews', id: slug },  
      ],
    }),
     updateReview: builder.mutation({
      query: (data) => ({
        url: `/products/slug/${data.slug}/reviews/${data.reviewId}`, 
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Product', id: arg.slug },
        { type: 'ProductReviews', id: arg.slug },
      ],
    }),
   deleteReview: builder.mutation({
  query: ({ slug, reviewId }) => ({  
    url: `/products/slug/${slug}/reviews/${reviewId}`,
    method: 'DELETE',
  }),
  invalidatesTags: (result, error, { slug }) => [
    { type: 'Product', id: slug },
    { type: 'ProductReviews', id: slug }, 
  ],
}),

     // 1. HELPFUL
     markReviewHelpful: builder.mutation({
      query: ({ slug, reviewId }) => ({  
        url: `/products/slug/${slug}/reviews/${reviewId}/helpful`,
        method: 'PUT',
      }),
      async onQueryStarted({ slug, reviewId }, { dispatch, queryFulfilled, getState }) {
        const patchResults = [];
        const state = getState();
        const userId = state.auth.userInfo?._id;
        const queries = productsApiSlice.util.selectCachedArgsForQuery(state, 'getProductReviews');
        
        queries.forEach((args) => {
          if (args.slug === slug) {
            patchResults.push(
              dispatch(
                productsApiSlice.util.updateQueryData('getProductReviews', args, (draft) => {
                  const review = draft.reviews?.find(r => r._id === reviewId);
                  if (review) {
                    const hasVoted = review.helpful?.includes(userId);
                    review.helpful = hasVoted ? review.helpful.filter(id => id !== userId) : [...(review.helpful || []), userId];
                    review.notHelpful = review.notHelpful?.filter(id => id !== userId) || [];
                    if (args.sort === 'helpful') draft.reviews.sort((a,b) => (b.helpful?.length||0) - (a.helpful?.length||0));
                  }
                })
              )
            );
          }
        });

        try { await queryFulfilled; dispatch(apiSlice.util.invalidateTags([{ type: 'Product', id: slug }])); } 
        catch { patchResults.forEach(patch => patch.undo()); }
      },
    }),
   // 2. NOT HELPFUL
    markReviewNotHelpful: builder.mutation({
      query: ({ slug, reviewId }) => ({ 
        url: `/products/slug/${slug}/reviews/${reviewId}/not-helpful`,
        method: 'PUT',
      }),
      async onQueryStarted({ slug, reviewId }, { dispatch, queryFulfilled, getState }) {
        const patchResults = [];
        const state = getState();
        const userId = state.auth.userInfo?._id;
        const queries = productsApiSlice.util.selectCachedArgsForQuery(state, 'getProductReviews');
        
        queries.forEach((args) => {
          if (args.slug === slug) {
            patchResults.push(
              dispatch(
                productsApiSlice.util.updateQueryData(
                  'getProductReviews',
                  args,
                  (draft) => {
                    const review = draft.reviews?.find(r => r._id === reviewId);
                    if (review) {
                      const hasVoted = review.notHelpful?.includes(userId);
                      review.notHelpful = hasVoted
                        ? review.notHelpful.filter(id => id !== userId)
                        : [...(review.notHelpful || []), userId];
                      // Remove from helpful if voted there
                      review.helpful = review.helpful?.filter(id => id !== userId) || [];
                    }
                  }
                )
              )
            );
          }
        });

        try { await queryFulfilled; dispatch(apiSlice.util.invalidateTags([{ type: 'Product', id: slug }])); } 
        catch { patchResults.forEach(patch => patch.undo()); }
      },
    }),
     // 3. ADD ADMIN REPLY
     addAdminReply: builder.mutation({
      query: ({ slug, reviewId, reply }) => ({  
        url: `/products/slug/${slug}/reviews/${reviewId}/reply`,
        method: 'POST',
        body: { reply },
      }),
      async onQueryStarted({ slug, reviewId, reply }, { dispatch, queryFulfilled, getState }) {
        const patchResults = [];
        const state = getState();
        const userName = state.auth.userInfo?.name || 'Admin';
        const queries = productsApiSlice.util.selectCachedArgsForQuery(state, 'getProductReviews');
        
        queries.forEach((args) => {
          if (args.slug === slug) {
            patchResults.push(
              dispatch(
                productsApiSlice.util.updateQueryData('getProductReviews', args, (draft) => {
                  const review = draft.reviews?.find(r => r._id === reviewId);
                  if (review) review.adminReply = { reply, name: userName, createdAt: new Date().toISOString() };
                })
              )
            );
          }
        });

        try { await queryFulfilled; dispatch(apiSlice.util.invalidateTags([{ type: 'Product', id: slug }])); } 
        catch { patchResults.forEach(patch => patch.undo()); }
      },
    }),

     // 4. EDIT ADMIN REPLY
    editAdminReply: builder.mutation({
      query: ({ slug, reviewId, reply }) => ({  
        url: `/products/slug/${slug}/reviews/${reviewId}/reply`,
        method: 'PUT',
        body: { reply },
      }),
      async onQueryStarted({ slug, reviewId, reply }, { dispatch, queryFulfilled, getState }) {
        const patchResults = [];
        const queries = productsApiSlice.util.selectCachedArgsForQuery(getState(), 'getProductReviews');
        
        queries.forEach((args) => {
          if (args.slug === slug) {
            patchResults.push(
              dispatch(
                productsApiSlice.util.updateQueryData(
                  'getProductReviews',
                  args,
                  (draft) => {
                    const review = draft.reviews?.find(r => r._id === reviewId);
                    if (review?.adminReply) {
                      review.adminReply.reply = reply;
                    }
                  }
                )
              )
            );
          }
        });

        try { await queryFulfilled; dispatch(apiSlice.util.invalidateTags([{ type: 'Product', id: slug }]));}
        
        catch { patchResults.forEach(patch => patch.undo()); }
      },
    }),
     // 5. DELETE ADMIN REPLY
    // 5. DELETE ADMIN REPLY
deleteAdminReply: builder.mutation({
  query: ({ slug, reviewId }) => ({  
    url: `/products/slug/${slug}/reviews/${reviewId}/reply`,
    method: 'DELETE',
  }),
  async onQueryStarted({ slug, reviewId }, { dispatch, queryFulfilled, getState }) { // KEY: added getState
    const patchResults = [];
    const queries = productsApiSlice.util.selectCachedArgsForQuery(getState(), 'getProductReviews');
    
    queries.forEach((args) => {
      if (args.slug === slug) {
        patchResults.push(
          dispatch(
            productsApiSlice.util.updateQueryData(
              'getProductReviews',
              args, // use args directly so it works for page 1,2,3
              (draft) => {
                const review = draft.reviews?.find(r => r._id === reviewId);
                if (review) {
                  review.adminReply = null; // delete reply
                }
              }
            )
          )
        );
      }
    });

    try { 
      await queryFulfilled;
      dispatch(apiSlice.util.invalidateTags([{ type: 'Product', id: slug }]));
    } 
    catch { 
      patchResults.forEach(patch => patch.undo()); 
    }
  },
}),

    uploadProductImage: builder.mutation({ // V8.6 for Products -> Admin only
      query: (formData) => ({
        url: '/upload/products', // <-- hits :type = products
        method: 'POST',
        body: formData,
        credentials: 'include', // <-- send cookie
      }),
      invalidatesTags: ['Product'], // optional: refetch after upload
    }),

    uploadReviewImage: builder.mutation({ // V8.6 for Reviews -> Public
      query: (formData) => ({
        url: '/upload/reviews', // <-- hits :type = reviews
        method: 'POST',
        body: formData,
        credentials: 'include',
      }),
    }),

    deleteCloudinaryImage: builder.mutation({ // V33.34A: V31.84 format
      query: (publicId) => ({
        url: '/upload', // V33.34 KEY: No param in URL
        method: 'DELETE',
        body: { publicId }, // V33.34 KEY: Send in body
        credentials: 'include',
      }),
    }),

    deleteCloudinaryImagesBatch: builder.mutation({ // V38.48 KEY: BATCH DELETE
      query: (data) => ({
        url: '/upload/delete', // V38.48 KEY: Matches new backend POST route
        method: 'POST',
        body: data, // { publicIds: ['id1', 'id2'] }
        credentials: 'include',
      })
    }),

    getProductReviewImages: builder.query({
  query: (slug) => `/products/slug/${slug}/reviews/images`,
  keepUnusedDataFor: 300,
}),

getBrandMenuProducts: builder.query({  
  query: (brand) => `/products/brand-menu/${brand}`,
  keepUnusedDataFor: 60,  
}),


  }),
});

export const {
  useGetProductsQuery,
  useGetSearchSuggestionsQuery,
  useGetProductsForDropdownQuery,
  useGetProductDetailsQuery,
  useGetProductBySlugQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUpdateProductSpecsMutation,
  useDeleteProductMutation,
  useGetProductReviewsQuery,
  useCreateProductReviewMutation,
  useUpdateReviewMutation,
  useGetBestSellerProductsQuery,
  useGetDealsProductsQuery,
  useGetNewArrivalProductsQuery,
  useGetCompareProductsQuery,
  useGetRecommendedProductsQuery,
  useGetFrequentlyBoughtTogetherQuery,
  useDeleteReviewMutation,
  useMarkReviewHelpfulMutation,
  useMarkReviewNotHelpfulMutation,
  useAddAdminReplyMutation,
  useEditAdminReplyMutation,
  useDeleteAdminReplyMutation,
  useGetProductReviewImagesQuery,
  useUploadProductImageMutation,
  useUploadReviewImageMutation,
  useDeleteCloudinaryImageMutation,
  useDeleteCloudinaryImagesBatchMutation,
  useGetBrandMenuProductsQuery,
} = productsApiSlice;