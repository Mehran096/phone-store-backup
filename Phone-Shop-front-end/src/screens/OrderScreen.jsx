import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import {
  FaArrowLeft,
  FaCopy,
  FaHome,
  FaCreditCard,
  FaBox,
  FaTruck,
  FaReceipt
} from 'react-icons/fa';
import {
  getOrderDetails,
  shipOrder,
  deliverOrder,
  cancelOrder,
  resetShip,
  resetDeliver,
  resetCancel,
  retryPayment
} from '../slices/orderSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';

const OrderScreen = () => {
  const { id: orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');

  const [showCancelModal, setShowCancelModal] = useState(false)
const [cancelReason, setCancelReason] = useState('Customer requested')
const [cancelCode, setCancelCode] = useState('ADMIN_CANCEL_COD')

  const { order, loading, error, successShip, successDeliver, successCancel } = useSelector((state) => state.order);
  const { userInfo } = useSelector((state) => state.auth);

  // FIXED: Add Number() + fallbacks for old orders
  const originalItemsPrice =
    order?.orderItems?.reduce(
      (acc, item) => acc + (Number(item.originalPrice) || Number(item.price) || 0) * (Number(item.qty) || 0),
      0
    ) || 0;

  const totalDiscount =
    order?.orderItems?.reduce(
      (acc, item) => acc + (Number(item.discountAmount) || 0) * (Number(item.qty) || 0),
      0
    ) || 0;

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    }
    if (!order || order._id !== orderId) {
      dispatch(getOrderDetails(orderId));
    }

    if (successShip) {
      toast.success('Order marked as shipped');
      dispatch(resetShip());
      dispatch(getOrderDetails(orderId));
    }

    if (successDeliver) {
      toast.success('Order marked as delivered');
      dispatch(resetDeliver());
      dispatch(getOrderDetails(orderId));
    }

    if (successCancel) {
      toast.success('Order cancelled successfully');
      dispatch(resetCancel());
      dispatch(getOrderDetails(orderId));
    }
  }, [dispatch, orderId, order, navigate, userInfo, successShip, successDeliver, successCancel]);

  const copyOrderId = () => {
    navigator.clipboard.writeText(order._id);
    toast.success('Order ID copied!');
  };

  const shipHandler = () => {
    if (!trackingNumber || !carrier) {
      toast.error('Please enter tracking number and carrier');
      return;
    }
    dispatch(shipOrder({ orderId, trackingNumber, carrier }));
  };

  const deliverHandler = () => {
    dispatch(deliverOrder(orderId));
  };

 const cancelHandler = () => {
  setShowCancelModal(true)
};

const handleRetryPayment = () => {
  dispatch(retryPayment(orderId))
}

