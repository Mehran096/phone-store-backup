import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useGetProductsQuery } from '../slices/productsApiSlice';
import Product from '../components/Product';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Paginate from '../components/Paginate';
import { useSelector } from 'react-redux';

const LatestBrandPhone = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { userInfo } = useSelector((state) => state.auth);
  
  const keyword = searchParams.get('keyword') || '';
  const brand = searchParams.get('brand') || '';
  const filter = searchParams.get('filter') || ''; // latest
  const pageNumber = Number(searchParams.get('pageNumber')) || 1;

  const { data, isLoading, error } = useGetProductsQuery({ 
    keyword,
    brand,
    isLatest: filter === 'latest' ? 'true' : '',
    pageNumber 
  });

  const handlePageChange = (pageNum) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('pageNumber', pageNum)
    setSearchParams(newParams)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const title = filter === 'latest' 
    ? 'Latest Phones' 
    : brand 
    ? `${brand} Phones` 
    : keyword 
    ? `Search: ${keyword}` 
    : 'All Products';

  return (
    <div className='container mx-auto px-4 py-8'>
      <Link to='/' className='inline-block mb-6 text-blue-600 hover:text-blue-800 font-medium'>
        ← Back to Home
      </Link>
      
      <h1 className='text-3xl font-bold mb-8 text-center'>{title}</h1>
      
      {isLoading ? <Loader /> : error ? (
        <Message variant='danger'>{error?.data?.message || error.error}</Message>
      ) : (
        <>
          {data?.products?.length === 0 ? (
            <Message>No products found</Message>
          ) : (
            <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {data?.products?.map((product) => (
                <Product key={product._id} product={product} userInfo={userInfo} />
              ))}
            </div>
          )}
          
          {data?.pages > 1 && (
            <div className='mt-12 flex justify-center'>
              <Paginate 
                pages={data?.pages} 
                page={data?.page} 
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LatestBrandPhone;