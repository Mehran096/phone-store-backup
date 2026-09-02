import { useState, useEffect } from 'react'
import { FaTimes, FaShoppingCart, FaChevronLeft, FaChevronRight, FaSpinner } from 'react-icons/fa' // <-- added arrows
import { Link, useNavigate } from 'react-router-dom'
import WishlistButton from './WishlistButton'

const COLOR_MAP = {
  'black': '#000', 'white': '#FFFFFF', 'red': '#EF4444', 'blue': '#3B82F6',
  'green': '#22C55E', 'mint breeze': '#A7F3D0', 'midnight': '#1F2937',
  'silver': '#E5E7EB', 'gold': '#FCD34D', 'purple': '#A855F7', 'pink': '#EC4899',
  'gray': '#6B7280', 'grey': '#6B7280', 'navy': '#1E3A8A', 'orange': '#F97316', 'yellow': '#FACC15'
}

const QuickViewModal = ({ product, onClose, onAddToCart }) => {
  if (!product) return null

  const firstVariant = product.variants?.[0]
  const firstColor = firstVariant?.colors?.[0]

  const [selectedStorage, setSelectedStorage] = useState(firstVariant?.storage)
  const [selectedColor, setSelectedColor] = useState(firstColor)
  const [currentImageIndex, setCurrentImageIndex] = useState(0) // <-- NEW: for slider
  const [imageLoading, setImageLoading] = useState(true)
  const [isZoomed, setIsZoomed] = useState(false)
  const [prevImageUrls, setPrevImageUrls] = useState('');

  const selectedVariant = product.variants?.find(v => v.storage === selectedStorage) || firstVariant

  const navigate = useNavigate()

const handleViewFullDetails = () => {
  const productSlug = product.slug || product._id
  const color = selectedColor?.name || ''
  const storage = selectedStorage || ''
  
  onClose() // close modal first
  navigate(`/product/${productSlug}?color=${encodeURIComponent(color)}&storage=${encodeURIComponent(storage)}`)
}

  // Keep same color when changing storage if available
  useEffect(() => {
    const sameColorInNewVariant = selectedVariant?.colors?.find(
      c => c.name === selectedColor?.name
    )
    setSelectedColor(sameColorInNewVariant || selectedVariant?.colors?.[0])
  }, [selectedStorage, selectedVariant])

  // Reset image index when color changes
  useEffect(() => {
    setCurrentImageIndex(0)
  }, [selectedColor])

  // // Reset image index + loading when color changes
  // useEffect(() => {
  //   setCurrentImageIndex(0)
  //   setImageLoading(true) // <-- start loading
  // }, [selectedColor])

  // // Also reset loading when storage changes images
  // useEffect(() => {
  //   setImageLoading(true)
  // }, [selectedVariant])





  const selectedColorData = selectedVariant?.colors?.find(c => c.name === selectedColor?.name) || firstColor
  const productImages = selectedColorData?.images || [{ url: '/images/placeholder-phone.jpg' }] // <-- ALL IMAGES

  const selectedImage = productImages[currentImageIndex]?.url || '/images/placeholder-phone.jpg'
  const selectedPrice = Number(selectedColorData?.price || 0)
  const countInStock = Number(selectedColorData?.countInStock ?? selectedVariant?.countInStock ?? 0)

  const spinnerColor = selectedColorData?.hexCode || COLOR_MAP[selectedColor?.name?.toLowerCase()] || '#3B82F6'

  const isOutOfStock = countInStock === 0

  const discount = selectedColorData?.discount
  const isDiscountActive = discount?.isActive && discount?.value > 0

  const discountPrice = isDiscountActive
    ? discount.type === 'percentage'
      ? selectedPrice - (selectedPrice * discount.value / 100)
      : selectedPrice - discount.value
    : selectedPrice

  const youSave = selectedPrice - discountPrice

  // Slider functions
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length)
  }
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length)
  }

  // Touch swipe for mobile
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [isPaused, setIsPaused] = useState(false) // <-- for pause on hover/drag

  const minSwipeDistance = 50

  const onTouchStart = (e) => {
    setIsPaused(true) // <-- pause when user touches
    setIsDragging(true)
    setTouchEnd(null)
    setTouchStart(e.touches ? e.touches[0].clientX : e.clientX)
  }

  const onTouchMove = (e) => {
    if (!isDragging) return
    const currentX = e.touches ? e.touches[0].clientX : e.clientX
    setTouchEnd(currentX)
    setDragOffset(currentX - touchStart)
  }

  const onTouchEnd = () => {
    setIsDragging(false)
    setTimeout(() => setIsPaused(false), 2000) // <-- resume 2s after swipe

    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) nextImage()
      else prevImage()
    }
    setDragOffset(0)
  }

  useEffect(() => {
  // Only compare the actual URLs, not array reference
  const currentUrls = productImages.map(img => img.url).join(',')
  const urlsChanged = currentUrls!== prevImageUrls
  
  if (urlsChanged && productImages.length > 0) {
    setImageLoading(true);
    setCurrentImageIndex(0);
    setPrevImageUrls(currentUrls);
    
    // SAFETY NET: Force stop after 600ms even if onLoad doesn't fire
    const timeout = setTimeout(() => setImageLoading(false), 600)
    return () => clearTimeout(timeout)
  } else {
    setImageLoading(false) // Same images = stop loading immediately
  }
}, [productImages])

  // Autoplay
  useEffect(() => {
    if (productImages.length <= 1 || isPaused) return

    const interval = setInterval(() => {
      nextImage()
    }, 3000) // 3 seconds

    return () => clearInterval(interval)
  }, [currentImageIndex, productImages.length, isPaused])

  useEffect(() => {
  document.body.style.overflow = 'hidden'
  return () => {
    document.body.style.overflow = 'unset'
  }
}, [])



  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">{product.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={24} />
          </button>
        </div>

        <div className="p-6 grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image with Slider */}
          <div
            className="relative overflow-hidden select-none bg-gray-50 rounded-xl cursor-zoom-in" // <-- added bg + cursor
            
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseDown={onTouchStart}
            onMouseMove={onTouchMove}
            onMouseUp={onTouchEnd}
            onMouseLeave={(e) => { onTouchEnd(); setIsPaused(false) }}
            onMouseEnter={() => setIsPaused(true)} // <-- PAUSE
            
          >
            {/* THIS IS WHERE WE SET THE STYLE of smoothly swipe*/}
            {/* Loading Skeleton + Spinner */}
            {imageLoading && (
              <div className="absolute inset-0 w-full h-80 bg-gray-200 animate-pulse rounded-xl z-10 flex items-center justify-center">
                <FaSpinner
                  className="animate-spin text-2xl"
                  style={{ color: spinnerColor }} // <-- dynamic color
                />
              </div>
            )}

            <div
              className="flex"
              style={{
                transform: `translateX(calc(-${currentImageIndex * 100}% + ${dragOffset}px))`,
                transition: isDragging ? 'none' : 'transform 300ms ease-out',
                opacity: imageLoading ? 0 : 1
              }}
            >
            
              {productImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img.url}
                  alt={product.name}
                  loading={idx === 0 ? "eager" : "lazy"} // first image loads fast, rest lazy
                  onClick={() => setIsZoomed(true)} // <-- OPEN ZOOM
                  className="w-full pt-2 h-80 object-contain rounded-xl flex-shrink-0"
                  draggable={false}
                  onLoad={() => setImageLoading(false)}
                  onError={() => setImageLoading(false)}
                />
              ))}
            </div>

            {/* Arrows - Desktop */}
            {productImages.length > 1 && (
              <div className="hidden md:block">
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow z-10"
                >
                  <FaChevronLeft />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow z-10"
                >
                  <FaChevronRight />
                </button>
              </div>
            )}

            {productImages.length > 1 && (
              <div className="flex justify-between items-center mt-3 px-2">
                {/* Counter */}
                <span className="text-sm text-gray-500 font-medium">
                  {currentImageIndex + 1} / {productImages.length}
                </span>

                {/* Dots */}
                <div className="flex justify-center gap-2">
                  {productImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${currentImageIndex === idx ? 'bg-blue-600 w-4' : 'bg-gray-300'
                        }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-sm text-gray-500 mb-2">{product.brand}</p>

            <div className="mb-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-3xl font-bold">${discountPrice.toFixed(2)}</span>
                {isDiscountActive && (
                  <span className="text-lg line-through text-gray-400">${selectedPrice.toFixed(2)}</span>
                )}
                {isDiscountActive && (
                  <span className="bg-red-500 text-white text-sm px-2 py-1 rounded">-{discount.value}%</span>
                )}
              </div>
              {isDiscountActive && (
                <p className="text-green-600 text-sm mt-1 font-semibold">You save ${youSave.toFixed(2)}</p>
              )}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-yellow-500">★</span>
              <span className="font-semibold">{product.rating?.toFixed(1) || 0}</span>
              <span className="text-gray-500 text-sm">({product.numReviews} reviews)</span>
            </div>

            {/* Storage Selection */}
            {product.variants?.length > 1 && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Storage: {selectedStorage}</p>
                <div className="flex gap-2 flex-wrap">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.storage}
                      onClick={() => setSelectedStorage(variant.storage)}
                      className={`px-4 py-2 border-2 rounded-lg text-sm font-semibold transition ${selectedStorage === variant.storage
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-300 hover:border-gray-500'
                        }`}
                    >
                      {variant.storage}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Status */}
            <div className="mb-4">
              {isOutOfStock ? (
                <span className="inline-block bg-red-100 text-red-700 text-sm font-semibold px-3 py-1 rounded-full">
                  Out of Stock
                </span>
              ) : (
                <span className="inline-block bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full">
                  In Stock: {countInStock}
                </span>
              )}
            </div>

            {/* Color Selection */}
            {selectedVariant?.colors?.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Color: {selectedColor?.name}</p>
                <div className="flex gap-2 flex-wrap">
                  {selectedVariant.colors.map((color) => {
                    const bgColor = color.hexCode || COLOR_MAP[color.name.toLowerCase()] || '#9CA3AF'
                    return (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full border-2 transition ${selectedColor?.name === color.name
                          ? 'border-blue-600 ring-2 ring-blue-300'
                          : 'border-gray-300 hover:border-gray-500'
                          }`}
                        style={{ backgroundColor: bgColor }}
                        title={color.name}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mb-6">
              <button
                disabled={isOutOfStock}
                onClick={() => {
                  onAddToCart({
                    product: product,
                    variant: selectedVariant,
                    color: selectedColorData,
                    qty: 1
                  });
                  onClose()
                }}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${isOutOfStock
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
              >
                <FaShoppingCart /> {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>

              <div className="w-12 h-12 flex-shrink-0">
                <WishlistButton
                  product={product}
                  selectedColor={selectedColorData?.name}
                  selectedStorage={selectedStorage}
                  selectedPrice={discountPrice}
                  selectedImage={selectedImage}
                  countInStock={countInStock}
                  className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-xl bg-white hover:bg-gray-50 transition"
                  showText={false}
                />
              </div>
            </div>

            <button 
  onClick={handleViewFullDetails}
  className="text-blue-600 hover:text-blue-800 underline text-sm mt-2 block"
>
  View Full Details →
</button>
          </div>
          {/* Zoom Lightbox */}
          {/* Zoom Lightbox - FINAL FIX */}
          {isZoomed && (
            <div
              className="fixed inset-0 bg-white z-[999] flex items-center justify-center" // <-- z-[999] to be on absolute top
              //onClick={() => setIsZoomed(false)}
              onTouchStart={onTouchStart} 
              onTouchMove={onTouchMove} 
              onTouchEnd={onTouchEnd} 
            >
              {/* X Button - FORCED VISIBLE */}
              <button
                className="fixed top-4 right-4 md:top-6 md:right-6 text-gray-900 text-3xl hover:text-black z-[1000] bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md" // <-- fixed + shadow
                onClick={(e) => { e.stopPropagation(); setIsZoomed(false) }}
              >
                <FaTimes />
              </button>

              {/* Image container - REDUCED SPACING */}
              <div className="relative w-full h-full flex items-center justify-center p-1 md:p-4">
                <div className="relative max-w-3xl max-h-[65vh] md:max-h-[80vh] w-full h-full flex items-center justify-center overflow-hidden"> {/* ✅ overflow-hidden is key */}
                  
                  {/* THE TRACK - COPY OF PRODUCT360 */}
                  <div 
                    className="flex w-full h-full"
                    style={{
                      transform: `translateX(calc(-${currentImageIndex * 100}% + ${dragOffset}px))`,
                      transition: isDragging? 'none' : 'transform 300ms ease-out',
                    }}
                    onTouchStart={(e) => { e.stopPropagation(); onTouchStart(e) }}
                    onTouchMove={(e) => { e.stopPropagation(); onTouchMove(e) }}
                    onTouchEnd={(e) => { e.stopPropagation(); onTouchEnd() }}
                    onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e) }}
                    onMouseMove={(e) => { e.stopPropagation(); onMouseMove(e) }}
                    onMouseUp={(e) => { e.stopPropagation(); onMouseUp(e) }}
                    onMouseLeave={(e) => { e.stopPropagation(); onMouseUp(e) }}
                    onMouseLeave={(e) => { onTouchEnd(); setIsPaused(false) }}
                    onMouseEnter={() => setIsPaused(true)} // <-- PAUSE
                  >
                    {productImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={img.url}
                        alt={product.name}
                        className="w-full h-full object-contain flex-shrink-0"  
                        draggable={false}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ))}
                  </div>
 

               {/* Arrows - DESKTOP ONLY */}
      {/* Arrows - NOW OUTSIDE THE IMAGE BOX */}
         {/* Arrows - OUTSIDE overflow-hidden */}
{productImages.length > 1 && (
  <>
    <button
      onClick={prevImage}
      className="hidden md:flex fixed left-8 lg:left-16 top-1/2 -translate-y-1/2 z-[10000] 
        bg-white hover:bg-gray-100 text-black p-4 rounded-full 
        shadow-2xl border-gray-200 transition-all"
      aria-label="Previous image"
    >
      <FaChevronLeft size={24} />
    </button>
    
    <button
      onClick={nextImage}
      className="hidden md:flex fixed right-8 lg:right-16 top-1/2 -translate-y-1/2 z-[10000] 
        bg-white hover:bg-gray-100 text-black p-4 rounded-full 
        shadow-2xl border-gray-200 transition-all"
      aria-label="Next image"
    >
      <FaChevronRight size={24} />
    </button>
  </>
)}
                </div>

                {/* Counter */}
                <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white px-3 py-1 rounded-full text-xs">
                  {currentImageIndex + 1} / {productImages.length}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuickViewModal