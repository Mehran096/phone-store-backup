import { Routes, Route, useLocation } from 'react-router-dom';
 
import { useDispatch, useSelector } from 'react-redux'
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import Header from './components/Header';
import Footer from './components/Footer'
import CartScreen from './screens/CartScreen';
import ShippingScreen from './screens/ShippingScreen';
import PaymentScreen from './screens/PaymentScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import MyOrdersScreen from './screens/MyOrdersScreen';
import AdminDashboard from './screens/admin/AdminDashboard'
import AdminRoute from './components/AdminRoute'
import OrderListScreen from './screens/admin/OrderListScreen';
import ProductListScreen from './screens/admin/ProductListScreen';
import ProductEditScreen from './screens/admin/ProductEditScreen';

import AccessoryListScreen from './screens/admin/AccessoryListScreen';
import AccessoryCreateScreen from './screens/admin/AccessoryCreateScreen';
import AccessoryEditScreen from './screens/admin/AccessoryEditScreen';
import AccessoryDetailScreen from './screens/admin/AccessoryDetailScreen';


import UserListScreen from './screens/admin/UserListScreen';
import UserEditScreen from './screens/admin/UserEditScreen';
// import MyOrdersScreen from './screens/MyOrdersScree'
import ProductCreateScreen from './screens/admin/ProductCreateScreen'
import AllProductsScreen from './screens/AllProductsScreen'
import FAQScreen from './screens/FAQScreen'
import ReturnRefundScreen from './screens/ReturnRefundScreen'
import OrderSuccessScreen from './screens/OrderSuccessScreen';
import ContactScreen from './screens/ContactScreen'
import ForgotPasswordScreen from './screens/ForgotPasswordScreen'
import ResetPasswordScreen from './screens/ResetPasswordScreen'
import WishlistScreen from './screens/WishlistScreen'
import ShippingPolicyScreen from './screens/ShippingPolicyScreen';
import MyAccountScreen from './screens/MyAccountScreen';
import ProductReviewsScreen from './screens/ProductReviewsScreen';
import DealsScreen from './screens/DealsScreen';
import BestSellersScreen from './screens/BestSellersScreen'
import NewArrivalsScreen from './screens/NewArrivalsScreen'
import SearchBox from './components/SearchBox';
import CompareScreen from './screens/CompareScreen';
import CompareBar from './components/CompareBar';
import SearchScreen from './screens/SearchScreen'
 

import { FaExclamationTriangle, FaWifi } from 'react-icons/fa'
import { setCartItems } from './slices/cartSlice'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import api from './utils/axios';
import AccessoryScreen from './screens/AccessoryScreen';
import AccessoryReviewsScreen from './screens/AccessoryReviewsScreen';
import AccessoryViewListScreen from './screens/AccessoryViewListScreen'
import LatestBrandPhone from './screens/LatestBrandPhone'
 
//import AccessoryCategoryListScreen from './screens/AccessoryViewListScreen'
  
 
 
 



