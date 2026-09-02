import { useState, useEffect, useRef, useCallback } from 'react'
import { FaChevronLeft, FaChevronRight, FaTimes, FaBan } from 'react-icons/fa'

const Product360 = ({
  images,
  selectedIndex,
  setSelectedIndex,
  isImageFullscreen,
  setIsImageFullscreen,
  stock,
  color,
  slideDirection,
  setSlideDirection,

}) => {
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [isImgLoading, setIsImgLoading] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [currentColor, setCurrentColor] = useState(color)

  const desktopThumbRef = useRef(null)
  const mobileThumbRef = useRef(null)

  //THESE FOR MODAL
  const modalDesktopThumbRef = useRef(null)
  const modalMobileThumbRef = useRef(null)

  const minSwipeDistance = 50

  // NO LOADING SPINNER - just fade + slide for desktop arrows next & prev
  const nextImage = () => {
    setSlideDirection('right')
    setSelectedIndex((prev) => (prev + 1) % images.length) // LOOP
  }

  const prevImage = () => {
    setSlideDirection('left')
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length) // LOOP
  }

  // Mobile swipe
  //   const nextImageTouch = () => {  
  //   if (selectedIndex === images.length - 1) return;
  //   setSlideDirection('left') // slide left - KEEP THIS, touch works

  //     setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : prev))

  // }
  // Mobile swipe - WITH LOOP
  const nextImageTouch = () => {
    setSlideDirection('left') // slide left
    setSelectedIndex((prev) => (prev + 1) % images.length) // LOOP
  }

  // const prevImageTouch = () => {  
  //   if (selectedIndex === 0) return;
  //   setSlideDirection('right') // slide right - KEEP THIS, touch works

  //     setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))

  // }
  const prevImageTouch = () => {
    setSlideDirection('right') // slide right
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length) // LOOP
  }

  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX)

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    if (distance > minSwipeDistance) nextImageTouch()
    if (distance < -minSwipeDistance) prevImageTouch()
  }

  // Reset slideDirection after animation so image returns to center
  // Reset slideDirection instantly after animation
  useEffect(() => {
    if (slideDirection !== 'center') {
      // Use requestAnimationFrame instead of 220ms timeout
      const id = requestAnimationFrame(() => {
        setSlideDirection('center')
      })
      return () => cancelAnimationFrame(id)
    }
  }, [slideDirection])

  // Lock body scroll when fullscreen open
  useEffect(() => {
    if (isImageFullscreen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isImageFullscreen])

  // Desktop keyboard + ESC for fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') prevImage()
      if (e.key === 'ArrowRight') nextImage()
      if (e.key === 'Escape') setIsImageFullscreen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIndex, isImageFullscreen])



  // Auto scroll thumbnails when main image changes
  const scrollThumbsToIndex = useCallback((index, dRef, mRef) => {
    const doScroll = (isSmooth) => { // <-- ADD PARAM
      // DESKTOP
      const dContainer = dRef.current
      if (dContainer) {
        const activeThumb = dContainer.children[index]
        if (activeThumb) {
          const containerRect = dContainer.getBoundingClientRect()
          const thumbRect = activeThumb.getBoundingClientRect()
          const offset = thumbRect.top - containerRect.top - (containerRect.height / 2) + (thumbRect.height / 2)
          dContainer.scrollTo({
            top: dContainer.scrollTop + offset,
            behavior: isSmooth ? 'smooth' : 'auto' // <-- TOGGLE
          })
        }
      }

      // MOBILE
      const mContainer = mRef.current
      if (mContainer) {
        const activeThumb = mContainer.children[index]
        if (activeThumb) {
          const containerRect = mContainer.getBoundingClientRect()
          const thumbRect = activeThumb.getBoundingClientRect()
          const offset = thumbRect.left - containerRect.left - (containerRect.width / 2) + (thumbRect.width / 2)
          mContainer.scrollTo({
            left: mContainer.scrollLeft + offset,
            behavior: isSmooth ? 'smooth' : 'auto' // <-- TOGGLE
          })
        }
      }
    }

    // First 2 are instant to find position, last one is smooth
    doScroll(false)
    setTimeout(() => doScroll(false), 50)
    setTimeout(() => doScroll(true), 150) // <-- SMOOTH HERE
  }, [])

  // Effect for MAIN thumbnails
  useEffect(() => {
    if (!isImageFullscreen) {
      scrollThumbsToIndex(selectedIndex, desktopThumbRef, mobileThumbRef)
    }
  }, [selectedIndex, isImageFullscreen, scrollThumbsToIndex])

  // Effect for MODAL thumbnails 
  useEffect(() => {
    if (isImageFullscreen) {
      scrollThumbsToIndex(selectedIndex, modalDesktopThumbRef, modalMobileThumbRef)
    }
  }, [selectedIndex, isImageFullscreen, scrollThumbsToIndex])

  useEffect(() => {
  if (color!== currentColor) {
    setIsImgLoading(true) // FORCE skeleton immediately
    setImgError(false)
    setSelectedIndex(0)
    setCurrentColor(color)
  }
}, [color, currentColor])

  useEffect(() => {
     
    setImgError(false)

    // GUARD: no images at all
    if (!images || images.length === 0 || !images[selectedIndex]) {
      setImgError(true) // show "Image not available" instead of nothing
      return
    }

    const img = new Image()
    img.src = images[selectedIndex]

    // Only show spinner if image takes > 200ms to load
    const showLoaderTimer = setTimeout(() => {
      if (!img.complete) setIsImgLoading(true)
    }, 200)

    img.onload = () => {
      clearTimeout(showLoaderTimer)
      setIsImgLoading(false)
    }
    img.onerror = () => {
      clearTimeout(showLoaderTimer)
      setIsImgLoading(false)
      setImgError(true)
    }

    return () => clearTimeout(showLoaderTimer)
  }, [selectedIndex, images])

  //console.log('IMG DEBUG:', { selectedIndex, src: images[selectedIndex], isImgLoading, imgError })
  return (
    <>
      <div className='w-full flex flex-col md:flex-row min-w-0 gap-4'>

        {/* Desktop Thumbnails - LEFT V21.12 */}
        {images?.length > 1 && (
          <div ref={desktopThumbRef} className='hidden pt-2 pl-2 md:flex flex-col gap-2 w-20 overflow-y-auto overflow-x-hidden h-[28rem] flex-shrink-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>

            {(!images || images.length === 0) && isImgLoading ? (
              // SKELETON LOADING
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="w-14 h-14 bg-white rounded-xl border-2 border-gray-200 p-1 flex-shrink-0"
                >
                  <div className="w-full h-full bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              ))
            ) : (
              // REAL THUMBNAILS
              images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (idx === selectedIndex) return;
                    setSlideDirection(idx > selectedIndex ? 'right' : 'left')
                    setSelectedIndex(idx)
                    setImgError(false)
                  }}
                  className={`w-14 h-14 bg-white rounded-xl border-2 p-1 flex-shrink-0 transition-all duration-200 ${selectedIndex === idx
                    ? "border-blue-600 shadow-lg scale-105 ring-2 ring-blue-100"
                    : "border-gray-200 hover:border-gray-400 hover:shadow-md hover:scale-105"
                    }`}
                >
                  <img
                    src={img || '/images/placeholder-phone.jpg'}
                    alt={`Thumb ${idx + 1}`}
                    className="w-full h-full object-contain rounded-lg transition-opacity duration-300 opacity-100"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.target.src = '/images/placeholder-phone.jpg';
                      setImgError(true)
                    }}
                  />
                </button>
              ))
            )}
          </div>
        )}

        {/* Main Image - AMAZON MOBILE: FIXED ASPECT RATIO */}
        <div
          className="flex-1 relative group bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-w-0 w-full 
          aspect-[4/5] md:aspect-auto md:h-[32rem] transition-all duration-300"
        >
          {stock === 0 && (
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 lg:top-5 lg:left-5 z-30">
              <div
                className="
                  flex items-center gap-2
                  rounded-full
                  bg-gradient-to-r from-gray-700 via-gray-600 to-gray-500
                  text-white
                  px-3 py-1.5
                  sm:px-4 sm:py-2
                  text-[10px] sm:text-xs md:text-sm
                  font-bold
                  uppercase
                  tracking-wider
                  
                  border border-white/20
                  backdrop-blur-md
                   
                "
              >

                <FaBan className="text-xs sm:text-sm animate-pulse" />
                <span className='animate-pulse'>SOLD OUT</span>
              </div>
            </div>
          )}
          <div
            className="w-full h-full flex items-center justify-center pt-12 pb-4 px-4 md:p-8"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">

              {/* LOADING SKELETON */}
              {isImgLoading && !imgError && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
                  <div className="w-[90%] h-[90%] bg-gray-200 rounded-xl animate-pulse"></div>
                </div>
              )}

              {/* BROKEN IMAGE / NO IMAGE FALLBACK */}
              {(!images || images.length === 0 || imgError) && (
                <div className="absolute inset-0 flex-col items-center justify-center bg-gray-100 z-10 text-gray-400">
                  <span className="text-4xl mb-2">🖼️</span>
                  <p className="text-sm text-gray-500">
                    {(!images || images.length === 0) ? 'No image available' : 'Image failed to load'}
                  </p>
                </div>
              )}

              {/* MAIN IMAGE - ONLY RENDER IF WE HAVE IMAGES */}
              {images?.[selectedIndex] && (
                <img
                  key={`${selectedIndex}-${images[selectedIndex]}`}
                  src={images[selectedIndex] || '/images/placeholder-phone.jpg'}
                  alt={`${color} Product`}
                  decoding="async"
                  loading={selectedIndex === 0? "eager" : "lazy"}  
                  fetchPriority={selectedIndex === 0? "high" : "auto"}  
                  className={`h-full w-auto max-h-[90%] max-w-[90%] object-contain cursor-pointer transition-all duration-200 ease-out will-change-transform ${stock === 0 ? 'grayscale opacity-80' : 'group-hover:scale-105'
                    } ${isImgLoading || imgError ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                    } ${slideDirection === 'right'
                      ? '-translate-x-8 opacity-0'
                      : slideDirection === 'left'
                        ? 'translate-x-8 opacity-0'
                        : 'translate-x-0 opacity-100'
                    }`}
                  onLoadStart={() => setIsImgLoading(true)}
                  onLoad={() => setIsImgLoading(false)}
                  onError={() => { setIsImgLoading(false); setImgError(true) }}
                  onClick={() => setIsImageFullscreen(true)}
                  onTransitionEnd={() => setSlideDirection('center')}
                />
              )}
            </div>

            {/* Mobile Counter - TOP CENTER */}
            {images.length > 1 && (
              <div className=' absolute top-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-2.5 py-1 
              rounded-full'>
                {selectedIndex + 1} of {images.length}
              </div>
            )}
          </div>

          {/* Desktop Arrows - NO CIRCLE */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage() }}
                className='hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 p-3 text-gray-700 hover:text-black transition items-center justify-center'
                aria-label='Previous image'
              >
                <FaChevronLeft size={28} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage() }}
                className='hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 p-3 text-gray-700 hover:text-black transition items-center justify-center'
                aria-label='Next image'
              >
                <FaChevronRight size={28} />
              </button>
            </>
          )}
        </div>


        {/* Mobile Thumbnails - BOTTOM V21.13 */}
        {images?.length > 1 && (
          <div className='md:hidden bg-gray-50 border-t border-gray-200 -mx-4 relative'>
            <div ref={mobileThumbRef} className='flex gap-2 overflow-x-auto p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>

              {(!images || images.length === 0) && isImgLoading ? (
                // MOBILE SKELETON LOADING
                Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-14 h-14 bg-white rounded-lg border-2 border-gray-200 p-1 snap-start"
                  >
                    <div className="w-full h-full bg-gray-200 rounded-md animate-pulse"></div>
                  </div>
                ))
              ) : (
                // REAL MOBILE THUMBNAILS
                images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (idx === selectedIndex) return;
                      setSlideDirection(idx > selectedIndex ? 'right' : 'left')
                      setSelectedIndex(idx)
                      setImgError(false)
                    }}
                    aria-label={`View image ${idx + 1}`}
                    className={`flex-shrink-0 w-14 h-14 bg-white rounded-lg border-2 p-1 snap-start transition-all duration-200 ${selectedIndex === idx
                      ? 'border-blue-600 ring-2 ring-blue-100 shadow-md scale-105'
                      : 'border-gray-200 hover:border-gray-400'
                      }`}
                  >
                    <img
                      src={img || '/images/placeholder-phone.jpg'}
                      alt={`Thumb ${idx + 1}`}
                      className="w-full h-full object-contain rounded-md"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.target.src = '/images/placeholder-phone.jpg';
                        setImgError(true)
                      }}
                    />
                  </button>
                ))
              )}
            </div>
            <div className='absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none' />
          </div>
        )}
      </div>

      {/* Fullscreen Modal - KEEP AS IS - WORKING FINE */}
      {isImageFullscreen && (
        <div
          className='fixed inset-0 bg-white z-50 flex flex-col md:flex-row overflow-hidden'
        // onClick={() => {
        //   setIsImageFullscreen(false);
        // }}
        >
          {/* Close - CIRCLE - BLACK ICON */}
          <button
            onClick={() => {
              setIsImageFullscreen(false);
              setTimeout(() => {
                // This will trigger the useEffect above because selectedIndex is same but we force it
                setSelectedIndex(prev => prev)
              }, 100)
            }}
            className='absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-white/65 backdrop-blur-md border border-white/60 shadow-md text-gray-700 hover:bg-white hover:text-black transition-all duration-200'
            aria-label='Close fullscreen'
          >
            <FaTimes size={22} />
          </button>

          {/* Desktop modal thumbs V21.14 */}
          {images?.length > 1 && (
            <div ref={modalDesktopThumbRef} className='hidden md:flex flex-col gap-2 w-26 p-4 overflow-y-auto overflow-x-hidden bg-gray-50 border-r border-gray-200 flex-shrink-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>

              {(!images || images.length === 0) && isImgLoading ? (
                // MODAL SKELETON LOADING
                Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-16 h-16 bg-white rounded-lg border-2 border-gray-200 p-0.5 flex-shrink-0"
                  >
                    <div className="w-full h-full bg-gray-200 rounded-md animate-pulse"></div>
                  </div>
                ))
              ) : (
                // REAL MODAL THUMBNAILS
                images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (idx === selectedIndex) return;
                      setSlideDirection(idx > selectedIndex ? 'right' : 'left')
                      setSelectedIndex(idx)
                      setImgError(false)
                    }}
                    className={`w-16 h-16 bg-white rounded-lg border-2 p-0.5 flex-shrink-0 transition-all duration-200 ${selectedIndex === idx
                      ? 'border-blue-500 ring-2 ring-blue-300 shadow-lg scale-105'
                      : 'border-gray-500 hover:border-white'
                      }`}
                  >
                    <img
                      src={img || '/images/placeholder-phone.jpg'}
                      alt={`Thumb ${idx + 1}`}
                      className='w-full h-full object-contain rounded-md'
                      decoding="async"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = '/images/placeholder-phone.jpg';
                        setImgError(true)
                      }}
                    />
                  </button>
                ))
              )}
            </div>
          )}

          {/* Fullscreen image - HARD HEIGHT CAP */}
          <div
            className='flex-1 flex items-center justify-center px-4 md:px-8 bg-white overflow-hidden'
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-[520px] h-[65vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
              {/* LOADING SKELETON */}
              {isImgLoading && !imgError && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
                  <div className="w-[90%] h-[90%] bg-gray-200 rounded-xl animate-pulse"></div>
                </div>
              )}

              {/* ERROR STATE */}
              {(imgError || !images?.[selectedIndex]) && (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <span className="text-4xl mb-2">🖼️</span>
                  <p className="text-sm">Image failed to load</p>
                </div>
              )}

              {/* REAL IMAGE */}
              {images?.[selectedIndex] && (
                <img
                  key={`modal-${selectedIndex}-${images?.[selectedIndex]}`} // add URL to key
                  src={images?.[selectedIndex] || '/images/placeholder-phone.jpg'}
                  alt={`${color} Product`}
                  decoding="async"
                  loading={selectedIndex === 0? "eager" : "lazy"}
                  fetchPriority={selectedIndex === 0? "high" : "auto"}
                  className={`max-w-full max-h-full object-contain transition-all duration-200 ease-out will-change-transform ${slideDirection === 'right'
                    ? 'opacity-0 -translate-x-8'
                    : slideDirection === 'left'
                      ? 'opacity-0 translate-x-8'
                      : 'opacity-100 translate-x-0'
                    } ${isImgLoading || imgError ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                  onLoadStart={() => setIsImgLoading(true)}
                  onLoad={() => setIsImgLoading(false)}
                  onError={() => { setIsImgLoading(false); setImgError(true) }}
                  onTransitionEnd={() => setSlideDirection('center')}
                />
              )}

              {/* Desktop modal arrows - BLACK ICONS */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage() }}
                    className='hidden md:flex absolute left-32 top-1/2 -translate-y-1/2 w-11 h-11 items-center justify-center rounded-full bg-white/80 hover:bg-white shadow-lg text-black transition'
                    aria-label='Previous image'
                  >
                    <FaChevronLeft size={24} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage() }}
                    className='hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 items-center justify-center rounded-full bg-white/80 hover:bg-white shadow-lg text-black transition'
                    aria-label='Next image'
                  >
                    <FaChevronRight size={24} />
                  </button>
                </>
              )}

              {/* Mobile counter in modal */}
              {images.length > 1 && (
                <div className=' absolute
                    top-2
                    left-1/2
                    -translate-x-1/2
                    z-30
                    bg-white/80
                    backdrop-blur-md
                    rounded-full
                    px-3
                    py-1
                    shadow-sm'>
                  {selectedIndex + 1} / {images.length}
                </div>
              )}
            </div>
          </div>


          {/* Mobile thumbs in modal V21.16 */}
          {images?.length > 1 && (
            <div className='md:hidden bg-gray-50 border-t border-gray-200'>
              <div ref={modalMobileThumbRef} className='flex gap-2 overflow-x-auto p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>

                {(!images || images.length === 0) && isImgLoading ? (
                  // MOBILE MODAL SKELETON
                  Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 w-14 h-14 bg-white rounded-lg border-2 border-gray-200 p-0.5 snap-start"
                    >
                      <div className="w-full h-full bg-gray-200 rounded-md animate-pulse"></div>
                    </div>
                  ))
                ) : (
                  // REAL MOBILE MODAL THUMBS
                  images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (idx === selectedIndex) return;
                        setSlideDirection(idx > selectedIndex ? 'right' : 'left')
                        setSelectedIndex(idx)
                        setImgError(false)
                      }}
                      className={`flex-shrink-0 w-14 h-14 bg-white rounded-lg border-2 p-0.5 snap-start transition-all duration-200 ${selectedIndex === idx
                        ? 'border-blue-600 scale-105 shadow-md ring-2 ring-blue-100'
                        : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                      <img
                        src={img || '/images/placeholder-phone.jpg'}
                        alt={`Thumb ${idx + 1}`}
                        className='w-full h-full object-contain rounded-md'
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.target.src = '/images/placeholder-phone.jpg';
                          setImgError(true)
                        }}
                      />
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default Product360