import React, { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { FaChevronDown, FaBox, FaUser, FaTimes, FaFire, FaStar, FaClock } from 'react-icons/fa'
import { IoLogOutOutline } from "react-icons/io5"
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../slices/authSlice'
import { clearCartItems } from '../slices/cartSlice'
import { resetWishlist } from '../slices/wishlistSlice'
import api from '../utils/axios'

const MobileSidebar = ({ show, setShow }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [openAccessory, setOpenAccessory] = useState(false)
  const [openCategory, setOpenCategory] = useState(true)
  const [openType, setOpenType] = useState(false)
  const [openExplore, setOpenExplore] = useState(false)
  const currentFilter = searchParams.get('filter') // 'latest'

  const { userInfo } = useSelector((state) => state.auth)

  const brands = ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Realme', 'Oppo', 'Vivo']

  const accessoryTypes = [
    { name: 'Cases', dbValue: 'case', sub: ['iPhone Cases', 'Samsung Cases', 'Google Pixel Cases'] },
    { name: 'Chargers', dbValue: 'charger', sub: ['Chargers', 'Fast Chargers 20W+'] },
    { name: 'Cables', dbValue: 'cable', sub: ['Cables', 'USB-C Cables', 'Lightning Cables', 'Adapters'] },
    { name: 'Screen Protectors', dbValue: 'glass', sub: ['Screen Protectors'] },
    { name: 'Audio', dbValue: 'audio', sub: ['Audio Adapters'] },
    { name: 'Holders & Stands', dbValue: 'holder', sub: ['Holders'] },
  ]

  const slugToType = {
    'iphone-cases': 'case', 'samsung-cases': 'case', 'google-pixel-cases': 'case',
    'chargers': 'charger', 'fast-chargers-20w+': 'charger',
    'cables': 'cable', 'usb-c-cables': 'cable', 'lightning-cables': 'cable', 'adapters': 'cable',
    'screen-protectors': 'glass', 'audio-adapters': 'audio', 'holders': 'holder',
  }

  const activeBrand = searchParams.get('brand')
  const activeType = searchParams.get('type')
  const activeFilter = searchParams.get('filter')
  const closeSidebar = () => setShow(false)

  const logoutHandler = async () => {
    if (userInfo?._id) localStorage.removeItem(`cartMerged_${userInfo._id}`)
    try { await api.post('/users/logout', {}, { withCredentials: true }) } catch (err) {}
    dispatch(logout())
    dispatch(clearCartItems())
    dispatch(resetWishlist())
    navigate('/login')
    closeSidebar()
  }

  const handleBrandClick = (brand) => {
    navigate(`/products?brand=${brand}`)
    closeSidebar()
  }

  const handleTypeClick = (dbValue) => {
    navigate(`/accessories?type=${encodeURIComponent(dbValue)}`)
    closeSidebar()
  }

  const handleSubCategoryClick = (subCat) => {
    const slug = subCat.toLowerCase().replace(/\s+/g, '-')
    const dbType = slugToType[slug]
    if (dbType) navigate(`/accessories?type=${encodeURIComponent(dbType)}`)
    else navigate('/accessories')
    closeSidebar()
  }

  const handleAccessoryFilter = (filter) => {
    navigate(`/accessories?filter=${filter}`)
    closeSidebar()
  }

  return (
    <>
      {/* BACKDROP - HIGHER Z INDEX */}
      <div
        onClick={closeSidebar}
        className={`lg:hidden fixed inset-0 bg-black/50 z-[10000] transition-opacity duration-300 ${show? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      {/* SIDEBAR - HIGHEST Z INDEX */}
      <div className={`lg:hidden fixed top-0 left-0 h-full w-[85%] max-w-sm bg-[#0f172a] z-[10001] overflow-y-auto transition-transform duration-300 shadow-2xl ${show? "translate-x-0" : "-translate-x-full"}`}>
        
        {/* HEADER - ADDED z-10 and bg to cover content behind */}
        <div className="sticky top-0 bg-[#0a1120] px-4 py-3 flex items-center justify-between border-b border-gray-700 z-10">
          <Link to='/' onClick={closeSidebar} className="flex items-center gap-2">
            <img src='/assets/logo-horizontal.png' alt='PhoneStore' className='h-10 w-auto' />
            <span className='text-lg font-bold text-white'>PhoneStore</span>
          </Link>
          <button onClick={closeSidebar} className="text-white hover:text-gray-300 transition">
            <FaTimes className="text-2xl" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="px-6 py-4 space-y-6 relative z-0">

          {/* BRANDS */}
          <div className='pt-2'>
            <h3 className="text-gray-400 uppercase text-[11px] tracking-widest mb-3 font-semibold">SHOP BY BRAND</h3>
            {brands.map((brand) => (
              <button key={brand} onClick={() => handleBrandClick(brand)} className={`block w-full text-left py-2.5 text-[16px] hover:text-blue-400 transition ${activeBrand === brand? 'text-blue-400 font-semibold' : 'text-white'}`}>
                {brand}
              </button>
            ))}
          </div>

          {/* QUICK LINKS - NEW SECTION */}
<div className='border-t border-gray-700 pt-4'>
  <h3 className="text-gray-400 uppercase text-[11px] tracking-widest mb-3 font-semibold">QUICK LINKS</h3>

  {/* DEALS */}
  <button
    onClick={() => { navigate('/deals'); closeSidebar() }}
    className={`flex items-center gap-2 w-full text-left py-2.5 text-[16px] transition
      ${location.pathname === '/deals'? 'text-red-400 font-semibold' : 'text-white hover:text-red-400'}`}
  >
    <FaFire className="text-sm text-red-500" /> Deals
  </button>

  {/* BEST SELLERS */}
  <button
    onClick={() => { navigate('/bestsellers'); closeSidebar() }}
    className={`flex items-center gap-2 w-full text-left py-2.5 text-[16px] transition
      ${location.pathname === '/bestsellers'? 'text-orange-400 font-semibold' : 'text-white hover:text-orange-400'}`}
  >
    <FaStar className="text-sm text-orange-400" /> Best Sellers
  </button>

  {/* NEW ARRIVALS */}
  <button
    onClick={() => { navigate('/new-arrivals'); closeSidebar() }}
    className={`flex items-center gap-2 w-full text-left py-2.5 text-[16px] transition
      ${location.pathname === '/new-arrivals'? 'text-blue-400 font-semibold' : 'text-white hover:text-blue-400'}`}
  >
    <FaClock className="text-sm text-blue-400" /> New Arrivals
  </button>

  {/* LATEST PHONES - NEW BUTTON */}
  <button 
  onClick={() => { navigate('/products?filter=latest'); closeSidebar() }}
     
    className={`flex items-center gap-2 w-full text-left py-2.5 text-[16px] transition
      ${location.pathname === '/products' && currentFilter === 'latest'
        ? 'text-blue-400 font-semibold'
        : 'text-white hover:text-blue-400'}`}
  >
    📱 Latest Phones
  </button>
</div>

          {/* ACCESSORY WITH 3 NESTED DROPDOWNS */}
          <div className='border-t border-gray-700 pt-4'>
            <button
              onClick={() => setOpenAccessory(!openAccessory)}
              className="flex items-center justify-between w-full text-gray-400 uppercase text-[11px] tracking-widest mb-3 font-semibold"
            >
              SHOP BY ACCESSORY 
              <FaChevronDown className={`text-xs transition-transform duration-300 ${openAccessory? 'rotate-180' : 'rotate-0'}`} />
            </button>

            <div className={`grid transition-all duration-300 ease-in-out ${openAccessory? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden pl-2 space-y-1">
                
                <button onClick={() => { navigate('/accessories'); closeSidebar() }} className="block w-full text-left py-2 text-[15px] text-gray-300 hover:text-white transition">
                  All Accessories
                </button>

                {/* MORE TO EXPLORE */}
                <button
                  onClick={() => setOpenExplore(!openExplore)}
                  className="flex items-center justify-between w-full text-left py-2 text-[15px] text-gray-300 hover:text-white transition"
                >
                  More to Explore 
                  <FaChevronDown className={`text-[10px] transition-transform duration-300 ${openExplore? 'rotate-180' : 'rotate-0'}`} />
                </button>
                <div className={`grid transition-all duration-300 ease-in-out ${openExplore? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden pl-3 space-y-1">
                    <button 
                      onClick={() => handleAccessoryFilter('new')}
                      className={`flex items-center gap-2 w-full text-left py-2 text-[14px] transition ${activeFilter === 'new'? 'text-blue-400 font-semibold' : 'text-gray-300 hover:text-white'}`}
                    >
                      <FaClock className="text-xs" /> New Arrivals
                    </button>
                    <button 
                      onClick={() => handleAccessoryFilter('bestseller')}
                      className={`flex items-center gap-2 w-full text-left py-2 text-[14px] transition ${activeFilter === 'bestseller'? 'text-blue-400 font-semibold' : 'text-gray-300 hover:text-white'}`}
                    >
                      <FaStar className="text-xs text-yellow-400" /> Best Sellers
                    </button>
                    <button 
                      onClick={() => handleAccessoryFilter('deal')}
                      className={`flex items-center gap-2 w-full text-left py-2 text-[14px] transition ${activeFilter === 'deal'? 'text-blue-400 font-semibold' : 'text-gray-300 hover:text-white'}`}
                    >
                      <FaFire className="text-xs text-orange-400" /> Deals
                    </button>
                  </div>
                </div>

                {/* SHOP BY CATEGORY */}
                <button
                  onClick={() => setOpenCategory(!openCategory)}
                  className="flex items-center justify-between w-full text-left py-2 text-[15px] text-gray-300 hover:text-white transition"
                >
                  Shop by Category
                  <FaChevronDown className={`text-[10px] transition-transform duration-300 ${openCategory? 'rotate-180' : 'rotate-0'}`} />
                </button>
                <div className={`grid transition-all duration-300 ease-in-out ${openCategory? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden pl-3 space-y-1">
                    {accessoryTypes.map((type) => type.sub.map((subCat) => {
                      const slug = subCat.toLowerCase().replace(/\s+/g, '-')
                      const dbType = slugToType[slug]
                      return (
                        <button
                          key={subCat}
                          onClick={() => handleSubCategoryClick(subCat)}
                          className={`block w-full text-left py-2 text-[14px] transition ${activeType === dbType? 'text-blue-400 font-semibold' : 'text-gray-300 hover:text-white'}`}
                        >
                          {subCat}
                        </button>
                      )
                    }))}
                  </div>
                </div>

                {/* SHOP BY TYPE */}
                <button
                  onClick={() => setOpenType(!openType)}
                  className="flex items-center justify-between w-full text-left py-2 text-[15px] text-gray-300 hover:text-white transition"
                >
                  Shop by Type
                  <FaChevronDown className={`text-[10px] transition-transform duration-300 ${openType? 'rotate-180' : 'rotate-0'}`} />
                </button>
                <div className={`grid transition-all duration-300 ease-in-out ${openType? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden pl-3 space-y-1">
                    {accessoryTypes.map((type) => (
                      <button
                        key={type.dbValue}
                        onClick={() => handleTypeClick(type.dbValue)}
                        className={`block w-full text-left py-2 text-[14px] transition ${activeType === type.dbValue? 'text-blue-400 font-semibold' : 'text-gray-300 hover:text-white'}`}
                      >
                        {type.name}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* USER LINKS */}
          {userInfo? (
            <div className='border-t border-gray-700 pt-4'>
              <Link to='/my-account' className='flex items-center gap-2 py-2 hover:text-blue-400 transition' onClick={closeSidebar}><FaUser />My Account</Link>
              <Link to='/myorders' className='flex items-center gap-2 py-2 hover:text-blue-400 transition' onClick={closeSidebar}><FaBox />My Orders</Link>
              <button onClick={logoutHandler} className='flex items-center gap-2 py-2 hover:text-red-400 transition'><IoLogOutOutline className="text-xl" />Logout</button>
            </div>
          ) : (
            <Link to='/login' className='flex items-center gap-2 py-2 hover:text-blue-400 transition mt-2' onClick={closeSidebar}><FaUser />Sign In</Link>
          )}

          {/* ADMIN */}
          {userInfo && userInfo.isAdmin && (
            <div className='border-t border-gray-700 pt-2'>
              <div className='text-gray-400 text-sm mb-1'>Admin</div>
              <Link to='/admin' onClick={closeSidebar} className='block py-2 pl-4 hover:text-blue-400 text-blue-400 font-semibold transition'>Dashboard</Link>
              <Link to='/admin/userlist' onClick={closeSidebar} className='block py-2 pl-4 hover:text-blue-400 transition'>Users</Link>
              <Link to='/admin/productlist' onClick={closeSidebar} className='block py-2 pl-4 hover:text-blue-400 transition'>Products</Link>
              <Link to='/admin/accessorylist' onClick={closeSidebar} className='block py-2 pl-4 hover:text-blue-400 transition'>Accessories</Link>
              <Link to='/admin/orderlist' onClick={closeSidebar} className='block py-2 pl-4 hover:text-blue-400 transition'>Orders</Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default MobileSidebar