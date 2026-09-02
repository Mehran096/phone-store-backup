import { useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom' // V37.78 KEY: added useNavigate
import { Helmet } from 'react-helmet-async'
import { FaBox, FaHeadphones, FaSearch } from 'react-icons/fa'
import Product from '../components/Product'
import AccessoryCard from '../components/AccessoryCard'
import Paginate from '../components/Paginate'
import Loader from '../components/Loader'
import Message from '../components/Message'
import OfflineMessage from '../components/OfflineMessage'
import { useGetProductsQuery } from '../slices/productsApiSlice'
import { useGetAccessoriesQuery } from '../slices/accessoriesApiSlice'
import { useSelector } from 'react-redux'

const SearchScreen = ({ isOnline }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const keyword = searchParams.get('keyword') || '';
  const pageNumber = Number(searchParams.get('pageNumber')) || 1;
  const accessoryPageNumber = Number(searchParams.get('accessoryPage')) || 1;
  const [activeTab, setActiveTab] = useState('all');
   const [searchKeyword, setSearchKeyword] = useState(keyword);

    // ===== ADD THESE 2 FUNCTIONS for Pagination =====
  const handleProductPageChange = (pageNum) => {
    navigate(`/search?keyword=${keyword}&pageNumber=${pageNum}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAccessoryPageChange = (pageNum) => {
    navigate(`/search?keyword=${keyword}&accessoryPage=${pageNum}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  // ===== END =====

  const { userInfo } = useSelector((state) => state.auth)

  const { data: productData, isLoading: loadingProducts, error: errorProducts, refetch: refetchProducts } = useGetProductsQuery({ keyword, pageNumber });
  const { data: accessoryData, isLoading: loadingAccessories, error: errorAccessories, refetch: refetchAccessories } = useGetAccessoriesQuery({ keyword, pageNumber: accessoryPageNumber });

  const isLoading = loadingProducts || loadingAccessories;
  const error = errorProducts || errorAccessories;

  if (!isOnline || error?.status === 'FETCH_ERROR') {
    return <OfflineMessage refetch={() => {refetchProducts(); refetchAccessories()}} isOnline={isOnline} />
  }

  const products = productData?.products || [];
  const accessories = accessoryData?.accessories || [];
  
  const productPages = productData?.pages || 1;
  const accessoryPages = accessoryData?.pages || 1;
  const productPage = productData?.page || 1;
  const accessoryPage = accessoryData?.page || 1;

  const allResults = [
  ...products.map(p => ({...p, type: 'product'})),
  ...accessories.map(a => ({...a, type: 'accessory'}))
  ];

  // V37.84 KEY: Calculate filtered on the fly, don't depend on state race
  const displayedResults = activeTab === 'all' 
   ? allResults 
    : activeTab === 'products' 
     ? products.map(p => ({...p, type: 'product'}))
      : accessories.map(a => ({...a, type: 'accessory'}));

  const totalResults = allResults.length;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/search?keyword=${keyword}&pageNumber=1`);
  }

   const submitSearchHandler = (e) => { // V37.96 KEY
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/search?keyword=${searchKeyword.trim()}&pageNumber=1`);
    } else {
      navigate('/search');
    }
  };

  return (
    <>
      <Helmet>
        <title>Search: {keyword} - PhoneStore</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <Link to='/' className='inline-block mb-6 text-blue-600 hover:text-blue-800 font-medium'>
          ← Go Back Home
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Search Results for "{keyword}"</h1>
        <p className='text-gray-600 mb-6'>{totalResults} results found</p>
         {/* V37.96 KEY: SMALL SEARCH BAR */}
     <form onSubmit={submitSearchHandler} className="mb-6">
  <div className="flex gap-2 bg-white p-3 rounded-xl shadow-sm border border-gray-200">
    <input
      type="text"
      value={searchKeyword}
      onChange={(e) => setSearchKeyword(e.target.value)}
      placeholder={`Search in "iph" results...`} // dynamic placeholder
      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white"
    />
    <button 
      type="submit"
      className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition flex items-center gap-2"
    >
      <FaSearch className="w-4 h-4" />
      <span className="hidden sm:inline">Search</span>
    </button>
  </div>
</form>
        
        {/* TABS */}
        <div className="flex gap-4 border-b mb-6 overflow-x-auto">
          <button 
            onClick={() => handleTabChange('all')}
            className={`pb-2 px-2 whitespace-nowrap ${activeTab === 'all'? 'border-b-2 border-blue-600 font-semibold' : 'text-gray-500'}`}
          >
            All ({totalResults})
          </button>
          <button 
            onClick={() => handleTabChange('products')}
            className={`pb-2 px-2 flex items-center gap-1 whitespace-nowrap ${activeTab === 'products'? 'border-b-2 border-blue-600 font-semibold' : 'text-gray-500'}`}
          >
            <FaBox /> Products ({products.length})
          </button>
          <button 
            onClick={() => handleTabChange('accessories')}
            className={`pb-2 px-2 flex items-center gap-1 whitespace-nowrap ${activeTab === 'accessories'? 'border-b-2 border-blue-600 font-semibold' : 'text-gray-500'}`}
          >
            <FaHeadphones /> Accessories ({accessories.length})
          </button>
        </div>

        {isLoading? <Loader /> : error? (
          <Message variant='danger'>{error?.data?.message || error.error}</Message>
        ) : displayedResults.length === 0? ( // V37.84 KEY: use displayedResults
          <Message>No results found for "{keyword}"</Message>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {displayedResults.map((item) => (
                item.type === 'product'? (
                  <Product key={`product-${item._id}`} product={item} userInfo={userInfo} />
                ) : (
                  <AccessoryCard key={`accessory-${item._id}`} accessory={item} />
                )
              ))}
            </div>

            {(activeTab === 'products' || activeTab === 'all') && productPages > 1 && (
  <div className='mt-12 flex justify-center'>
    <Paginate 
      pages={productPages} 
      page={productPage} 
      onPageChange={handleProductPageChange} // <-- SIRF YE
    />
  </div>
)}

            {activeTab === 'accessories' && accessoryPages > 1 && (
  <div className='mt-12 flex justify-center'>
    <Paginate 
      pages={accessoryPages} 
      page={accessoryPage} 
      onPageChange={handleAccessoryPageChange} // <-- SIRF YE
    />
  </div>
)}
          </>
        )}
      </div>
    </>
  )
}

export default SearchScreen