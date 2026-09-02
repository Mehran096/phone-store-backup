import { useState, useEffect, useMemo, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import RatingStars from '../components/RatingStars';
//import ReviewsModal from '../components/ReviewsModal';
import OfflineMessage from '../components/OfflineMessage'
import StickyPurchaseBar from "../components/StickyPurchaseBar";

import { useSelector, useDispatch } from 'react-redux'

import {
  useGetProductDetailsQuery,
  useGetProductBySlugQuery,
  useGetCompareProductsQuery,
  useCreateProductReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useMarkReviewHelpfulMutation,
  useMarkReviewNotHelpfulMutation,
  useAddAdminReplyMutation,
  useEditAdminReplyMutation,
  useDeleteAdminReplyMutation,
  useUploadReviewImageMutation,
  useDeleteCloudinaryImageMutation,
  useGetRecommendedProductsQuery,
  useGetFrequentlyBoughtTogetherQuery
} from '../slices/productsApiSlice'
import { addToCart } from '../slices/cartSlice'
import Loader from '../components/Loader'
import Message from '../components/Message'
import Rating from '../components/Rating'
import {
  FaEdit,
  FaCheck,
  FaTrash,
  FaShoppingCart,
  FaStar,
  FaChevronDown,
  FaChevronUp,
  FaThumbsUp,
  FaThumbsDown,
  FaHeart,
  FaMemory, FaHdd, FaMobileAlt, FaCamera, FaBatteryFull, FaMicrochip, FaBalanceScale, FaSearch,
} from 'react-icons/fa'

import { toast } from 'react-toastify'
import Product360 from '../components/Product360';
import WishlistButton from '../components/WishlistButton'
import CompareProducts from '../components/CompareProducts';
import CompareSearch from '../components/CompareSearch';
import { addToRecentlyViewed } from '../utils/recentlyViewed';
import RecommendedProducts from '../components/RecommendedProducts';
import FrequentlyBoughtTogether from '../components/FrequentlyBoughtTogether'




const ProductScreen = ({ isOnline, isMobileMenuOpen }) => {
  const { slug } = useParams()
  const productId = slug
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams();

  // const dealStorage = searchParams.get('storage');
  // const dealColor = searchParams.get('color');

  const { userInfo } = useSelector((state) => state.auth)
  const { data: product, isLoading, error, refetch } = useGetProductBySlugQuery(slug)
  const [createProductReview, { isLoading: loadingProductReview }] = useCreateProductReviewMutation()
  const [deleteProductReview, { isLoading: loadingDeleteReview }] = useDeleteReviewMutation();
  const [addAdminReply, { isLoading: loadingAdminReply }] = useAddAdminReplyMutation();
  const [editAdminReply, { isLoading: loadingUpdateReply }] = useEditAdminReplyMutation();
  const [deleteAdminReply, { isLoading: loadingDeleteReply }] = useDeleteAdminReplyMutation();
  const [markHelpful, { isLoading: loadingHelpfulReview }] = useMarkReviewHelpfulMutation();
  const [markReviewNotHelpful, { isLoading: loadingNotHelpfulReview },] = useMarkReviewNotHelpfulMutation();
  const [uploadReviewImage, { isLoading: loadingUpload }] = useUploadReviewImageMutation();
  const [deleteCloudinaryImage] = useDeleteCloudinaryImageMutation();

  const {
    data,
    isLoading: loadingRecs,
    error: errorRecs
  } = useGetRecommendedProductsQuery(product?._id, {
    skip: !product?._id // don't run until product loads
  })

  

  // const recommendations = data?.recommendations || []
  // const recType = data?.type
  // const recBrand = data?.brand

  // Compare state
  const [compareSlug, setCompareSlug] = useState("");

  //quick state for Modal view
  const [quickViewProduct, setQuickViewProduct] = useState(null)

  //state for specs hide and show
  const [isSpecsOpen, setIsSpecsOpen] = useState(true)

  // Compare query
  const {
    data: compareProducts,
    isLoading: compareLoading,
  } = useGetCompareProductsQuery(
    [product?.slug, compareSlug],
    {
      skip: !product?.slug || !compareSlug,
    }
  );



  //compare page route for comparison/ start
  const handleCompareThisPhone = () => {
    // Navigate with query: /compare?phones=iphone-17-pro-max
    //navigate(`/compare?phones=${product.slug}`);
    navigate(`/compare?phones=${product.slug}`, {
      state: { from: `/product/${product.slug}` }
    });
  };
  //comparison end


  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0); // V9.26 KEY: Default first variant
  const [selectedColorIndex, setSelectedColorIndex] = useState(0); // V9.26 KEY: Default first color



  const selectedVariant = useMemo( // V27.1 KEY
    () => product?.variants?.[selectedVariantIndex],
    [product, selectedVariantIndex]
  );

  const selectedColor = useMemo( // V27.1 KEY
    () => selectedVariant?.colors?.[selectedColorIndex],
    [selectedVariant, selectedColorIndex]
  );
  //console.log(selectedColor?.images)
 
//frequentlyBoughtTogether RTK query
const { 
  data: frequentlyBought,
  isLoading: loadingFBT,
  error: errorFBT
} = useGetFrequentlyBoughtTogetherQuery({
  productId: product?._id,
  model: selectedVariant?.modelName || product?.name, // use selected model, not product name
}, {
  skip:!product?._id
})

  // const [selectedPrice, setSelectedPrice] = useState(0) // ADD THIS
  // const [selectedImage, setSelectedImage] = useState('') // ADD THIS
  const [mainImage, setMainImage] = useState('/images/placeholder-phone.jpg') // Default to placeholder
  const [qty, setQty] = useState(1)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0) // ADD THIS
  //const [headline, setHeadline] = useState('')      // ADD THIS
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [comment, setComment] = useState('')
  const [title, setTitle] = useState('')
  const [sortBy, setSortBy] = useState('helpful');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [isEditingReply, setIsEditingReply] = useState(null);
  const [editReplyText, setEditReplyText] = useState('');
  //const [reviewImages, setReviewImages] = useState([]);
  // V33.58 KEY: V31 Object[] -> V33.57 File[] + Preview[]
  const [reviewImageFiles, setReviewImageFiles] = useState([]); // V33.58 KEY: For upload on Submit
  const [reviewImagePreviews, setReviewImagePreviews] = useState([]); // V33.58 KEY: For UI only
  //const [reviewImageFiles, setReviewImageFiles] = useState([]);
  const [ratingFilter, setRatingFilter] = useState(0);
  //const [showAllReviews, setShowAllReviews] = useState(false);
  //product360
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  //product360 open modal state and used for to hide the stickyPurchase.jsx in mobile screen 
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);
  //for loading and sliderthe main images
  //const [imageLoadingTrigger, setImageLoadingTrigger] = useState(false)
  const [slideDirection, setSlideDirection] = useState('center')


  // Edit states

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editComment, setEditComment] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editRating, setEditRating] = useState(0);
  const [editImages, setEditImages] = useState([]);
  //const [removedImageIds, setRemovedImageIds] = useState([]);

  const [editColor, setEditColor] = useState(null);


  const isMounted = useRef(false);
  
  useEffect(() => {
  if (!product) return;

  // Auto-select from URL - Works for Cart, Wishlist, Deals
  const urlColor = searchParams.get('color');
  const urlStorage = searchParams.get('storage');

  if (urlColor && urlStorage) {
    const variantIndex = product.variants?.findIndex(v => v.storage === urlStorage);
    const colorIndex = variantIndex >= 0 
     ? product.variants[variantIndex]?.colors?.findIndex(c => c.name === urlColor)
      : -1;

    setSelectedVariantIndex(variantIndex >= 0? variantIndex : 0);
    setSelectedColorIndex(colorIndex >= 0? colorIndex : 0);
    isMounted.current = true;
    return; // Exit so it doesn't reset
  }

  // Default if no params in URL
  if (!isMounted.current) {
    setSelectedVariantIndex(0);
    setSelectedColorIndex(0);
  }
  isMounted.current = true;

}, [product, searchParams]);

  //recently viewed useEffect


  const lastSavedId = useRef('');
  const saveTimeout = useRef(null);

  // Recently Viewed
  useEffect(() => {
    // GUARD: WAIT FOR DATA
    if (!product || !product.slug || !selectedVariant || !selectedColor) return;

    clearTimeout(saveTimeout.current);

    const { price: originalPrice = 0, discount, images, name: colorName } = selectedColor;
    const { storage } = selectedVariant;

    const discountValue = discount?.isActive ? discount.value : 0;
    const discountAmount = (originalPrice * discountValue) / 100;
    const finalPrice = Math.max(0, originalPrice - discountAmount);

    const safeColor = (colorName || 'Default').toLowerCase().replace(/\s+/g, '-');
    const safeStorage = (storage || 'Default').toLowerCase().replace(/\s+/g, '-');
    const uniqueId = `${product._id}-${safeStorage}-${safeColor}`;

    saveTimeout.current = setTimeout(() => {
      if (lastSavedId.current === uniqueId) return;
      lastSavedId.current = uniqueId;

      //console.log('SAVING TO RECENT:', uniqueId);
      addToRecentlyViewed({
        _id: uniqueId,
        slug: product.slug,
        name: product.name,
        image: images?.[0]?.url || '/images/placeholder-phone.jpg',
        price: Number(finalPrice.toFixed(2)),
        originalPrice: Number(originalPrice.toFixed(2)),
        bestDiscount: discountValue,
        endDate: discount?.endDate,
        youSave: Number(discountAmount.toFixed(2)),
        isFlat: true,
        color: colorName || 'Default', // ADD THIS AT ROOT
        storage: storage || 'Default', // ADD THIS AT ROOT
        attributes: { color: colorName || 'Default', storage: storage || 'Default' }
      });
    }, 0);

    return () => clearTimeout(saveTimeout.current);
  }, [product, selectedColor, selectedVariant]);

  // const startEdit = (review) => {
  //   setEditingReview(review);
  //   setEditComment(review.comment);
  //   setEditRating(review.rating);
  //   setEditImages(review.images || []);
  //   setEditColor(review.color || null);

  // };

  //review edit modal
  const handleEditClick = (review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setEditTitle(review.title || "");
    setEditImages(review.images || []); // V33.35B KEY
    setEditColor(review.color || null);
    setIsEditModalOpen(true); // V33.93 KEY

  };


  const cancelEdit = () => {
    setEditingReview(null);
    setEditComment('');
    setEditRating(0);
    setEditTitle('');
    setEditImages([]);
    setIsEditModalOpen(false);
    //setEditImageFiles([]);
    //setRemovedImageIds([]);

  };

  const [updateProductReview, { isLoading: loadingUpdateReview }] = useUpdateReviewMutation();

  // useEffect(() => {
  //   if (product?.variants?.length > 0) { // V9.99 KEY:?. added
  //     setSelectedColorIndex(0);
  //   }
  // }, [product, selectedVariantIndex]);

  useEffect(() => {
    if (selectedColor) { // V10.1 KEY: Add {
      setMainImage(selectedColor.images?.[0]?.url || '/images/placeholder-phone.jpg');
    } // V10.1 KEY: Add }
  }, [selectedColor]);



  // review modal open useEffect for background scroll stop
  useEffect(() => {
    if (isEditModalOpen) {
      document.body.style.overflow = 'hidden' // lock scroll
    } else {
      document.body.style.overflow = 'unset' // unlock scroll
    }

    // cleanup when component unmounts
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isEditModalOpen]) // <-- this dependency is perfect


  // }

  const addToCartHandler = (itemData = null) => { 

    const productToAdd = itemData?.product || product
    const variantToAdd = itemData?.variant || selectedVariant
    const colorToAdd = itemData?.color || selectedColor
    const qtyToAdd = Number(itemData?.qty || qty || 1)

    if (variantToAdd?.colors?.length > 0 && !colorToAdd?.name) {
      toast.error('Please select a color')
      return
    }

    const price = Number(colorToAdd?.price || variantToAdd?.price || productToAdd?.price || 0);

    const discount = colorToAdd?.discount
    const isDiscountActive = discount?.isActive && discount?.value > 0
    const finalPrice = isDiscountActive
      ? discount.type === 'percentage'
        ? price - (price * discount.value / 100)
        : price - discount.value
      : price

    const discountAmount = price - finalPrice
    const imageUrl = colorToAdd?.images?.[0]?.url || productToAdd?.image || '/placeholder.png';

    dispatch(addToCart({
      product: productToAdd._id,
      name: productToAdd.name,
      slug: productToAdd.slug,
      image: imageUrl,

      price: isDiscountActive ? finalPrice : price,
      originalPrice: price,
      discountAmount: discountAmount,
      discount: colorToAdd?.discount,

      // PHONE SPECIFIC KEYS - MUST MATCH OTHER SCREENS
      variantType: 'phone',
      variant: variantToAdd?.storage || 'Default', // <-- KEY 1: Add this
      variantName: variantToAdd?.storage || colorToAdd?.name || 'Default',
      variantSubName: variantToAdd?.storage || '',

      model: productToAdd.name, // <-- KEY 2: Add this. Use product.name for phones
      color: colorToAdd?.name || 'Default', // phones use color name
      storage: variantToAdd?.storage || '',
      countInStock: colorToAdd?.countInStock ?? variantToAdd?.countInStock ?? 0,
      qty: qtyToAdd,
    }));

    toast.success(`${productToAdd.name} added to cart`)
    navigate('/cart')
  }
   
 // Buy now handler
