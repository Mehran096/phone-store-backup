import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams, useLocation, } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { logout } from '../slices/authSlice'
import { FaShoppingCart, FaUser, FaBars, FaTimes, FaChevronDown, FaHeart, FaUserPlus, FaOutdent, } from 'react-icons/fa'
import { IoLogOutOutline } from "react-icons/io5";
import { clearCartItems } from '../slices/cartSlice'
import { getWishlist, resetWishlist } from '../slices/wishlistSlice'
import SearchBox from './SearchBox'
import { FaWifi } from 'react-icons/fa'
import CollapsibleMenu from './CollapsibleMenu';
import api from '../utils/axios'
import CompareBar from './CompareBar'
import Navbar from './Navbar' 
import MobileSidebar from './MobileSidebar' // ADD AT TOP

const Header = ({ isOnline, isMobileMenuOpen, setIsMobileMenuOpen, }) => {
  const location = useLocation();

  const hideSearchPages = [
    "/login", "/register", "/forgot-password", "/cart", "/shipping",
    "/payment", "/placeorder", "/order-success",
  ]

  const hideSearch =
    hideSearchPages.includes(location.pathname) ||
    location.pathname.startsWith("/reset-password/") ||
    location.pathname.startsWith("/order/") ||
    (location.pathname.startsWith("/products/") && location.pathname.endsWith("/reviews"));

     const hideNavbarRoutes = ['/login', '/register', '/forgot-password'];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname) || 
                           location.pathname.startsWith('/reset-password');

  const [userDropdown, setUserDropdown] = useState(false)
  const [adminDropdown, setAdminDropdown] = useState(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  //const currentBrand = searchParams.get('brand')

  const { wishlist } = useSelector((state) => state.wishlist)
  const { cartItems } = useSelector((state) => state.cart)
  const { userInfo } = useSelector((state) => state.auth)

  const wishlistCount = wishlist.items.length

  //const brands = ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Realme', 'Oppo', 'Vivo']
  
   
  
   

  const logoutHandler = async () => {
    if (userInfo?._id) {
      localStorage.removeItem(`cartMerged_${userInfo._id}`)
    }
    try {
      await api.post('/users/logout', {}, { withCredentials: true })
    } catch (err) {
      console.error('Logout API error:', err.message)
    }
    dispatch(logout())
    dispatch(clearCartItems())
    dispatch(resetWishlist())
    navigate('/login')
    setUserDropdown(false)
    setIsMobileMenuOpen(false)
  }

   

  useEffect(() => {
    if (userInfo) {
      dispatch(getWishlist())
    }
  }, [dispatch, userInfo])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const closeMobileMenu = () => setIsMobileMenuOpen(false)
  const cartCount = cartItems?.reduce((acc, item) => acc + item.qty, 0) || 0

  return (
    <header className='bg-gray-900 shadow-md sticky top-0 z-50 text-white'>
      <nav className='container mx-auto px-2'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <Link to='/' className='hidden md:flex items-center flex-shrink-0 px-1 py-0.5 border border-transparent hover:border-white rounded-sm transition-all duration-100'>
            <img src='/assets/logo-horizontal.png' alt='PhoneStore' className='h-12 w-auto' />
            <div className='flex flex-col'>
              <span className='text-xl font-bold text-white leading-none'>PhoneStore</span>
              <span className='text-xs text-gray-400 leading-none'>Your Phone, Our Passion</span>
            </div>
          </Link>

          <Link to='/' className='flex md:hidden items-center p-1 border border-transparent hover:border-white rounded-sm duration-100'>
            <img src='/assets/logo-horizontal.png' alt='PhoneStore' className='h-12 w-auto' />
          </Link>

          {/* Desktop + Tablet Search */}
{!hideSearch && (
  <div className='hidden xl:flex flex-1 min-w-0 justify-center mx-4 lg:mx-8 max-w-xl'>
    {isOnline ? (
      <SearchBox onSearchComplete={closeMobileMenu} />
    ) : (
      <div className='bg-gray-700 text-gray-400 px-3 md:px-4 py-2 rounded flex items-center w-full text-xs md:text-sm'>
        <FaWifi className='mr-2' /> Search disabled
      </div>
    )}
  </div>
)}

          {/* Desktop Menu */}
          <div className='hidden lg:flex items-center space-x-6 pr-5'>
            {/* Cart */}
            <Link to='/cart' className='flex items-center gap-2 px-2 py-1 border border-transparent hover:border-white rounded-sm transition-all duration-100 text-white relative'>
              <FaShoppingCart className='text-xl' />
              <div className='flex flex-col leading-tight'>
                <span className='text-xs text-gray-300'>Cart</span>
                <span className='text-sm font-bold'>{cartCount > 0? cartCount : '0'}</span>
              </div>
              {cartCount > 0 && (
                <span className='absolute -top-1 left-6 bg-orange-400 text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center'>
                  {cartCount}
                </span>
              )}
            </Link>

            {/* WISHLIST - FIXED */}
            {userInfo && (
              <Link to='/wishlist' className='flex items-center gap-2 px-2 py-1 border border-transparent hover:border-white rounded-sm transition-all duration-100'>
                <FaHeart className='text-xl' />
                <div className='flex flex-col leading-tight relative'>
                  <span className='text-xs text-gray-300'>
                    {wishlistCount > 0? `${wishlistCount} Items` : 'Your'}
                  </span>
                  <span className='text-sm font-bold'>Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className='absolute -top-1 -right-6 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center'>
                      {wishlistCount}
                    </span>
                  )}
                </div>
              </Link>
            )}

            {/* User Dropdown */}
            {userInfo? (
              <div className='relative group'>
                <button className='flex items-center gap-2 px-2 py-1 border border-transparent group-hover:border-white rounded-sm transition-all duration-100 text-white'>
                  <FaUser />
                  {userInfo.name}
                  <FaChevronDown className='text-xs' />
                </button>
                <div className='absolute right-0 mt-0 w-48 bg-white text-gray-900 rounded-sm shadow-lg py-1 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-100'>
                  <Link to='/my-account' className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600'>My Account</Link>
                  <Link to='/myorders' className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600'>My Orders</Link>
                  <button onClick={logoutHandler} className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600'>Logout</button>
                </div>
              </div>
            ) : (
              <Link to='/login' className='flex items-center gap-2 px-2 py-1 border border-transparent hover:border-white rounded-sm transition-all duration-100 text-white'>
                <FaUser /> Sign In
              </Link>
            )}

            {/* Admin Dropdown */}
            {userInfo && userInfo.isAdmin && (
              <div className='relative group'>
                <button className='flex items-center gap-2 px-2 py-1 border border-transparent group-hover:border-white rounded-sm transition-all duration-100 text-white'>
                  Admin <FaChevronDown className='text-xs' />
                </button>
                <div className='absolute right-0 mt-0 w-48 bg-white text-gray-900 rounded-sm shadow-lg py-1 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-100'>
                  <Link to='/admin' className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600'>Dashboard</Link>
                  <hr className='my-1 border-gray-200' />
                  <Link to='/admin/userlist' className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600'>Users</Link>
                  <Link to='/admin/productlist' className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600'>Products</Link>
                  <Link to='/admin/accessorylist' className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600'>Accessories</Link>
                  <Link to='/admin/orderlist' className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600'>Orders</Link>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Icons */}
<div className='lg:hidden gap-4 flex items-center pr-5'>
  
  {/* wishlist mobile */}
  {userInfo && (
    <Link to='/wishlist' className="relative" onClick={closeMobileMenu}>
      <FaHeart className="text-white text-2xl" />
      {wishlistCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {wishlistCount}
        </span>
      )}
    </Link>
  )}

  {/* Cart mobile */}
  <Link to="/cart" className="relative">
    <FaShoppingCart className="text-white text-2xl" />
    {cartCount > 0 && (
      <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
        {cartCount}
      </span>
    )}
  </Link>

  {/* User / Sign In mobile - NEW */}
  {userInfo? (
    <Link to="/my-account" onClick={closeMobileMenu}>
      <FaUser className="text-white text-2xl" />
    </Link>
  ) : (
    <Link to="/login" onClick={closeMobileMenu}>
      <FaUserPlus className="text-white text-2xl" />
    </Link>
  )}

  {/* Mobile Hamburger - ONLY OPEN, NO X */}
  <button 
    className='text-white text-2xl' 
    onClick={() => setIsMobileMenuOpen(true)}
  >
    <FaBars />
  </button>
</div>
        </div>
      </nav> 
      
   {/* Brand Navbar - Desktop */}
{!shouldHideNavbar && <Navbar />}

      {/* Mobile Menu */}
      <MobileSidebar show={isMobileMenuOpen} setShow={setIsMobileMenuOpen} />
    </header>
  )
}

export default Header