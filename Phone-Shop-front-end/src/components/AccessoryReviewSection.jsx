import { useState, useMemo, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FaStar, FaThumbsUp, FaThumbsDown, FaTrash, FaUpload, FaX, FaPen, FaCheck, FaGripVertical } from 'react-icons/fa6'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import {
  useCreateAccessoryReviewMutation,
  useGetAccessoryReviewsQuery,
  useDeleteAccessoryReviewMutation,
  useUpdateAccessoryReviewMutation,
  useVoteReviewMutation,
  useUploadAccessoryReviewImageMutation, // V33.80 KEY
  useReplyToReviewMutation,
  useGetRepliesQuery,
  useUpdateReplyMutation,
  useDeleteReplyMutation,
} from '../slices/accessoriesApiSlice'

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const mins = Math.floor(seconds / 60)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

const AccessoryReviewSection = ({ accessory }) => {

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const selectedModel = queryParams.get('model') || ''
  const selectedVariant = queryParams.get('variant') || ''


  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')


  const [reviewImageFiles, setReviewImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const fileInputRef = useRef(null)

  // EDIT MODAL STATE
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editReviewId, setEditReviewId] = useState(null)
  const [editRating, setEditRating] = useState(0)
  const [editTitle, setEditTitle] = useState('')
  const [editComment, setEditComment] = useState('')
  const [editImages, setEditImages] = useState([])
  const [editDragActive, setEditDragActive] = useState(false)
  const editFileInputRef = useRef(null)

  //filter review states
  //   const [selectedRating, setSelectedRating] = useState('')
  // const [keyword, setKeyword] = useState('')
  // const [sort, setSort] = useState('newest')

  const { userInfo } = useSelector((state) => state.auth)

  const { data: reviewData, isLoading } = useGetAccessoryReviewsQuery({
    slug: accessory.slug,
    page: 1,
    limit: 10, // only show 3 on main page
    sort: 'newest',
    model: '',
    variant: '',
    rating: '',
    keyword: ''
  })
  const [createReview, { isLoading: loadingReview }] = useCreateAccessoryReviewMutation()
  const [updateReview, { isLoading: loadingUpdate }] = useUpdateAccessoryReviewMutation()
  const [uploadImages] = useUploadAccessoryReviewImageMutation()
  const [deleteReview, { isLoading: loadingDelete }] = useDeleteAccessoryReviewMutation()
  const [voteReview, { isLoading: voting }] = useVoteReviewMutation()

  const [replyText, setReplyText] = useState({}) // {reviewId: 'text'}
  const [activeReplyBox, setActiveReplyBox] = useState(null) // reviewId
  const [editingReplyId, setEditingReplyId] = useState(null)
  const [editReplyText, setEditReplyText] = useState('')

  const [replyToReview, { isLoading: replying }] = useReplyToReviewMutation()
  const [updateReply, { isLoading: updatingReply }] = useUpdateReplyMutation()
  const [deleteReply, { isLoading: deletingReply }] = useDeleteReplyMutation()

  const reviews = useMemo(() => {
    const all = reviewData?.reviews || []

    // 1. IF LOGGED IN: User review first, then sort rest by most helpful
    if (userInfo) {
      const userRev = all.find(r => r.user?.toString() === userInfo._id?.toString())
      const others = all.filter(r => r.user?.toString() !== userInfo._id?.toString())

      // sort others by most helpful
      others.sort((a, b) => (b.helpful?.length || 0) - (a.helpful?.length || 0))

      const sorted = userRev ? [userRev, ...others] : others
      return sorted.slice(0, 3) // only 3 on main page
    }

    // 2. IF NOT LOGGED IN: Sort all by most helpful
    const sorted = [...all].sort((a, b) => (b.helpful?.length || 0) - (a.helpful?.length || 0))
    return sorted.slice(0, 3) // only 3 on main page
  }, [reviewData, userInfo])

  const userReview = reviews.find(r => r.user?.toString() === userInfo?._id?.toString())

  //filter for reviews summary
  const ratingBreakdown = useMemo(() => {
    const breakdown = reviewData?.ratingBreakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    const total = reviewData?.totalReviews || 0
    return [5, 4, 3, 2, 1].map(star => ({
      star,
      count: breakdown[star],
      percent: total > 0 ? (breakdown[star] / total) * 100 : 0
    }))
  }, [reviewData])

  // V33.80 KEY: DRAG DROP + PREVIEW HANDLER
 const handleFiles = (files, isEdit = false) => {
  const newFiles = Array.from(files)
  const currentCount = isEdit? editImages.length : imagePreviews.length

  if (currentCount + newFiles.length > 3) {
    return toast.error(`Max 3 images allowed. You can only add ${3 - currentCount} more`)
  }

  if (isEdit) {
    const newImageObjs = newFiles.map(file => ({
      id: `new-${Date.now()}-${Math.random()}`, // unique id
      url: URL.createObjectURL(file),
      file: file,
      isNew: true
    }))
    setEditImages(prev => [...prev,...newImageObjs])
  } else {
    setReviewImageFiles(prev => [...prev,...newFiles])
    setImagePreviews(prev => [...prev,...newFiles.map(file => URL.createObjectURL(file))])
  }
}

 const removeImage = (id, isEdit = false) => {
  if (isEdit) {
    const imgToRemove = editImages.find(i => i.id === id)
    if(imgToRemove?.url && imgToRemove.url.startsWith('blob:')) URL.revokeObjectURL(imgToRemove.url) // FIXED
    setEditImages(prev => prev.filter((i) => i.id!== id)) // FIXED
  } else {
    URL.revokeObjectURL(imagePreviews[index])
    setImagePreviews(imagePreviews.filter((_, i) => i!== index))
    setReviewImageFiles(reviewImageFiles.filter((_, i) => i!== index))
  }
}
  //image reOrder - sorting - drag n drop
  const onDragEnd = (result, isEdit = false) => {
    if (!result.destination) return

   if (isEdit) {
  const items = Array.from(editImages)
  const [reorderedItem] = items.splice(result.source.index, 1)
  items.splice(result.destination.index, 0, reorderedItem)
  setEditImages(items) // <-- ONLY 1 SETTER NOW
} else {
      const items = Array.from(imagePreviews)
      const files = Array.from(reviewImageFiles)
      const [reorderedItem] = items.splice(result.source.index, 1)
      const [reorderedFile] = files.splice(result.source.index, 1)
      items.splice(result.destination.index, 0, reorderedItem)
      files.splice(result.destination.index, 0, reorderedFile)
      setImagePreviews(items)
      setReviewImageFiles(files)
    }
  }

  // DRAG EVENTS
  const makeDragHandlers = (setDrag) => ({
    handleDrag: (e) => { e.preventDefault(); e.stopPropagation(); },
    handleDragIn: (e) => { e.preventDefault(); e.stopPropagation(); setDrag(true); },
    handleDragOut: (e) => { e.preventDefault(); e.stopPropagation(); setDrag(false); },
    handleDrop: (e, isEdit = false) => {
      e.preventDefault(); e.stopPropagation(); setDrag(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFiles(e.dataTransfer.files, isEdit)
    }
  })

  const dragHandlers = makeDragHandlers(setDragActive)
  const editDragHandlers = makeDragHandlers(setEditDragActive)

  // V33.80 KEY: FIXED - UPLOAD IMAGES RETURNS [] DIRECTLY
  const uploadImagesAndGetUrls = async (files) => {
    if (files.length === 0) return []
    const formData = new FormData()
    files.forEach(file => formData.append('images', file))

    const uploaded = await uploadImages(formData).unwrap() // returns []
    return uploaded
  }

  const submitHandler = async (e) => {
    e.preventDefault()
    if (isSubmitting) return // prevent double submit

    setIsSubmitting(true)

    if (rating === 0) return toast.error('Please select rating')

    try {
      const uploadedImages = await uploadImagesAndGetUrls(reviewImageFiles)
      console.log('SENDING TO BACKEND:', uploadedImages) // V33.80 DEBUG

      await createReview({
        slug: accessory.slug,
        review: { rating, title, comment, model: selectedModel, variant: selectedVariant, images: uploadedImages }
      }).unwrap()
      toast.success('Review submitted')
      setShowReviewForm(false)
      setRating(0); setTitle(''); setComment('');
      setReviewImageFiles([]); setImagePreviews([])

    } catch (err) {
      toast.error(err?.data?.message || err.error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // EDIT LOGIC
  const handleEditClick = (review) => {
  setEditReviewId(review._id)
  setEditRating(review.rating)
  setEditTitle(review.title)
  setEditComment(review.comment)
  
  const existing = review.images?.map((img, i) => ({
    id: `existing-${img.imagePublicId || img.url}-${i}`, // use publicId as id
    url: img.url,
    file: null,
    isNew: false
  })) || []
  
  setEditImages(existing) // <-- USE THIS NOW
  setIsEditModalOpen(true)
}

 const cancelEdit = () => {
  setIsEditModalOpen(false)
  setEditReviewId(null)
  editImages.forEach(img => { if (!img.url.startsWith('http')) URL.revokeObjectURL(img.url) }) // cleanup
  setEditImages([]) // <-- RESET THIS
}

  const submitEditHandler = async (e) => {
  e.preventDefault()
   if (isUpdating) return // prevent double click
  
  setIsUpdating(true) // START LOADING IMMEDIATELY
   try {
    const newFiles = editImages.filter(i => i.isNew).map(i => i.file)
    const newUploadedImages = newFiles.length > 0? await uploadImagesAndGetUrls(newFiles) : []

    const existingImages = editImages
    .filter(i =>!i.isNew)
    .map(i => {
        const originalImg = reviews.find(r => r._id === editReviewId)?.images?.find(img => img.url === i.url)
        return { url: i.url, imagePublicId: originalImg?.imagePublicId || '' }
      })
      
    const allImages = [...existingImages,...newUploadedImages]

    await updateReview({
      slug: accessory.slug,
      reviewId: editReviewId,
      review: { rating: editRating, title: editTitle, comment: editComment, images: allImages }
    }).unwrap()
    
    toast.success('Review updated')
    cancelEdit()

  } catch (err) {
    toast.error(err?.data?.message || err.error)
  }finally {
    setIsUpdating(false) // STOP LOADING
  }
}

  const deleteHandler = async (reviewId) => {
    if (window.confirm('Delete this review?')) {
      await deleteReview({ slug: accessory.slug, reviewId }).unwrap()

    }
  }

  const helpfulHandler = async (reviewId, type) => {
    if (!userInfo) return toast.error('Please login to vote')

    const review = reviews.find(r => r._id === reviewId)
    if (!review) return

    const userIdStr = userInfo._id
    const alreadyVotedHelpful = review.helpful?.some(id => id.toString() === userIdStr)
    const alreadyVotedNotHelpful = review.notHelpful?.some(id => id.toString() === userIdStr)

    let message = ''

    try {
      await voteReview({
        slug: accessory.slug,
        reviewId,
        type // 'helpful' or 'notHelpful'
      }).unwrap()

      // SET TOAST BASED ON ACTION
      if (type === 'helpful') {
        if (alreadyVotedHelpful) {
          message = 'Removed helpful vote 👍'
        } else if (alreadyVotedNotHelpful) {
          message = 'Changed to helpful 👍'
        } else {
          message = 'Thanks for marking this helpful! 👍'
        }
      }
      else { // notHelpful
        if (alreadyVotedNotHelpful) {
          message = 'Removed not helpful vote 👎'
        } else if (alreadyVotedHelpful) {
          message = 'Changed to not helpful 👎'
        } else {
          message = 'Thanks for your feedback! 👎'
        }
      }

      toast.success(message)

    } catch (err) {
      toast.error(err?.data?.message || err.error)
    }
  }

  const submitReply = async (reviewId) => {
    const comment = replyText[reviewId]
    if (!comment?.trim()) return toast.error('Reply cannot be empty')
    try {
      await replyToReview({ slug: accessory.slug, reviewId, comment }).unwrap()
      toast.success('Reply posted')
      setReplyText({ ...replyText, [reviewId]: '' })
      setActiveReplyBox(null) // CLOSE THE BOX AFTER POST

    } catch (err) {
      toast.error(err?.data?.message || err.error)
    }
  }

  const submitEditReply = async (reviewId, replyId) => {
    if (!editReplyText?.trim()) return toast.error('Reply cannot be empty')
    try {
      await updateReply({ slug: accessory.slug, reviewId, replyId, comment: editReplyText }).unwrap()
      toast.success('Reply updated')
      setEditingReplyId(null)
      setEditReplyText('')

    } catch (err) {
      toast.error(err?.data?.message || err.error)
    }
  }

  const deleteReplyHandler = async (reviewId, replyId) => {
    if (window.confirm('Delete this reply?')) {
      try {
        await deleteReply({ slug: accessory.slug, reviewId, replyId }).unwrap()
        toast.success('Reply deleted')

      } catch (err) {
        toast.error(err?.data?.message || err.error)
      }
    }
  }

  {/* image selector to show in create form review*/ }
  const selectedModelObj = accessory.models?.find(m => m.modelName === selectedModel)
  const selectedVariantObj = selectedModelObj?.variants?.find(v => v.name === selectedVariant)
  const reviewHeaderImage = selectedVariantObj?.images?.[0]?.url || accessory.models?.[0]?.variants?.[0]?.images?.[0]?.url || '/placeholder.png'

  // V33.84: LOCK BODY SCROLL WHEN EDIT MODAL IS OPEN
  useEffect(() => {
    if (isEditModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isEditModalOpen])

  return (
    <div id="reviews" className="mt-10">

      {/* 1. SUMMARY */}
      <div className="bg-white border rounded-xl p-6 mb-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-5">Customer Reviews Summary</h3>
        <div className="flex flex-col md:flex-row gap-10">
          <div className="md:w-56 text-center">
            <div className="text-5xl font-bold">
              {(reviewData?.rating || accessory.rating || 0).toFixed(1)}
            </div>
            <div className="flex justify-center text-yellow-400 text-3xl mt-2">
              {[1, 2, 3, 4, 5].map((i) =>
                <span key={i}>
                  {(reviewData?.rating || accessory.rating || 0) >= i ? "★" : "☆"}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-3">
              {reviewData?.totalReviews || accessory.numReviews || 0} customer reviews
            </p>
          </div>
          <div className="flex-1">
            {ratingBreakdown.map(({ star, count, percent }) => (
              <div key={star} className="flex items-center gap-3 mb-2">
                <span className="w-8 text-sm">{star}★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full">
                  <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${percent}%` }}></div>
                </div>
                <span className="w-16 text-right text-sm">{count} ({Math.round(percent)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. REVIEW LIST */}
      <div className='mb-8'>
        {isLoading ? <p>Loading...</p> : reviews.slice(0, 3).map((review) => (
          <div key={review._id} className='bg-gray-50 p-4 rounded-lg mb-4'>
            <div className='flex justify-between'>
              <div>
                <strong>{review.name}</strong>
                <div className="flex gap-2 text-xs text-gray-500">
                  {review.verifiedPurchase && <span className="text-green-600 flex items-center gap-1"><FaCheck /> Verified</span>}
                  {review.model && <span>{review.model} {review.variant && `/ ${review.variant}`}</span>}
                  <span>| {timeAgo(review.createdAt)}</span>
                </div>
              </div>
              {userInfo?._id?.toString() === review.user?.toString() && (
                <div className='flex gap-2'>
                  <button onClick={() => handleEditClick(review)} className='text-blue-600 text-xs flex items-center gap-1'><FaPen size={10} />Edit</button>
                  <button onClick={() => deleteHandler(review._id)} disabled={loadingDelete} className='text-red-600 text-xs flex items-center gap-1'><FaTrash size={10} />Delete</button>
                </div>
              )}
            </div>
            <div className="flex my-2">{[...Array(5)].map((_, i) => <FaStar key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'} />)}</div>
            <h4 className="font-semibold">{review.title}</h4>
            <p className='mt-1 text-gray-700'>{review.comment}</p>
            {review.images?.length > 0 && <div className='flex gap-2 mt-3 flex-wrap'>{review.images.map((img, idx) => <img key={idx} src={img.url} alt='review' className="w-20 h-20 object-contain border rounded bg-white" />)}</div>}

            {userInfo && (
              <div className='flex gap-4 mt-3 text-xs'>
                <button
                  onClick={() => helpfulHandler(review._id, 'helpful')}
                  disabled={voting}
                  className={`flex items-center gap-1 transition ${review.helpful?.some(id => id.toString() === userInfo?._id?.toString())
                    ? 'text-green-600 font-semibold'
                    : 'text-gray-600 hover:text-green-600'
                    }`}
                >
                  <FaThumbsUp /> Helpful ({review.helpful?.length || 0})
                </button>

                <button
                  onClick={() => helpfulHandler(review._id, 'notHelpful')}
                  disabled={voting}
                  className={`flex items-center gap-1 transition ${review.notHelpful?.some(id => id.toString() === userInfo?._id?.toString())
                    ? 'text-red-600 font-semibold'
                    : 'text-gray-600 hover:text-red-600'
                    }`}
                >
                  <FaThumbsDown /> Not Helpful ({review.notHelpful?.length || 0})
                </button>
              </div>
            )}
            {/* === REPLIES START === */}
            {/* SHOW ALL REPLIES */}
            {review.replies?.length > 0 && (
              <div className='ml-6 mt-4 space-y-3 border-l-4 border-blue-500 pl-4'>
                {review.replies.map((reply) => (
                  <div key={reply._id} className='bg-blue-50 p-3 rounded-lg'>
                    <div className='flex justify-between items-start'>
                      <div className='flex items-center gap-2'>
                        <span className='bg-blue-600 text-white text-xs px-2 py-0.5 rounded font-semibold'>Admin</span>
                        <strong className='text-sm'>{reply.name}</strong>
                        <span className='text-xs text-gray-500'>{timeAgo(reply.createdAt)}</span>
                      </div>
                      {userInfo?.isAdmin && (
                        <div className='flex gap-2'>
                          <button
                            onClick={() => { setEditingReplyId(reply._id); setEditReplyText(reply.comment) }}
                            className='text-blue-600 hover:text-blue-800'
                          >
                            <FaPen size={12} />
                          </button>
                          <button
                            onClick={() => deleteReplyHandler(review._id, reply._id)}
                            disabled={deletingReply}
                            className='text-red-600 hover:text-red-800'
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      )}
                    </div>

                    {editingReplyId === reply._id ? (
                      <div className='mt-2'>
                        <textarea
                          value={editReplyText}
                          onChange={(e) => setEditReplyText(e.target.value)}
                          rows="2"
                          className="w-full border p-2 rounded text-sm outline-none focus:border-blue-500"
                        />
                        <div className='flex gap-2 mt-2'>
                          <button
                            onClick={() => submitEditReply(review._id, reply._id)}
                            disabled={updatingReply}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                          >
                            {updatingReply ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => setEditingReplyId(null)}
                            className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className='text-sm mt-1 text-gray-800'>{reply.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ADMIN REPLY BUTTON + BOX */}
            {userInfo?.isAdmin && (
              <div className='ml-6 mt-3'>
                {activeReplyBox === review._id ? (
                  <>
                    <textarea
                      value={replyText[review._id] || ''}
                      onChange={(e) => setReplyText({ ...replyText, [review._id]: e.target.value })}
                      placeholder="Reply as Admin..."
                      rows="2"
                      className="w-full border p-2 rounded text-sm focus:border-blue-500 outline-none"
                      autoFocus
                    />
                    <div className='flex gap-2 mt-2'>
                      <button
                        onClick={() => submitReply(review._id)}
                        disabled={replying}
                        className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        {replying ? 'Posting...' : 'Post Reply'}
                      </button>
                      <button
                        onClick={() => setActiveReplyBox(null)}
                        className="bg-gray-300 text-gray-700 px-4 py-1.5 rounded text-sm hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => setActiveReplyBox(review._id)}
                    className="text-blue-600 text-sm font-semibold hover:underline"
                  >
                    Reply
                  </button>
                )}
              </div>
            )}
            {/* === REPLIES END === */}
          </div>
        ))}
        {reviewData?.totalReviews > 3 && <Link to={`/accessories/${accessory.slug}/reviews`} className="border px-6 py-2 rounded hover:bg-gray-50">View All Reviews ({reviewData.totalReviews})</Link>}
      </div>

      {/* 3. WRITE REVIEW BUTTON */}
      {userInfo && !userReview && !showReviewForm && (
        <div className='mt-8 pt-8 border-t'>
          <button onClick={() => setShowReviewForm(true)} className='bg-white px-6 py-2 rounded-lg border hover:bg-gray-50 font-semibold'>Write a customer review</button>
        </div>
      )}

      {/* 3.5 ALREADY REVIEWED MESSAGE */}
      {userInfo && userReview && !showReviewForm && (
        <div className='mt-8 pt-8 border-t'>
          <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className="text-green-700 font-semibold text-sm sm:text-lg flex items-center gap-2">
                  <FaCheck /> You have already reviewed this accessory
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">You can edit or delete your review above</p>
              </div>
              <button
                onClick={() => handleEditClick(userReview)}
                className="bg-blue-600 text-white px-2 sm:px-4 py-1 rounded-lg text-xs sm:text-sm font-semibold hover:bg-blue-700"
              >
                Edit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3.75 SIGN IN MESSAGE for guest */}
      {!userInfo && (
        <div className='mt-8 pt-8 border-t'>
          <Link to='/login' className='bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700'>
            Sign in to write a review
          </Link>
        </div>
      )}

      {/* 4. CREATE FORM */}
      {userInfo && !userReview && showReviewForm && (
        <div className='max-w-2xl bg-white p-6 rounded-lg border mt-8'>
          <div className='flex justify-between items-center mb-4 pb-3 border-b'>
            <h2 className='text-xl font-bold'>Create Review</h2>
            <button type='button' onClick={() => setShowReviewForm(false)} className='text-gray-500 hover:text-gray-700 text-2xl'>×</button>
          </div>
          <form onSubmit={submitHandler}>

            <div className='mb-6'>
              <label className='block font-bold mb-2'>Overall rating *</label>
              <div className='flex gap-1'>
                {[1, 2, 3, 4, 5].map(num =>
                  <FaStar
                    key={num}
                    onClick={() => setRating(num)}
                    onMouseEnter={() => setHoverRating(num)}
                    onMouseLeave={() => setHoverRating(0)}
                    className={`w-8 h-8 cursor-pointer transition ${num <= (hoverRating || rating) ? 'text-amber-500' : 'text-gray-300 hover:text-amber-300'}`}
                  />
                )}
              </div>
              <p className='text-xs text-gray-500 mt-1'>
                {hoverRating || rating ? `${hoverRating || rating} Star${hoverRating || rating > 1 ? 's' : ''}` : 'Select a rating'}
              </p>
            </div>

            {/* NEW PRODUCT INFO BOX */}
            {(selectedModel || selectedVariant) && (
              <div className='flex items-center gap-3 bg-gray-50 border rounded-lg p-3 mb-5'>
                <img src={reviewHeaderImage} alt={accessory.name} className='w-12 h-12 object-contain border rounded bg-white' />
                <div>
                  <p className='text-xs text-gray-500'>You are reviewing:</p>
                  <p className='font-semibold text-sm'>
                    {accessory.name} {selectedModel && `- ${selectedModel}`} {selectedVariant && `- ${selectedVariant}`}
                  </p>
                </div>
              </div>
            )}

            <div className='mb-4'>
              <label className='block font-bold mb-2'>Review Title</label>
              <input type="text" placeholder="Summarize your review" value={title} onChange={e => setTitle(e.target.value)} className="w-full border p-3 rounded-lg focus:border-black outline-none" />
            </div>

            <div className='mb-4'>
              <label className='block font-bold mb-2'>Review Comment *</label>
              <textarea placeholder="What did you like or dislike?" value={comment} onChange={e => setComment(e.target.value)} rows="4" className="w-full border p-3 rounded-lg focus:border-black outline-none" required />
            </div>

            <div className='mb-6'>
              <label className='block font-bold mb-2'>Add photos ({imagePreviews.length}/3)</label>
              <div
                onDragEnter={dragHandlers.handleDragIn}
                onDragLeave={dragHandlers.handleDragOut}
                onDragOver={dragHandlers.handleDrag}
                onDrop={(e) => dragHandlers.handleDrop(e, false)}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} ${imagePreviews.length >= 3 ? 'opacity-50 pointer-events-none' : 'hover:border-gray-400'}`}
              >
                {imagePreviews.length >= 3
                  ? <p className="text-red-500 text-sm font-semibold">Max 3 images. Delete one to add more</p>
                  : <>
                    <FaUpload className="mx-auto text-3xl text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Drag & drop images here, or <button type="button" onClick={() => fileInputRef.current.click()} className="text-blue-600 underline">Browse</button></p>
                  </>
                }
                <input
                  ref={fileInputRef}
                  type='file'
                  multiple
                  accept='image/*'
                  onChange={(e) => handleFiles(e.target.files, false)}
                  className='hidden'
                  disabled={imagePreviews.length >= 3}
                />
              </div>
              {imagePreviews.length > 0 && (
                <DragDropContext onDragEnd={(result) => onDragEnd(result, false)}>
                  <Droppable droppableId="review-images" direction="horizontal">
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className='flex gap-3 mt-4 flex-wrap'
                      >
                        {imagePreviews.map((url, idx) => (
                          <Draggable key={url} draggableId={url} index={idx}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`relative group ${snapshot.isDragging ? 'opacity-50' : ''}`}
                              >
                                <img src={url} className='w-20 h-20 object-contain rounded-lg border bg-white p-1' />
                                <div
                                  {...provided.dragHandleProps}
                                  className="absolute -top-1 -left-1 bg-gray-700 text-white rounded-full w-6 h-6 flex items-center justify-center cursor-grab"
                                >
                                  <FaGripVertical size={12} />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeImage(idx, false)}
                                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                >
                                  <FaX size={12} />
                                </button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>

            <button
              type='submit'
              disabled={isSubmitting || loadingReview}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-200
    ${isSubmitting || loadingReview
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black shadow-md hover:shadow-lg'
                }`}
            >
              {isSubmitting || loadingReview ? (
                <div className='flex items-center justify-center gap-2'>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </div>
              ) : 'Submit Review'}
            </button>
          </form>
        </div>
      )}


      {/* 5. EDIT MODAL */}

      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-2 sm:p-4"
          onClick={cancelEdit}
        >
          <div
            className="bg-white w-full sm:max-w-lg rounded-2xl shadow-2xl relative flex flex-col h-[95vh] sm:h-auto sm:max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER - FIXED */}
            <div className="flex justify-between items-center p-4 sm:p-5 border-b flex-shrink-0">
              <h3 className='text-lg sm:text-2xl font-bold'>Edit Your Review</h3>
              <button
                type="button"
                onClick={cancelEdit}
                className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition"
              >
                <FaX size={20} />
              </button>
            </div>

            {/* BODY - ONLY THIS SCROLLS */}
            <div className='overflow-y-auto p-4 sm:p-5 flex-1'>
              <form onSubmit={submitEditHandler} className='space-y-4'>
                <div>
                  <label className='block text-sm font-semibold mb-2'>Rating *</label>
                  <div className='flex gap-1'>
                    {[1, 2, 3, 4, 5].map(num =>
                      <FaStar
                        key={num}
                        onClick={() => setEditRating(num)}
                        className={`w-9 h-9 sm:w-8 sm:h-8 cursor-pointer transition ${num <= editRating ? 'text-amber-500' : 'text-gray-300 hover:text-amber-300'}`}
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-semibold mb-2'>Review Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    placeholder="Summarize your review"
                    className="w-full border p-3 rounded-lg focus:border-black outline-none text-base"
                  />
                </div>

                <div>
                  <label className='block text-sm font-semibold mb-2'>Review Comment *</label>
                  <textarea
                    value={editComment}
                    onChange={e => setEditComment(e.target.value)}
                    rows="4"
                    placeholder="What did you like or dislike?"
                    className="w-full border p-3 rounded-lg focus:border-black outline-none text-base"
                    required
                  />
                </div>

                {/* IMAGE UPLOAD */}
                <div>
                  <label className='block text-sm font-semibold mb-2'>Add photos ({editImages.length}/3)</label>
                  <div
                    onDragEnter={editDragHandlers.handleDragIn}
                    onDragLeave={editDragHandlers.handleDragOut}
                    onDragOver={editDragHandlers.handleDrag}
                    onDrop={(e) => editDragHandlers.handleDrop(e, true)}
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition ${editDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} ${editImages.length >= 3 ? 'opacity-50 pointer-events-none' : 'hover:border-gray-400'}`}
                  >
                    {editImages.length >= 3
                      ? <p className="text-red-500 text-sm font-semibold">Max 3 images. Delete one to add more</p>
                      : <button type="button" onClick={() => editFileInputRef.current.click()} className="text-blue-600 text-sm font-medium underline">Add More Images ({editImages.length}/3)</button>
                    }
                    <input
                      ref={editFileInputRef}
                      type='file'
                      multiple
                      accept='image/*'
                      onChange={(e) => handleFiles(e.target.files, true)}
                      className='hidden'
                      disabled={editImages.length >= 3}
                    />
                  </div>

                {/* IMAGE PREVIEW GRID - WRAP ON MOBILE */}
{editImages.length > 0 && (
  <DragDropContext onDragEnd={(result) => onDragEnd(result, true)}>
    <Droppable droppableId="edit-review-images" direction="horizontal">
      {(provided) => (
        <div ref={provided.innerRef} {...provided.droppableProps} className='flex gap-3 mt-3 flex-wrap'>
          {editImages.map((img) => (
            <Draggable 
              key={img.id} 
              draggableId={img.id} 
              index={editImages.findIndex(i => i.id === img.id)}
              isDragDisabled={img.isNew} // NEW can't drag
            >
              {(provided, snapshot) => (
                <div ref={provided.innerRef} {...provided.draggableProps} className={`relative group ${snapshot.isDragging? 'opacity-50 scale-105' : ''}`}>
                  <img src={img.url} className='w-20 h-20 object-contain rounded-lg border bg-white p-1' />
                  
                  {!img.isNew && (
                    <div {...provided.dragHandleProps} className="absolute -top-2 -left-2 bg-gray-700 text-white rounded-full w-6 h-6 flex items-center justify-center cursor-grab hover:bg-gray-900">
                      <FaGripVertical size={12} />
                    </div>
                  )}

                  {img.isNew && (
                    <span className="absolute -top-2 -left-2 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow">
                      New
                    </span>
                  )}

                  <button type="button" onClick={() => removeImage(img.id, true)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition">
                    <FaX size={12} />
                  </button>
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </DragDropContext>
)}
                </div>
              </form>
            </div>

           {/* FOOTER - FIXED */}
<div className='flex gap-3 p-4 sm:p-5 border-t bg-white flex-shrink-0'>
  <button
    type='button'
    onClick={submitEditHandler}
    disabled={isUpdating || loadingUpdate} // USE BOTH
    className={`flex-1 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 flex items-center justify-center gap-2
      ${isUpdating || loadingUpdate 
        ? 'bg-gray-400 text-white cursor-not-allowed' 
        : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white'
      }`}
  >
    {isUpdating || loadingUpdate ? (
      <>
        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Updating...
      </>
    ) : 'Update Review'}
  </button>

  <button
    type='button'
    onClick={cancelEdit}
    disabled={isUpdating || loadingUpdate}
    className='px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200'
  >
    Cancel
  </button>
</div>
          </div>
        </div>
      )}
    </div>
  )
}
export default AccessoryReviewSection