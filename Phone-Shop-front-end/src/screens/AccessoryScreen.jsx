import { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useGetAccessoryBySlugQuery } from '../slices/accessoriesApiSlice';
import { addToCart } from '../slices/cartSlice';
import { calculateBulkPrice } from '../utils/calculateBulkPrice'
import { toast } from 'react-toastify';
import { FaShoppingCart, FaCheck, FaArrowLeft, FaStar, FaTag } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import Loader from '../components/Loader';
import Message from '../components/Message';
import ProductImageGallery from '../components/ProductImageGallery';
import WishlistButton from '../components/WishlistButton'
import AccessoryReviewSection from '../components/AccessoryReviewSection'

const ACCESSORY_TYPE_LABELS = {
  case: 'Case', charger: 'Charger', cable: 'Cable', glass: 'Glass', audio: 'Audio', holder: 'Holder', other: 'Other'
}

const getTypeColor = (type) => {
  const colors = {
    Charger: 'bg-blue-100 text-blue-700', Cable: 'bg-green-100 text-green-700',
    Audio: 'bg-purple-100 text-purple-700', Holder: 'bg-orange-100 text-orange-700',
    Case: 'bg-pink-100 text-pink-700', Glass: 'bg-gray-100 text-gray-700',
  };
  const label = ACCESSORY_TYPE_LABELS[type] || 'Other';
  return colors[label] || 'bg-gray-100 text-gray-700';
};

