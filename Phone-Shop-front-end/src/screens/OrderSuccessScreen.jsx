import { useEffect, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { verifyStripeSession } from '../slices/orderSlice'
import { resetCart } from '../slices/cartSlice'
import Loader from '../components/Loader'
import Message from '../components/Message'

const OrderSuccessScreen = () => {
  const hasVerified = useRef(false)
  const location = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { order, loading, error } = useSelector((state) => state.order)

  const query = new URLSearchParams(location.search)
  const sessionId = query.get('session_id')

  useEffect(() => {
    if (!sessionId) {
      navigate('/')
      return
    }

    if (hasVerified.current) return
    hasVerified.current = true
    dispatch(verifyStripeSession(sessionId))
    dispatch(resetCart())
  }, [sessionId, dispatch, navigate])

  if (loading) return <Loader />
  if (error) return <Message variant='danger'>{error}</Message>

  return (
    <div className="flex justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        <div className="bg-white shadow-xl rounded-lg p-6 md:p-8">
          <div className="text-center mb-8">
            <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
              Payment Successful!
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Thank you for your purchase
            </p>
          </div>

          <div className="border-t border-gray-200">
            <dl className="divide-y divide-gray-200">
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Order ID</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {order?._id}
                </dd>
              </div>

              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  Stripe
                </dd>
              </div>

              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Total Paid</dt>
                <dd className="mt-1 text-sm font-semibold text-gray-900 sm:col-span-2 sm:mt-0">
                  ${order?.totalPrice?.toFixed(2)}
                </dd>
              </div>

              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  A confirmation email has been sent to {order?.user?.email}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={`/order/${order?._id}`}
              className="inline-flex justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              View Order Details
            </Link>
            <Link
              to="/"
              className="inline-flex justify-center rounded-md bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccessScreen