import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { clearCartItems, resetCart } from '../slices/cartSlice'
import { createCheckoutSession, createOrder, resetOrder } from '../slices/orderSlice'
import CheckoutSteps from '../components/CheckoutSteps'
import Message from '../components/Message'
import { toast } from 'react-toastify'

const PlaceOrderScreen = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [orderPlaced, setOrderPlaced] = useState(false)

  const cart = useSelector((state) => state.cart)
  const { order, success, error, loading } = useSelector((state) => state.order)

  const addDecimals = (num) => {
  return Number((Math.round(num * 100) / 100).toFixed(2)) // FIX: Return Number
}

  // Calculate prices
  const originalItemsPrice = addDecimals(
    cart.cartItems.reduce(
      (acc, item) => acc + (item.originalPrice || item.price) * item.qty,
      0
    )
  )

  const itemsPrice = addDecimals(
    cart.cartItems.reduce(
      (acc, item) => acc + item.price * item.qty,
      0
    )
  )

  const totalDiscount = addDecimals(
    Number(originalItemsPrice) - Number(itemsPrice)
  )

  //this code for shippingPrice
  //const shippingPrice = addDecimals(itemsPrice > 100 ? 0 : 10)

  //this code for shippingRice 0 for both payment methods
  const shippingPrice = 0;

  const TAX_RATE = 5 / 100;

