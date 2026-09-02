import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaSearch, FaTimes } from 'react-icons/fa'
import { useGetSearchSuggestionsQuery } from '../slices/productsApiSlice';

const CompareSearch = ({ currentSlug, setCompareSlug, onSelect, disabled, compareProductIds=[] }) => {
    const navigate = useNavigate()
    const itemRefs = useRef([]);
    const searchRef = useRef(null);

    const [keyword, setKeyword] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [displayKeyword, setDisplayKeyword] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const { data: suggestions, isLoading } = useGetSearchSuggestionsQuery(
        keyword,
        {
            skip: keyword.trim().length < 2,
        }
    );

    const products = (suggestions || []).filter((product) => {
  // Don't show the current phone
  if (product.slug === currentSlug) return false;

  // Don't show phones already in comparison
  return !compareProductIds.some(
    (p) => p._id === product._id
  );
});

    useEffect(() => {
        setSelectedIndex(-1);
    }, [keyword]);

    useEffect(() => {
        if (selectedIndex >= 0) {
            itemRefs.current[selectedIndex]?.scrollIntoView({
                block: 'nearest',
                behavior: 'smooth',
            });
        }
    }, [selectedIndex]);

    useEffect(() => {
        setDisplayKeyword(keyword);
    }, [keyword]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target)
            ) {
                setShowSuggestions(false);
                setSelectedIndex(-1);
                setDisplayKeyword(keyword);
                //setKeyword('')
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [keyword]);

   const submitHandler = (e) => {
    e.preventDefault();

    if (keyword.trim() && products.length > 0) {
        const selectedProduct =
            selectedIndex >= 0
                ? products[selectedIndex]
                : products[0];

        if (onSelect) {
            onSelect(selectedProduct);
        } else {
            setCompareSlug(selectedProduct.slug);
        }

        setKeyword(selectedProduct.name);
        setDisplayKeyword(selectedProduct.name);
        setShowSuggestions(false);
    }
};


   const highlightText = (text = "", keyword = "") => {
  if (!keyword) return text;

  // Escape regex special characters
  const escapedKeyword = keyword.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

  const regex = new RegExp(`(${escapedKeyword})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) =>
    part.toLowerCase() === keyword.toLowerCase() ? (
      <span
        key={index}
        className="font-bold text-blue-600"
      >
        {part}
      </span>
    ) : (
      part
    )
  );
};

    //   const handleBlur = () => {
    //   setTimeout(() => {
    //     setShowSuggestions(false);
    //     setSelectedIndex(-1);

    //     // Restore what the user actually typed
    //     setDisplayKeyword(keyword);
    //   }, 150);
    // };

    const totalItems = products.length + 1;

    const handleKeyDown = (e) => {
        if (!products.length) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();

                setSelectedIndex((prev) => {
                    const newIndex = prev < totalItems - 1 ? prev + 1 : 0;

                    if (newIndex < products.length) {
                        setDisplayKeyword(products[newIndex].name);
                    } else {
                        setDisplayKeyword(keyword);
                    }

                    return newIndex;
                });

                break;

            case 'ArrowUp':
                e.preventDefault();

                setSelectedIndex((prev) => {
                    const newIndex =
                        prev > 0 ? prev - 1 : totalItems - 1;

                    if (newIndex < products.length) {
                        setDisplayKeyword(products[newIndex].name);
                    } else {
                        setDisplayKeyword(keyword);
                    }

                    return newIndex;
                });

                break;

           case "Enter":
    if (selectedIndex >= 0) {
        e.preventDefault();

        if (selectedIndex < products.length) {
            const selectedProduct = products[selectedIndex];

            if (onSelect) {
                onSelect(selectedProduct);
            } else if (setCompareSlug) {
                setCompareSlug(selectedProduct.slug);
            }

            setKeyword(selectedProduct.name);
            setDisplayKeyword(selectedProduct.name);
        }

        setShowSuggestions(false);
        setSelectedIndex(-1);
    }
    break;

            case 'Escape':
                e.preventDefault();

                // Restore the user's original typed text
                setShowSuggestions(false);
                setDisplayKeyword(keyword);
                // Remove the highlighted item
                setSelectedIndex(-1);

                break;
        }
    };

    if (disabled) {
  return (
    <div className="h-10 flex items-center justify-center border rounded">
      Updating...
    </div>
  );
}

    return (
        <div className='relative w-full' ref={searchRef}>
            <form onSubmit={submitHandler} className="relative w-full">
  {/* Search icon */}
  <FaSearch
  className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400
             w-[16px] h-[16px] md:w-[18px] md:h-[18px]"
/>


  <input
    type="text"
    name="search"
    autoComplete="off"
    onKeyDown={handleKeyDown}
    onChange={(e) => {
      setKeyword(e.target.value);
      setDisplayKeyword(e.target.value);
      setShowSuggestions(true);
    }}
    value={displayKeyword}
    placeholder="Search another phone..."
   className="w-full pl-8 md:pl-11 pr-10 py-2.5 md:py-3 border border-gray-300 rounded-lg
             bg-white text-gray-900
             focus:outline-none focus:ring-2 focus:ring-blue-500
             placeholder:text-gray-400
             text-sm md:text-lg
             placeholder:text-[10px] md:placeholder:text-base
             truncate
             "
               
  />

  {displayKeyword && (
    <button
      type="button"
      onClick={() => {
        setKeyword("");
        setDisplayKeyword("");
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }}
      className="absolute right-4 top-1/2 -translate-y-1/2
                 text-gray-400 hover:text-gray-700"
    >
      <FaTimes size={16} />
    </button>
  )}
</form>
            {showSuggestions && keyword.trim().length >= 2 && (
                <div className="absolute left-0 right-0 mt-1 bg-white transition-all ease-out duration-150 border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto hide-scrollbar">

                    {isLoading ? (
                        <>
                            {[...Array(5)].map((_, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-4 px-5 py-4 sm:px-4 animate-pulse"
                                >
                                    {/* Image Skeleton */}
                                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-200 rounded-md flex-shrink-0" />

                                    {/* Text Skeleton */}
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/3 mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : products.length > 0 ? (
                        <>
                            {products.map((product, index) => (
                                 <div
                                     key={`${product._id}-${index}`}
                                    ref={(el) => (itemRefs.current[index] = el)}
                                    className={`flex items-center gap-1 sm:gap-4 px-1 sm:px-5 py-3 sm:py-4 border-b border-gray-100 last:border-b-0 cursor-pointer transition-all duration-150 ${selectedIndex === index
                                        ? 'bg-blue-50'
                                        : 'hover:bg-gray-50'
                                        }`}
                                    onClick={() => {
                                        if (onSelect) {
                                            onSelect(product);
                                        } else if (setCompareSlug) {
                                            setCompareSlug(product.slug);
                                        }

                                        setKeyword(product.name);
                                        setDisplayKeyword(product.name);
                                        setShowSuggestions(false);
                                        setSelectedIndex(-1);
                                    }}
                                >
                                    <img
                                        src={product.colors[0]?.images?.[0]?.url}
                                        alt={product.name}
                                        className="w-10 h-10 sm:w-16 sm:h-16 object-contain rounded-lg bg-gray-50 p-1"
                                    />

                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-[8px] sm:text-base font-medium text-gray-900 truncate">
                                            {highlightText(product.name, keyword)}
                                        </h4>

                                        <p className="text-[8px] uppercase traching-wide sm:text-sm text-gray-500">
                                            {product.brand}
                                        </p>

                                        <p className="text-[8px] sm:text-sm font-semibold text-blue-600">
                                            From ${product.minPrice?.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                            ))}
 
                        </>
                    ) : (
                        <div className="px-4 py-3 text-gray-500">
                            No products found
                        </div>
                    )}


                </div>
            )}
        </div>
    )
}

export default CompareSearch