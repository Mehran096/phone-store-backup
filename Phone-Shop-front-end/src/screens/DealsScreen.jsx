import { Helmet } from 'react-helmet-async'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import Product from '../components/Product'
import Loader from '../components/Loader'
import Message from '../components/Message'


import { useGetDealsProductsQuery } from '../slices/productsApiSlice'

const DealsScreen = () => {
  const { userInfo } = useSelector((state) => state.auth)

  // Get deals from backend with filters
  const {
    data,
    isLoading,
    error,
  } = useGetDealsProductsQuery({ limit: 24, minDiscount: 5 })

  const deals = data?.deals || []

  return (
    <>
      <Helmet>
        <title>Deals & Discounts | PhoneStore</title>
        <meta
          name="description"
          content="Browse all discounted smartphones and save more on your next purchase."
        />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-block mb-8 text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          ← Back to Home
        </Link>

        {/* Heading */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            💸 Deals & Discounts
          </h1>
          <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
            Discover all smartphones currently available at discounted prices. Limited time offers!
          </p>
        </div>

        {/* Products Section */}
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">
            {error?.data?.message || error.error}
          </Message>
        ) : deals.length === 0 ? (
          <Message>No discounted products available right now. Check back later!</Message>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-500">
                Showing <span className="font-semibold">{data?.count || 0}</span> products on sale
              </p>
            </div>
            
            {/* Product Grid - Same as HomeScreen */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {deals.map((product) => (
                <Product
                  key={product._id}
                  product={product}
                  userInfo={userInfo}
                  showDiscountBadge={true}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default DealsScreen