import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaTimes, FaEye } from 'react-icons/fa';
import {
  useGetAccessoriesQuery,
  useDeleteAccessoryMutation,
} from '../../slices/accessoriesApiSlice';
import AdminAccessoryCard from '../../components/admin/AdminAccessoryCard'; // NEW
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import Paginate from '../../components/Paginate';
import { toast } from 'react-toastify';

const ACCESSORY_TYPE_LABELS = {
  case: 'Case',
  charger: 'Charger',
  cable: 'Cable',
  glass: 'Glass',
  audio: 'Audio',
  holder: 'Holder',
  other: 'Other'
}

const getTypeColor = (type) => {
  const colors = {
    Charger: 'bg-blue-100 text-blue-700',
    Cable: 'bg-green-100 text-green-700',
    Audio: 'bg-purple-100 text-purple-700',
    Holder: 'bg-orange-100 text-orange-700',
    Case: 'bg-pink-100 text-pink-700',
    Glass: 'bg-gray-100 text-gray-700',
    Other: 'bg-gray-100 text-gray-700',
  };
  const label = ACCESSORY_TYPE_LABELS[type] || 'Other';
  return colors[label] || 'bg-gray-100 text-gray-700';
};

const getStockBadge = (stock) => {
  if (stock === 0) return <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">Out of Stock</span>;
  if (stock < 50) return <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700">{stock} Low</span>;
  return <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">{stock} In Stock</span>;
};

