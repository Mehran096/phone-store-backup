import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { FaChevronDown } from 'react-icons/fa'
import { useGetBrandMenuProductsQuery } from '../slices/productsApiSlice' // V38.30
import { useGetFeaturedAccessoryQuery } from '../slices/accessoriesApiSlice'
import {   FaFire } from 'react-icons/fa'

const Navbar = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [searchParams] = useSearchParams()
    const [showAccessoryMenu, setShowAccessoryMenu] = useState(false)
    const [showBrandMenu, setShowBrandMenu] = useState(null)
    const [hoveredBrand, setHoveredBrand] = useState(null) // V38.30 KEY 
    const [showArrows, setShowArrows] = useState(false)
    const [isOverflowing, setIsOverflowing] = useState(false)
    const dropdownRef = useRef(null)
    const timeoutRef = useRef(null)
    const hoverTimeoutRef = useRef(null)
    const scrollRef = useRef(null)

const scroll = (direction) => {
  if (scrollRef.current) {
    const scrollAmount = 500 // kitna scroll karna hai
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
  }
}

    const brands = ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Realme', 'Oppo', 'Vivo']

     

    // RTK Query - only fetches when hoveredBrand is set
    const {
        data: brandProducts = [],
        isLoading: loadingBrand
    } = useGetBrandMenuProductsQuery(hoveredBrand, {
        skip: !hoveredBrand
    })

    const {
        data: featuredAccessory,
        isLoading: loadingFeatured
    } = useGetFeaturedAccessoryQuery()

    // V38.66: Map category slug to DB accessoryType
    const slugToType = {
        'iphone-cases': 'case',
        'samsung-cases': 'case',
        'google-pixel-cases': 'case',
        'chargers': 'charger',
        'fast-chargers-20w+': 'charger',
        'cables': 'cable',
        'usb-c-cables': 'cable',
        'lightning-cables': 'cable',
        'adapters': 'cable',
        'screen-protectors': 'glass',
        'audio-adapters': 'audio',
        'holders': 'holder',
    }

    const accessoryTypes = [
        { name: 'Cases', dbValue: 'case', sub: ['iPhone Cases', 'Samsung Cases', 'Google Pixel Cases'] },
        { name: 'Chargers', dbValue: 'charger', sub: ['Chargers', 'Fast Chargers 20W+'] },
        { name: 'Cables', dbValue: 'cable', sub: ['Cables', 'USB-C Cables', 'Lightning Cables', 'Adapters'] },
        { name: 'Screen Protectors', dbValue: 'glass', sub: ['Screen Protectors'] },
        { name: 'Audio', dbValue: 'audio', sub: ['Audio Adapters'] },
        { name: 'Holders & Stands', dbValue: 'holder', sub: ['Holders'] },
    ]

    const activeBrand = searchParams.get('brand')
    const activeType = searchParams.get('type')

    useEffect(() => {
        setShowAccessoryMenu(false)
        setShowBrandMenu(null)
        setHoveredBrand(null)
    }, [location.pathname])

    useEffect(() => {
        const handleMouseLeave = () => {
            setShowAccessoryMenu(false)
            setShowBrandMenu(null)
            setHoveredBrand(null)
        }
        const el = dropdownRef.current
        if (el) el.addEventListener('mouseleave', handleMouseLeave)
        return () => el?.removeEventListener('mouseleave', handleMouseLeave)
    }, [])

    useEffect(() => {
  const checkOverflow = () => {
    if (scrollRef.current) {
      const { scrollWidth, clientWidth } = scrollRef.current
      setIsOverflowing(scrollWidth > clientWidth + 5) // 5px buffer
    }
  }

  checkOverflow()
  window.addEventListener('resize', checkOverflow)
  return () => window.removeEventListener('resize', checkOverflow)
}, [brands]) // brands change hon to check ho

    const handleBrandHover = (brand) => {
        clearTimeout(timeoutRef.current)
        setHoveredBrand(brand)
        setShowBrandMenu(brand)
    }

    const handleBrandLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setShowBrandMenu(null)
            setHoveredBrand(null)
        }, 150) // small delay so mouse can move to menu
    }

    const handleBrandClick = (brand) => {
        navigate(`/products?brand=${brand}`)
        setShowBrandMenu(null)
        setHoveredBrand(null)
    }

    const handleNewBrandClick = (brand) => {
        navigate(`/products?brand=${brand}&filter=new`)
        setShowBrandMenu(null)
        setHoveredBrand(null)
    }

    const handleBrandAccessoryClick = (brand) => {
        navigate(`/accessories?brand=${brand}`)
        setShowBrandMenu(null)
        setHoveredBrand(null)
    }
    const handleTypeClick = (dbValue) => {
        navigate(`/accessories?type=${encodeURIComponent(dbValue)}`)
        setShowAccessoryMenu(false)
    }
    const handleSubCategoryClick = (subCat) => {
        const slug = subCat.toLowerCase().replace(/\s+/g, '-')
        const dbType = slugToType[slug]

        if (dbType) {
            navigate(`/accessories?type=${encodeURIComponent(dbType)}`) // NEW 1 ROUTE
        } else {
            navigate('/accessories') // fallback
        }
        setShowAccessoryMenu(false)
    }


    return (
         <div
        className='hidden lg:block bg-gray-800 border-t border-gray-700 relative w-full hide-scrollbar'
        ref={dropdownRef}
    >
        <div className='group container mx-auto px-10 overflow-hidden relative'
        onMouseEnter={() => {
    hoverTimeoutRef.current = setTimeout(() => setShowArrows(true), 200) // 200ms baad show
  }}
  onMouseLeave={() => {
    clearTimeout(hoverTimeoutRef.current)
    setShowArrows(false)
  }}
        >  
            
   {/* LEFT ARROW */}
  <button
    onClick={() => scroll('left')}
    className={`hidden lg:flex  absolute left-2 top-1/2 -translate-y-1/2 z-50 bg-gray-900/90 hover:bg-gray-900 text-white p-2 rounded-full shadow-lg transition-all duration-300 ${
      isOverflowing && showArrows? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
    }`}
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  </button>

  {/* RIGHT ARROW */}
  <button
    onClick={() => scroll('right')}
    className={`hidden lg:flex  absolute right-2 top-1/2 -translate-y-1/2 z-50 bg-gray-900/90 hover:bg-gray-900 text-white p-2 rounded-full shadow-lg transition-all duration-300 ${
      isOverflowing && showArrows? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
    }`}
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  </button>
            <div 
  ref={scrollRef} 
  className='flex items-center h-10 text-sm whitespace-nowrap overflow-x-auto scroll-smooth hide-scrollbar'
>

                    {/* PRODUCTS SECTION WITH BRAND HOVER */}
                    <span className='text-gray-400 mr-2 font-medium whitespace-nowrap'>Products:</span>
                    <div className='flex items-center space-x-1'>
                        {brands.map((brand) => (
                            <div
                                key={brand}
                                onMouseEnter={() => {
                                    handleBrandHover(brand)
                                    setShowAccessoryMenu(false) // CLOSE ACCESSORY
                                }}
                                onMouseLeave={handleBrandLeave}
                                className="relative"
                            >
                                <button
                                    onClick={() => handleBrandClick(brand)}
                                    className={`text-sm px-1.5 py-1 border border-transparent rounded-sm transition-all 
                                                    duration-100  ${activeBrand === brand || showBrandMenu === brand
                                    ?'text-white border-white font-bold'  // bold when active
                                        : 'text-gray-200 hover:text-white hover:border-white font-normal'
                                        }`}
                                    >
                                    {brand}
                                </button>

                                {/* BRAND MEGA MENU WITH REAL PRODUCTS */}
                                
                                    <div className={`fixed top-[104px] left-0 w-full bg-[#1a1a1a] text-white shadow-2xl z-[9999] border-t border-gray-700
                                        transition-all duration-300 ease-out origin-top
                                        ${showBrandMenu === brand
                                        ? 'opacity-100 translate-y-0 scale-100'
                                            : 'opacity-0 -translate-y-3 scale-95 pointer-events-none'
                                        }`}>
                                        <div className="w-full px-4 py-4 grid grid-cols-[200px_1fr_1fr_240px] gap-3 max-w-[1300px] mx-auto">

                                            {/* COL 1: LINKS */}
                                            <div className="pr-2">
                                                <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-2 font-semibold">{brand}</p>
                                                <button onClick={() => handleBrandClick(brand)} className="text-[15px] font-semibold hover:text-blue-400 block mb-2 text-left">All {brand} Phones</button>
                                                <button
                                                    onClick={() => handleNewBrandClick(brand)}
                                                    className="text-[15px] font-semibold hover:text-blue-400 block mb-2 text-left"
                                                >
                                                    New {brand}
                                                </button>

                                                <button
                                                    onClick={() => handleBrandAccessoryClick(brand)}
                                                    className="text-[15px] font-semibold hover:text-blue-400 block mb-2 text-left"
                                                >
                                                    {brand} Accessories
                                                </button>
                                            </div>

                                            {/* COL 2-3: PRODUCTS WITH IMAGE + PRICE */}
                                            <div className="col-span-2">
                                                <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-2 font-semibold">Popular {brand} Phones</p>

                                                {loadingBrand ? (
                                                    <div className="grid grid-cols-4 gap-3">
                                                        {[...Array(6)].map((_, i) => (
                                                            <div key={i} className="animate-pulse">
                                                                <div className="bg-gray-700 rounded-md h-20 mb-2"></div>
                                                                <div className="bg-gray-700 h-4 rounded w-3/4 mb-1"></div>
                                                                <div className="bg-gray-700 h-4 rounded w-1/2"></div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : brandProducts.length === 0 ? (
                                                    <p className="text-gray-400 text-sm">No products found</p>
                                                ) : (
                                                    <div className="grid grid-cols-4 gap-3">
                                                        {brandProducts.map((product) => (
                                                            <button
                                                                key={product._id}
                                                                onClick={() => navigate(`/product/${product.slug}`)}
                                                                className="group text-left hover:bg-gray-800 p-1.5 rounded-lg transition-all duration-300 hover:scale-[1.03]"
                                                                >
                                                                <div className="bg-white rounded-md p-1.5 mb-1.5">
                                                                    <img src={product.image} alt={product.name} className="w-full h-28 object-contain transition-transform duration-300 group-hover:scale-110" />
                                                                </div>
                                                                <p className="text-[12px] font-medium text-gray-200 group-hover:text-white line-clamp-2 h-9 leading-tight">
                                                                    {product.name}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <p className="text-[13px] font-bold text-blue-400">${product.price}</p>
                                                                    {product.discountPercent > 0 && (
                                                                        <p className="text-[10px] text-gray-400 line-through">${product.originalPrice}</p>
                                                                    )}
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>


                                            {/* COL 4: FEATURED BANNER */}
                                            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-3 h-fit border border-gray-700">
                                                <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-2 font-semibold">Featured {brand}</p>

                                                {/* Dynamic Banner Image */}
                                                <div className="relative rounded-md overflow-hidden mb-3 bg-white">
                                                    <img
                                                        src={`/images/${brand.toLowerCase()}.svg`}
                                                        alt={`${brand} deals`}
                                                        className="w-full h-32 object-contain p-2"
                                                        onError={(e) => e.target.src = `/images/${brand.toLowerCase()}.png`}
                                                    />
                                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                                        <p className="text-[10px] text-white font-semibold">
                                                            Up to {{ Apple: '10%', Samsung: '25%', Google: '20%' }[brand] || '15%'} OFF
                                                        </p>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleBrandClick(brand)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold px-4 py-2 rounded-md w-full transition-all"
                                                >
                                                    Shop All {brand}
                                                </button>
                                            </div>

                                        </div>
                                    </div>
                                    
                                 
                            </div>
                        ))}
                        {/* DIVIDER */}
<div className="w-px h-5 bg-gray-600 mx-5"></div>

{/* QUICK LINKS SECTION */}
<div className='flex items-center space-x-4'>
  <span className='text-gray-400 mr-2 font-medium whitespace-nowrap ml-3'>Quick Links:</span>
  
  {/* DEALS */}
  <button 
    onClick={() => navigate('/deals')}
    className={`text-sm px-2 py-1.5 rounded-md transition-all duration-200 font-semibold
      ${location.pathname === '/deals' 
        ? 'bg-red-600 text-white' 
        : 'text-red-400 hover:text-white hover:bg-red-600/30'}`}
  >
    💸 Deals
  </button>

  {/* BEST SELLERS */}
  <button 
    onClick={() => navigate('/bestsellers')}
    className={`text-sm px-2 py-1.5 rounded-md flex transition-all duration-200 font-semibold
      ${location.pathname === '/bestsellers' 
        ? 'bg-orange-600 text-white' 
        : 'text-orange-400 hover:text-white hover:bg-orange-600/30'}`}
  >
    <FaFire className="text-sm mt-1 mr-1.5 text-red-500" /> Best Sellers
  </button>

  {/* NEW ARRIVALS */}
  <button 
    onClick={() => navigate('/new-arrivals')}
    className={`text-sm px-2 py-1.5 rounded-md transition-all duration-200 font-semibold
      ${location.pathname === '/new-arrivals' 
        ? 'bg-blue-600 text-white' 
        : 'text-blue-400 hover:text-white hover:bg-blue-600/30'}`}
  >
    ✨ New Arrivals
  </button>

  {/* LATEST PHONES - NEW BUTTON */}
  <button 
    onClick={() => navigate('/products')}
    className={`text-sm px-2 py-1.5 rounded-md transition-all duration-200 font-semibold
      ${location.pathname === '/products' 
        ? 'bg-indigo-600 text-white' 
        : 'text-indigo-400 hover:text-white hover:bg-indigo-600/30'}`}
  >
    📱 Latest Phones
  </button>
</div>
                    </div>

                    {/* DIVIDER + ACCESSORY MENU */}
                    <div className="w-px h-5 bg-gray-600 mx-5"></div>
                    <span className='text-gray-400 mr-3 font-medium whitespace-nowrap flex items-center gap-2'>
                        Accessory:
                        {featuredAccessory && !loadingFeatured && (
                            <span className='flex items-center gap-1 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold px-2 py-0.5 rounded-full border-yellow-500/30 animate-pulse'>
                                🔥 FEATURED
                            </span>
                        )}
                    </span>
                    <div
                        onMouseEnter={() => {
                            setShowAccessoryMenu(true)
                            setShowBrandMenu(null)
                            setHoveredBrand(null)
                        }}
                        className="relative"
                    >
                       <button
  className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-md transition-all duration-200
    ${activeType || showAccessoryMenu? 'bg-gray-700 text-white font-semibold scale-105' : 'text-gray-300 hover:text-white hover:bg-gray-700 hover:scale-105'}`}
>
                            Shop <FaChevronDown className={`text-xs transition-transform duration-200 ${showAccessoryMenu ? 'rotate-180' : ''}`} />
                        </button>

                         
                            <div className={`fixed top-[104px] left-0 w-full bg-[#1a1a1a] text-white shadow-2xl z-[99999] border-t border-gray-700
  transition-all duration-300 ease-out origin-top
  ${showAccessoryMenu
   ? 'opacity-100 translate-y-0 scale-100'
    : 'opacity-0 -translate-y-3 scale-95 pointer-events-none'
  }`}>
                                <div className="container mx-auto px-8 py-5 grid grid-cols-4 gap-8 max-w-[1300px]">
                                    {/*...same accessory columns from V38.26... */}
                                    <div>
                                        <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-4 font-semibold">Shop by Type</p>
                                        <button onClick={() => { navigate('/accessories'); setShowAccessoryMenu(false) }} className="text-[15px] font-semibold hover:text-blue-400 block mb-2.5">All Accessories</button>
                                        {accessoryTypes.map((type) => (
                                            <button key={type.dbValue} onClick={() => handleTypeClick(type.dbValue)} className="text-[15px] font-semibold hover:text-blue-400 block mb-2.5">{type.name}</button>
                                        ))}
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-4 font-semibold">Shop by Category</p>
                                        <div className="space-y-1">
                                            {accessoryTypes.map((type) => type.sub.map((subCat) => {
                                                const slug = subCat.toLowerCase().replace(/\s+/g, '-') // DEFINE SLUG HERE
                                                const dbType = slugToType[slug]

                                                return (
                                                    <button
                                                        key={subCat}
                                                        onClick={() => handleSubCategoryClick(subCat)}
                                                        className={`text-[14px] px-2 py-1 rounded-md block w-full text-left ${activeType === dbType ? 'bg-gray-800 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'
                                                            }`}
                                                    >
                                                        {subCat}
                                                    </button>
                                                )
                                            }))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-4 font-semibold">More to Explore</p>
                                        <div className="space-y-1">
                                            <button
                                                onClick={() => { navigate('/accessories?filter=new'); setShowAccessoryMenu(false) }}
                                                className={`text-[14px] px-2 py-1 rounded-md block w-full text-left ${searchParams.get('filter') === 'new' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}
                                            >
                                                New Arrivals
                                            </button>
                                            <button
                                                onClick={() => { navigate('/accessories?filter=bestseller'); setShowAccessoryMenu(false) }}
                                                className={`text-[14px] px-2 py-1 rounded-md block w-full text-left ${searchParams.get('filter') === 'bestseller' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}
                                            >
                                                Best Sellers
                                            </button>
                                            <button
                                                onClick={() => { navigate('/accessories?filter=deal'); setShowAccessoryMenu(false) }}
                                                className={`text-[14px] px-2 py-1 rounded-md block w-full text-left ${searchParams.get('filter') === 'deal' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}
                                            >
                                                Deals
                                            </button>
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-br from-yellow-900/30 to-gray-900 rounded-lg p-4 h-fit border border-yellow-600/30">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] bg-yellow-500 text-black font-bold px-2 py-0.5 rounded">🔥 FEATURED</span>
                                        </div>

                                        {loadingFeatured ? (
                                            <div className="animate-pulse">
                                                <div className="bg-gray-700 rounded-md h-24 mb-2"></div>
                                                <div className="bg-gray-700 h-3 rounded w-3/4 mb-1"></div>
                                                <div className="bg-gray-700 h-3 rounded w-1/2"></div>
                                            </div>
                                        ) : !featuredAccessory ? (
                                            <div>
                                                <p className="text-xs text-gray-400 mb-3">No featured accessory set</p>
                                                <button
                                                    onClick={() => navigate('/admin/accessorylist')}
                                                    className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-4 py-1.5 rounded-md w-full"
                                                >
                                                    Set Featured
                                                </button>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="bg-white rounded-md p-2 mb-3">
                                                    <img
                                                        src={featuredAccessory.image}
                                                        alt={featuredAccessory.name}
                                                        className="w-full h-24 object-contain"
                                                    />
                                                </div>
                                                <p className="text-[13px] font-semibold text-white line-clamp-2 mb-1">
                                                    {featuredAccessory.name}
                                                </p>
                                                <p className="text-[11px] text-gray-400 mb-2">
                                                    {featuredAccessory.brand}
                                                </p>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <p className="text-[14px] font-bold text-yellow-400">${featuredAccessory.price}</p>
                                                    {featuredAccessory.originalPrice > featuredAccessory.price && (
                                                        <p className="text-[10px] text-gray-500 line-through">${featuredAccessory.originalPrice}</p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        navigate(`/accessory/${featuredAccessory.slug}`)
                                                        setShowAccessoryMenu(false)
                                                    }}
                                                    className="bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold px-4 py-2 rounded-md w-full transition"
                                                >
                                                    View Product
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Navbar