const confirmCancel = () => {
  if(window.confirm(`Are you sure? This will revert sales + FBT.`)) {
    dispatch(cancelOrder({ 
      id: orderId, 
      cancelReason,
      cancelCode
    }))
    setShowCancelModal(false)
  }
}

  const getOrderStatus = () => {
  if (order.isCancelled) return { text: 'Cancelled', color: 'bg-red-100 text-red-800' }; // <-- ADD THIS FIRST
  if (order.isDelivered) return { text: 'Delivered', color: 'bg-green-100 text-green-800' };
  if (order.isShipped) return { text: 'Shipped', color: 'bg-blue-100 text-blue-800' };
  if (order.isPaid) return { text: 'Processing', color: 'bg-yellow-100 text-yellow-800' };
  return { text: 'Awaiting Payment', color: 'bg-gray-100 text-gray-800' };
};

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  

  return loading ? (
    <Loader />
  ) : error ? (
    <Message variant='danger'>{error}</Message>
  ) : !order || !order._id ? (
    <Loader />
  ) : (
    <>
      <Helmet>
        <title>Order Details | Phone-Store</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header + Copy ID */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 font-medium transition"
          >
            <FaArrowLeft /> Go Back
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Order #{order._id.slice(-7).toUpperCase()}
            </h1>
            <button
              onClick={copyOrderId}
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline self-start sm:self-auto"
            >
              <FaCopy /> Copy Order ID
            </button>
          </div>
        </div>

        {/* 2 Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column - 2/3 */}
          <div className="lg:col-span-2 space-y-4">

            {/* Shipping Card */}
            <div className="bg-white p-5 rounded-lg shadow-sm border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <FaHome className="text-gray-600" />
                <h2 className="text-lg font-semibold">Shipping Address</h2>
              </div>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-gray-900">{order.user?.name}</p>
                <p className="text-gray-600">{order.shippingAddress.address}</p>
                <p className="text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}</p>
                <p className="text-gray-600">Phone: {order.shippingAddress.phone}</p>
                <p className="text-gray-500 text-xs">Email: {order.user?.email}</p>
              </div>
              <div className="mt-4">
                {(() => {
                  const status = getOrderStatus();
                  const Icon = order.isDelivered ? FaTruck : order.isShipped ? FaTruck : FaBox;
                  return (
                    <div className={`flex items-center gap-2 p-3 rounded-md text-sm font-medium ${status.color}`}>
                      <Icon /> {status.text}
                      {order.isDelivered && ` on ${formatDate(order.deliveredAt)}`}
                      {order.isShipped && !order.isDelivered && ` on ${formatDate(order.shippedAt)}`}
                    </div>
                  )
                })()}
              </div>
            </div>

           {/* Payment Card */}
<div className="bg-white p-5 rounded-lg shadow-sm border-gray-200">
  <div className="flex items-center gap-2 mb-4">
    <FaCreditCard className="text-gray-600" />
    <h2 className="text-lg font-semibold">Payment Method</h2>
  </div>
  <p className="text-sm text-gray-700"><strong>{order.paymentMethod}</strong></p>

  {order.isPaid ? (
    <div className="mt-3 p-3 bg-green-50 text-green-700 rounded-md text-sm font-medium">
      Paid on {formatDate(order.paidAt)}
    </div>
  ) : order.paymentMethod === 'COD' ? (
    <div className="mt-3 p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm font-medium">
      Pay when you receive your order
    </div>
  ) : (
    <>
      <div className="mt-3 p-3 bg-blue-50 text-blue-700 rounded-md text-sm font-medium">
        Payment Pending
      </div>
      {/* YE BUTTON NAYA ADD KIYA */}
      {!order.isCancelled && (
        <button
          onClick={handleRetryPayment}
          disabled={loading}
          className="w-full mt-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm text-sm font-semibold disabled:opacity-50"
        >
          {loading ? 'Redirecting...' : 'Pay Again'}
        </button>
      )}
    </>
  )}
</div>

            {/* Order Items */}
            <div className="bg-white p-5 rounded-lg shadow-sm border-gray-200">
              <h2 className="text-lg font-semibold mb-4">Order Items</h2>
              {order.orderItems.length === 0 ? (
                <Message>Order is empty</Message>
              ) : (
                <div className="space-y-4">
                  {order.orderItems.map((item, index) => {
                    // FIXED: Add fallbacks for every number field
                    const isAccessory = !!item.accessory
                    const isProduct = !!item.product
                    const price = Number(item.price) || 0
                    const qty = Number(item.qty) || 0
                    const originalPrice = Number(item.originalPrice) || price
                    const discountAmount = Number(item.discountAmount) || 0

                    const getProductLink = (item) => {
                      const isAccessory = !!item.accessory

                      // Safe: check if object or just ID string
                      const productId = item.product && typeof item.product === 'object'
                        ? item.product._id
                        : item.product

                      const accessoryId = item.accessory && typeof item.accessory === 'object'
                        ? item.accessory._id
                        : item.accessory

                      const slug = item.slug || productId || accessoryId

                      // If both are deleted, return # to prevent crash
                      if (!slug) return '#'

                      const base = isAccessory
                        ? `/accessory/${slug}`
                        : `/product/${slug}`

                      const params = new URLSearchParams()
                      if (item.color) params.append('color', item.color)
                      if (item.storage) params.append('storage', item.storage)
                      if (item.model) params.append('model', item.model)

                      // === KEY FIX FOR BULK PRICE ===
                      if (item.variantName) params.append('variant', item.variantName) // holder, glass, cable etc
                      if (item.variantSubName) params.append('variantSub', item.variantSubName) // White-2-Pack, 256GB etc

                      if (item.qty && item.qty > 1) params.append('qty', item.qty)

                      return `${base}?${params.toString()}`
                    }

                    return (
                      <div key={index} className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition">
                        {/* Image */}
                        <Link to={getProductLink(item)} className="w-20 h-20 sm:w-28 sm:h-28 flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-contain rounded-xl bg-gray-50 p-2 border-gray-100"
                          />
                        </Link>

                        {/* Details + Price */}
                        <div className="flex-1 flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <Link
                                to={getProductLink(item)}
                                className="text-blue-600 hover:underline font-semibold text-sm sm:text-base line-clamp-2"
                              >
                                {item.name}
                              </Link>
                              {isAccessory && <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-0.5 rounded">Accessory</span>}
                              {isProduct && <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded">Product</span>}
                            </div>

                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-600 mt-1">
                              {item.color && <span className="bg-gray-100 px-2 py-0.5 rounded">Color: {item.color}</span>}
                              {item.storage && <span className="bg-gray-100 px-2 py-0.5 rounded">Storage: {item.storage}</span>}
                              {item.model && <span className="bg-gray-100 px-2 py-0.5 rounded">For: {item.model}</span>}
                              {item.variantName && <span className="bg-gray-100 px-2 py-0.5 rounded">{item.variantName}</span>}
                              <span className="bg-gray-100 px-2 py-0.5 rounded">Qty: {qty}</span>
                            </div>
                          </div>

                          <div className="mt-2 space-y-1">
                            {discountAmount > 0 && (
                              <>
                                <div className="text-sm text-gray-500 line-through">
                                  Original: ${originalPrice.toFixed(2)}
                                </div>
                                <div className="text-sm font-medium text-green-600">
                                  Discount: -${discountAmount.toFixed(2)}
                                </div>
                              </>
                            )}

                            <div className="flex items-end justify-between gap-2 sm:gap-3">
                              <span className="text-sm text-gray-600 whitespace-nowrap flex-shrink-0">
                                {qty} × ${price.toFixed(2)}
                              </span>
                              <span className="sm:text-lg font-bold text-gray-900">
                                ${(qty * price).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - 1/3 Summary + Admin */}
          <div className="lg:col-span-1 space-y-4">

            {/* Order Summary Card */}
            <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl shadow-sm border-gray-200 lg:sticky lg:top-4">
              <div className="flex items-center gap-2 mb-4">
                <FaReceipt className="text-gray-700" />
                <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Original Price</span>
                  <span className="font-medium text-gray-900">
                    ${originalItemsPrice.toFixed(2)}
                  </span>
                </div>

                {totalDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">
                      -${totalDiscount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Items Subtotal</span>
                  <span className="font-medium text-gray-900">${Number(order.itemsPrice || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium text-gray-900">${Number(order.shippingPrice || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span className="font-medium text-gray-900">${Number(order.taxPrice || 0).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-base font-bold text-gray-900">Order Total</span>
                    <span className="text-xl sm:text-2xl font-bold text-gray-900">${Number(order.totalPrice || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin: Ship Order Card */}
            {userInfo?.isAdmin && !order.isShipped && !order.isCancelled && (
              <div className="bg-white p-5 rounded-xl shadow-sm border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <FaTruck className="text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Mark As Shipped</h2>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Tracking Number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full px-3 py-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Carrier e.g. DHL, FedEx"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="w-full px-3 py-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={shipHandler}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Shipping...' : 'Ship Order'}
                  </button>
                </div>
              </div>
            )}

            {/* Admin: Mark As Delivered Card */}
            {userInfo?.isAdmin && order.isShipped && !order.isDelivered && !order.isCancelled && (
              <div className="bg-white p-5 rounded-xl shadow-sm border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <FaBox className="text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Mark As Delivered</h2>
                </div>
                <button
                  type="button"
                  onClick={deliverHandler}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-2.5 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-sm text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Marking...' : 'Mark As Delivered'}
                </button>
              </div>
            )}

           {/* Admin - Cancel Order Card */}
{userInfo?.isAdmin && !order?.isCancelled && order?.isDelivered && order?.paymentMethod === 'COD' && (
  <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
    <div className="flex items-center gap-2 mb-4">
      <FaBox className="text-red-600" />
      <h2 className="text-lg font-semibold text-gray-900">Cancel Order</h2>
    </div>
    <p className="text-sm text-gray-600 mb-3">
      Cancel this COD order. Sales and FBT will be reverted.
    </p>
    <button
      type="button"
      onClick={cancelHandler}
      disabled={loading}
      className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-2.5 rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-sm text-sm font-semibold disabled:opacity-50"
    >
      {loading ? 'Cancelling...' : 'Cancel Order'}
    </button>
  </div>
)}

{/* Cancel Modal */}
{showCancelModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl p-6 w-full max-w-md">
      <h3 className="text-lg font-bold mb-4">Cancel Order</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Cancel Code</label>
          <select 
            value={cancelCode}
            onChange={(e) => setCancelCode(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="ADMIN_CANCEL_COD">ADMIN_CANCEL_COD</option>
            <option value="USER_REQUEST">USER_REQUEST</option>
            <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
            <option value="WRONG_ADDRESS">WRONG_ADDRESS</option>
            <option value="FRAUD">FRAUD</option>
            <option value="DUPLICATE_ORDER">DUPLICATE_ORDER</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Reason</label>
          <input
            type="text"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Enter reason..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button 
          onClick={() => setShowCancelModal(false)}
          className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg text-sm font-medium"
        >
          Close
        </button>
        <button 
          onClick={confirmCancel}
          className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium"
        >
          Confirm Cancel
        </button>
      </div>
    </div>
  </div>
)}

{/* Show if already cancelled */}
{userInfo?.isAdmin && order.isCancelled && (
  <div className="bg-red-50 p-5 rounded-xl shadow-sm border border-red-200">
    <div className="text-sm font-semibold text-red-800 mb-2">
      Order Cancelled on {formatDate(order.cancelledAt)}
    </div>
    <div className="text-xs text-red-700 space-y-1">
      <p><strong>Code:</strong> {order.cancelCode}</p>
      <p><strong>Reason:</strong> {order.cancelReason}</p>
      {order.isRefunded && (
        <p><strong>Refunded:</strong> {formatDate(order.refundedAt)}</p>
      )}
    </div>
  </div>
)}
          </div>
        </div>
      </div>
    </>
  )
}

export default OrderScreen;