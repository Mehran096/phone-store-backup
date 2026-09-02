import { Helmet } from 'react-helmet-async'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import Product from '../components/Product'
import Loader from '../components/Loader'
import Message from '../components/Message'

import { useGetNewArrivalProductsQuery } from '../slices/productsApiSlice'

const NewArrivalsScreen = () => {
  const { userInfo } = useSelector((state) => state.auth)

  const {
    data,
    isLoading,
    error,
  } = useGetNewArrivalProductsQuery({ limit: 24 }) // <-- 24 products

  const newArrivals = data || []

  return (
    <>
      <Helmet>
        <title>New Arrivals | PhoneStore</title>
        <meta name="description" content="Check out the latest smartphones just added to PhoneStore." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-block mb-8 text-blue-600 hover:text-blue-800 font-medium transition-colors">
          ← Back to Home
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">✨ New Arrivals</h1>
          <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
            Freshly added smartphones
          </p>
        </div>

        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">{error?.data?.message || error.error}</Message>
        ) : newArrivals.length === 0 ? (
          <Message>No new arrivals available.</Message>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-500">
                Showing <span className="font-semibold">{newArrivals.length}</span> new products
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {newArrivals.map((product) => (
                <Product key={product._id} product={product} userInfo={userInfo} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default NewArrivalsScreen