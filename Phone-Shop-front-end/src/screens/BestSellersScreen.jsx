import { Helmet } from 'react-helmet-async'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import Product from '../components/Product'
import Loader from '../components/Loader'
import Message from '../components/Message'
import {  FaFire } from 'react-icons/fa'

import { useGetBestSellerProductsQuery } from '../slices/productsApiSlice'

const BestSellersScreen = () => {
  const { userInfo } = useSelector((state) => state.auth)

  const {
    data,
    isLoading,
    error,
  } = useGetBestSellerProductsQuery({ limit: 24 }) // <-- 24 products

  const bestSellers = data || []

  return (
    <>
      <Helmet>
        <title>Best Sellers | PhoneStore</title>
        <meta name="description" content="Shop the most popular smartphones. Top rated phones bought by customers." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-block mb-8 text-blue-600 hover:text-blue-800 font-medium transition-colors">
          ← Back to Home
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 flex items-center justify-center gap-2"><FaFire className="text-lg md:text-3xl text-red-500" /> Best Sellers</h1>
          <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
            Discover the smartphones customers are buying the most.
          </p>
        </div>

        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">{error?.data?.message || error.error}</Message>
        ) : bestSellers.length === 0 ? (
          <Message>No best selling products found.</Message>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-500">
                Showing <span className="font-semibold">{bestSellers.length}</span> best selling products
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {bestSellers.map((product) => (
                <Product key={product._id} product={product} userInfo={userInfo} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default BestSellersScreen