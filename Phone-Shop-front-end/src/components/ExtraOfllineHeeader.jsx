import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams, useLocation, } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { logout } from '../slices/authSlice'
import { FaShoppingCart, FaUser, FaBars, FaTimes, FaChevronDown, FaHeart } from 'react-icons/fa'
import { clearCartItems } from '../slices/cartSlice'
import { getWishlist, resetWishlist } from '../slices/wishlistSlice'
import SearchBox from './SearchBox'
import { FaWifi } from 'react-icons/fa'

const Header = ({ isOnline }) => {
  const [userDropdown, setUserDropdown] = useState(false)
  const [adminDropdown, setAdminDropdown] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)



  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const currentBrand = searchParams.get('brand')

  const { wishlistItems } = useSelector((state) => state.wishlist)
  const { cartItems } = useSelector((state) => state.cart)
  const { userInfo } = useSelector((state) => state.auth)

  const brands = ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Realme', 'Oppo', 'Vivo']
  const activeBrand = searchParams.get('brand')

  const logoutHandler = () => {
    dispatch(logout())
    dispatch(clearCartItems())
    dispatch(resetWishlist())
    navigate('/login')
    setUserDropdown(false)
    setIsMobileMenuOpen(false)
  }

  const handleBrandClick = (brand) => {
    navigate(`/products?brand=${brand}`)
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
      <nav className='container mx-auto'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo - always works */}
          <Link
            to='/'
            className='hidden md:flex items-center flex-shrink-0 px-1 py-0.5 border border-transparent hover:border-white rounded-sm transition-all duration-100'
          >
            <img
              src='/assets/logo-horizontal.png'
              alt='PhoneStore'
              className='h-12 w-auto'
            />
            <div className='flex flex-col'>
              <span className='text-xl font-bold text-white leading-none'>PhoneStore</span>
              <span className='text-xs text-gray-400 leading-none'>Your Phone, Our Passion</span>
            </div>
          </Link>

          {/* Mobile logo */}
          <Link
            to='/'
            className='flex md:hidden items-center p-1 border border-transparent hover:border-white rounded-sm duration-100'
          >
            <img
              src='/assets/logo-horizontal.png'
              alt='PhoneStore'
              className='h-12 w-auto'
            />
          </Link>

          {/* Desktop Search - DISABLED OFFLINE */}
          <div className='hidden md:flex flex-1 justify-center mx-8 max-w-md'>
            {isOnline? (
              <SearchBox onSearchComplete={closeMobileMenu} />
            ) : (
              <div className='bg-gray-700 text-gray-400 px-4 py-2 rounded flex items-center w-full'>
                <FaWifi className='mr-2' /> Search unavailable
              </div>
            )}
          </div>

          {/* Desktop Menu */}
          <div className='hidden md:flex items-center space-x-6 pr-5'>
            {/* Cart - DISABLED OFFLINE */}
            {isOnline? (
              <Link
                to='/cart'
                className='flex items-center gap-2 px-2 py-1 border border-transparent hover:border-white rounded-sm transition-all duration-100 relative'
              >
                <FaShoppingCart className='text-xl' />
                <div className='flex flex-col leading-tight'>
                  <span className='text-xs text-gray-300'>Cart</span>
                  <span className='text-sm font-bold'>
                    {cartCount > 0? cartCount : '0'}
                  </span>
                </div>
                {cartCount > 0 && (
                  <span className='absolute -top-1 left-6 bg-orange-400 text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center'>
                    {cartCount}
                  </span>
                )}
              </Link>
            ) : (
              <div className='flex items-center gap-2 px-2 py-1 text-gray-500 cursor-not-allowed'>
                <FaShoppingCart className='text-xl' />
                <div className='flex flex-col leading-tight'>
                  <span className='text-xs'>Cart</span>
                  <span className='text-sm font-bold'>0</span>
                </div>
              </div>
            )}

            {/* Wishlist - DISABLED OFFLINE */}
            {userInfo && (
              isOnline? (
                <Link
                  to='/wishlist'
                  className='flex items-center gap-2 px-2 py-1 border border-transparent hover:border-white rounded-sm transition-all duration-100'
                >
                  <FaHeart className='text-xl' />
                  <div className='flex flex-col leading-tight relative'>
                    <span className='text-xs text-gray-300'>
                      {wishlistItems.length > 0? `${wishlistItems.length} Items` : 'Your'}
                    </span>
                    <span className='text-sm font-bold'>Wishlist</span>
                    {wishlistItems.length > 0 && (
                      <span className='absolute -top-1 -right-6 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center'>
                        {wishlistItems.length}
                      </span>
                    )}
                  </div>
                </Link>
              ) : (
                <div className='flex items-center gap-2 px-2 py-1 text-gray-500 cursor-not-allowed'>
                  <FaHeart className='text-xl' />
                  <div className='flex flex-col leading-tight'>
                    <span className='text-xs'>Your</span>
                    <span className='text-sm font-bold'>Wishlist</span>
                  </div>
                </div>
              )
            )}

            {/* User Dropdown - DISABLED OFFLINE */}
            {userInfo? (
              <div className='relative group'>
                <button
                  onClick={() => isOnline && setUserDropdown(!userDropdown)}
                  disabled={!isOnline}
                  className={`flex items-center gap-2 px-2 py-1 border border-transparent rounded-sm transition-all duration-100 ${isOnline? 'hover:border-white text-white' : 'text-gray-500 cursor-not-allowed'}`}
                >
                  <FaUser />
                  {userInfo.name}
                  <FaChevronDown className='text-xs' />
                </button>

                {/* Dropdown - only render if online */}
                {isOnline && userDropdown && (
                  <div className='absolute right-0 mt-0 w-48 bg-white text-gray-900 rounded-sm shadow-lg py-1 z-50'>
                    <Link
                      to='/profile'
                      className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                      onClick={() => setUserDropdown(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={logoutHandler}
                      className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600'
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              isOnline? (
                <Link
                  to='/login'
                  className='flex items-center gap-2 px-2 py-1 border border-transparent hover:border-white rounded-sm transition-all duration-100 text-white'
                >
                  <FaUser />
                  Sign In
                </Link>
              ) : (
                <div className='flex items-center gap-2 px-2 py-1 text-gray-500 cursor-not-allowed'>
                  <FaUser />
                  Sign In
                </div>
              )
            )}

            {/* Admin Dropdown - DISABLED OFFLINE */}
            {userInfo && userInfo.isAdmin && (
              isOnline? (
                <div className='relative group'>
                  <button className='flex items-center gap-2 px-2 py-1 border border-transparent group-hover:border-white rounded-sm transition-all duration-100 text-white'>
                    Admin
                    <FaChevronDown className='text-xs' />
                  </button>
                  <div className='absolute right-0 mt-0 w-48 bg-white text-gray-900 rounded-sm shadow-lg py-1 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-100'>
                    <Link
                      to='/admin'
                      className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                    >
                      Dashboard
                    </Link>

                    <hr className='my-1 border-gray-200' />

                    <Link
                      to='/admin/userlist'
                      className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                    >
                      Users
                    </Link>

                    <Link
                      to='/admin/productlist'
                      className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                    >
                      Products
                    </Link>

                    <Link
                      to='/admin/orderlist'
                      className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                    >
                      Orders
                    </Link>
                  </div>
                </div>
              ) : (
                <div className='flex items-center gap-2 px-2 py-1 text-gray-500 cursor-not-allowed'>
                  Admin
                  <FaChevronDown className='text-xs' />
                </div>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className='md:hidden pr-6'
          >
            {isMobileMenuOpen? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </nav>

      {/* Brand Navbar - Desktop - DISABLED OFFLINE */}
      <div className='hidden md:block bg-gray-800 border-t border-gray-700'>
        <div className='container mx-auto px-4'>
          <div className='flex space-x-8 h-10 items-center'>
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() => isOnline && handleBrandClick(brand)}
                disabled={!isOnline}
                className={`text-sm px-2 py-1 border border-transparent rounded-sm transition-all duration-100 ${
                  isOnline
                   ? activeBrand === brand
                     ? 'text-white border-white font-bold'
                      : 'text-gray-200 hover:text-white hover:border-white font-normal'
                    : 'text-gray-500 cursor-not-allowed'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className='md:hidden pl-5 fixed top-16 left-0 right-0 bottom-0 bg-gray-900 z-50 overflow-y-auto'>
          <div className='pr-5 py-4'>
            {/* Mobile Search - DISABLED OFFLINE */}
            {isOnline? (
              <SearchBox onSearchComplete={closeMobileMenu} />
            ) : (
              <div className='bg-gray-700 text-gray-400 px-4 py-2 rounded flex items-center'>
                <FaWifi className='mr-2' /> Search disabled
              </div>
            )}

            {/* Mobile Cart - DISABLED OFFLINE */}
            {isOnline? (
              <Link
                to='/cart'
                className='flex items-center gap-2 py-2 hover:text-blue-400 mt-4'
                onClick={closeMobileMenu}
              >
                <FaShoppingCart />
                Cart {cartCount > 0 && `(${cartCount})`}
              </Link>
            ) : (
              <div className='flex items-center gap-2 py-2 text-gray-500 cursor-not-allowed mt-4'>
                <FaShoppingCart />
                Cart (0)
              </div>
            )}

            {/* Wishlist - DISABLED OFFLINE */}
            {userInfo && (
              isOnline? (
                <Link
                  to='/wishlist'
                  className='flex items-center gap-2 py-2 hover:text-red-400 border-t border-gray-700 pt-4 mt-2'
                  onClick={closeMobileMenu}
                >
                  <FaHeart />
                  Wishlist {wishlistItems.length > 0 && `(${wishlistItems.length})`}
                </Link>
              ) : (
                <div className='flex items-center gap-2 py-2 text-gray-500 cursor-not-allowed border-t border-gray-700 pt-4 mt-2'>
                  <FaHeart />
                  Wishlist (0)
                </div>
              )
            )}
          </div>

          {/* Brands - Mobile - DISABLED OFFLINE */}
          <div className='border-t border-gray-700 pt-4 mt-2'>
            <p className='text-gray-400 text-sm mb-2'>Shop by Brand</p>
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() => {
                  if (isOnline) {
                    handleBrandClick(brand)
                    closeMobileMenu()
                  }
                }}
                disabled={!isOnline}
                className={`block w-full text-left py-2 ${
                  isOnline
                   ? `text-lg hover:text-blue-400 ${activeBrand === brand? 'text-blue-400' : 'text-white'}`
                    : 'text-gray-500 cursor-not-allowed'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>

          {/* Mobile User Section - DISABLED OFFLINE */}
          {userInfo? (
            <div className='border-t border-gray-700 pt-4 mt-2'>
              {isOnline? (
                <>
                  <Link
                    to='/profile'
                    className='flex items-center gap-2 py-2 hover:text-blue-400'
                    onClick={closeMobileMenu}
                  >
                    <FaUser />
                    Profile
                  </Link>
                  <button
                    onClick={() => { logoutHandler(); closeMobileMenu() }}
                    className='flex items-center gap-2 py-2 hover:text-blue-400 text-left w-full'
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <div className='flex items-center gap-2 py-2 text-gray-500 cursor-not-allowed'>
                    <FaUser />
                    Profile
                  </div>
                  <div className='flex items-center gap-2 py-2 text-gray-500 cursor-not-allowed'>
                    Logout
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className='border-t border-gray-700 pt-4 mt-2'>
              {isOnline? (
                <Link
                  to='/login'
                  className='flex items-center gap-2 py-2 hover:text-blue-400'
                  onClick={closeMobileMenu}
                >
                  <FaUser />
                  Sign In
                </Link>
              ) : (
                <div className='flex items-center gap-2 py-2 text-gray-500 cursor-not-allowed'>
                  <FaUser />
                  Sign In
                </div>
              )}
            </div>
          )}

          {/* Mobile Admin Section - DISABLED OFFLINE */}
          {userInfo && userInfo.isAdmin && (
            <div className='border-t border-gray-700 pt-4 mt-2'>
              <p className='text-gray-400 text-sm mb-2'>Admin</p>
              {isOnline? (
                <>
                  <Link
                    to='/admin'
                    className='block py-2 hover:text-blue-400'
                    onClick={closeMobileMenu}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to='/admin/userlist'
                    className='block py-2 hover:text-blue-400'
                    onClick={closeMobileMenu}
                  >
                    Users
                  </Link>
                  <Link
                    to='/admin/productlist'
                    className='block py-2 hover:text-blue-400'
                    onClick={closeMobileMenu}
                  >
                    Products
                  </Link>
                  <Link
                    to='/admin/orderlist'
                    className='block py-2 hover:text-blue-400'
                    onClick={closeMobileMenu}
                  >
                    Orders
                  </Link>
                </>
              ) : (
                <div className='block py-2 text-gray-500 cursor-not-allowed'>
                  Admin panel disabled offline
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  )
}

export default Header