const AccessoryListScreen = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const accessoryType = searchParams.get('type') || '';
  const pageNumber = searchParams.get('pageNumber') || 1;

  const { data, isLoading, error, refetch } = useGetAccessoriesQuery({ keyword, type: accessoryType, pageNumber });
  const [deleteAccessory, { isLoading: loadingDelete }] = useDeleteAccessoryMutation();
  const [searchKeyword, setSearchKeyword] = useState(keyword);
  const navigate = useNavigate();

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this accessory?')) {
      try {
        await deleteAccessory(id).unwrap();
        toast.success('Accessory deleted');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const submitHandler = (e) => {
  e.preventDefault();
  const newParams = new URLSearchParams()
  if (searchKeyword.trim()) newParams.set('keyword', searchKeyword.trim())
  if (accessoryType) newParams.set('type', accessoryType)
  newParams.set('pageNumber', 1)
  setSearchParams(newParams)
};

  const clearSearch = () => {
  setSearchKeyword('');
  const newParams = new URLSearchParams()
  if (accessoryType) newParams.set('type', accessoryType)  
  setSearchParams(newParams)
};

  //for pagination
  const handlePageChange = (pageNum) => {
  const newParams = new URLSearchParams()
  if (keyword) newParams.set('keyword', keyword)
  if (accessoryType) newParams.set('type', accessoryType)
  newParams.set('pageNumber', pageNum)
  setSearchParams(newParams)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

  // HELPER: Calculate stats for the accessory - MATCHES NEW SCHEMA
  const getAccessoryStats = (accessory) => {
    let totalStock = 0;
    let minPrice = Infinity;
    let maxPrice = 0;

    accessory.models?.forEach(model => {
      model.variants?.forEach(variant => {
        totalStock += Number(variant.countInStock) || 0;
        const price = Number(variant.price) || 0;
        minPrice = Math.min(minPrice, price);
        maxPrice = Math.max(maxPrice, price);
      })
    })

    return {
      totalStock,
      minPrice: minPrice === Infinity? 0 : minPrice,
      maxPrice,
      hasRange: minPrice!== maxPrice,
      modelCount: accessory.models?.length || 0,
      variantCount: accessory.models?.reduce((acc, m) => acc + (m.variants?.length || 0), 0) || 0,
      thumbnail: accessory.models?.[0]?.variants?.[0]?.images?.[0]?.url || '/placeholder.jpg',
      typeLabel: ACCESSORY_TYPE_LABELS[accessory.accessoryType] || 'Other'
    }
  }

  return (
    <div className='p-4'>
      {/* HEADER */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4'>
        <h1 className='text-2xl font-bold'>Accessories</h1>
        <Link
          to='/admin/accessory/create'
          className='bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition'
        >
          <FaPlus /> Create Accessory
        </Link>
      </div>

      {/* SEARCH + FILTER */}
      <form onSubmit={submitHandler} className='mb-6 flex flex-col sm:flex-row gap-3'>
        <div className='relative flex-1'>
          <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
          <input
            type='text'
            placeholder='Search accessories...'
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className='w-full pl-10 pr-10 py-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          {searchKeyword && (
            <FaTimes
              onClick={clearSearch}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600'
            />
          )}
        </div>
       <select
          value={accessoryType}
          onChange={(e) => {
            const newParams = new URLSearchParams(searchParams)
            if (e.target.value) {
              newParams.set('type', e.target.value)
            } else {
              newParams.delete('type')
            }
            newParams.set('pageNumber', 1)
            setSearchParams(newParams)
          }}
          className='p-2 border rounded-lg text-sm'
        >
          <option value="">All Types</option>
          {Object.entries(ACCESSORY_TYPE_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </form>

      {(isLoading || loadingDelete) && <Loader />}
      {error? (
        <Message variant='danger'>{error?.data?.message || error.error}</Message>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className='hidden md:block overflow-x-auto bg-white rounded-lg shadow'>
            <table className='min-w-full'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='py-3 px-4 border-b text-left text-sm font-semibold text-gray-700'>NAME</th>
                  <th className='py-3 px-4 border-b text-left text-sm font-semibold text-gray-700'>TYPE</th>
                  <th className='py-3 px-4 border-b text-center text-sm font-semibold text-gray-700'>MODELS</th>
                  <th className='py-3 px-4 border-b text-center text-sm font-semibold text-gray-700'>VARIANTS</th>
                  <th className='py-3 px-4 border-b text-left text-sm font-semibold text-gray-700'>FROM PRICE</th>
                  <th className='py-3 px-4 border-b text-left text-sm font-semibold text-gray-700'>TOTAL STOCK</th>
                  <th className='py-3 px-4 border-b text-left text-sm font-semibold text-gray-700'>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {data?.accessories?.map((accessory) => {
                  const stats = getAccessoryStats(accessory);
                  return (
                    <tr key={accessory._id} className='hover:bg-gray-50 border-b'>
                      {/* NAME + IMAGE */}
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img src={stats.thumbnail} alt={accessory.name} className="w-12 h-12 rounded-lg object-cover border" />
                          <div>
                            <Link to={`/admin/accessory/${accessory._id}`} className="font-semibold text-gray-800 hover:text-green-600">
                              {accessory.name}
                            </Link>
                            <p className="text-xs text-gray-500">{accessory.brand}</p>
                          </div>
                        </div>
                      </td>

                      {/* TYPE BADGE */}
                      <td className="p-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(accessory.accessoryType)}`}>
                          {stats.typeLabel}
                        </span>
                      </td>

                      {/* MODELS */}
                      <td className="p-3 text-center text-sm">{stats.modelCount}</td>

                      {/* VARIANTS */}
                      <td className="p-3 text-center text-sm">{stats.variantCount}</td>

                      {/* PRICE RANGE */}
                      <td className="p-3 text-sm font-semibold">
                        ${stats.hasRange? `${stats.minPrice.toFixed(2)} - ${stats.maxPrice.toFixed(2)}` : stats.minPrice.toFixed(2)}
                      </td>

                      {/* STOCK */}
                      <td className="p-3">{getStockBadge(stats.totalStock)}</td>

                      {/* ACTIONS */}
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Link to={`/admin/accessory/${accessory._id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                            <FaEye />
                          </Link>
                          <Link to={`/admin/accessory/${accessory._id}/edit`} className="p-2 text-green-600 hover:bg-green-50 rounded">
                            <FaEdit />
                          </Link>
                          <button onClick={() => deleteHandler(accessory._id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className='md:hidden space-y-4'>
            {data?.accessories?.map((accessory) => {
              const stats = getAccessoryStats(accessory);
              return (
                <div key={accessory._id} className='bg-white rounded-lg shadow p-4 border'>
                  <div className='flex gap-3 mb-3'>
                    <img src={stats.thumbnail} alt={accessory.name} className="w-16 h-16 rounded-lg object-cover border" />
                    <div className='flex-1'>
                      <h3 className='font-semibold text-base'>{accessory.name}</h3>
                      <p className='text-xs text-gray-500'>Brand: {accessory.brand}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${getTypeColor(accessory.accessoryType)}`}>
                        {stats.typeLabel}
                      </span>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-2 text-sm mb-3'>
                    <div><p className='text-gray-500'>Models</p><p className='font-medium'>{stats.modelCount}</p></div>
                    <div><p className='text-gray-500'>Variants</p><p className='font-medium'>{stats.variantCount}</p></div>
                    <div>
                      <p className='text-gray-500'>From Price</p>
                      <p className='font-medium'>
                        ${stats.hasRange? `${stats.minPrice.toFixed(2)} - ${stats.maxPrice.toFixed(2)}` : stats.minPrice.toFixed(2)}
                      </p>
                    </div>
                    <div><p className='text-gray-500'>Stock</p><p className='font-medium'>{getStockBadge(stats.totalStock)}</p></div>
                  </div>

                  <div className='flex gap-2 pt-3 border-t'>
                    <Link to={`/admin/accessory/${accessory._id}`} className='flex-1 bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2'><FaEye /> View</Link>
                    <Link to={`/admin/accessory/${accessory._id}/edit`} className='flex-1 bg-green-600 text-white text-center py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2'><FaEdit /> Edit</Link>
                    <button onClick={() => deleteHandler(accessory._id)} className='flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2'><FaTrash /></button>
                  </div>
                </div>
              )
            })}
          </div>

         <div className='mt-6'>
  <Paginate 
    pages={data?.pages} 
    page={data?.page} 
    onPageChange={handlePageChange}
  />
</div>
        </>
      )}
    </div>
  );
};

export default AccessoryListScreen;