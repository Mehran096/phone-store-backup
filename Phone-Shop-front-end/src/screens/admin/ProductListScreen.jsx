import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaSearch } from 'react-icons/fa';
import { useGetProductsQuery, useDeleteProductMutation, useCreateProductMutation } from '../../slices/productsApiSlice';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import Paginate from '../../components/Paginate';
import { toast } from 'react-toastify';

const ProductListScreen = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const pageNumber = searchParams.get('pageNumber') || 1;

  const { data, isLoading, error } = useGetProductsQuery({ keyword, pageNumber });

  const [deleteProduct, { isLoading: loadingDelete }] = useDeleteProductMutation();
  const [createProduct, { isLoading: loadingCreate }] = useCreateProductMutation();

  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState(keyword);

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id).unwrap();
        toast.success('Product deleted');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const createProductHandler = () => {
    navigate('/admin/product/create');
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      setSearchParams({ keyword: searchKeyword, pageNumber: 1 });
    } else {
      setSearchParams({});
    }
  };

  //for pagination
  const handlePageChange = (pageNum) => {
  const newParams = new URLSearchParams()
  if (keyword) newParams.set('keyword', keyword)
  newParams.set('pageNumber', pageNum)
  setSearchParams(newParams)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

  const clearSearch = () => {
    setSearchKeyword('');
    setSearchParams({});
  };

  return (
    <div className='container mx-auto px-4 py-6'>
      {/* Header + Search + Create */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>Products</h1>
        
        <div className='flex flex-col sm:flex-row gap-3 w-full md:w-auto'>
          <form onSubmit={submitHandler} className='flex gap-2 flex-1'>
            <div className='relative flex-1'>
              <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
              <input
                type='text'
                placeholder='Search products...'
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className='w-full pl-10 pr-10 py-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              {searchKeyword && (
                <button
                  type='button'
                  onClick={clearSearch}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
                >
                  <FaTimes />
                </button>
              )}
            </div>
            <button
              type='submit'
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition'
            >
              Search
            </button>
          </form>

          <button
            onClick={createProductHandler}
            disabled={loadingCreate}
            className='flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap'
          >
            <FaPlus /> Create Product
          </button>
        </div>
      </div>

      {/* Loaders */}
      {loadingCreate && <Loader />}
      {loadingDelete && <Loader />}

      {/* Main Content */}
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='error'>{error?.data?.message || error.error}</Message>
      ) : (
        <>
          {/* Desktop Table - Hidden on mobile */}
          <div className='hidden md:block overflow-x-auto bg-white rounded-lg shadow'>
            <table className='w-full table-auto'>
              <thead className='bg-gray-50 border-b'>
                <tr>
                  <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>ID</th>
                  <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>NAME</th>
                  <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>PRICE</th>
                  <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>CATEGORY</th>
                  <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>BRAND</th>
                  <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'></th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {data.products.map((product) => (
                  <tr key={product._id} className='hover:bg-gray-50'>
                    <td className='px-4 py-3 text-sm text-gray-600'>{product._id.substring(18, 24)}...</td>
                    <td className='px-4 py-3 text-sm font-medium text-gray-900'>{product.name}</td>
                    <td className='px-4 py-3 text-sm text-gray-600'>
   ${product.variants?.[0]?.colors?.[0]?.price?.toLocaleString()?? 'N/A'}
</td>

                    <td className='px-4 py-3 text-sm text-gray-600'>{product.category}</td>
                    <td className='px-4 py-3 text-sm text-gray-600'>{product.brand}</td>
                    <td className='px-4 py-3 flex gap-2'>
                      <Link to={`/admin/product/${product._id}/edit`}>
                        <button className='p-2 text-blue-600 hover:bg-blue-50 rounded transition'>
                          <FaEdit />
                        </button>
                      </Link>
                      <button
                        className='p-2 text-red-600 hover:bg-red-50 rounded transition'
                        onClick={() => deleteHandler(product._id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards - Hidden on desktop */}
          <div className='md:hidden space-y-4'>
            {data.products.map((product) => (
              <div key={product._id} className='bg-white p-4 rounded-lg shadow'>
                <div className='flex justify-between items-start mb-2 gap-2'>
                  <h3 className='font-semibold text-lg leading-tight'>{product.name}</h3>
                  <span className='text-xl font-bold text-blue-600 shrink-0'>
  ${product.variants?.[0]?.colors?.[0]?.price?.toLocaleString() ?? 'N/A'}  
</span>
                </div>
                <div className='text-sm text-gray-600 space-y-1 mb-3'>
                  <p><span className='font-medium'>Brand:</span> {product.brand}</p>
                  <p><span className='font-medium'>Category:</span> {product.category}</p>
                  <p className='font-mono text-xs'><span className='font-medium font-sans'>ID:</span> {product._id.substring(18, 24)}...</p>
                </div>
                <div className='flex gap-2'>
                  <Link
                    to={`/admin/product/${product._id}/edit`}
                    className='flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-center text-sm flex items-center justify-center gap-1'
                  >
                    <FaEdit /> Edit
                  </Link>
                  <button
                    onClick={() => deleteHandler(product._id)}
                    className='flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 text-sm flex items-center justify-center gap-1'
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Paginate */}
      <div className='mt-6'>
        <Paginate
          pages={data.pages}
          page={data.page}
          onPageChange={handlePageChange}  
        />
      </div>
        </>
      )}
    </div>
  );
};

export default ProductListScreen;