function App() {
  const { pathname, search } = useLocation()
 
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
const dispatch = useDispatch()
  const { userInfo } = useSelector((state) => state.auth)
  const { cartItems } = useSelector((state) => state.cart)

   const showCompareBar =
  !isMobileMenuOpen &&
  (
    pathname === "/" ||
    pathname === "/products" ||
    pathname === "/deals" ||
    pathname === "/search"
  );

   const showMobileSearch =
  !isMobileMenuOpen &&
  (
    pathname === "/" ||
    pathname === "/products" ||
    pathname === "/deals"
  );

 useEffect(() => {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
}, [pathname, search])

 // Sync guest cart to DB on login
 useEffect(() => {
  const syncCartOnLogin = async () => {
    if (!userInfo) return

    const hasMerged = localStorage.getItem(`cartMerged_${userInfo._id}`)
    if (hasMerged) return

    try {
      const { data: dbCart } = await api.get('/users/cart', {
        withCredentials: true
      })

      // If guest cart has items, merge via backend
      if (cartItems?.length > 0) {
        const { data: mergedCart } = await api.post(
          '/users/cart',
          { cartItems },
          { withCredentials: true }
        )
        dispatch(setCartItems(mergedCart.cartItems))
        localStorage.removeItem('cart') // Clear guest cart silently
      } else {
        // Just load DB cart
        dispatch(setCartItems(dbCart.cartItems || []))
      }

      localStorage.setItem(`cartMerged_${userInfo._id}`, 'true')
    } catch (err) {
      console.error('Cart sync error:', err.message)
      // Fail silently - no toast
    }
  }

  syncCartOnLogin()
}, [userInfo, dispatch]) // Removed cartItems from deps to prevent loops


  useEffect(() => {
    const setOnline = () => setIsOnline(true)
    const setOffline = () => setIsOnline(false)
    
    window.addEventListener('online', setOnline)
    window.addEventListener('offline', setOffline)
    
    return () => {
      window.removeEventListener('online', setOnline)
      window.removeEventListener('offline', setOffline)
    }
  }, [])

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header isOnline={isOnline} isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen} />
         {/* MOBILE SEARCH BAR - Only shows on mobile */}
         {showMobileSearch && (
      <div className='xl:hidden bg-gray-900 px-4 py-1 sticky top-0 z-40 border-b border-gray-800'>
        <div className='relative'>
          {isOnline ? (
            <SearchBox />
          ) : (
            <div className='bg-gray-800 text-gray-400 px-4 py-2 rounded-lg flex items-center w-full'>
              <FaWifi className='mr-2' /> Search disabled
            </div>
          )}
        </div>
      </div>
        )}

        {!isOnline && (
        <div className='alert alert-warning text-center mb-0 rounded-0'>
          <FaExclamationTriangle className='me-2' style={{ display: 'inline-block' }} />
          No internet connection. Some features may not work.
        </div>
      )}

        <main className="flex-grow">
          <Routes>
             <Route path='/search' element={<SearchScreen isOnline={isOnline} />} />
            <Route path='/bestsellers' element={<BestSellersScreen />} />
            <Route path='/new-arrivals' element={<NewArrivalsScreen />} />
            <Route path='/deals' element={<DealsScreen isOnline={isOnline}/>} />
            <Route path="/compare" element={<CompareScreen />} />
             
            <Route path='/accessories' element={<AccessoryViewListScreen />} />
            <Route path='/accessory/:slug' element={<AccessoryScreen />} />
            <Route path="/accessories/:slug/reviews" element={<AccessoryReviewsScreen />} />
             
            <Route path='/products' element={<LatestBrandPhone isOnline={isOnline}/>} />
            
            <Route path='/faq' element={<FAQScreen />} />
            <Route path='/shipping-policy' element={<ShippingPolicyScreen />} />
            <Route path='/returns' element={<ReturnRefundScreen />} />
            <Route path='/contact' element={<ContactScreen />} />
            <Route path="/product/:slug" element={<ProductScreen isOnline={isOnline} isMobileMenuOpen={isMobileMenuOpen}/>} />
            <Route path="/products/:slug/reviews" element={<ProductReviewsScreen />}/>
            <Route path="/cart" element={<CartScreen />} />
            <Route path="/shipping" element={<ShippingScreen />} />
            <Route path="/payment" element={<PaymentScreen />} />
            <Route path="/placeorder" element={<PlaceOrderScreen />} />
            <Route path='/order-success' element={<OrderSuccessScreen />} />
            <Route path="/order/:id" element={<OrderScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/myorders" element={<MyOrdersScreen />} />
            <Route path="/my-account" element={<MyAccountScreen />} />
            {/* <Route path='/myorders' element={<MyOrdersScreen />} /> */}
            <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
            <Route path="/reset-password/:token" element={<ResetPasswordScreen />} />
            <Route path="/wishlist" element={<WishlistScreen />} />
            <Route path="/" element={<HomeScreen isOnline={isOnline} />} />

            {/* Admin Routes */}
            <Route path="" element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/productlist" element={<ProductListScreen />} />
              <Route path="/admin/product/create" element={<ProductCreateScreen />} />
              <Route path="/admin/product/:id/edit" element={<ProductEditScreen />} />
              {/* Accessories - NEW */}
              <Route path='/admin/accessorylist' element={<AccessoryListScreen />} />
              <Route path='/admin/accessory/create' element={<AccessoryCreateScreen />} />
              <Route path='/admin/accessory/:id/edit' element={<AccessoryEditScreen />} />
              <Route path='/admin/accessory/:id' element={<AccessoryDetailScreen />} />

              <Route path="/admin/orderlist" element={<OrderListScreen />} />
              <Route path="/admin/userlist" element={<UserListScreen />} />
              <Route path="/admin/user/:id/edit" element={<UserEditScreen />} />
            </Route>


          </Routes>
          <ToastContainer />
        </main>
        {showCompareBar && <CompareBar />}
        <Footer />
      </div>
    </>
  );
}

export default App;