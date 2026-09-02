import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaSearch, FaTimes, FaBox, FaHeadphones } from 'react-icons/fa'
import { useGetSearchSuggestionsQuery } from '../slices/productsApiSlice';
import { useGetAccessorySearchSuggestionsQuery } from '../slices/accessoriesApiSlice';

const SearchBox = ({ onSearchComplete }) => {
  const navigate = useNavigate()
  const itemRefs = useRef([]);
  const searchRef = useRef(null);

  const [keyword, setKeyword] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [displayKeyword, setDisplayKeyword] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 1. PRODUCTS
  const { data: productSuggestions = [], isLoading: loadingProducts } = useGetSearchSuggestionsQuery(
    keyword, { skip: keyword.trim().length < 2 }
  );
  
  // 2. ACCESSORIES - NEW
  const { data: accessorySuggestions = [], isLoading: loadingAccessories } = useGetAccessorySearchSuggestionsQuery(
    keyword, { skip: keyword.trim().length < 2 }
  );

  // 3. COMBINE BOTH
  const suggestions = [
   ...productSuggestions.map(p => ({...p, type: 'product' })),
   ...accessorySuggestions.map(a => ({...a, type: 'accessory' }))
  ].slice(0, 8);

  const isLoading = loadingProducts || loadingAccessories;

  useEffect(() => { setSelectedIndex(-1); }, [keyword]);

  useEffect(() => {
    if (selectedIndex >= 0) {
      itemRefs.current[selectedIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  useEffect(() => { setDisplayKeyword(keyword); }, [keyword]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current &&!searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
        setDisplayKeyword(keyword);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [keyword]);

  const submitHandler = (e) => {
    e.preventDefault()
    if (keyword.trim()) {
      navigate(`/search?keyword=${keyword.trim()}`) // V37.73 KEY: Changed from homepage
      setKeyword('')
      setDisplayKeyword('')
      setShowSuggestions(false)
      if (onSearchComplete) onSearchComplete()
    } else {
      navigate('/')
      if (onSearchComplete) onSearchComplete()
    }
  }

  const highlightText = (text = "", keyword = "") => {
    if (!keyword) return text;
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedKeyword})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, index) =>
      part.toLowerCase() === keyword.toLowerCase()? (
        <span key={index} className="font-bold text-blue-600">{part}</span>
      ) : (part)
    );
  };

  const totalItems = suggestions.length + 1;

  const handleKeyDown = (e) => {
    if (!suggestions.length) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => {
          const newIndex = prev < totalItems - 1? prev + 1 : 0;
          if (newIndex < suggestions.length) {
            setDisplayKeyword(suggestions[newIndex].name);
          } else {
            setDisplayKeyword(keyword);
          }
          return newIndex;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => {
          const newIndex = prev > 0? prev - 1 : totalItems - 1;
          if (newIndex < suggestions.length) {
            setDisplayKeyword(suggestions[newIndex].name);
          } else {
            setDisplayKeyword(keyword);
          }
          return newIndex;
        });
        break;
      case 'Enter':
        if (selectedIndex >= 0) {
          e.preventDefault();
          if (selectedIndex < suggestions.length) {
            const item = suggestions[selectedIndex];
            navigate(item.type === 'product'? `/product/${item.slug}` : `/accessory/${item.slug}`); // V37.73 KEY
          } else {
            navigate(`/search?keyword=${keyword.trim()}`);
          }
          setKeyword('');
          setDisplayKeyword('');
          setSelectedIndex(-1);
          setShowSuggestions(false);
          if (onSearchComplete) onSearchComplete();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setDisplayKeyword(keyword);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className='relative w-full' ref={searchRef}>
      <form onSubmit={submitHandler} className='flex w-full'>
        <div className="relative flex-1">
          <input
            type='text'
            onKeyDown={handleKeyDown}
            name="search"
            autoComplete="off"
            onChange={(e) => {
              setKeyword(e.target.value);
              setDisplayKeyword(e.target.value);
              setShowSuggestions(true);
            }}
            value={displayKeyword}
            placeholder='Search phones & accessories...' // V37.73 KEY
            className='flex-1 w-full px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white'
          />
          {displayKeyword && (
            <button
              type="button"
              onClick={() => {
                setKeyword('');
                setDisplayKeyword('');
                setShowSuggestions(false);
                setSelectedIndex(-1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            >
              <FaTimes size={14} />
            </button>
          )}
        </div>
         <button
          type='submit'
          className='px-4 py-2 border rounded-r-lg focus:outline-none shrink-0 focus:ring-2 focus:ring-blue-500'
        >

          <FaSearch className='text-white sm:text-white-500 w-5 h-5' />
        </button>
      </form>

      {showSuggestions && keyword.trim().length >= 2 && (
        <div className="absolute left-0 right-0 mt-1 bg-white transition-all ease-out duration-150 border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto hide-scrollbar">
          {isLoading? (
            [...Array(4)].map((_, index) => (
              <div key={index} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                <div className="w-14 h-14 bg-gray-200 rounded-md flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))
          ) : suggestions.length > 0? (
            <>
              {suggestions.map((item, index) => (
                <div
                  key={item._id + item.type} // V37.73 KEY: unique key for both
                  ref={(el) => (itemRefs.current[index] = el)}
                  className={`flex items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-b-0 cursor-pointer transition-all duration-150 ${selectedIndex === index? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  onClick={() => {
                    navigate(item.type === 'product'? `/product/${item.slug}` : `/accessory/${item.slug}`);
                    setKeyword('');
                    setDisplayKeyword('');
                    setShowSuggestions(false);
                    if (onSearchComplete) onSearchComplete();
                  }}
                >
                  <img
                    src={item.image || item.colors?.[0]?.images?.[0]?.url || '/placeholder.png'} // V37.73 KEY: handles both
                    alt={item.name}
                    className="w-14 h-14 object-contain rounded-lg bg-gray-50 p-1"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm sm:text-base font-medium text-gray-900 truncate">
                      {highlightText(item.name, keyword)}
                    </h4>
                    <div className='flex items-center gap-2 mt-1'>
                      <p className="text-xs uppercase text-gray-500">
                        {item.brand}
                      </p>
                      <span className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded ${item.type === 'product'? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {item.type === 'product'? <FaBox size={8} /> : <FaHeadphones size={8} />}
                        {item.type === 'product'? 'Product' : 'Accessory'}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-blue-600">
                      From ${(item.minPrice || item.price)?.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}

              <div
                ref={(el) => (itemRefs.current[suggestions.length] = el)}
                className={`border-t border-gray-200 px-4 py-3 text-center font-medium cursor-pointer transition-colors ${selectedIndex === suggestions.length? 'bg-blue-50 text-blue-600' : 'text-blue-600 hover:bg-blue-50'}`}
                onClick={submitHandler}
              >
                View all results for "{keyword}" →
              </div>
            </>
          ) : (
            <div className="px-4 py-3 text-gray-500">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBox