import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { listMyOrders } from '../slices/orderSlice'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { FaBox } from 'react-icons/fa'

const MyOrdersScreen = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { userInfo } = useSelector((state) => state.auth)
  const { myOrders, loading: loadingOrders, error: errorOrders } = useSelector((state) => state.order)

  useEffect(() => {
    if (!userInfo) {
      navigate('/login')
    } else {
      dispatch(listMyOrders())
    }
  }, [dispatch, navigate, userInfo])

  const formatCancelReason = (reason) => {
  if(!reason) return ''
  return reason.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')
}

 const getStatus = (order) => {
  if (order.isCancelled) return { 
    text: `Cancelled${order.cancelReason ? ` - ${formatCancelReason(order.cancelReason)}` : ''}`, 
    color: 'bg-red-100 text-red-800' 
  }
  if (order.isDelivered) return { text: 'Delivered', color: 'bg-green-100 text-green-800' }
  if (order.isShipped) return { text: 'Shipped', color: 'bg-blue-100 text-blue-800' }
  if (order.isPaid) return { text: 'Processing', color: 'bg-yellow-100 text-yellow-800' }
  return { text: 'Awaiting Payment', color: 'bg-gray-100 text-gray-800' }
}

  return (
    <>
      <Helmet><title>My Orders | Phone-Store</title></Helmet>
      <div className='container mx-auto px-4 py-6 md:py-8'>
        {/* Center everything like Settings */}
        <div className='flex justify-center'>
          <div className='w-full max-w-4xl'>
            <h1 className='text-2xl md:text-3xl font-bold mb-6 text-center flex items-center justify-center gap-2'>
              <FaBox className='text-blue-600' /> My Orders
            </h1>

            <div className='bg-white p-4 md:p-6 rounded-lg shadow-md'>
              {loadingOrders ? (
                <Loader />
              ) : errorOrders ? (
                <Message variant='danger'>{errorOrders}</Message>
              ) : myOrders?.length === 0 ? (
                <div className='text-center py-8'>
                  <p className='text-gray-500 mb-4'>You haven't placed any orders yet</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className='hidden md:block overflow-x-auto'>
                    <table className='w-full'>
                      <thead><tr className='border-b'>
                        <th className='text-left pb-2'>ORDER ID</th>
                        <th className='text-left pb-2'>DATE</th>
                        <th className='text-left pb-2'>TOTAL</th>
                        <th className='text-left pb-2'>STATUS</th>
                        <th></th>
                      </tr></thead>
                      <tbody>{myOrders.map((order, index) => (
                        <tr key={order._id} className='border-b'>
                          <td className='py-3'>#{order._id.slice(-6).toUpperCase()}</td>
                          <td className='py-3'>{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                          <td className='py-3'>${order.totalPrice.toFixed(2)}</td>
                          <td className='py-3'>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatus(order).color}`}>
                              {getStatus(order).text}
                            </span>
                          </td>
                          <td className='py-3'><button className='text-blue-600 hover:text-blue-800 text-sm font-medium' onClick={() => navigate(`/order/${order._id}`)}>View Details</button></td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className='md:hidden space-y-3'>
                    {myOrders.map((order, index) => (
                      <div key={order._id} className='border border-gray-200 rounded-lg p-4'>
                        <div className='flex justify-between mb-2'>
                          <p className='font-semibold text-sm'>#{order._id.slice(-6).toUpperCase()}</p>
                          <p className='text-xs text-gray-500'>{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                        </div>
                        <div className='mb-3'>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatus(order).color}`}>
                            {getStatus(order).text}
                          </span>
                        </div>
                        <div className='flex justify-between items-center pt-3 border-t'>
                          <p className='font-bold text-lg'>${order.totalPrice.toFixed(2)}</p>
                          <button className='text-blue-600 text-sm font-medium' onClick={() => navigate(`/order/${order._id}`)}>View Details →</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default MyOrdersScreen