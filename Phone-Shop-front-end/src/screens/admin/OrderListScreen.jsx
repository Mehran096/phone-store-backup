import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { listOrders, listAllOrders, deleteOrder, resetDelete } from '../../slices/orderSlice' // <-- ADDED listAllOrders
import { FaSearch, FaDownload } from 'react-icons/fa'
import { toast } from 'react-toastify' // <-- you use toast in export

const OrderListScreen = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '')
  const [cancelCodeFilter, setCancelCodeFilter] = useState(searchParams.get('cancelCode') || 'ALL')

  // CHANGED: get allOrders for dashboard, orders for table
  const { orders, allOrders, loading, loadingAll, error, successDelete, page, pages } = useSelector((state) => state.order)
  const { userInfo } = useSelector((state) => state.auth)

  // CHANGED: filter based on paginated orders for table
  const filteredOrders = orders?.filter(order => {
    if (cancelCodeFilter === 'ALL') return true
    if (cancelCodeFilter === 'ACTIVE') return !order.isCancelled
    return order.cancelCode === cancelCodeFilter
  }) || []

  // CHANGED: stats now use ALL ORDERS but respect the dropdown filter
  const baseOrdersForStats =
    cancelCodeFilter === 'ALL' ? allOrders :
      cancelCodeFilter === 'ACTIVE' ? allOrders?.filter(o => !o.isCancelled) :
        allOrders?.filter(o => o.cancelCode === cancelCodeFilter)


  const cancelStats = {
    totalCancelled: baseOrdersForStats?.filter(o => o.isCancelled).length || 0,
    totalRevenueLost: baseOrdersForStats?.filter(o => o.isCancelled).reduce((acc, o) => acc + o.totalPrice, 0) || 0,
    activeOrders: baseOrdersForStats?.filter(o => !o.isCancelled).length || 0,
    byCode: baseOrdersForStats?.filter(o => o.isCancelled && o.cancelCode)
      .reduce((acc, o) => {
        acc[o.cancelCode] = (acc[o.cancelCode] || 0) + 1
        return acc
      }, {})
  }

  // Get top 3 cancel reasons FROM THE FILTERED SET
  const topCancelReasons = Object.entries(cancelStats.byCode)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      dispatch(listAllOrders()) // <-- NEW: fetch all for dashboard
      const pageNumber = searchParams.get('page') || 1
      const searchKeyword = searchParams.get('keyword') || ''
      dispatch(listOrders({ pageNumber, keyword: searchKeyword })) // for table
    } else {
      navigate('/login')
    }

    if (successDelete) {
      dispatch(resetDelete())
    }

    setKeyword(searchParams.get('keyword') || '')

  }, [dispatch, userInfo, navigate, successDelete, searchParams])

  const deleteHandler = (id) => {
    if (window.confirm('Delete this order? This cannot be undone.')) {
      dispatch(deleteOrder(id))
    }
  }

  const submitHandler = (e) => {
    e.preventDefault()
    if (keyword.trim()) {
      setSearchParams({ keyword: keyword.trim(), page: 1, cancelCode: cancelCodeFilter })
    } else {
      setSearchParams({ page: 1, cancelCode: cancelCodeFilter })
    }
  }

  const formatCancelCode = (code) => {
    if (!code) return '-'
    return code.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Orders</h1>

        <form onSubmit={submitHandler} className="flex w-full md:w-96">
          <div className='relative flex-1'>
            <input
              type="text"
              placeholder="Search by Order ID or User..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {keyword && (
              <button
                type="button"
                onClick={() => {
                  setKeyword('')
                  setCancelCodeFilter('ALL')
                  setSearchParams({ page: 1, cancelCode: 'ALL' })
                }}
                className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-3xl font-light leading-none z-10 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100'
              >
                ×
              </button>
            )}
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700"
          >
            <FaSearch />
          </button>
        </form>
      </div>

      {loading || loadingAll ? ( // <-- ADDED loadingAll
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        <>
          <div className="bg-white p-4 rounded-lg shadow-md mb-4 border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg font-semibold text-gray-800">
                All Orders <span className="text-sm font-normal text-gray-500">({filteredOrders.length} on this page)</span>
              </h2>

              <div className="flex flex-col sm:flex-row gap-2">
                {/* Cancel Code Filter */}
                <select
                  value={cancelCodeFilter}
                  onChange={(e) => {
                    const val = e.target.value
                    setCancelCodeFilter(val)
                    setSearchParams({ keyword, page: 1, cancelCode: val })
                  }}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-56"
                >
                  <option value="ALL">All Orders</option>
                  <option value="ACTIVE">Active Only</option>
                  <option value="ADMIN_CANCEL_COD">ADMIN_CANCEL_COD</option>
                  <option value="USER_REQUEST">USER_REQUEST</option>
                  <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
                  <option value="WRONG_ADDRESS">WRONG_ADDRESS</option>
                  <option value="FRAUD">FRAUD</option>
                  <option value="DUPLICATE_ORDER">DUPLICATE_ORDER</option>
                </select>

                {/* Export CSV Button */}
                <button
                  onClick={() => {
                    if (filteredOrders.length === 0) {
                      toast.info('No orders to export')
                      return
                    }

                    const headers = ['Order ID', 'User', 'Email', 'Date', 'Total', 'Payment', 'Delivery', 'Status', 'Cancel Code', 'Reason']
                    const csvRows = [
                      headers.join(','),
                      ...filteredOrders.map(o => [
                        o._id,
                        `"${o.user?.name || 'Deleted'}"`,
                        `"${o.user?.email || ''}"`,
                        o.createdAt.substring(0, 10),
                        o.totalPrice.toFixed(2),
                        o.isPaid ? 'Paid' : 'Not Paid',
                        o.isDelivered ? 'Delivered' : 'Not Delivered',
                        o.isCancelled ? 'Cancelled' : 'Active',
                        o.cancelCode || '-',
                        `"${o.cancelReason || ''}"`
                      ].join(','))
                    ]

                    const csv = csvRows.join('\n')
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                    const url = window.URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `orders-${cancelCodeFilter}-${new Date().toISOString().split('T')[0]}.csv`
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    window.URL.revokeObjectURL(url)
                    toast.success(`${filteredOrders.length} orders exported`)
                  }}
                  className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition"
                >
                  <FaDownload /> Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Orders */}
            <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800">{baseOrdersForStats?.length || 0}</p>
            </div>

            {/* Active Orders */}
            <div className="bg-white p-5 rounded-lg shadow-md border border-green-200">
              <p className="text-sm text-gray-500">Active Orders</p>
              <p className="text-2xl font-bold text-green-600">{cancelStats.activeOrders}</p>
            </div>

            {/* Cancelled Orders */}
            <div className="bg-white p-5 rounded-lg shadow-md border border-red-200 cursor-pointer hover:shadow-lg" onClick={() => { setCancelCodeFilter('ALL'); setSearchParams({ keyword, page: 1, cancelCode: 'ALL' }) }}>
              <p className="text-sm text-gray-500">Cancelled Orders</p>
              <p className="text-2xl font-bold text-red-600">{cancelStats.totalCancelled}</p>
              <p className="text-xs text-gray-400">
                {baseOrdersForStats?.length ? ((cancelStats.totalCancelled / baseOrdersForStats.length) * 100).toFixed(1) : 0}% cancel rate
              </p>
            </div>

            {/* Revenue Lost */}
            <div className="bg-white p-5 rounded-lg shadow-md border border-orange-200">
              <p className="text-sm text-gray-500">Revenue Lost</p>
              <p className="text-2xl font-bold text-orange-600">${cancelStats.totalRevenueLost.toFixed(2)}</p>
            </div>
          </div>

          {/* Top Cancel Reasons */}
          {cancelStats.totalCancelled > 0 && (
            <div className="bg-white p-4 rounded-lg shadow-md mb-4 border border-gray-200">
              <h3 className="text-md font-semibold text-gray-800 mb-3">Top Cancel Reasons</h3>
              <div className="space-y-2">
                {topCancelReasons.map(([code, count]) => (
                  <div
                    key={code}
                    className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-1 rounded"
                    onClick={() => { setCancelCodeFilter(code); setSearchParams({ keyword, page: 1, cancelCode: code }) }}
                  >
                    <span className="text-sm font-mono text-red-600">
                      {formatCancelCode(code)}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: `${(count / cancelStats.totalCancelled) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cancel Code</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
                <tbody className="bg-white divide-y divide-gray-200">

                  {filteredOrders?.map((order) => (

                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order._id.substring(0, 10)}...</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.user?.name || 'Deleted User'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.createdAt.substring(0, 10)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.totalPrice.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.isCancelled ? 'bg-red-100 text-red-800' :
                          order.isDelivered ? 'bg-green-100 text-green-800' :
                            order.isPaid ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                          {order.isCancelled ? 'Cancelled' : order.isDelivered ? 'Delivered' : order.isPaid ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-red-600">{order.isCancelled ? formatCancelCode(order.cancelCode) : '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link to={`/order/${order._id}`} className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">Details</Link>
                        <button onClick={() => deleteHandler(order._id)} className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filteredOrders?.map((order) => (

              <div key={order._id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{order.user?.name || 'Deleted User'}</h3>
                    <p className="text-xs text-gray-500">#{order._id.substring(0, 8)}</p>
                  </div>
                  <span className="font-bold text-lg">${order.totalPrice.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{order.createdAt.substring(0, 10)}</p>
                <div className="flex gap-2 mb-3 flex-wrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${order.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {order.isPaid ? 'Paid' : 'Not Paid'}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${order.isDelivered ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {order.isDelivered ? 'Delivered' : 'Not Delivered'}
                  </span>
                  {order.isCancelled && (
                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 font-mono">
                      {formatCancelCode(order.cancelCode)}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/order/${order._id}`}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm flex-1 text-center"
                  >
                    Details
                  </Link>
                  <button
                    onClick={() => deleteHandler(order._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm flex-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center items-center mt-6 gap-2 flex-wrap">
              <button
                onClick={() => setSearchParams({ keyword, page: 1, cancelCode: cancelCodeFilter })}
                disabled={page === 1}
                className="px-3 py-1 rounded bg-white text-gray-700 border hover:bg-gray-100 disabled:opacity-50"
              >
                « First
              </button>
              <button
                onClick={() => setSearchParams({ keyword, page: page - 1, cancelCode: cancelCodeFilter })}
                disabled={page === 1}
                className="px-4 py-2 rounded bg-white text-gray-700 border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>

              {[...Array(pages).keys()]
                .filter(x => x + 1 >= page - 2 && x + 1 <= page + 2)
                .map((x) => (
                  <button
                    key={x + 1}
                    onClick={() => setSearchParams({ keyword, page: x + 1, cancelCode: cancelCodeFilter })}
                    className={`px-3 py-1 rounded ${x + 1 === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border hover:bg-gray-100'
                      }`}
                  >
                    {x + 1}
                  </button>
                ))
              }

              <button
                onClick={() => setSearchParams({ keyword, page: page + 1, cancelCode: cancelCodeFilter })}
                disabled={page === pages}
                className="px-4 py-2 rounded bg-white text-gray-700 border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
              <button
                onClick={() => setSearchParams({ keyword, page: pages, cancelCode: cancelCodeFilter })}
                disabled={page === pages}
                className="px-3 py-1 rounded bg-white text-gray-700 border hover:bg-gray-100 disabled:opacity-50"
              >
                Last »
              </button>

              <span className="text-sm text-gray-600 ml-4">
                Page {page} of {pages}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default OrderListScreen