const buyNowHandler = () => {
  if (selectedVariant?.colors?.length > 0 &&!selectedColor?.name) {
    toast.error("Please select a color");
    return;
  }

  const price = Number(selectedColor?.price || selectedVariant?.price || product?.price || 0);
  const imageUrl = selectedColor?.images?.[0]?.url || product.image || '/placeholder.png';

  const discount = selectedColor?.discount
  const isDiscountActive = discount?.isActive && discount?.value > 0
  const finalPrice = isDiscountActive
   ? discount.type === 'percentage'
     ? price - (price * discount.value / 100)
      : price - discount.value
    : price

  const discountAmount = price - finalPrice

  dispatch(addToCart({
    product: product._id,
    name: product.name,
    slug: product.slug,
    image: imageUrl,
    price: isDiscountActive? finalPrice : price,
    originalPrice: price,
    discountAmount: discountAmount,
    discount: selectedColor?.discount,

    // PHONE KEYS - SAME AS ADD TO CART
    variantType: 'phone',
    variant: selectedVariant?.storage || 'Default', 
    variantName: selectedVariant?.storage || selectedColor?.name || 'Default',
    variantSubName: selectedVariant?.storage || '',
    
    model: product.name, 
    color: selectedColor?.name || 'Default',
    storage: selectedVariant?.storage || '',
    countInStock: selectedColor?.countInStock?? selectedVariant?.countInStock?? 0,
    qty,
  }));

  navigate("/shipping");
}


  // Filter reviews by selected color, user login to show first his review
  const sortedReviews = useMemo(() => {
    if (!product?.reviews) return [];
    let reviews = [...product.reviews];

    if (ratingFilter !== 0) {
      reviews = reviews.filter(r => r.rating === Number(ratingFilter));
    }

    // Put user's review first, then apply the selected sort
    reviews.sort((a, b) => {
      const aUserId = typeof a.user === 'string' ? a.user : a.user?._id;
      const bUserId = typeof b.user === 'string' ? b.user : b.user?._id;

      // Force user's review to top
      if (userInfo && aUserId === userInfo._id) return -1
      if (userInfo && bUserId === userInfo._id) return 1

      // Then apply user's chosen sort
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'lowest') return a.rating - b.rating;
      if (sortBy === 'helpful') return (b.helpful?.length || 0) - (a.helpful?.length || 0);

      // Default: newest first
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return reviews;
  }, [product, ratingFilter, sortBy, userInfo]);

  //rating counts
  const ratingCounts = useMemo(() => {
    const counts = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    product?.reviews?.forEach((review) => {
      counts[Math.round(review.rating)]++;
    });

    return counts;
  }, [product]);


  const displayRating = product?.rating || 0;
  const displayNumReviews = product?.numReviews || 0;

  const submitReviewHandler = async (e) => {
    e.preventDefault();
    if (!rating) {
      toast.error('Please select a rating');
      return;
    }
    if (product?.colors?.length > 0 && !selectedColor) {
      toast.error('Please select a color');
      return;
    }
    // V33.66 REPLACE L211-L218 WHOLE BLOCK
    try {
      // V33.66 KEY: 1 FormData with 'images' field for multer.array
      const formData = new FormData();
      reviewImageFiles.forEach((file) => {
        formData.append('images', file); // V33.66 KEY: Must match backend
      });

      const uploadedImages = await uploadReviewImage(formData).unwrap(); // [{url, imagePublicId}]

      await createProductReview({
        slug,
        rating,
        comment,
        title,
        color: selectedColor?.name || '',
        storage: selectedVariant.storage || '',
        images: uploadedImages, // V33.66 KEY: [{url, imagePublicId}]
      }).unwrap();

      refetch();
      toast.success('Review submitted successfully');
      setRating(0);
      setComment('');
      setTitle('');
      setReviewImageFiles([]);
      setReviewImagePreviews([]);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };



  // 3. Submit: just send URLs, no upload loop
  // V33.89: Submit Edit - No upload, just send current images
  const submitEditHandler = async (e) => {
    e.preventDefault();
    if (!editRating) {
      toast.error('Please select a rating');
      return;
    }

    try {
      // V33.89 KEY: Send editImages as-is. No upload, no merge
      await updateProductReview({
        slug,
        reviewId: editingReview._id,
        rating: editRating,
        comment: editComment,
        title: editTitle,
        images: editImages, // V33.89 KEY: [{url, imagePublicId}] only
      }).unwrap();

      toast.success('Review updated successfully');
      cancelEdit(); // V33.89 KEY: Reset editImages
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };




  //create review /upload images
  // V33.62 KEY: No upload here. Only store File + Preview
  const uploadFileHandler = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // V33.62 KEY: Check against new state
    if (reviewImageFiles.length + files.length > 3) { // V33.62 KEY: Max 3
      toast.error('Max 3 images per review');
      return;
    }

    // V33.62 KEY: Store File objects only
    setReviewImageFiles((prev) => [...prev, ...files]);

    // V33.62 KEY: Create local previews, no Cloudinary call
    const previews = files.map(file => URL.createObjectURL(file));
    setReviewImagePreviews((prev) => [...prev, ...previews]);

    toast.success(`${files.length} Image(s) added`); // V33.62 KEY: 'added' not 'uploaded'
    e.target.value = null;
  };

  // For CREATE form - remove image
  // V33.63 KEY: For CREATE form - UI only, no Cloudinary call
  const removeImage = (index) => { // V33.63 KEY: index not imgObj
    // V33.63 KEY: Remove File
    setReviewImageFiles((prev) => prev.filter((_, i) => i !== index));

    // V33.63 KEY: Remove Preview + Free memory
    setReviewImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]); // V33.63 KEY: Prevent memory leak
      return prev.filter((_, i) => i !== index);
    });

    toast.success('Image removed'); // V33.63 KEY: 'removed' not 'deleted'
  };

  // 2.edit review / upload images
  // V33.41 EDIT form upload - 1 API call
  const uploadEditImageHandler = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (editImages.length + files.length > 3) { // V33.41: Max 3 total
      toast.error('Max 3 images');
      return;
    }

    // V33.41 KEY: 1 API call for all files
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file)); // V33.41: must be 'images'

    try {
      const data = await uploadReviewImage(formData).unwrap(); // V33.41: Expect [{url, imagePublicId}]
      const uploaded = data.map((u) => ({
        url: u.url,
        imagePublicId: u.imagePublicId || u.public_id // V33.41: backend compat
      }));
      setEditImages((prev) => [...prev, ...uploaded]); // V33.41: Object[]
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
    e.target.value = null;
  };

  // V33.84: Remove handler - UI only, no Cloudinary delete/ for edit review
  const removeEditImage = (index) => {
    // V33.84 KEY 1: Just remove from UI array
    setEditImages((prev) => prev.filter((_, i) => i !== index));

    // V33.84 KEY 2: Also remove from file array if it's a new file
    //setEditImageFiles((prev) => prev.filter((_, i) => i !== index)); 
  };

  //delete review hnadler
  const deleteHandler = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteProductReview({ slug, reviewId }).unwrap();
        toast.success('Review deleted');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };





  const helpfulHandler = async (reviewId) => {
    if (!userInfo) {
      toast.error('Please sign in to vote');
      return;
    }
    try {
      const res = await markHelpful({
        slug,
        reviewId,
      }).unwrap();

      refetch();

      toast.success(
        res.userVoted
          ? 'Thanks! You found this review helpful.'
          : 'Your helpful vote has been removed.'
      );
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const notHelpfulHandler = async (reviewId) => {
    if (!userInfo) {
      toast.error('Please login to mark as not helpful');
      return;
    }

    try {
      const res = await markReviewNotHelpful({
        slug,
        reviewId,
      }).unwrap();

      refetch();
      toast.success(
        res.userVoted
          ? "Thanks! You marked this review as not helpful."
          : 'Your not helpful vote has been removed.'
      );
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const submitReplyHandler = async (reviewId) => {
    if (!replyText.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }
    try {
      await addAdminReply({
        slug,
        reviewId,
        reply: replyText, // <-- Change key from replyText to reply
      }).unwrap();
      setReplyText('');
      setReplyingTo(null);
      toast.success('Reply posted');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const updateReplyHandler = async (reviewId) => {
    try {
      await editAdminReply({
        slug,
        reviewId,
        reply: editReplyText  // <-- Change from replyText: to reply:
      }).unwrap();
      setIsEditingReply(null);
      toast.success('Reply updated');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const deleteReplyHandler = async (reviewId) => {
    if (window.confirm('Delete this reply?')) {
      try {
        await deleteAdminReply({ slug, reviewId }).unwrap();
        toast.success('Reply deleted');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };




  const alreadyReviewed = product?.reviews?.find(
    (r) => r.user === userInfo?._id || r.user?._id === userInfo?._id
  );
  const showCreateForm = userInfo && !alreadyReviewed && !editingReview;
  const showAlreadyReviewedMsg = userInfo && alreadyReviewed && !editingReview;


  // This is the key part - check for network error
  if (!isOnline || error?.status === 'FETCH_ERROR' || error?.error === 'TypeError: Failed to fetch') {
    return <OfflineMessage refetch={refetch} isOnline={isOnline} />
  }

  // V9.92 KEY: GUARD. Stop code before accessing undefined
  if (isLoading) return <Loader />;
  if (error || !product || !product.variants?.[0]?.colors?.[0])
    return <Message variant='danger'>Product not found or invalid V9.47 data</Message>;

  const currentStock = selectedColor?.countInStock ?? selectedVariant?.countInStock ?? 0;
  //const currentPrice = selectedColor?.price ?? product.price ?? 0
  // const currentStock =
  // selectedColor?.countInStock ?? selectedVariant?.countInStock ?? 0;

  const price = Number(
    selectedColor?.price ?? selectedVariant?.price ?? 0
  );

  const isDiscountActive =
    selectedColor?.discount?.isActive &&
    Number(selectedColor?.discount?.value) > 0;

  const discountValue = Number(selectedColor?.discount?.value ?? 0);

  const discountAmount = isDiscountActive
    ? selectedColor?.discount?.type === "percentage"
      ? (price * discountValue) / 100
      : discountValue
    : 0;

  const finalPrice = Math.max(0, price - discountAmount);

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  //drop down for qty / mobile screen
  const CustomDropdown = ({ value, onChange, options, size = 'md' }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
      const handleClickOutside = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const sizeClasses = size === 'sm'
      ? 'px-3 py-2 h-11 text-sm min-w-'
      : 'px-4 py-2.5 h-12 text-base min-w-[100px]';

    return (
      <div ref={ref} className="relative w-full">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center justify-between gap-2 border font-semibold text-gray-900 bg-white border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${sizeClasses}`}
        >
          <span>{value}</span>
          <FaChevronDown size={size === 'sm' ? 14 : 16} className={`text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute top-full mt-1 left-0 w-full bg-white border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="max-h-[240px] overflow-y-auto scrollbar-hide">
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm transition ${Number(value) === Number(opt) ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-900 hover:bg-blue-50 hover:text-blue-600'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };



  return (
    <>
      <Helmet>
        <title>{product?.name} - Phone-Store</title>
        <meta
          name="description"
          content={`${product?.name} - ${product?.description?.substring(0, 130)}... Buy now at Phone-Store Pakistan with warranty.`}
        />
        <link rel="canonical" href={`https://www.phone-store.asia/product/${product?.slug}`} />

        <meta property="og:title" content={`${product?.name} | Phone-Store`} />
        <meta property="og:description" content={product?.description?.substring(0, 155)} />
        <meta property="og:image" content={selectedColor?.images?.[0] || product?.image} />
        <meta property="og:url" content={`https://www.phone-store.asia/product/${product?.slug}`} />
        <meta property="og:type" content="product" />
        <meta
          property="product:price:amount"
          content={isDiscountActive ? finalPrice : price}
        />
        <meta property="product:price:currency" content="PKR" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product?.name,
            "image": selectedColor?.images || [product?.image],
            "description": product?.description,
            "sku": product?._id,
            "brand": { "@type": "Brand", "name": product?.brand },
            "offers": {
              "@type": "Offer",
              "url": `https://www.phone-store.asia/product/${product?.slug}`,
              "priceCurrency": "PKR",
              "price": String(isDiscountActive ? finalPrice : price),
              "availability": currentStock > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
              "seller": { "@type": "Organization", "name": "Phone-Store" }
            },
            ...(product?.numReviews > 0 && {
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": product?.rating?.toFixed(1),
                "reviewCount": product?.numReviews
              }
            })
          })}
        </script>
      </Helmet>

      <div className='max-w-7xl mx-auto px-4 py-8'>
        <Link to='/' className='text-blue-600 hover:text-blue-800 mb-6 inline-block font-medium'>
          ← Go Back
        </Link>

        <div className='bg-white rounded-xl shadow-lg overflow-hidden'>
          <div className='p-6 md:p-8'>

            {/* Top Section: Images + Buy Box */}
            <div className='grid grid-cols-1 lg:grid-cols-12 lg:items-start gap-8 mb-8'>

              {/* Left: Thumbnails + Main Image */}

              {/* Main 360 Image */}

              <div className='lg:col-span-7 min-w-0'>
                <div className='relative'>

                  <button
                    onClick={handleCompareThisPhone}
                    disabled={!product}
                    className="absolute top-3 right-3 z-20 bg-white hover:bg-gray-100 text-gray-700 p-2.5 rounded-full shadow-lg border-gray-200 transition-all duration-200 hover:scale-110"
                    title="Compare this phone"
                  >
                    <FaBalanceScale className="text-lg" />
                  </button>
                  {!product || !selectedColor ? (
                    // SKELETON WHILE LOADING
                    <div className="relative w-full h-[500px] flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
                      <div className="w-full h-full animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>

                      {/* Thumbnail skeleton strip */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Product360
                      images={selectedColor.images?.length > 0
                        ? selectedColor.images.map(img => img.url)
                        : [product.image]} // V11.1 KEY: .map(img => img.url)
                      color={selectedColor.name || selectedColor.color}
                      selectedIndex={selectedImageIndex}
                      setSelectedIndex={setSelectedImageIndex}
                      isImageFullscreen={isImageFullscreen}
                      setIsImageFullscreen={setIsImageFullscreen}
                      stock={selectedColor.countInStock ?? 0}
                      //externalLoading={imageLoadingTrigger}
                      //setExternalLoading={setImageLoadingTrigger}  
                      slideDirection={slideDirection}
                      setSlideDirection={setSlideDirection}

                    />
                  )}
                </div>
              </div>



              {/* Right: Buy Box - Name, Brand, Price, Stock, Colors, Cart */}
              <div className='lg:col-span-5'>
                <h1 className='text-2xl
                        sm:text-3xl
                        lg:text-4xl
                        font-bold
                        leading-tight
                        text-gray-900
                        tracking-tight
                        mb-3
                        sm:mb-5'
                >
                  {product.name}{selectedVariant?.storage ? ` ${selectedVariant.storage}` : ''}
                </h1>

                {/* <div className='text-sm text-gray-500 mb-2 font-medium'>{product.brand}</div> */}
                {product.numReviews > 0 && (
                  <div className='flex items-center gap-2 mb-3 sm:mb-5'>
                    <div className='flex text-amber-500 gap-0.5'>
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`w-4 h-4 sm:w-5 sm:h-5 ${i < Math.floor(product.rating)
                            ? 'fill-current'
                            : 'fill-gray-300'
                            }`}
                        />
                      ))}
                    </div>
                    <a className='text-sm font-medium text-gray-600 ml-1.5 hover:text-orange-600 hover:underline cursor-pointer'>
                      {product.rating?.toFixed(1) ?? '0.0'}
                    </a>
                    <a className='text-sm text-blue-600 ml-1 hover:text-orange-600 hover:underline cursor-pointer'>
                      ({product.numReviews})
                    </a>
                  </div>
                )}
                {/* <div className="sm:mb-5 mb-3">
                  <span className="text-4xl sm:text-5xl font-extrabold text-blue-600">
                    ${selectedColor?.price ?? selectedVariant?.price ?? 0}
                  </span>
                </div> */}
                <div className="sm:mb-5 mb-3">
                  {isDiscountActive ? (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl sm:text-5xl font-extrabold text-red-600">
                          ${finalPrice.toFixed(2)}
                        </span>

                        <span className="text-xl text-gray-500 line-through">
                          ${price.toFixed(2)}
                        </span>
                      </div>

                      <p className="text-green-600 font-semibold mt-1">
                        You save ${discountAmount.toFixed(2)}
                      </p>
                    </>
                  ) : (
                    <span className="text-4xl sm:text-5xl font-extrabold text-blue-600">
                      ${price.toFixed(2)}
                    </span>
                  )}
                </div>



                {/* Stock Status */}
                <div className="sm:mb-7 mb-5">
                  {(() => {
                    const stock =
                      selectedColor?.countInStock ??
                      selectedVariant?.countInStock ??
                      0;

                    if (stock === 0) {
                      return (
                        <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm border bg-red-50 border-red-200 text-red-700">
                          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                          Out of Stock
                        </span>
                      );
                    }

                    if (stock <= 3) {
                      return (
                        <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm border bg-orange-50 border-orange-200 text-orange-700">
                          <span className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
                          Only {stock} Left
                        </span>
                      );
                    }

                    if (stock <= 10) {
                      return (
                        <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm border bg-yellow-50 border-yellow-200 text-yellow-700">
                          <span className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
                          Low Stock ({stock})
                        </span>
                      );
                    }

                    return (
                      <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm border bg-green-50 border-green-200 text-green-700">
                        <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                        In Stock ({stock})
                      </span>
                    );
                  })()}
                </div>


                {/* Color Selection V12.6 */}
                {selectedVariant?.colors?.length > 0 && (
                  <div className='mb-6'>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                      Color:
                      <span className="ml-2 text-blue-600 font-bold">
                        {selectedColor?.name}
                      </span>
                    </h3>
                    <div className="flex flex-wrap gap-3 sm:gap-4">
                      {selectedVariant?.colors?.map((color, cIdx) => (
                        <button
                          key={cIdx}
                          type="button"
                          onClick={() => {
                            //setImageLoadingTrigger(true)  
                            setSlideDirection('left')
                            setSelectedColorIndex(cIdx)
                            setSelectedImageIndex(0)
                            //setTimeout(() => setImageLoadingTrigger(false), 400)  
                          }}
                          className={`
                                  relative flex flex-col items-center justify-center gap-1
                                  w-20 h-24
                                  sm:w-28 sm:h-32  
                                  lg:w-32 lg:h-36  
                                  rounded-xl
                                  border-2
                                  bg-white
                                  overflow-hidden
                                  transition-all
                                  duration-300
                                  ${cIdx === selectedColorIndex
                              ? "border-blue-600 ring-2 sm:ring-4 ring-blue-100 shadow-lg scale-105"
                              : "border-gray-200 hover:border-blue-300 hover:shadow-md"
                            }
                                  `}
                          title={color?.name}
                        >
                          <img
                            src={(color?.images?.[0]?.url || selectedVariant?.images?.[0]?.url || product?.image || '/images/placeholder-phone.jpg').replace('/upload/', '/upload/w_400,h_400,c_pad,b_white,q_auto:best/')} // V12.7
                            alt={color?.name}
                            className='w-full h-full max-h-14 sm:max-h-18 lg:max-h-24 object-contain p-0.5 transition-transform duration-200 hover:scale-105' // V12.7
                            onError={(e) => e.target.src = '/images/placeholder-phone.jpg'}
                          />
                          <span className='text-xs font-medium text-gray-700 text-center leading-tight max-w-full truncate px-1'>
                            {color?.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* V9.40 KEY: VARIANT SELECTOR = STORAGE 128GB/256GB/512GB */}
                {product?.variants?.length > 0 && (
                  <div className='mb-4'>
                    <label className='font-semibold block mb-3 text-gray-900'>
                      Storage: <span className='text-blue-600 font-semibold'>
                        {selectedVariant?.storage || selectedVariant?.name}
                      </span>
                    </label>
                    <div className="flex flex-wrap gap-3 sm:gap-4">
                      {product?.variants?.map((variant, vIdx) => (
                        <button
                          key={vIdx}
                          type="button"
                          onClick={() => {
                            //setImageLoadingTrigger(true) // START LOADING
                            setSlideDirection('right') // slide direction for storage
                            // Remember the currently selected color
                            const currentColorName = selectedColor?.name;

                            // Find the same color in the new storage
                            const newColorIndex = product.variants[vIdx]?.colors?.findIndex(
                              (color) => color.name === currentColorName
                            );

                            setSelectedVariantIndex(vIdx);

                            if (newColorIndex !== -1) {
                              // Keep the same color
                              setSelectedColorIndex(newColorIndex);
                            } else {
                              // Color doesn't exist in this storage
                              setSelectedColorIndex(0);
                            }

                            // setSelectedImageIndex(0) // reset to first image
                            // setTimeout(() => setImageLoadingTrigger(false), 400) // STOP LOADING
                          }}
                          className={`
                                min-w-[70px] md:min-w-[96px] lg:min-w-[90px]
                                h-12 md:h-14
                                px-4 md:px-5
                                rounded-xl
                                border-2
                                font-semibold
                                text-sm md:text-base
                                transition-all
                                duration-200 
                                ${vIdx === selectedVariantIndex
                              ? "border-blue-600 bg-blue-50 text-blue-700 shadow-lg scale-[1.03]"
                              : "border-gray-200 bg-white text-gray-700 hover:border-blue-400 hover:shadow-sm"
                            }
                                `}
                        >
                          {variant?.name || variant?.storage || `${variant?.size}GB`} {/* V9.40 KEY */}
                        </button>
                      ))}
                    </div>
                  </div>
                )}




                {/* Qty + Add to Cart - V12.8 KEY */}

                {(selectedColor?.countInStock ?? selectedVariant?.countInStock ?? 0) > 0 ? (
                  <div className='hidden md:block mt-8 pt-8 border-t border-gray-200'>
                    <div className='flex flex-col lg:flex-row lg:items-end gap-4'>

                      {/* QTY - AMAZON STYLE 1-5 MAX */}
                      <div className='w-full lg:w-24'>
                        <label className='block text-sm font-semibold text-gray-900 mb-1.5'>Qty:</label>
                        <CustomDropdown
                          size="sm"
                          value={String(qty)}
                          onChange={(val) => setQty(Number(val))}
                          options={Array.from({ length: Math.min(selectedColor?.countInStock ?? 5, 5) }, (_, i) => String(i + 1))}
                        />
                      </div>

                      {/* ADD TO CART */}
                      <button
                        onClick={addToCartHandler}
                        className='w-full lg:flex-1 bg-[#FFD814] hover:bg-[#F7CA00] border-[#FCD200] text-[#111] 
                        font-semibold h-12 lg:h-14 px-6 rounded-lg flex items-center justify-center gap-2 shadow-sm hover:shadow-md 
                        transition-all'
                      >
                        <FaShoppingCart size={18} /> Add to Cart
                      </button>

                      
                      {/* WISHLIST - WRAPPED IN DIV */}
                    <div className="w-14 h-14 flex-shrink-0">
                      <WishlistButton 
                        type="product"
                        product={product}
                        productVariantIndex={selectedVariantIndex}  
                        productColorIndex={selectedColorIndex}      
                        className="w-14 h-14 flex items-center justify-center border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition"
                        showText={false}
                      />
                    </div>

                    </div>
                  </div>
                ) : (
                  <div className='mt-6 pt-6 border-t border-gray-200'>
                    <button
                      disabled
                      className='w-full bg-gray-200 text-gray-500 font-semibold h-12 px-6 rounded-lg cursor-not-allowed'
                    >
                      Currently Unavailable
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Specifications Box - Collapsible V13.0 */}
            {(() => {
              const specs = { ...product.specs, ...selectedVariant?.specs, ...selectedColor?.specs };

              return Object.keys(specs).length > 0 ? (
                <div className='mt-6 pt-6 border-t border-gray-200'>
                  {/* HEADER BUTTON */}
                  <button
                    onClick={() => setIsSpecsOpen(!isSpecsOpen)}
                    className='w-full flex items-center justify-between text-left hover:bg-gray-50 p-2 rounded-lg'
                  >
                    <h3 className='text-xl font-bold'>
                      Specifications - {selectedVariant?.storage || ''}
                    </h3>
                    {isSpecsOpen ? <FaChevronUp /> : <FaChevronDown />}
                  </button>

                  {/* COLLAPSIBLE CONTENT */}
                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isSpecsOpen ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 bg-gray-50 p-3 lg:p-6 rounded-lg'>
                      {Object.entries(specs).map(([key, value]) => (
                        <div key={key} className='flex flex-col'>
                          <span className='text-xs text-gray-500 uppercase tracking-wide font-semibold'>{key}</span>
                          <span className='text-[15px] leading-6 text-gray-900 font-medium mt-0.5'>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null;
            })()}

            {/* Description - Full Width V13.4 */}
            {(selectedVariant?.description || selectedColor?.description || product.description) && (
            <div className='border-t pt-8 mt-2'>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                Description {selectedVariant?.storage ? `- ${selectedVariant?.storage}` : ''} {/* V13.4 KEY */}
              </h2>
              <div className='max-w-5xl'>
                <p className='text-gray-700 leading-8 text-[15px] whitespace-pre-line'>
                  {selectedVariant?.description || selectedColor?.description || product.description || 'No description available.'} {/* V13.4 */}
                </p>

              </div>
            </div>
            )}

          </div>
        </div>
        {/* compare phone section */}
        {/* <div className="mt-8 rounded-xl border bg-white p-4 lg:p-6 shadow-sm">
          <div className="flex items-start sm:items-center gap-3">
            <FaBalanceScale className="text-blue-600 text-xl lg:text-2xl mt-1 sm:mt-0" />

            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold leading-tight">
              Compare with another phone
            </h2>
          </div>

          <p className="mt-2 text-sm sm:text-base text-gray-500 max-w-3xl">
            Choose another phone to compare specifications,
            price, camera, display and performance.
          </p>
          <div className="relative mt-4">
            {/* <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" /> */}

           {/* <CompareSearch
              currentSlug={product.slug}
              setCompareSlug={setCompareSlug}
            />
          </div>
          <div className="mt-6">
            {compareLoading ? (
              <div className="text-center text-gray-500">
                Loading comparison...
              </div>
            ) : (
              compareProducts?.length === 2 && (
                <CompareProducts
                  products={compareProducts}
                  showRemove={false}
                />
              )
            )}
          </div>
        </div> */}

        {/* Customers also viewed section */}
        <RecommendedProducts
          data={data}
          loading={loadingRecs}
          error={errorRecs}
          onAddToCart={addToCartHandler}
          quickViewProduct={quickViewProduct}
          setQuickViewProduct={setQuickViewProduct}
        />

        <FrequentlyBoughtTogether
          product={product}
          selectedVariant={selectedVariant}
          selectedColor={selectedColor}
          finalPrice={finalPrice}
          frequentlyBought={frequentlyBought}
          loadingFBT={loadingFBT}
        />


        {/* Reviews Section */}
        <div className='mt-10'>


          {/* Review Summary */}
          {/* Review Summary */}
          <div className="bg-white border rounded-xl p-6 mb-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-5">
              Customer Reviews Summary
            </h3>

            <div className="flex flex-col md:flex-row gap-10">
              {/* Left */}
              <div className="md:w-56 flex flex-col items-center md:items-start">
                <div className="text-5xl sm:text-5xl md:text-6xl font-bold text-gray-900">
                  {product.rating.toFixed(1)}
                </div>

                <div className="flex text-yellow-400 text-4xl sm:text-5xl md:text-5xl mt-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i}>
                      {product.rating >= i
                        ? "★"
                        : product.rating >= i - 0.5
                          ? "☆"
                          : "☆"}
                    </span>
                  ))}
                </div>

                <p className="text-sm text-gray-500 mt-3">
                  {product.numReviews} customer reviews
                </p>
              </div>

              {/* Right */}
              <div className="flex-1">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = product.reviews.filter(
                    (review) => review.rating === star
                  ).length;

                  const percentage =
                    product.numReviews > 0
                      ? (count / product.numReviews) * 100
                      : 0;

                  return (
                    <div
                      key={star}
                      className="flex items-center gap-3 mb-3"
                    >
                      <span className="w-8 text-sm font-medium">
                        {star}★
                      </span>

                      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="bg-yellow-400 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>

                      <span className="w-16 text-right text-sm text-gray-600">
                        {count} ({Math.round(percentage)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>



          {product?.reviews?.length === 0 && (
            <Message>No Reviews Yet</Message>
          )}

          {/* Review List */}
          <div className='mb-8'>
            {sortedReviews.length > 0 ? (
              sortedReviews.slice(0, 3).map((review) => (
                <div key={review._id} className='bg-gray-50 p-4 rounded-lg mb-4'>
                  <div className='flex justify-between items-start gap-3 mb-2'>
                    <div className="flex-1 min-w-0">
                      <strong className="block text-lg font-semibold">
                        {review.name}
                      </strong>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">

                        {review.verifiedPurchase && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 text-xs px-2 py-1">
                            ✓ Verified Purchase
                          </span>
                        )}

                        {(review.color || review.storage) && (
                          <span>
                            {review.color}
                            {review.storage ? ` / ${review.storage}` : ""}
                          </span>
                        )}

                        <span>
                          | {timeAgo(review.createdAt)}
                        </span>

                      </div>
                    </div>
                    {userInfo?._id === review.user && (
                      <div className='flex gap-2 flex-shrink-0'>
                        <button
                          onClick={() => handleEditClick(review)}
                          className='text-blue-600 text-xs hover:underline font-medium'
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteHandler(review._id)}
                          disabled={loadingDeleteReview}
                          className='text-red-600 text-xs hover:underline font-medium disabled:opacity-50'
                        >
                          {loadingDeleteReview ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-2">
                    <Rating value={review.rating} />
                  </div>
                  {review.title && (
                    <h4 className="mt-2 text-lg font-semibold text-gray-900 leading-tight">
                      {review.title}
                    </h4>
                  )}
                  <p className='mt-2 text-[15px] leading-7 text-gray-700'>{review.comment}</p>

                  {review.images?.length > 0 && (
                    <div className='flex gap-2 mt-2 flex-wrap'>
                      {review.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img.url} // V33.21 KEY: .url not the whole object
                          alt={`Review ${idx + 1}`}
                          className="w-16 h-16
                                sm:w-20 sm:h-20
                                lg:w-24 lg:h-24
                                object-contain
                                rounded-lg
                                bg-white
                                border
                                border-gray-200
                                p-1
                                cursor-pointer
                                hover:opacity-80
                                flex-shrink-0"
                          onClick={() => window.open(img.url, '_blank')} // V33.21 KEY: .url
                        />
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">

                    {/* Helpful */}
                    <button
                      onClick={() => helpfulHandler(review._id)}
                      disabled={loadingHelpfulReview}
                      className={`inline-flex items-center gap-2 rounded-md px-3 py-2 transition-colors
                            ${userInfo && review.helpful?.includes(userInfo._id)
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                      <FaThumbsUp size={14} />
                      Helpful ({review.helpful?.length || 0})
                    </button>

                    {/* Not Helpful */}
                    <button
                      onClick={() => notHelpfulHandler(review._id)}
                      disabled={loadingNotHelpfulReview}
                      className={`inline-flex items-center gap-2 rounded-md px-3 py-2 transition-colors
                          ${userInfo && review.notHelpful?.includes(userInfo._id)
                          ? "bg-red-50 text-red-600 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                      <FaThumbsDown size={14} />
                      Not Helpful ({review.notHelpful?.length || 0})
                    </button>

                  </div>

                  {/* Show existing admin reply */}
                  {review.adminReply && (review.adminReply.reply || review.adminReply.text) && (
                    <div className="mt-4 ml-2 sm:ml-4 border-l-4 border-blue-500 bg-blue-50 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div className='flex-1'>
                          <p className="text-sm font-semibold text-blue-700">
                            Store Response - {review.adminReply.name}
                          </p>
                          {isEditingReply === review._id ? (
                            <div className='mt-1'>
                              <textarea
                                rows='2'
                                value={editReplyText}
                                onChange={(e) => setEditReplyText(e.target.value)}
                                className='w-full border rounded p-1 text-sm'
                              />
                              <div className="flex gap-3 self-end sm:self-auto">
                                <button
                                  onClick={() => updateReplyHandler(review._id)}
                                  disabled={loadingUpdateReply}
                                  className='bg-green-600 text-white px-2 py-1 rounded text-xs disabled:opacity-50'
                                >
                                  {loadingUpdateReply ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                  onClick={() => setIsEditingReply(null)}
                                  className='text-gray-600 text-xs'
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className='text-sm text-gray-700 mt-1'>
                              <p className="mt-2 text-sm leading-7 text-gray-700 break-words">
                                {review.adminReply.reply || review.adminReply.text}</p>
                              {review.adminReply.createdAt && (

                                <p className='text-xs text-gray-500 mt-3'>{timeAgo(review.adminReply.createdAt)}</p>

                              )}
                            </div>



                          )}
                        </div>

                        {userInfo?.isAdmin && isEditingReply !== review._id && (
                          <div className='flex gap-2 ml-2'>
                            <button
                              onClick={() => {
                                setIsEditingReply(review._id);
                                setEditReplyText(review.adminReply.reply);
                              }}
                              className='text-blue-600 text-xs hover:underline'
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteReplyHandler(review._id)}
                              disabled={loadingDeleteReply}
                              className='text-red-600 text-xs hover:underline disabled:opacity-50'
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Admin reply button + form - for reviews without replies */}
                  {userInfo?.isAdmin && !review.adminReply?.reply && (
                    <div className='mt-2'>
                      {replyingTo === review._id ? (
                        <div className='mt-2'>
                          <textarea
                            rows='2'
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder='Write admin reply...'
                            className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
                          />
                          <div className="mt-3 flex items-center gap-3">
                            <button
                              onClick={() => submitReplyHandler(review._id)}
                              disabled={loadingAdminReply}
                              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                            >
                              {loadingAdminReply ? 'Posting...' : 'Post Reply'}
                            </button>
                            <button
                              onClick={() => { setReplyingTo(null); setReplyText(''); }}
                              className="rounded-md px-2 py-2 text-sm text-gray-600 hover:text-gray-800"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReplyingTo(review._id)}
                          className="mt-2 text-sm font-medium text-blue-600 hover:underline"
                        >
                          Reply as Admin
                        </button>
                      )}
                    </div>

                  )}


                </div>

              ))
            ) : product?.reviews?.length > 0 ? (
              <p className='text-gray-500 py-4'>
                No {ratingFilter} star reviews yet
              </p>
            ) : null}



            {/* Add this right here*/}
            {product?.reviews?.length > 3 && (
              <div className="mt-8 flex">
                <Link
                  to={`/products/${product.slug}/reviews`}
                  className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 shadow-sm transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 hover:shadow-md sm:w-auto"
                >
                  View All Reviews ({product.reviews.length})
                </Link>
              </div>
            )}

            {/* {showAllReviews && product && (
              <ReviewsModal
                productId={product?._id}
                product={product}
                onClose={() => setShowAllReviews(false)}
              />
            )} */}

          </div>



          {/* CREATE REVIEW SECTION */}
          {/* WRITE REVIEW BUTTON - Shows when form is hidden */}
          {userInfo && !alreadyReviewed && !editingReview && !showReviewForm && (
            <div className='mt-8 pt-8 border-t border-gray-200'>
              <h3 className='text-lg font-bold text-gray-900 mb-4'>Review this product</h3>
              <p className='text-sm text-gray-600 mb-4'>
                Share your thoughts with other customers
              </p>
              <button
                onClick={() => setShowReviewForm(true)}
                className='bg-white hover:bg-gray-50 text-gray-900 px-6 py-2 rounded-lg border border-gray-300 text-sm font-medium shadow-sm'
              >
                Write a customer review
              </button>
            </div>
          )}

          {/* CREATE REVIEW FORM - Shows when button clicked */}
          {userInfo && !alreadyReviewed && !editingReview && showReviewForm && (
            <div className='max-w-2xl bg-white p-6 rounded-lg border border-gray-200 mt-8'>
              <div className='flex justify-between items-center mb-4 pb-3 border-b border-gray-200'>
                <h2 className='text-xl font-bold text-gray-900'>
                  Create Review
                </h2>
                <button
                  type='button'
                  onClick={() => setShowReviewForm(false)}
                  className='text-gray-500 hover:text-gray-700 text-2xl leading-none'
                >
                  ×
                </button>
              </div>

              {/* Product info */}
              {selectedColor && (
                <div className='flex items-center gap-3 mb-6 text-sm'>
                  <img
                    src={mainImage || '/images/placeholder-phone.jpg'}
                    alt={product.name}
                    className='w-12 h-12 object-contain border border-gray-200 rounded bg-white'
                    onError={(e) => { e.target.src = '/images/placeholder-phone.jpg' }}
                  />
                  <div>
                    <p className='text-gray-600'>You are reviewing:</p>
                    <p className='font-medium text-gray-900'>
                      {product.name} - {selectedColor.name} - {selectedVariant?.storage}
                    </p>
                  </div>
                </div>
              )}

              {!selectedColor && product?.colors?.length > 0 && (
                <Message variant='danger'>Please select a color first</Message>
              )}

              <form onSubmit={submitReviewHandler}>
                {/* Overall Rating */}
                <div className='mb-6'>
                  <label className='block text-base font-bold text-gray-900 mb-2'>
                    Overall rating
                  </label>
                  <div className='flex gap-1'>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className={`w-7 h-7 cursor-pointer transition-colors ${(hoverRating || rating) >= star
                          ? 'text-amber-500'
                          : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  {rating === 0 && (
                    <p className='text-xs text-red-600 mt-1'>Please select a rating</p>
                  )}
                </div>

                {/* Written Review */}
                <div className="mb-6">
                  <label className="block text-base font-bold text-gray-900 mb-2">
                    Review title <span className="text-gray-500 font-normal">(optional)</span>
                  </label>

                  <input
                    type="text"
                    placeholder="Example: Great battery life"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={120}
                    className="w-full px-3 py-2 border border-gray-400 rounded shadow-sm focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
                <div className='mb-6'>
                  <label className='block text-base font-bold text-gray-900 mb-2'>
                    Add a written review
                  </label>
                  <textarea
                    rows={5}
                    placeholder='What did you like or dislike? What did you use this product for?'
                    className='w-full px-3 py-2 border border-gray-400 rounded shadow-sm focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 text-sm'
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  />
                </div>

                {/* Upload Images */}
                <div className='mb-6'>
                  <label className='block text-base font-bold text-gray-900 mb-2'>
                    Add photos
                  </label>
                  <p className='text-xs text-gray-600 mb-3'>
                    Shoppers find images more helpful than text alone.
                  </p>

                  <label className={`
  inline-block px-4 py-2 rounded-lg border border-gray-400 bg-white text-sm font-medium text-gray-900
  hover:bg-gray-50 cursor-pointer shadow-sm
  ${reviewImageFiles.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''} // V33.64 KEY: Files not Upload
`}>
                    <input
                      type='file'
                      accept='image/*'
                      multiple
                      onChange={uploadFileHandler}
                      disabled={reviewImageFiles.length >= 3}
                      className='hidden'
                    />
                    {'Choose files'}
                  </label>
                  <span className='text-xs text-gray-500 ml-3'>
                    {reviewImageFiles.length}/3 photos / (Optional)
                  </span>

                  {/* Image Preview Thumbnails */}
                  {reviewImagePreviews.length > 0 && (
                    <div className='flex gap-3 mt-4 flex-wrap'>
                      {reviewImagePreviews.map((url, idx) => (
                        <div key={idx} className='relative group'>
                          <img
                            src={url}
                            alt={`Review ${idx + 1}`}
                            className='w-20 h-20 lg:w-24 lg:h-24 object-contain rounded-lg bg-white border border-gray-200'
                          />
                          <button
                            type='button'
                            onClick={() => removeImage(idx)}
                            className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100'
                          >
                            ❌
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className='pt-4 border-t border-gray-200'>
                  <button
                    type='submit'
                    disabled={
                      loadingProductReview ||
                      loadingUpload ||
                      rating === 0 ||
                      !comment ||
                      (product?.colors?.length > 0 && !selectedColor)
                    }
                    className='bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-200 text-black px-6 py-2 rounded-full text-sm font-medium shadow-sm disabled:cursor-not-allowed'
                  >
                    {loadingProductReview ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          )}




          {/* EDIT REVIEW FORM */}
          {/* V33.99: EDIT REVIEW MODAL */}
          {isEditModalOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm" // V33.99 KEY: darker + blur
              onClick={cancelEdit}
            >
              <div
                className="bg-white w-full max-w-md rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto relative" // V33.99 KEY: max-w-md + relative
                onClick={(e) => e.stopPropagation()}
              >
                {/* V33.99 KEY: Top Close Button */}
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="p-6 pt-10"> {/* V33.99 KEY: pt-10 for X button space */}
                  <h3 className='text-2xl font-bold mb-5'>Edit Your Review</h3>

                  <form onSubmit={submitEditHandler} className='space-y-5'>
                    {/* Rating */}
                    <div>
                      <label className='block mb-2 font-semibold text-gray-700'>Rating</label>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button type="button" key={star} onClick={() => setEditRating(star)} className="cursor-pointer transition-transform hover:scale-110">
                            <FaStar
                              className={`w-8 h-8 ${star <= editRating ? 'text-yellow-400' : 'text-gray-300'}`} // V33.99 KEY: w-8 bigger
                            />
                          </button>
                        ))}
                      </div>
                      {editRating === 0 && <p className='text-red-500 text-sm mt-1'>Please select a rating</p>}
                    </div>
                    {/* Review Title */}

                    <div className="mb-4">
                      <label className="block mb-2 font-semibold text-gray-700">
                        Review Title <span className="text-gray-500 font-normal">(optional)</span>
                      </label>

                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Example: Great battery life"
                        maxLength={120}
                        className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>


                    {/* Comment */}
                    <div>
                      <label className='block mb-2 font-semibold text-gray-700'>Comment</label>
                      <textarea
                        className='w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                        rows='4'
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        required
                      />
                    </div>

                    {/* Images - Clear + Big */}
                    <div>
                      <label className='block mb-2 font-semibold text-gray-700'>Images (max 3)</label>
                      <div className='flex gap-3 mt-3 flex-wrap'>
                        {editImages.map((img, idx) => (
                          <div key={idx} className='relative'>
                            <img
                              src={img.url}
                              alt='review'
                              //className="w-24 h-24 object-cover rounded-xl border-2 border-gray-200 shadow-sm bg-white"
                              className='w-20 h-20 lg:w-24 lg:h-24 object-contain rounded-lg bg-white border border-gray-200' // V33.99 KEY: w-24 + border-2 + shadow
                            />
                            <button
                              type='button'
                              onClick={() => removeEditImage(idx)}
                              className='absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm shadow-md transition' // V33.99 KEY: bigger X
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>

                      {editImages.length < 3 && (
                        <div className='mt-3'>
                          <input
                            type='file'
                            accept='image/*'
                            multiple
                            onChange={uploadEditImageHandler}
                            className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer'
                          />
                          {loadingUpload && <p className='text-sm text-gray-500 mt-1'>Uploading...</p>}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2">To add images, delete current and add new one</p>
                    </div>

                    {/* Buttons */}
                    <div className='flex gap-3 pt-3'>
                      <button
                        type='submit'
                        disabled={loadingUpdateReview}
                        className='flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition'
                      >
                        {loadingUpdateReview ? 'Updating...' : 'Update Review'}
                      </button>
                      <button
                        type='button'
                        onClick={cancelEdit}
                        className='px-6 bg-gray-100 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-200 transition'
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ALREADY REVIEWED MESSAGE */}
          {userInfo && alreadyReviewed && !editingReview && (
            <div className='bg-green-50 p-4 rounded-lg border border-green-200'>
              <p className='text-sm text-green-800'>
                ✓ You've already reviewed this product. Click "Edit" on your review above to update it.
              </p>
            </div>
          )}

          {/* NOT LOGGED IN */}
          {!userInfo && (
            <Message>
              Please <Link to='/login' className='text-blue-600 underline'>sign in</Link> to write a review
            </Message>
          )}
        </div>
      </div>
      {!quickViewProduct && !isImageFullscreen && !isEditModalOpen && !isMobileMenuOpen && (
  <StickyPurchaseBar
    product={product}
    selectedColorIndex={selectedColorIndex}
    selectedVariantIndex={selectedVariantIndex}
    qty={qty}
    setQty={setQty}
    addToCartHandler={addToCartHandler}
    buyNowHandler={buyNowHandler}
  />
)}
    </>
  )
}

export default ProductScreen