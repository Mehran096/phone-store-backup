import { apiSlice } from './apiSlice';

export const accessoriesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
     // GET /api/accessories?keyword=&pageNumber=&type=&limit=
    getAccessories: builder.query({
      query: ({ keyword = '', pageNumber = '',  type = '', brand = '', pageSize = '', filter = '', limit = 0 }) => ({
        url: '/accessories',
        params: { keyword, pageNumber, type, brand, pageSize, filter, limit },
      }),
      providesTags: ['Accessories'],
      keepUnusedDataFor: 5,
    }),

    // V37.71 KEY: NEW SEARCH SUGGESTION ENDPOINT
    getAccessorySearchSuggestions: builder.query({
      query: (keyword) => ({
        url: '/accessories',
        params: { 
          keyword, 
          pageSize: 6 // only 6 for dropdown
        },
      }),
      transformResponse: (response) => response.accessories || [], // backend returns {accessories: []}
      keepUnusedDataFor: 5,
    }),

    // GET /api/accessories/:id
    getAccessoryDetails: builder.query({
      query: (id) => `/accessories/${id}`,
      providesTags: (result, error, id) => [{ type: 'Accessory', id }],
      keepUnusedDataFor: 5,
    }),

    // GET /api/accessories/slug/:slug
    getAccessoryBySlug: builder.query({
      query: (slug) => `/accessories/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Accessory', id: slug }],
      keepUnusedDataFor: 5,
    }),

    // POST /api/accessories
    createAccessory: builder.mutation({
      query: (data) => ({
        url: '/accessories',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Accessories'],
    }),

    // PUT /api/accessories/:id
    updateAccessory: builder.mutation({
      query: ({ _id, ...data }) => ({
        url: `/accessories/${_id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { _id }) => [
        { type: 'Accessory', id: _id },
        'Accessories',
      ],
    }),

    // DELETE /api/accessories/:id
    deleteAccessory: builder.mutation({
      query: (id) => ({
        url: `/accessories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Accessories'],
    }),

    // POST /api/upload/accessories
    uploadAccessoryImage: builder.mutation({
      query: (formData) => ({
        url: '/upload/accessories',
        method: 'POST',
        body: formData,
        credentials: 'include',
      }),
    }),

    // ===== V33.80 KEY: ACCESSORY REVIEW ENDPOINTS ===== 
    // POST /api/accessories/slug/:slug/reviews
    createAccessoryReview: builder.mutation({
      query: ({ slug, review }) => ({
        url: `/accessories/slug/${slug}/reviews`,
        method: 'POST',
        body: review,
        credentials: 'include',
      }),
      invalidatesTags: (result, error, { slug }) => [ // <-- FIXED
        { type: 'AccessoryReviews', id: slug }, // refresh review list + summary
        { type: 'Accessory', id: slug } // refresh product avg rating
      ],
    }),

    // PUT /api/accessories/slug/:slug/reviews/:reviewId
    updateAccessoryReview: builder.mutation({
      query: ({ slug, reviewId, review }) => ({
        url: `/accessories/slug/${slug}/reviews/${reviewId}`,
        method: 'PUT',
        body: review,
        credentials: 'include',
      }),
      invalidatesTags: (result, error, { slug }) => [ // <-- FIXED
        { type: 'AccessoryReviews', id: slug },
        { type: 'Accessory', id: slug }
      ],
    }),


    
   // GET /accessories/slug/:slug/reviews?page=&limit=&sort=&model=&variant=&rating=&keyword=
getAccessoryReviews: builder.query({
  query: ({ slug, page = 1, limit = 10, sort = 'newest', model = '', variant = '', rating = '', keyword = '', hasPhotos = false }) => ({
    url: `/accessories/slug/${slug}/reviews`,
    params: { 
      page, 
      limit, 
      sort, 
      model, 
      variant, 
      rating, 
      keyword, 
      hasPhotos: hasPhotos ? 'true' : 'false'
    },
  }),
  providesTags: (result, error, { slug }) => [{ type: 'AccessoryReviews', id: slug }],
  serializeQueryArgs: ({ queryArgs }) => {
    const { page, ...rest } = queryArgs;
    return JSON.stringify(rest); // all pages share same cache key
  },
  merge: (currentCache, newItems) => {
    if (!currentCache) return newItems; // first load
    if (newItems.page === 1) return newItems; // reset on filter change

    const merged = [...currentCache.reviews, ...newItems.reviews];
    const unique = Array.from(new Map(merged.map(r => [r._id, r])).values());

    return {
      ...newItems,
      reviews: unique,
    };
  },
  forceRefetch({ currentArg, previousArg }) {
    return currentArg?.page !== previousArg?.page;
  },
  keepUnusedDataFor: 300, // 5 min so cache doesn't drop
}),


    // DELETE /api/accessories/slug/:slug/reviews/:reviewId
    deleteAccessoryReview: builder.mutation({
      query: ({ slug, reviewId }) => ({
        url: `/accessories/slug/${slug}/reviews/${reviewId}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: (result, error, { slug }) => [
        { type: 'AccessoryReviews', id: slug },
        { type: 'Accessory', id: slug }
      ],
    }),


    // PUT /api/accessories/slug/:slug/reviews/:reviewId/vote
 voteReview: builder.mutation({
    query: ({ slug, reviewId, type }) => ({
        url: `/accessories/slug/${slug}/reviews/${reviewId}/vote`,
        method: 'PUT',
        body: { type },
    }),
    async onQueryStarted({ slug, reviewId, type }, { dispatch, queryFulfilled, getState }) {
        const userId = getState().auth.userInfo._id;
        const patchResults = [];
        const queries = accessoriesApiSlice.util.selectCachedArgsForQuery(getState(), 'getAccessoryReviews') || [];
        
        queries.forEach((arg) => {
            if (arg.slug === slug) {
                patchResults.push(
                    dispatch(
                        accessoriesApiSlice.util.updateQueryData('getAccessoryReviews', arg, (draft) => {
                            const review = draft.reviews.find(r => r._id === reviewId);
                            if (!review) return;
                            
                            const votedHelpful = review.helpful?.some(id => id.toString() === userId);
                            const votedNotHelpful = review.notHelpful?.some(id => id.toString() === userId);
                            
                            review.helpful = (review.helpful || []).filter(id => id.toString() !== userId);
                            review.notHelpful = (review.notHelpful || []).filter(id => id.toString() !== userId);
                            
                            if (type === 'helpful' && !votedHelpful) review.helpful.push(userId);
                            if (type === 'notHelpful' && !votedNotHelpful) review.notHelpful.push(userId);

                            // KEY FIX: RE-SORT IF CURRENT SORT IS HELPFUL
                            if (arg.sort === 'helpful') {
                                draft.reviews.sort((a, b) => {
                                    const aScore = (a.helpful?.length || 0) - (a.notHelpful?.length || 0);
                                    const bScore = (b.helpful?.length || 0) - (b.notHelpful?.length || 0);
                                    return bScore - aScore; // desc
                                });
                            }
                        })
                    )
                );
            }
        });

        try { await queryFulfilled; } 
        catch { patchResults.forEach(patch => patch.undo()); }
    },
    invalidatesTags: (result, error, { slug }) => [
        { type: 'Accessory', id: slug }
    ],
}),

    // POST /api/upload/accessory-reviews - for review images
    uploadAccessoryReviewImage: builder.mutation({
      query: (formData) => ({
        url: '/upload/accessory-reviews',
        method: 'POST',
        body: formData,
        credentials: 'include',
      }),
      transformResponse: (response) => {
        // V33.80 KEY: Always return array no matter what backend sends
        return Array.isArray(response) ? response : response.images || []
      }
    }),

    // POST /api/accessories/slug/:slug/reviews/:reviewId/reply - Add reply
    // POST /api/accessories/slug/:slug/reviews/:reviewId/reply - Add reply
replyToReview: builder.mutation({
    query: ({ slug, reviewId, comment }) => ({
        url: `/accessories/slug/${slug}/reviews/${reviewId}/reply`,
        method: 'POST',
        body: { comment }
    }),
    async onQueryStarted({ slug, reviewId, comment }, { dispatch, queryFulfilled, getState }) {
        const userInfo = getState().auth.userInfo;
        const tempId = `temp-${Date.now()}`;
        const newReply = { 
            _id: tempId,
            name: userInfo.name, 
            comment, 
            createdAt: new Date().toISOString(),
            isAdmin: true
        };
        const patchResults = [];
        const queries = accessoriesApiSlice.util.selectCachedArgsForQuery(getState(), 'getAccessoryReviews') || [];
        
        // 1. Optimistic: add temp reply instantly
        queries.forEach((arg) => {
            if (arg.slug === slug) {
                patchResults.push(
                    dispatch(
                        accessoriesApiSlice.util.updateQueryData('getAccessoryReviews', arg, (draft) => {
                            const review = draft.reviews.find(r => r._id === reviewId);
                            if (review) review.replies = [...(review.replies || []), newReply];
                        })
                    )
                );
            }
        });

        try { 
            const { data: realReply } = await queryFulfilled;
            // 2. Replace temp with real reply from backend
            patchResults.forEach(patch => patch.undo());
            patchResults.length = 0;
            queries.forEach((arg) => {
                if (arg.slug === slug) {
                    patchResults.push(
                        dispatch(
                            accessoriesApiSlice.util.updateQueryData('getAccessoryReviews', arg, (draft) => {
                                const review = draft.reviews.find(r => r._id === reviewId);
                                if (review) {
                                    review.replies = review.replies.filter(r => r._id !== tempId);
                                    review.replies.push(realReply);
                                }
                            })
                        )
                    );
                }
            });
        } 
        catch { patchResults.forEach(patch => patch.undo()); }
    },
    invalidatesTags: (result, error, { slug }) => [
        { type: 'Accessory', id: slug } // REMOVED AccessoryReviews
    ],
}),

    // GET /api/accessories/slug/:slug/reviews/:reviewId/replies - Get all replies
    getReplies: builder.query({
      query: ({ slug, reviewId }) => ({ // CHANGED
        url: `/accessories/slug/${slug}/reviews/${reviewId}/replies`, // CHANGED
        method: 'GET'
      }),
      providesTags: (result, error, { reviewId }) => [
        { type: 'Replies', id: reviewId }
      ]
    }),

    // GET /api/accessories/slug/:slug/reviews/:reviewId/reply/:replyId - Get single reply
    getReply: builder.query({
      query: ({ slug, reviewId, replyId }) => ({ // CHANGED
        url: `/accessories/slug/${slug}/reviews/${reviewId}/reply/${replyId}`, // CHANGED
        method: 'GET'
      })
    }),

     
   // PUT /api/accessories/slug/:slug/reviews/:reviewId/reply/:replyId - Update reply
updateReply: builder.mutation({
    query: ({ slug, reviewId, replyId, comment }) => ({
        url: `/accessories/slug/${slug}/reviews/${reviewId}/reply/${replyId}`,
        method: 'PUT',
        body: { comment }
    }),
    async onQueryStarted({ slug, reviewId, replyId, comment }, { dispatch, queryFulfilled, getState }) {
        const patchResults = [];
        const queries = accessoriesApiSlice.util.selectCachedArgsForQuery(getState(), 'getAccessoryReviews') || [];
        
        queries.forEach((arg) => {
            if (arg.slug === slug) {
                patchResults.push(
                    dispatch(
                        accessoriesApiSlice.util.updateQueryData('getAccessoryReviews', arg, (draft) => {
                            const review = draft.reviews.find(r => r._id === reviewId);
                            const reply = review?.replies?.find(r => r._id === replyId);
                            if (reply) reply.comment = comment; // instant update
                        })
                    )
                );
            }
        });
        try { await queryFulfilled; } 
        catch { patchResults.forEach(patch => patch.undo()); }
    },
    invalidatesTags: (result, error, { slug }) => [
        { type: 'Accessory', id: slug } // REMOVED AccessoryReviews and Replies
    ],
}),
   
   // DELETE /api/accessories/slug/:slug/reviews/:reviewId/reply/:replyId - Delete reply
deleteReply: builder.mutation({
    query: ({ slug, reviewId, replyId }) => ({
        url: `/accessories/slug/${slug}/reviews/${reviewId}/reply/${replyId}`,
        method: 'DELETE'
    }),
    async onQueryStarted({ slug, reviewId, replyId }, { dispatch, queryFulfilled, getState }) {
        const patchResults = [];
        const queries = accessoriesApiSlice.util.selectCachedArgsForQuery(getState(), 'getAccessoryReviews') || [];
        
        queries.forEach((arg) => {
            if (arg.slug === slug) {
                patchResults.push(
                    dispatch(
                        accessoriesApiSlice.util.updateQueryData('getAccessoryReviews', arg, (draft) => {
                            const review = draft.reviews.find(r => r._id === reviewId);
                            if (review) review.replies = review.replies.filter(r => r._id !== replyId); // instant delete
                        })
                    )
                );
            }
        });
        try { await queryFulfilled; } 
        catch { patchResults.forEach(patch => patch.undo()); }
    },
    invalidatesTags: (result, error, { slug }) => [
        { type: 'Accessory', id: slug } // REMOVED AccessoryReviews and Replies
    ],
}),

getFeaturedAccessory: builder.query({
  query: () => '/accessories/featured',
  keepUnusedDataFor: 300, // cache 5 min
  providesTags: ['Accessory'],
}),

getAccessoryReviewImages: builder.query({
  query: (slug) => `/accessories/${slug}/reviews/images`,
  keepUnusedDataFor: 60, // cache for 1 min
}),

 

 

  }),
});

// Export hooks
export const {
  useGetAccessoriesQuery,
  useGetAccessorySearchSuggestionsQuery,
  useGetAccessoryDetailsQuery,
  useGetAccessoryBySlugQuery,
  useGetFeaturedAccessoryQuery,
  useCreateAccessoryMutation,
  useUpdateAccessoryMutation,
  useDeleteAccessoryMutation,
  useUploadAccessoryImageMutation,
  useCreateAccessoryReviewMutation,
  useUpdateAccessoryReviewMutation,
  useGetAccessoryReviewsQuery,
  useDeleteAccessoryReviewMutation,
  useVoteReviewMutation,
  useUploadAccessoryReviewImageMutation,
  useReplyToReviewMutation,
  useGetRepliesQuery,
  useGetReplyQuery,
  useUpdateReplyMutation,
  useDeleteReplyMutation,
  useGetAccessoryReviewImagesQuery,  
} = accessoriesApiSlice;