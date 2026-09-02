import { useState, useRef, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
import ZoomableImage from './ZoomableImage';

const ProductImageGallery = ({ images = [], selectedImage, onSelectImage, isOutOfStock = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isZoomDragging, setIsZoomDragging] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null); // <-- SWIPE

  const thumbnailRef = useRef(null);
  const modalThumbRef = useRef(null);
  const sliderRef = useRef(null);
  const modalSliderRef = useRef(null);

  const validImages = images.filter(Boolean);
  const SWIPE_THRESHOLD = 50; // min px to trigger swipe

  

  const goToIndex = (newIndex) => {
    setCurrentIndex(newIndex);
    onSelectImage(validImages[newIndex]);
    scrollThumbnail(newIndex);
    scrollModalThumbnail(newIndex);
  };

  const goPrev = () => {
    if (isZoomDragging) return;
    const newIndex = currentIndex === 0? validImages.length - 1 : currentIndex - 1;
    goToIndex(newIndex);
  };

  const goNext = () => {
    if (isZoomDragging) return;
    const newIndex = currentIndex === validImages.length - 1? 0 : currentIndex + 1;
    goToIndex(newIndex);
  };

  const scrollThumbnail = (index) => {
    const el = thumbnailRef.current?.children[index];
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

  const scrollModalThumbnail = (index) => {
    const el = modalThumbRef.current?.children[index];
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

  // LOCK BODY SCROLL WHEN MODAL OPEN
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isModalOpen]);

  // KEYBOARD SUPPORT
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isModalOpen) return;
      if (e.key === 'Escape') setIsModalOpen(false);
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, currentIndex, validImages.length]);

  useEffect(() => {
    const idx = validImages.findIndex(img => img === selectedImage);
    if (idx!== -1) setCurrentIndex(idx);
  }, [selectedImage, validImages]);

  // SMOOTH SCROLL TO INDEX - SKIP IF ZOOM DRAGGING
  useEffect(() => {
    if (isZoomDragging) return;
    if (sliderRef.current) {
      sliderRef.current.scrollTo({
        left: currentIndex * sliderRef.current.offsetWidth,
        behavior: 'smooth'
      })
    }
    if (modalSliderRef.current) {
      modalSliderRef.current.scrollTo({
        left: currentIndex * modalSliderRef.current.offsetWidth,
        behavior: 'smooth'
      })
    }
  }, [currentIndex, isZoomDragging]);

  // <-- SWIPE HANDLERS FOR MOBILE
  const handleTouchStart = (e) => {
    if (isZoomed || isZoomDragging) return; // don't swipe if zoomed
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (isZoomed || isZoomDragging || touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) goNext(); // swipe left
      else goPrev(); // swipe right
    }
    setTouchStartX(null);
  };

  const handleThumbnailClick = (img, index) => {
    goToIndex(index);
  };

  if (validImages.length === 0) {
    return (
      <div className='w-full h-[450px] md:h-[450px] h-[350px] bg-gray-100 rounded-lg flex items-center justify-center text-gray-400'>
        No Image
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* MAIN IMAGE SLIDER */}
       <div className={`relative border-gray-200 rounded-lg p-2 md:p-4 bg-white group overflow-hidden transition duration-300 ${isOutOfStock? 'opacity-40 grayscale' : ''}`}>
        <div
          ref={sliderRef}
          className="flex w-full h-[350px] md:h-[450px] overflow-hidden scroll-smooth snap-x snap-mandatory" // <-- RESPONSIVE HEIGHT
          style={{ scrollbarWidth: 'none' }}
          onTouchStart={handleTouchStart} // <-- MOBILE SWIPE
          onTouchEnd={handleTouchEnd} // <-- MOBILE SWIPE
        >
          {validImages.map((img, idx) => (
            <div key={img + idx} className="w-full h-full flex-shrink-0 snap-center flex items-center justify-center">
              <img
                src={img}
                alt="Product"
                className="w-full h-full object-contain cursor-zoom-in"
                onClick={() => setIsModalOpen(true)}
              />
            </div>
          ))}
        </div>

        {/* ARROWS - HIDDEN ON MOBILE */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-md opacity-0 md:group-hover:opacity-100 md:opacity-0 transition hidden md:block" // <-- hidden md:block
            >
              <FaChevronLeft size={18} />
            </button>
            <button
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-md opacity-0 md:group-hover:opacity-100 md:opacity-0 transition hidden md:block" // <-- hidden md:block
            >
              <FaChevronRight size={18} />
            </button>
          </>
        )}

        {/* DOTS FOR MOBILE */}
        {validImages.length > 1 && (
          <div className="flex justify-center gap-2 mt-3 md:hidden"> {/* <-- MOBILE DOTS */}
            {validImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToIndex(idx)}
                className={`w-2 h-2 rounded-full transition ${currentIndex === idx? 'bg-gray-800 w-4' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* THUMBNAILS - SMALLER ON MOBILE */}
      <div
        ref={thumbnailRef}
        className={`flex gap-2 md:gap-3 mt-3 md:mt-4 overflow-x-auto scroll-smooth py-2 md:py-4 transition duration-300 ${isOutOfStock? 'opacity-40 grayscale' : ''}`}
        style={{ scrollbarWidth: 'none' }}
      >
        {validImages.map((img, index) => (
          <button
            key={img + index}
            onClick={() => handleThumbnailClick(img, index)}
            className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 border-2 rounded-lg p-1 transition-all duration-200 hover:scale-105 ${ // <-- RESPONSIVE SIZE
              currentIndex === index? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-400'
            }`}
          >
            <img src={img} alt="" className="w-full h-full object-contain" />
          </button>
        ))}
      </div>
      <style>{`div::-webkit-scrollbar { display: none; }`}</style>

      {/* MODAL */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-white z-50 flex flex-col"
          onClick={() => setIsModalOpen(false)}
        >
          {/* HEADER */}
          <div className="flex justify-between items-center p-3 md:p-4 border-b border-gray-200">
            <p className="font-semibold text-gray-800 text-sm md:text-base">Product Images ({currentIndex + 1}/{validImages.length})</p>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-gray-600 hover:text-black transition hover:rotate-90 duration-300"
            >
              <FaTimes size={24} className="md:w-7 md:h-7" /> {/* <-- SMALLER ON MOBILE */}
            </button>
          </div>

          {/* BIG IMAGE SLIDER */}
          <div className="relative flex-1 overflow-hidden bg-gray-50">
            <div
              ref={modalSliderRef}
              className={`flex w-full h-full overflow-hidden scroll-smooth ${isZoomDragging? '' : 'snap-x snap-mandatory'}`}
              style={{ touchAction: isZoomDragging || isZoomed ? 'none' : 'pan-y' }}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart} // <-- SWIPE IN MODAL TOO
              onTouchEnd={handleTouchEnd} // <-- SWIPE IN MODAL TOO
            >
              {validImages.map((img, idx) => (
                <ZoomableImage
                  key={'modal-' + img + idx}
                  src={img}
                  alt="Product Zoom"
                  onDragStart={() => setIsZoomDragging(true)}
                  onDragEnd={() => setIsZoomDragging(false)}
                  onZoomChange={setIsZoomed}
                />
              ))}
            </div>

            {/* MODAL ARROWS - SMALLER ON MOBILE */}
            {validImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {e.stopPropagation(); goPrev()}}
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-gray-800/70 hover:bg-gray-800 p-2 md:p-4 rounded-full transition hover:scale-110 z-10 hidden md:block"
                >
                  <FaChevronLeft size={18} className="md:w-6 md:h-6" color="white" />
                </button>
                <button
                  onClick={(e) => {e.stopPropagation(); goNext()}}
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-gray-800/70 hover:bg-gray-800 p-2 md:p-4 rounded-full transition hover:scale-110 z-10 hidden md:block"
                >
                  <FaChevronRight size={18} className="md:w-6 md:h-6" color="white" />
                </button>
              </>
            )}
          </div>

          {/* BIG THUMBNAILS - HORIZONTAL SCROLL ON MOBILE */}
          {validImages.length > 1 && (
            <div className="border-t border-gray-200 p-2 md:p-4 bg-white">
              <div
                ref={modalThumbRef}
                className="flex gap-2 md:gap-3 justify-start md:justify-center overflow-x-auto scroll-smooth py-2 md:py-4 px-2" // <-- justify-start on mobile
                style={{ scrollbarWidth: 'none' }}
                onClick={(e) => e.stopPropagation()}
              >
                {validImages.map((img, index) => (
                  <button
                    key={'modal-' + img + index}
                    onClick={() => handleThumbnailClick(img, index)}
                    className={`flex-shrink-0 w-20 h-20 md:w-24 md:h-24 border-2 rounded-lg p-1 transition-all duration-200 bg-white hover:scale-105 ${ // <-- RESPONSIVE
                      currentIndex === index? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;