const taxPrice = addDecimals(
  cart.paymentMethod === 'COD'
    ? Number((itemsPrice * TAX_RATE).toFixed(2))
    : 0
)

  const totalPrice = addDecimals(
    Number(itemsPrice) + Number(shippingPrice) + Number(taxPrice)
  )

  const getProductLink = (item) => {
  const base =
    item.variantType === 'accessory'
      ? `/accessory/${item.slug || item.product}`
      : `/product/${item.slug || item.product}`

  // Build query string with all selected options
  const params = new URLSearchParams()
  if (item.color) params.append('color', item.color)
  if (item.storage) params.append('storage', item.storage)
  if (item.model) params.append('model', item.model)
  if (item.variantName) params.append('variant', item.variantName)
  if (item.variantSubName) params.append('variantSub', item.variantSubName)
  if (item.qty && item.qty > 1) params.append('qty', item.qty) // optional

  return `${base}?${params.toString()}`
}

  useEffect(() => {
    if (!cart.paymentMethod) {
      navigate('/payment')
    }
    // REMOVED shippingAddress check - causes redirect loop after order success
  }, [cart.paymentMethod, navigate])



  const placeOrderHandler = async () => {
    try {
      const orderData = {
        orderItems: cart.cartItems.map((item) => ({
          product: item.product, // same field for product + accessory. Backend will split it
          name: item.name,
          image: item.image,
          slug: item.slug,
          price: Number(item.price),
          originalPrice: Number(item.originalPrice),
          discountAmount: Number(item.discountAmount || 0),
          qty: item.qty,
          color: item.color,
          storage: item.storage, // will be undefined for accessories, that's fine

          // === NEW: SEND VARIANT DATA FOR SMART LINKS ===
          variantType: item.variantType || 'product', // 'product' or 'accessory'
          variantName: item.variantName, // 'storage' or 'glass' or 'cable'
          variantSubName: item.variantSubName, // '256GB' or 'White-2-Pack'
          model: item.model, // 'iPhone 17 Pro Max' or 'Universal'
          sku: item.sku,
        })),
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      }

      if (cart.paymentMethod === 'COD') {
        const newOrder = await dispatch(createOrder(orderData)).unwrap() // CAPTURE THE RESPONSE
        navigate(`/order/${newOrder._id}`) // NAVIGATE USING THE RESPONSE
        dispatch(clearCartItems())         // CLEAR AFTER NAVIGATE
        dispatch(resetOrder())             // RESET ORDER STATE
      } else if (cart.paymentMethod === 'Stripe') {
        const session = await dispatch(createCheckoutSession(orderData)).unwrap()
        window.location.href = session.url // Redirect to Stripe
      } else {
        toast.error('Please select a payment method')
      }
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'Failed to place order')
    }
  }

  return (
    <>
      {/* seo start */}
      <Helmet>
        <title>PlaceOrder | Phone-Store</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {/* seo end*/}

      <div className='container mx-auto px-4 py-8'>
        <CheckoutSteps step1 step2 step3 step4 />
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8'>
          <div className='lg:col-span-2 space-y-6'>
            {/* Shipping */}
            <div className='bg-white rounded-lg shadow-md p-6'>
              <h2 className='text-2xl font-bold mb-4'>Shipping</h2>
              <p>
                <span className='font-semibold'>Address: </span>
                {cart.shippingAddress.address}, {cart.shippingAddress.city}{' '}
                {cart.shippingAddress.postalCode}, {cart.shippingAddress.country}
              </p>
            </div>

            {/* Payment Method */}
            <div className='bg-white rounded-lg shadow-md p-6'>
              <h2 className='text-2xl font-bold mb-4'>Payment Method</h2>
              <p><strong>Method: </strong>{cart.paymentMethod}</p>
            </div>

            {/* Order Items */}
            <div className='bg-white rounded-lg shadow-md p-6'>
              <h2 className='text-2xl font-bold mb-4'>Order Items</h2>
              {cart.cartItems.map((item) => (
                <div
                  key={`${item.product}-${item.color}-${item.storage}`}
                  className='flex gap-4 pb-4 border-b border-gray-200 last:border-0'
                >

                  <div className="w-20 h-20 sm:w-28 sm:h-28 flex-shrink-0 bg-gray-50 rounded-xl p-2">
                    <img
                      src={item.image}
                      alt={item.name}
                      className='w-full h-full object-contain'
                    />
                  </div>

                  <div className='flex-1 min-w-0 flex-col justify-between'>
                    <Link
                      to={getProductLink(item)}
                      className='text-blue-600 hover:text-blue-800 font-medium text-sm md:text-base line-clamp-2'
                    >
                      {item.name}
                      {item.variantType === 'accessory' && (
                        <span className="ml-2 bg-purple-100 text-purple-700 text-xs font-medium px-2 py-0.5 rounded">
                          Accessory
                        </span>
                      )}
                    </Link>

                    <div className='text-sm text-gray-500 space-y-1'>
                      {/* Show variant for accessories, color/storage for products */}
                      {item.variantType === 'accessory' && item.variantSubName && (
                        <p className="capitalize">
                          {item.variantName}: {item.variantSubName}
                        </p>
                      )}

                      {item.variantType !== 'accessory' && item.color && (
                        <p>Color: {item.color}</p>
                      )}

                      {item.storage && <p>Storage: {item.storage}</p>}

                      {/* Optional: show model for accessories */}
                      {item.variantType === 'accessory' && item.model && (
                        <p>For: {item.model}</p>
                      )}
                    </div>

                    <div className="mt-2 text-sm space-y-1">
                      {item.discountAmount > 0 && (
                        <>
                          <p className="text-gray-500 line-through">
                            Original Price: ${addDecimals(item.originalPrice)}
                          </p>

                          <p className="text-green-600 font-medium">
                            You Save: ${addDecimals(item.discountAmount)}
                          </p>

                          <p className="font-semibold text-gray-900">
                            Price: ${addDecimals(item.price)}
                          </p>
                        </>
                      )}

                      {item.discountAmount <= 0 && (
                        <p className="font-semibold text-gray-900">
                          Price: ${addDecimals(item.price)}
                        </p>
                      )}

                      <div className="mt-2 text-sm text-gray-600 font-medium">
                        {item.qty} × ${addDecimals(item.price)}
                      </div>

                      <div className="flex items-center justify-between border-t pt-3 mt-3">
                        <span className="text-base font-semibold">
                          Subtotal
                        </span>

                        <span className="text-base sm:text-xl font-semibold text-gray-900 whitespace-nowrap">
                          ${addDecimals(item.qty * item.price)}
                        </span>
                      </div>


                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-lg shadow-md p-6 sticky top-4'>
              <h2 className='text-2xl font-bold mb-6'>Order Summary</h2>

              <div className='space-y-3 mb-6'>
                <div className="flex justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Original Price</span>
                  <span className="font-semibold">${originalItemsPrice}</span>
                </div>

                <div className="flex justify-between pb-3 border-b border-gray-200">
                  <span className="text-green-600">Discount</span>
                  <span className="font-semibold text-green-600">
                    -${totalDiscount}
                  </span>
                </div>

                <div className="flex justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Items</span>
                  <span className="font-semibold">${itemsPrice}</span>
                </div>

                <div className="flex justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-green-600">
                    {Number(shippingPrice) === 0 ? 'Free' : `$${shippingPrice}`}
                  </span>
                </div>

                <div className="flex justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold">${taxPrice}</span>
                </div>

                <div className="flex justify-between pt-3">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-lg font-bold">${totalPrice}</span>
                </div>
              </div>

              {error && <Message variant='danger'>{error}</Message>}

              {cart.paymentMethod === 'Stripe' && (
                <p className="text-xs text-gray-500 mb-3 text-center">
                  You'll be redirected to Stripe to complete payment
                </p>
              )}

              <button
                type='button'
                disabled={cart.cartItems.length === 0 || loading}
                onClick={placeOrderHandler}
                className='w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition'
              >
                {loading ? 'Processing...' : cart.paymentMethod === 'COD' ? 'Place Order' : 'Proceed to Payment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default PlaceOrderScreen