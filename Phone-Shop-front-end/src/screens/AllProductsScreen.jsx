import { useParams, Link, useSearchParams } from 'react-router-dom'
import Product from '../components/Product'
import Paginate from '../components/Paginate'
import { useGetProductsQuery } from '../slices/productsApiSlice'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { Helmet } from 'react-helmet-async';
 

const AllProductsScreen = ({ isOnline }) => {
   const [searchParams] = useSearchParams()
  const keyword = searchParams.get('keyword') || '' 
  const pageNumber = Number(searchParams.get('pageNumber')) || 1 
  

  const { data, isLoading, error } = useGetProductsQuery({
    keyword: keyword || '',
    pageNumber: pageNumber
  })

  return (
    <>
     {/* SEO start */}
      <Helmet>
        <title>
          {keyword? `Search: ${keyword} | Phone-Store` : 'Buy iPhone & Pixel Phones in Pakistan | Phone-Store'}
        </title>
        <meta 
          name="description" 
          content={keyword 
           ? `Search results for ${keyword} at Phone-Store Pakistan. COD, warranty & fast delivery.` 
            : 'Shop original iPhone, Pixel & flagship phones in Pakistan. COD, warranty & fast delivery in Peshawar.'} 
        />
        <link rel="canonical" href={`https://www.phone-store.asia/products${keyword? `?keyword=${keyword}` : ''}`} />
        <meta name="robots" content={keyword? 'noindex, follow' : 'index, follow'} />
        
        <meta property="og:title" content="Buy iPhone & Pixel Phones in Pakistan | Phone-Store" />
        <meta property="og:url" content="https://www.phone-store.asia/products" />
        <meta property="og:type" content="website" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "iPhone & Pixel Phones Pakistan",
            "url": "https://www.phone-store.asia/products"
          })}
        </script>
      </Helmet>
      {/* SEO end */}
         
     {/* 3. Products Section */}
<div className='container mx-auto px-4 py-8'>
  {/* Back button when searching */}
  {keyword && (
    <Link
      to='/'
      className='inline-block mb-6 text-blue-600 hover:text-blue-800 font-medium'
    >
      ← Go Back
    </Link>
  )}

  <h1 className='text-3xl font-bold text-gray-900 mb-8 text-center'>
    {keyword ? `Search Results for "${keyword}"` : 'Latest Phones'}
  </h1>

  {isLoading ? (
    <Loader />
  ) : error ? (
    <Message variant='danger'>
      {error?.data?.message || error.error}
    </Message>
  ) : (
    <>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'>
        {data.products.map((product) => (
          <Product key={product._id} product={product} />
        ))}
      </div>
      
      {/* Add pagination here */}
      <div className='mt-12 flex justify-center'>
        <Paginate
          pages={data.pages}
          page={data.page}
          keyword={keyword}
          isAdmin={false}
        />
      </div>
    </>
  )}
</div>
    </>
  )
}

export default AllProductsScreen