const AccessoryScreen = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [qty, setQty] = useState(1);
  const [mainImage, setMainImage] = useState('');
  const [selectedTierQty, setSelectedTierQty] = useState(Number(searchParams.get('tier')) || 1);

  const { data: accessory, isLoading, error } = useGetAccessoryBySlugQuery(slug);

  const hasModels = accessory?.models && accessory.models.length > 0;

  const uniqueModels = useMemo(() => {
    if (!hasModels) return [];
    const map = new Map();
    accessory.models.forEach(m => {
      if (!map.has(m.modelName)) map.set(m.modelName, m);
    });
    return Array.from(map.values());
  }, [accessory, hasModels]);

  const urlModel = searchParams.get('model');
  const urlVariant = searchParams.get('variant');
  const urlVariantSub = searchParams.get('variantSub');
  const urlColor = searchParams.get('color');
  const urlQty = Number(searchParams.get('qty')) || 1;
  const urlTier = Number(searchParams.get('tier')) || 1;

  // 1. Sync from URL when coming back from cart
  useEffect(() => {
    setSelectedTierQty(urlTier);
    setQty(urlQty);
  }, [urlTier, urlQty]);

  // 2. Set default model if none in URL
  useEffect(() => {
    if (!accessory) return;
    if (urlModel && urlVariant) return; // <-- ADD THIS GUARD

    let modelToSet = urlModel;
    let variantToSet = urlVariant;

    if (!modelToSet && !variantToSet) {
      if (hasModels && uniqueModels.length > 0) {
        modelToSet = uniqueModels[0].modelName;
        variantToSet = uniqueModels[0].variants?.[0]?.name || '';
      } else if (accessory.variants?.length > 0) {
        modelToSet = 'Universal';
        variantToSet = accessory.variants[0].name;
      }
    }

    if (modelToSet && modelToSet !== urlModel) {
      const params = new URLSearchParams();
      params.set('model', modelToSet);
      params.set('variant', variantToSet || '');
      params.set('qty', urlQty);
      params.set('tier', urlTier);
      setSearchParams(params);
    }
  }, [accessory, hasModels, uniqueModels, urlModel, urlVariant, urlQty, urlTier, setSearchParams]);

  const selectedModelName = urlModel || '';
  const selectedVariantName = urlVariant || '';

  const selectedModel = useMemo(() => {
    if (!hasModels) return null;
    return uniqueModels.find(m => m.modelName === selectedModelName) || uniqueModels[0] || null;
  }, [uniqueModels, selectedModelName, hasModels]);

  const availableVariants = useMemo(() => {
    if (hasModels) {
      return selectedModel?.variants || [];
    } else {
      return accessory?.variants || [];
    }
  }, [selectedModel, accessory, hasModels]);

  const selectedVariant = useMemo(() => {
    if (!availableVariants.length) return null;
    let foundVariant = null;
    if (urlColor) {
      foundVariant = availableVariants.find(v =>
        v.color?.toLowerCase() === urlColor.toLowerCase() ||
        v.name?.toLowerCase() === urlColor.toLowerCase()
      );
    }
    if (!foundVariant && urlVariantSub) {
      foundVariant = availableVariants.find(v =>
        v.name?.toLowerCase() === urlVariantSub.toLowerCase()
      );
    }
    if (!foundVariant && selectedVariantName) {
      foundVariant = availableVariants.find(v => v.name === selectedVariantName);
    }
    return foundVariant || availableVariants[0] || null;
  }, [availableVariants, selectedVariantName, urlColor, urlVariantSub]);



  const getImageUrls = (images) => {
    if (!images || !Array.isArray(images)) return [];
    return images.map(img => typeof img === 'string' ? img : img?.url || '').filter(Boolean);
  };

  const displayImages = getImageUrls(selectedVariant?.images || accessory?.images || []);
  const modelDescription = selectedModel?.description || accessory?.description || '';

  // SET MAIN IMAGE WHEN VARIANT/IMAGES CHANGE
  useEffect(() => {
    if (displayImages.length > 0) {
      setMainImage(displayImages[0]);
    }
  }, [selectedVariant?.sku]); // <-- only when variant changes



  const modelSpecs = selectedModel?.specs || [];

  const handleModelChange = (modelName) => {
    const newModel = uniqueModels.find(m => m.modelName === modelName);
    if (!newModel) return;

    const modelVariants = newModel.variants || [];
    const firstVariant = modelVariants[0];

    const currentColor = urlColor || selectedVariant?.color || selectedVariant?.name;
    const colorExistsInNewModel = modelVariants.some(v =>
      v.color?.toLowerCase() === currentColor?.toLowerCase() ||
      v.name?.toLowerCase() === currentColor?.toLowerCase()
    );

    const variantToUse = colorExistsInNewModel
      ? modelVariants.find(v =>
        v.color?.toLowerCase() === currentColor?.toLowerCase() ||
        v.name?.toLowerCase() === currentColor?.toLowerCase()
      )
      : firstVariant;

    const params = new URLSearchParams(searchParams);
    params.set('model', modelName);
    params.set('variant', variantToUse?.name || '');
    params.set('variantSub', variantToUse?.name || '');
    params.set('color', variantToUse?.color || variantToUse?.name || '');
    params.set('qty', qty); // CHANGED: Keep current qty
    params.set('tier', selectedTierQty); // CHANGED: Keep current tier
    setSearchParams(params);
    // REMOVED: setQty(1) and setSelectedTierQty(1)
  };

  const handleVariantChange = (variantName) => {
    const selectedV = availableVariants.find(v => v.name === variantName);
    const params = new URLSearchParams(searchParams);
    params.set('variant', variantName);
    params.set('variantSub', variantName);
    if (selectedV?.color) params.set('color', selectedV.color);
    else params.set('color', variantName);

    // KEEP CURRENT QTY - DON'T RESET
    params.set('qty', qty);
    setSearchParams(params);
    // setQty(1); <-- DELETE THIS
  };

  const displayTitle = `${accessory?.name || ''} ${hasModels && selectedModelName ? `for ${selectedModelName}` : ''} ${selectedVariant ? `(${selectedVariant.name})` : ''}`;





  useEffect(() => {
    if (!selectedModel || !selectedVariant) return;
    const colorExists = availableVariants.some(v =>
      v.color?.toLowerCase() === urlColor?.toLowerCase() ||
      v.name?.toLowerCase() === urlColor?.toLowerCase()
    );
    if (urlColor && !colorExists && availableVariants.length > 0) {
      handleVariantChange(availableVariants[0].name);
    }
  }, [selectedModel, urlColor]);



  // === FINAL FIXED ADD TO CART ===
  // const addToCartHandler = () => {
  //   if (!selectedVariant) return toast.error('Please select an option');

  //   const variantColor = selectedVariant.name;
  //   const variantSubType = selectedVariant.name;
  //   const currentModel = selectedModelName || 'Universal';

  //   dispatch(addToCart({
  //     product: accessory._id,
  //     accessory: accessory._id,
  //     name: accessory.name,
  //     slug: accessory.slug,
  //     image: mainImage || displayImages[0] || accessory.image || '/placeholder.jpg',
  //     price: finalPrice,
  //     originalPrice: originalPrice,
  //     discountAmount: discountAmountPerItem,
  //     variantType: 'accessory',
  //     variantName: accessory.accessoryType,
  //     variant: variantSubType,
  //     variantSubName: variantSubType,
  //     color: variantColor,
  //     storage: '',
  //     model: currentModel,
  //     qty: qty,
  //     sku: displaySKU,
  //     countInStock: displayStock,
  //   }));

  //   toast.success('Added to cart');
  //   navigate('/cart');
  // };

  const mainOgImage = displayImages[0] || '/placeholder.jpg'; // For OG image
  const siteUrl = 'https://phone-store.asia'; // <-- put your domain here

  if (isLoading) return <Loader />;
  if (error) return <Message variant='danger'>{error?.data?.message || error.error}</Message>;
  if (!selectedVariant) return <Loader />;

  const originalPrice = Number(selectedVariant.originalPrice || 0); // $9.99
  const discountedPrice = Number(selectedVariant.price || 0); // $8.49
  const displayStock = Number(selectedVariant.countInStock || 0);
  const displaySKU = selectedVariant.sku || '';
  const discount = selectedVariant.discount;
  const isOutOfStock = displayStock <= 0;
  const bulkPricing = selectedVariant.bulkPricing || [];

  const { pricePerItem, totalPrice, appliedTier } = calculateBulkPrice(
    discountedPrice,
    qty,
    bulkPricing
  );

  const bulkPricePerItem = pricePerItem;

  const mainPrice = bulkPricing.length > 0
    ? Number(bulkPricing.find(t => t.qty === 1)?.price || discountedPrice)
    : discountedPrice; // New - reads from tier 1// Always $8.49 for display
  const finalPriceForCart = pricePerItem;


  const originalTotal = (originalPrice * qty).toFixed(2);
  const totalSavings = ((originalPrice - finalPriceForCart) * qty).toFixed(2);
  const mainSavingsPercent = originalPrice > 0 ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100) : 0;
  const bulkSavingsPercent = originalPrice > 0 ? Math.round(((originalPrice - finalPriceForCart) / originalPrice) * 100) : 0;
  const discountAmountPerItem = originalPrice - discountedPrice;

  // === FINAL FIXED ADD TO CART ===
  const addToCartHandler = () => {
    if (!selectedVariant) return toast.error('Please select an option');

    const variantColor = selectedVariant.name;
    const variantSubType = selectedVariant.name;
    const currentModel = selectedModelName || 'Universal';

    dispatch(addToCart({
      product: accessory._id,
      accessory: accessory._id,
      name: accessory.name,
      slug: accessory.slug,
      image: mainImage || displayImages[0] || accessory.image || '/placeholder.jpg',
      price: finalPriceForCart, // <-- KEY: Send bulk price to cart
      originalPrice: originalPrice,
      discountAmount: discountAmountPerItem,
      variantType: 'accessory',
      variantName: accessory.accessoryType,
      variant: variantSubType,
      variantSubName: variantSubType,
      color: variantColor,
      storage: '',
      model: currentModel,
      qty: qty,
      sku: displaySKU,
      countInStock: displayStock,
      bulkPricing: bulkPricing,
    }));

    toast.success('Added to cart');
    navigate('/cart');
  };

  //buy now handler
  const buyNowHandler = () => {
    if (!selectedVariant) return toast.error('Please select an option');

    const variantColor = selectedVariant.name;
    const variantSubType = selectedVariant.name;
    const currentModel = selectedModelName || 'Universal';

    dispatch(addToCart({
      product: accessory._id,
      accessory: accessory._id,
      name: accessory.name,
      slug: accessory.slug,
      image: mainImage || displayImages[0] || accessory.image || '/placeholder.jpg',
      price: finalPriceForCart,
      originalPrice: originalPrice,
      discountAmount: discountAmountPerItem,
      variantType: 'accessory',
      variantName: accessory.accessoryType,
      variant: variantSubType,
      variantSubName: variantSubType,
      color: variantColor,
      storage: '',
      model: currentModel,
      qty: qty,
      sku: displaySKU,
      countInStock: displayStock,
      bulkPricing: bulkPricing,
    }));

    toast.success('Added to cart');
    navigate('/cart'); // Buy Now goes straight to cart
  };

  const typeLabel = ACCESSORY_TYPE_LABELS[accessory?.accessoryType];

  return (
    <div className='container mx-auto px-3 sm:px-4 py-4 sm:py-6'>

      {/* ===== SEO HELMET BLOCK START ===== */}
      {accessory && (
        <Helmet>
          <title>{accessory.metaTitle || displayTitle}</title>
          <meta name="description" content={accessory.metaDescription || `Buy ${displayTitle} at best price`} />
          <meta name="keywords" content={`${accessory.brand}, ${accessory.name}, ${accessory.accessoryType}, ${accessory.category}, ${accessory.keywords?.join(', ')}`} />
          <link rel="canonical" href={`${siteUrl}/accessory/${accessory.slug}`} />

          {/* Open Graph for Facebook/WhatsApp */}
          <meta property="og:type" content="product" />
          <meta property="og:title" content={accessory.name} />
          <meta property="og:description" content={accessory.metaDescription} />
          <meta property="og:image" content={mainOgImage} />
          <meta property="og:url" content={`${siteUrl}/accessory/${accessory.slug}`} />
          <meta property="product:price:amount" content={mainPrice.toFixed(2)} />
          <meta property="product:price:currency" content="USD" />
          <meta property="product:brand" content={accessory.brand} />
          <meta property="product:availability" content={isOutOfStock ? "out of stock" : "in stock"} />

          {/* Twitter Card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={accessory.name} />
          <meta name="twitter:description" content={accessory.metaDescription} />
          <meta name="twitter:image" content={mainOgImage} />
        </Helmet>
      )}
      {/* ===== SEO HELMET BLOCK END ===== */}

      <Link to='/' className='inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 sm:mb-6 font-medium text-sm'>
        <FaArrowLeft /> Go Back
      </Link>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8'>
        {/* LEFT: IMAGES */}
        <div className='lg:col-span-1'>
          <div className='border rounded-xl p-3 sm:p-4 bg-white shadow-sm relative'>
            <div className='absolute top-3 left-3 z-20 flex gap-2 flex-wrap'>
              <span className={`px-2 py-1 text-[10px] font-semibold rounded-full ${getTypeColor(accessory?.accessoryType)}`}>
                {typeLabel}
              </span>
              {/* {Number(totalSavings) > 0 && (
                <p className="text-xs text-red-500 font-semibold">
                  You save ${totalSavings} ({bulkSavingsPercent}%) off ${originalTotal}
                </p>
              )} */}
            </div>

            {/* ===== FIX 1: SOLD OUT BADGE - TOP LEFT + HIGHER Z-INDEX ===== */}
            {isOutOfStock && (
              <div className='absolute top-3 left-3 z-40 flex flex-col gap-2'>
                <span className='px-3 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-md shadow-sm border'>SOLD OUT</span>
              </div>
            )}

            {/* WISHLIST HEART - TOP RIGHT */}
            <div className='absolute top-3 right-3 z-30'>
              <WishlistButton
                type="accessory"
                accessory={accessory}
                modelIndex={hasModels ? uniqueModels.findIndex(m => m.modelName === selectedModelName) : 0}
                accessoryVariantIndex={availableVariants.findIndex(v => v.sku === selectedVariant?.sku || v.name === selectedVariant?.name)}
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-md transition-all duration-200"
                showText={false}
              />
            </div>

             

            <ProductImageGallery
              images={displayImages} // <-- use the variable we already made above
              selectedImage={mainImage}
              onSelectImage={setMainImage}
               isOutOfStock={isOutOfStock}
            />
          </div>
        </div>

        {/* RIGHT: DETAILS */}
        <div className='bg-white p-4 sm:p-6 rounded-xl shadow-sm'>
          <p className='text-xs sm:text-sm text-gray-500 mb-1'>{accessory?.brand} / {typeLabel}</p>
          <h1 className='text-xl sm:text-2xl font-bold mb-3'>{displayTitle}</h1>

          <div className='flex items-center gap-2 mb-4'>
            <div className='flex text-yellow-400 text-sm sm:text-lg'>
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className={i < Math.round(accessory?.rating || 0) ? 'text-yellow-400' : 'text-gray-300'} />
              ))}
            </div>
            <span className='text-sm'>({accessory?.numReviews || 0} reviews)</span>
            <a href="#reviews" className="text-blue-600 text-sm hover:underline">Write a review</a>
          </div>

          {/* PRICE WITH ORIGINAL + CUT PRICE */}
          <div className='mb-4'>
            <div className='flex items-center gap-3 mb-1 flex-wrap'>
              <h2 className='text-2xl sm:text-3xl text-green-600 font-bold'>${mainPrice.toFixed(2)}</h2>
              {originalPrice > mainPrice && (
                <span className='text-sm sm:text-lg text-gray-400 line-through'>${originalPrice.toFixed(2)}</span>
              )}
              {discount?.isActive && mainSavingsPercent > 0 && (
                <span className='px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded flex items-center gap-1'>
                  <FaTag />-{mainSavingsPercent}%
                </span>
              )}
            </div>

            <p className="text-lg font-bold text-green-600">
              Estimated Total: ${totalPrice}
            </p>

            {Number(totalSavings) > 0 && (
              <p className="text-xs text-red-500 font-semibold">
                You save ${totalSavings} ({bulkSavingsPercent}%) off ${originalTotal}
              </p>
            )}

            <p className='text-xs text-gray-500 mt-1'>per item for qty {qty}</p>
            <p className='text-xs text-gray-400 mt-1'>SKU: {displaySKU}</p>
          </div>

          <div className='mb-5'>
            {displayStock > 0 ? <span className='text-green-600 flex items-center gap-1 text-sm'><FaCheck /> In Stock ({displayStock})</span> : <span className='text-red-600 text-sm'>Out Of Stock</span>}
          </div>

          {/* MODEL SELECTOR */}
          {hasModels && uniqueModels.length > 1 && (
            <div className='mb-5'>
              <p className='font-semibold mb-3 text-sm'>Select Model:</p>
              <div className='flex flex-wrap gap-2'>
                {uniqueModels.map((model) => (
                  <button
                    key={model.modelName}
                    onClick={() => handleModelChange(model.modelName)}
                    className={`px-3 py-2 border-2 rounded-lg text-xs sm:text-sm transition ${selectedModelName === model.modelName ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}
                  >
                    {model.modelName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* VARIANT SECTION */}
          <div className='mb-4'>
            <label className='block text-sm font-medium mb-2'>{hasModels ? 'Choose Color' : 'Choose Option'}</label>
            <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3'>
              {availableVariants.map((v) => {
                const { pricePerItem: vFinalPrice, appliedTier: vAppliedTier } = calculateBulkPrice(
                  Number(v.price || 0), // basePrice = db price
                  qty,
                  v.bulkPricing || []
                )
                const isVariantOut = Number(v.countInStock) <= 0;
                const vOriginalPrice = Number(v.originalPrice || 0);
                const hasDiscount = vOriginalPrice > vFinalPrice;

                return (
                  <button
                    key={v.sku}
                    onClick={() => handleVariantChange(v.name)}
                    className={`border-2 rounded-lg p-2 transition relative
        ${selectedVariant?.sku === v.sku || selectedVariant?.name === v.name ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200'}
        ${isVariantOut ? 'opacity-50 grayscale' : 'hover:border-gray-400'}`}
                  >
                    {isVariantOut && <span className='absolute -top-1 -right-1 bg-red-500 text-white text-[9px] px-1 py-0.5 rounded-full font-semibold'>OUT</span>}
                    <img src={v.images?.[0]?.url || '/placeholder.jpg'} className='w-full h-12 sm:h-16 object-contain mb-1' alt={v.name} />
                    {v.colorHex && <div className='w-4 h-4 rounded-full mx-auto mb-1 border' style={{ backgroundColor: v.colorHex }} />}
                    <p className='text-center text-xs font-medium truncate'>{v.name}</p>
                    <div className='text-center'>
                      <p className='text-[11px] font-bold text-green-600'>${vFinalPrice.toFixed(2)}</p>
                      {hasDiscount && <p className='text-[9px] text-gray-400 line-through'>${vOriginalPrice.toFixed(2)}</p>}
                    </div>
                    {isVariantOut && <p className='text-center text-[9px] text-red-500 font-bold'>0 Stock</p>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* BULK PRICING TIERS */}
          {displayStock > 0 && bulkPricing.length > 1 && (() => {
            const sortedTiers = [...bulkPricing].sort((a, b) => a.qty - b.qty);
            // Find which tier we should highlight based on saved tier, fallback to qty
            const tierToHighlight = sortedTiers.find(t => t.qty === selectedTierQty)
              || [...sortedTiers].reverse().find(t => qty >= t.qty)
              || sortedTiers[0];

            return (
              <div className='mb-4 p-3 bg-purple-50 rounded-lg'>
                <p className='text-sm font-semibold mb-2 text-purple-800'>Bulk Pricing - Save more:</p>
                <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
                  {sortedTiers.map((tier) => {
                    const isActive = tierToHighlight.qty === tier.qty;

                    const { pricePerItem: tierFinalPrice, totalPrice: tierTotal } = calculateBulkPrice(
                      Number(tier.price || 0),
                      Number(tier.qty),
                      []
                    )

                    return (
                      <button
                        key={tier.qty}
                        onClick={() => {
                          setQty(tier.qty);
                          setSelectedTierQty(tier.qty);
                          const params = new URLSearchParams(searchParams);
                          params.set('qty', tier.qty);
                          params.set('tier', tier.qty);
                          setSearchParams(params);
                        }}
                        className={`border-2 rounded-lg p-2 text-center transition ${isActive ? 'border-purple-600 bg-white shadow-sm ring-2 ring-purple-200' : 'border-purple-200 hover:border-gray-300'}`}
                      >
                        <p className='text-xs font-semibold'>Buy {tier.qty}+</p>
                        <p className='text-[11px] font-bold text-purple-700'>${Number(tier.price).toFixed(2)} each</p>
                        <p className='text-[10px] text-gray-500'>Total: ${(Number(tier.price) * Number(tier.qty)).toFixed(2)}</p>
                        {tier.discountLabel && <p className='text-[10px] text-red-500 font-medium mt-1'>{tier.discountLabel}</p>}
                      </button>
                    )
                  })}
                </div>
                <p className='text-[10px] text-gray-500 mt-2'>*Add to cart to get exact bulk price for selected qty</p>
              </div>
            )
          })()}

          {/* QTY SELECTOR */}
          {displayStock > 0 && (
            <div className='mb-4'>
              <label className='block text-sm font-medium mb-1'>Quantity</label>
              <select
                value={qty}
                onChange={(e) => {
                  const newQty = Number(e.target.value);
                  setQty(newQty);
                  setSelectedTierQty(newQty);
                  const params = new URLSearchParams(searchParams);
                  params.set('qty', newQty);
                  params.set('tier', newQty);
                  setSearchParams(params);
                }}
                className='border-2 rounded-lg p-2 w-full text-sm'
              >
                {[...Array(Math.min(displayStock, 20)).keys()].map(x => <option key={x + 1} value={x + 1}>{x + 1}</option>)}
              </select>
              <p className='text-sm font-bold text-green-600 mt-2'>Estimated Total: ${totalPrice}</p>
            </div>
          )}

          
          {/* ADD TO CART + BUY NOW */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={addToCartHandler}
              disabled={displayStock === 0}
              className='flex-1 bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed text-base transition active:scale-95'
            >
              <FaShoppingCart /> {isOutOfStock ? 'Out of Stock' : 'Add To Cart'}
            </button>

            <button
              onClick={buyNowHandler}
              disabled={displayStock === 0}
              className='flex-1 bg-[#111827] hover:bg-black text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed text-base transition active:scale-95'
            >
              {isOutOfStock ? 'Out of Stock' : 'Buy Now'}
            </button>
          </div>
        </div>
      </div>

      {/* SPECS + DESCRIPTION */}
      <div className='mt-6 sm:mt-5 grid grid-cols-1 lg:grid-cols-1 gap-4 sm:gap-6'>
       
        <div className='bg-white p-4 sm:p-6 rounded-xl shadow-sm'>
          <h3 className='font-bold text-base sm:text-lg mb-4'>Specifications</h3>
          {modelSpecs.length > 0 ? (
            <div className='divide-y divide-gray-200'>
              {modelSpecs.map((s, i) => (
                <div key={s.key + i} className='flex flex-col sm:flex-row sm:justify-between py-2 sm:py-3 text-sm gap-1'>
                  <span className='text-gray-600 font-medium'>{s.key}</span>
                  <span className='text-gray-900 sm:text-right'>{s.value}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400 text-sm">No specifications added</p>}
        </div>
         <div className='bg-white p-4 sm:p-6 rounded-xl shadow-sm'>
          <h3 className='font-bold text-base sm:text-lg mb-4'>Description</h3>
          <p className='text-gray-700 leading-relaxed text-sm whitespace-pre-line'>{modelDescription}</p>
        </div>
      </div>

      {/* V33.80 KEY: REVIEWS SECTION */}
      <AccessoryReviewSection accessory={accessory} />

    </div>
  );
};

export default AccessoryScreen;