import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'; 
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { savePaymentMethod } from '../slices/cartSlice'
import CheckoutSteps from '../components/CheckoutSteps'
import { toast } from 'react-toastify'

function PaymentScreen() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const cart = useSelector((state) => state.cart)
  const { shippingAddress } = cart

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping')
    }
  }, [shippingAddress.address, navigate])

  const [paymentMethod, setPaymentMethod] = useState(cart.paymentMethod || 'Stripe')

  const submitHandler = (e) => {
    e.preventDefault()
    if (!paymentMethod) {
      toast.error('Please select a payment method')
      return
    }
    dispatch(savePaymentMethod(paymentMethod))
    navigate('/placeorder')
  }

  return (
    <>
    {/* seo start */}
       <Helmet>
            <title>Payment | Phone-Store</title>
            <meta name="robots" content="noindex, nofollow" />
        </Helmet>
    {/* seo end*/}
     
    <div className="max-w-2xl mx-auto p-4">
      <CheckoutSteps step1 step2 step3/>
      
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 mt-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Payment Method
          </h1>

          <form onSubmit={submitHandler} className="space-y-4">
            {/* Stripe Option */}
            <label
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                paymentMethod === 'Stripe'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-300'
              }`}
            >
              <input
                type="radio"
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                id="Stripe"
                name="paymentMethod"
                value="Stripe"
                checked={paymentMethod === 'Stripe'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div className="ml-3">
                <span className="font-medium text-gray-900">Stripe</span>
                <p className="text-sm text-gray-500">Pay with credit/debit card</p>
              </div>
            </label>

            {/* COD Option - FIXED: value="COD" not "Cash on Delivery" */}
            <label
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                paymentMethod === 'COD'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-300'
              }`}
            >
              <input
                type="radio"
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                id="COD"
                name="paymentMethod"
                value="COD"
                checked={paymentMethod === 'COD'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div className="ml-3">
                <span className="font-medium text-gray-900">Cash on Delivery</span>
                <p className="text-sm text-gray-500">Pay when you receive your order</p>
              </div>
            </label>

            <button
              type="submit"
              disabled={!paymentMethod}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed mt-6"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
        
    </>
  )
}

export default PaymentScreen