import { Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaStar, FaBalanceScale } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect, useMemo, useRef } from 'react';
import { addToCompare, removeFromCompare } from '../slices/compareSlice';
import { addToCart } from '../slices/cartSlice';
import { toast } from 'react-toastify';
import CountdownTimer from './CountdownTimer';

const calculateDiscount = (price, discount = {}) => {
  const now = new Date();
  const { type = "percentage", value = 0, startDate, endDate } = discount;
  const start = startDate? new Date(startDate) : null;
  const end = endDate? new Date(endDate) : null;
  let isActive = Number(value) > 0;
  if (start && now < start) isActive = false;
  if (end && now > end) isActive = false;
  let finalPrice = Number(price);
  let discountAmount = 0;
  if (isActive) {
    if (type === "percentage") discountAmount = (price * Number(value)) / 100;
    else if (type === "fixed") discountAmount = Number(value);
    finalPrice = Math.max(0, price - discountAmount);
  }
  return { isActive, discountAmount, finalPrice };
};

const Product = ({ product, userInfo, hideCompare = false, fromRecent = false, showDiscountBadge = false}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
   const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedStorageIndex, setSelectedStorageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const loadingTimeoutRef = useRef(null);
  const { products: compareProducts } = useSelector((state) => state.compare);
  const activeCompareProducts = compareProducts.filter(Boolean);
  const isCompared = activeCompareProducts.some((item) => item?._id === product._id);

  const isFlat =!product.variants

  const selectedVariant = isFlat? null : product.variants?.[selectedStorageIndex] || product.variants?.[0];
  const firstVariantFirstColor =!isFlat? product.variants?.[0]?.colors?.[0] : null;

 const allVariantColors = useMemo(() => {
  if (isFlat) return [];
  return selectedVariant?.colors || []; // sirf current storage ke colors
}, [selectedVariant, isFlat]);

  const variantColors = useMemo(() => {
  if (isFlat) return [];
  const colors = selectedVariant?.colors || [];
  if (showDiscountBadge) {
    return colors.filter(c => calculateDiscount(c.price, c.discount).isActive);
  }
  return colors;
}, [selectedVariant, showDiscountBadge, isFlat]);
 
// 1. ONLY RUN ONCE: Auto select for Deals + Recent
useEffect(() => {
  if (!product.variants) return;

  if (fromRecent && product.storage && product.color) {
    // RECENT
    const sIdx = product.variants.findIndex(v => v.storage === product.storage);
    const cIdx = product.variants[sIdx]?.colors?.findIndex(c => c.name === product.color);
    setSelectedStorageIndex(sIdx!== -1? sIdx : 0);
    setSelectedColorIndex(cIdx!== -1? cIdx : 0);
  } 
  else if (showDiscountBadge) {
    // DEALS: Find first storage+color with active discount
    for(let sIdx = 0; sIdx < product.variants.length; sIdx++) {
      const variant = product.variants[sIdx];
      const cIdx = variant.colors?.findIndex(c => calculateDiscount(c.price, c.discount).isActive);
      if (cIdx!== -1 && cIdx!== undefined) {
        setSelectedStorageIndex(sIdx);
        setSelectedColorIndex(cIdx);
        return;
      }
    }
  }
}, [product._id, showDiscountBadge, fromRecent, product.storage, product.color, product.variants]) // REMOVED selectedStorageIndex

 // 2. STORAGE CHANGE: Auto select first IN-STOCK color of that storage
// useEffect(() => {
//   if (!showDiscountBadge &&!fromRecent && selectedVariant) {
//     const firstInStockIdx = selectedVariant.colors?.findIndex(c => c.countInStock > 0);
//     if (firstInStockIdx!== -1 && firstInStockIdx!== undefined) {
//       setSelectedColorIndex(firstInStockIdx);
//     }
//   }
// }, [selectedStorageIndex, selectedVariant, showDiscountBadge, fromRecent])

useEffect(() => {
  return () => clearTimeout(loadingTimeoutRef.current);
}, [])


 const currentColor = isFlat? null : selectedVariant?.colors?.[selectedColorIndex] || selectedVariant?.colors?.[0] || null;

  // KEY FIX: Handle old recent items that have no variants
  let priceSourceColor;
  if (isFlat) {
    priceSourceColor = null;
  } else if (fromRecent) {
    const recentVariant = product.variants?.find(v => v.storage === product.storage);
    priceSourceColor = recentVariant?.colors?.find(c => c.name === product.color) || { 
      price: product.price, 
      discount: product.discount,
      images: [{url: product.image}]
    };
  } else {
    priceSourceColor = showDiscountBadge? currentColor : (currentColor || firstVariantFirstColor);
  }

  const mainImage = isFlat? product.image : fromRecent? (priceSourceColor?.images?.[0]?.url || product.image || '/images/placeholder-phone.jpg') : (currentColor?.images?.[0]?.url || firstVariantFirstColor?.images?.[0]?.url || '/images/placeholder-phone.jpg')

  const { isActive, discountAmount, finalPrice } = isFlat? { isActive: false, discountAmount: 0, finalPrice: product.price } : calculateDiscount(priceSourceColor?.price || product.price, priceSourceColor?.discount);

  const mainPrice = isFlat? product.price : finalPrice;
  const mainOriginalPrice = isFlat? product.originalPrice : priceSourceColor?.price || product.price;
  const discountPercent = isActive? priceSourceColor?.discount?.value : 0;

  const mainPriceFormatted = mainPrice? Number(mainPrice).toLocaleString('en-US') : '0';
  const mainOriginalPriceFormatted = mainOriginalPrice? Number(mainOriginalPrice).toLocaleString('en-US') : null;
  const rating = product.rating || 0;
  const numReviews = product.numReviews || 0;

  //add to cart
  const addToCartHandler = () => {
    if (isFlat ||!currentColor) {
      toast.error('Please select options');
      return;
    }
    if (currentColor.countInStock === 0) {
      toast.error('Out of stock');
      return;
    }

    const price = Number(currentColor.price || 0);
   const { isActive: isDiscountActive, finalPrice: cartFinalPrice, discountAmount: cartDiscountAmount } =
    calculateDiscount(price, currentColor.discount);

    const imageUrl = currentColor?.images?.[0]?.url || product.image || '/images/placeholder-phone.jpg';

    dispatch(addToCart({
      product: product._id,
      name: product.name,
      slug: product.slug,
      image: imageUrl,
      price: isDiscountActive? cartFinalPrice : price,
      originalPrice: price,
      discountAmount: cartDiscountAmount,
      discount: currentColor.discount,
      variantType: 'phone',
      variantName: selectedVariant.storage,
      variantSubName: selectedVariant.storage,
      model: product.name,
      color: currentColor.name,
      storage: selectedVariant.storage,
      countInStock: currentColor.countInStock,
      qty: 1,
    }));

    toast.success(`${product.name} - ${selectedVariant.storage} added to cart`);
    // navigate('/cart') // 👈 if you want to go to cart then uncomment this line
  }


 const productUrl = useMemo(() => {
  const baseUrl = `/product/${product.slug}`;

  // KEY FIX: Don't use isFlat for recent. Recent always has storage+color
  if (fromRecent && product.color && product.storage) {
    return `${baseUrl}?storage=${encodeURIComponent(product.storage)}&color=${encodeURIComponent(product.color)}`
  }

  if (isFlat) return baseUrl;
  
  const storage = selectedVariant?.storage || ''
  const color = currentColor?.name || ''
  return storage && color ? `${baseUrl}?storage=${encodeURIComponent(storage)}&color=${encodeURIComponent(color)}` : baseUrl
}, [product.slug, fromRecent, product.storage, product.color, isFlat, selectedVariant, currentColor]);

  return (
    <div key={product._id} className='bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden border-gray-100 group relative flex flex-col justify-between h-full'>
      {userInfo && userInfo.isAdmin && (
        <Link to={`/admin/product/${product._id}/edit`} className='absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-sm text-gray-700 p-1.5 rounded-full hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity'>
          <FaEdit size={12} />
        </Link>
      )}

      {!hideCompare && (
        <button type="button" className={`absolute z-10 flex items-center justify-center w-7 h-7 lg:w-9 lg:h-9 rounded-full border shadow transition-all top-1 left-1 lg:top-3 lg:left-3 ${isCompared? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:text-white hover:border-blue-600"}`}
          title="Compare"
          onClick={(e) => {
            e.preventDefault(); e.stopPropagation();
            const maxCompare = window.innerWidth < 1024? 2 : 4;
            if (isCompared) dispatch(removeFromCompare(product._id));
            else {
              if (activeCompareProducts.length >= maxCompare) { toast.warning(`You can compare up to ${maxCompare} phones only.`); return; }
              dispatch(addToCompare({
                _id: product._id, slug: product.slug, name: product.name, brand: product.brand,
                defaultImage: mainImage,
                defaultPrice: mainPrice, rating: product.rating, numReviews: product.numReviews,
                defaultStorage: fromRecent? product.storage : selectedVariant?.storage || "", 
                defaultColor: fromRecent? product.color : currentColor?.name || firstVariantFirstColor?.name || "",
                specs: selectedVariant?.specs || {}, variants: product.variants || [],
              }));
              toast.success("Added to compare");
            }
          }}>
          <FaBalanceScale size={18} className={isCompared? "text-white" : "text-gray-700"} />
        </button>
      )}

      <Link to={productUrl} className='block'>
        <div className='h-32 sm:h-48 overflow-hidden bg-gray-50 flex items-center justify-center relative'>
  {isLoading? (
    <div className='w-full h-full bg-gray-200 animate-pulse' /> // Skeleton
  ) : (
    <img src={mainImage} alt={`${product.name} ${currentColor?.name || firstVariantFirstColor?.name || ''}`}
      className='h-full w-full object-contain p-2 sm:p-3 group-hover:scale-105 transition-transform duration-300'
      loading="lazy" />
  )}

  {discountPercent > 0 && priceSourceColor?.discount?.endDate && (
    <div className="absolute top-24 left-2 lg:top-40 lg:left-2 z-20">
      <CountdownTimer endDate={priceSourceColor.discount.endDate} />
    </div>
  )}
</div>
      </Link>

      <div className='p-3 sm:p-4 lg:p-5 flex flex-col flex-1'>
        <Link to={productUrl} className='block mb-1.5'>
          <h3 className='text-[12px] sm:text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-indigo-600 leading-snug'>{product.name}</h3>
        </Link>

        {numReviews > 0 && (
          <div className='flex items-center gap-1 mb-2 text-xs text-gray-500'>
            <FaStar className='text-yellow-500' size={12} />
            <span className='font-medium text-gray-500'>{rating.toFixed(1)}</span>
            <span>({numReviews})</span>
          </div>
        )}

        {fromRecent && product.storage && product.color && (
          <div className='flex items-center gap-2 mb-2'>
            <span className='text-[11px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded'>{product.storage}</span>
            <span className='text-[11px] text-gray-500'>{product.color}</span>
          </div>
        )}

       {!fromRecent && (showDiscountBadge? variantColors : allVariantColors).length > 0 && (
  <div className='mb-3'>
    <p className='text-[11px] text-gray-500 mb-1.5 font-medium'>
       
      {(showDiscountBadge? variantColors : allVariantColors).filter(c => c.countInStock > 0).length} Color{(showDiscountBadge? variantColors : allVariantColors).filter(c => c.countInStock > 0).length > 1? 's' : ''} Available
    </p>
    <div className='flex flex-wrap gap-2 sm:gap-2.5'>
      
      {(showDiscountBadge? variantColors : allVariantColors)
       .filter(color => color.countInStock > 0)
       .slice(0, 8).map((color) => {
        const actualIdx = allVariantColors.findIndex(c => c.name === color.name);
        const isSelected = selectedColorIndex === actualIdx;

        return (
          <button
            key={color.name}
            type="button"
            onClick={(e) => {
  e.preventDefault();
  e.stopPropagation();
  setIsLoading(true);

  const newColorIndex = allVariantColors.findIndex(c => c.name === color.name);
  setSelectedColorIndex(newColorIndex); // direct set

  clearTimeout(loadingTimeoutRef.current);
  loadingTimeoutRef.current = setTimeout(() => setIsLoading(false), 200);
}}
            className={`relative rounded-full border-2 transition-all duration-200 w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 ${
              isSelected? 'border-gray-900 scale-110 shadow-md ring-2 ring-gray-300 ring-offset-1'
              : 'border-gray-300 hover:border-gray-500 hover:scale-105'
            } cursor-pointer`}
            style={{ backgroundColor: color.hexCode || color.name.toLowerCase() }}
            title={`${color.name} - ${color.countInStock} in stock`}>
            {isSelected && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${color.name.toLowerCase().includes('white')? 'bg-gray-800' : 'bg-white'}`} />
              </span>
            )}
          </button>
        )
      })}
    </div>
  </div>
)}

      {/* CLICKABLE STORAGE OPTIONS */}
{!fromRecent && product.variants && product.variants.length > 1 && (
  <div className='mb-3'>
    <p className='text-[10px] text-gray-500 mb-1 font-medium'>
      {showDiscountBadge 
      ? product.variants.filter(v => v.colors?.some(c => calculateDiscount(c.price, c.discount).isActive)).length 
        : product.variants.length} Storage Options
    </p>
    <div className='flex flex-wrap gap-1.5'>
      {(showDiscountBadge 
      ? product.variants.map((v, i) => ({...v, originalIndex: i})).filter(v => v.colors?.some(c => calculateDiscount(c.price, c.discount).isActive))
        : product.variants.map((v, i) => ({...v, originalIndex: i}))
      ).map((variant) => (
        <button
  key={variant.storage}
  type="button"
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);

    const newStorageIndex = variant.originalIndex;
    const newVariant = product.variants[newStorageIndex];
    setSelectedStorageIndex(newStorageIndex);

    let newColorIndex = 0;

    if(showDiscountBadge) {
      // DEALS LOGIC: Discount + InStock wala color dhoondo
      newColorIndex = newVariant?.colors?.findIndex(c =>
        calculateDiscount(c.price, c.discount).isActive && c.countInStock > 0
      );
      if(newColorIndex === -1 || newColorIndex === undefined) {
        newColorIndex = newVariant?.colors?.findIndex(c => c.countInStock > 0);
      }
    } else {
      // LATEST/NEW/BESTSELLER LOGIC: Sirf pehla InStock
      newColorIndex = newVariant?.colors?.findIndex(c => c.countInStock > 0);
    }

    if(newColorIndex === -1 || newColorIndex === undefined) newColorIndex = 0;
    setSelectedColorIndex(newColorIndex); // FORAN SET

    clearTimeout(loadingTimeoutRef.current);
    loadingTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 200);
  }}
  disabled={!variant.colors?.some(c => c.countInStock > 0)}
  className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-all ${
    selectedStorageIndex === variant.originalIndex
? 'bg-gray-900 text-white border-gray-900'
      : 'bg-gray-100 text-gray-700 border-gray-200 hover:border-gray-400'
  } ${!variant.colors?.some(c => c.countInStock > 0)? 'opacity-40 cursor-not-allowed' : '' }`}
>
  {variant.storage}
</button>
      ))}
    </div>
  </div>
)}

        <div className='mt-auto pt-1'>
  {isLoading? (
    <div className='flex flex-col gap-2'>
      <div className='h-6 w-24 bg-gray-200 rounded animate-pulse' />  
      <div className='h-4 w-16 bg-gray-200 rounded animate-pulse' />  
    </div>
  ) : mainPrice? (
    
    <div className='flex items-baseline gap-1 sm:gap-2 flex-wrap sm:min-h-[48px]'>
      {discountPercent > 0 && Number(mainOriginalPrice) > Number(mainPrice)? (
        <><p className='text-lg sm:text-2xl font-bold text-gray-900 leading-none'>${mainPriceFormatted}</p><p className='text-sm line-through text-gray-500'>${mainOriginalPriceFormatted}</p><span className='text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-semibold'>{discountPercent}% OFF</span><p className='text-xs text-green-600 mt-0.5 w-full pb-2'>You save ${discountAmount.toFixed(2)}</p></>
      ) : (
        <>{!showDiscountBadge &&!fromRecent && (product.variants?.length > 1 || allVariantColors.length > 1) && (<span className='text-[10px] uppercase tracking-wider text-gray-500 font-medium pb-2'>Starting at</span>)}<p className='text-lg sm:text-2xl font-bold text-gray-900 leading-none'>${mainPriceFormatted}</p></>
      )}
    </div>
  ) : (<p className='text-sm text-gray-400 font-medium'>Contact</p>)}
</div>
 
{/* FOOTER BUTTON SECTION */}
{!isFlat &&!fromRecent && (
  <div className='px-2 sm:px-3 lg:px-4 pb-2 sm:pb-3 lg:pb-4 pt-0 mt-auto'>  
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCartHandler();
      }}
      disabled={!currentColor || currentColor.countInStock === 0}
      className='w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-black font-semibold
      text-sm sm:text-base  
      py-2 sm:py-2.5 
      px-3 sm:px-4
      rounded-md sm:rounded-lg 
      transition-colors duration-200 shadow-sm
      h-[38px] sm:h-[44px]' 
    >
      Add to Cart
    </button>
  </div>
)}
      </div>
    </div>
  );
};
export default Product;