import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaTrash } from 'react-icons/fa';
import { useGetAccessoryDetailsQuery, useDeleteAccessoryMutation } from '../../slices/accessoriesApiSlice';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { toast } from 'react-toastify';

const ACCESSORY_TYPE_LABELS = {
  case: 'Case', charger: 'Charger', cable: 'Cable', glass: 'Glass', audio: 'Audio', holder: 'Holder', other: 'Other'
}

const getTypeColor = (type) => {
  const colors = {
    Charger: 'bg-blue-100 text-blue-700', Cable: 'bg-green-100 text-green-700',
    Audio: 'bg-purple-100 text-purple-700', Holder: 'bg-orange-100 text-orange-700',
    Case: 'bg-pink-100 text-pink-700', Glass: 'bg-gray-100 text-gray-700',
  };
  const label = ACCESSORY_TYPE_LABELS[type] || 'Other';
  return colors[label] || 'bg-gray-100 text-gray-700';
};

const AccessoryDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: accessory, isLoading, error } = useGetAccessoryDetailsQuery(id);
  const [deleteAccessory, { isLoading: loadingDelete }] = useDeleteAccessoryMutation();

  const deleteHandler = async () => {
    if (window.confirm('Delete this accessory?')) {
      try {
        await deleteAccessory(id).unwrap();
        toast.success('Accessory deleted');
        navigate('/admin/accessorylist');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  if (isLoading || loadingDelete) return <Loader />;
  if (error) return <Message variant='danger'>{error?.data?.message || error.error}</Message>;

  // Get all images from all variants
  const allImages = accessory.models?.flatMap(m =>
    m.variants?.flatMap(v => v.images?.map(img => img.url) || [])
  ).filter(Boolean) || ['/placeholder.jpg'];

  const totalStock = accessory.models?.reduce((acc, m) => acc + m.variants?.reduce((sum, v) => sum + Number(v.countInStock || 0), 0), 0) || 0;
  const allPrices = accessory.models?.flatMap(m => m.variants?.map(v => Number(v.price) || 0)) || [0];
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const hasRange = minPrice!== maxPrice;

  const TabBtn = ({ tab, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === tab? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
    >
      {label}
    </button>
  );

  return (
    <div className='p-3 sm:p-4'>
      <Link to='/admin/accessorylist' className='flex items-center gap-2 text-blue-600 mb-4 hover:underline text-sm'>
        <FaArrowLeft /> Back to Accessories
      </Link>

      {/* TOP SECTION */}
      <div className='bg-white rounded-lg shadow p-4 sm:p-6 mb-6'>
        <div className='flex flex-col lg:flex-row gap-6'>
          {/* IMAGE GALLERY - FIXED FOR MOBILE + CLEAR IMAGE */}
          <div className='w-full lg:w-1/3'>
            <div className='bg-gray-50 rounded-lg border p-2'>
              <img
                src={allImages[selectedImage]}
                alt={accessory.name}
                className='w-full h-64 sm:h-80 object-contain rounded' // CHANGED: object-contain so image shows fully
              />
            </div>
            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className='flex gap-2 mt-3 overflow-x-auto'>
                {allImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-16 object-contain border-2 rounded cursor-pointer flex-shrink-0 ${selectedImage === idx? 'border-blue-600' : 'border-gray-200'}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* INFO */}
          <div className='flex-1'>
            <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-3'>
              <div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getTypeColor(accessory.accessoryType)}`}>
                  {ACCESSORY_TYPE_LABELS[accessory.accessoryType]}
                </span>
                <h1 className='text-xl sm:text-2xl font-bold mt-2'>{accessory.name}</h1>
                <p className='text-gray-500 text-sm'>Brand: {accessory.brand}</p>
              </div>
              <div className='flex gap-2'>
                <Link to={`/admin/accessory/${id}/edit`} className='p-2 bg-green-600 text-white rounded hover:bg-green-700'><FaEdit /></Link>
                <button onClick={deleteHandler} className='p-2 bg-red-600 text-white rounded hover:bg-red-700'><FaTrash /></button>
              </div>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6'>
              <div><p className='text-gray-500 text-sm'>Price Range</p><p className='font-bold text-lg'>${hasRange? `${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}` : minPrice.toFixed(2)}</p></div>
              <div><p className='text-gray-500 text-sm'>Total Stock</p><p className='font-bold text-lg'>{totalStock}</p></div>
              <div><p className='text-gray-500 text-sm'>Variants</p><p className='font-bold text-lg'>{accessory.models?.reduce((acc, m) => acc + (m.variants?.length || 0), 0)}</p></div>
            </div>

            <p className='mt-4 text-gray-700 text-sm sm:text-base'>{accessory.description}</p>
          </div>
        </div>
      </div>

      {/* TABS - SCROLLABLE ON MOBILE */}
      <div className='bg-white rounded-lg shadow'>
        <div className='border-b flex overflow-x-auto'>
          <TabBtn tab='overview' label='Overview' />
          <TabBtn tab='variants' label='Variants' />
          <TabBtn tab='seo' label='SEO' />
        </div>

        <div className='p-4 sm:p-6'>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <h3 className='font-semibold text-lg mb-4'>Model Details</h3>
              {accessory.models?.map((model, i) => (
                <div key={i} className='mb-4 p-3 sm:p-4 border rounded'>
                  <h4 className='font-bold'>{model.name}</h4>
                  <p className='text-gray-600 text-sm mb-2'>{model.description}</p>
                  {/* MOBILE: 1 col, DESKTOP: 2 col */}
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm'>
                    {model.specs?.map((spec, idx) => (
                      <div key={idx} className='flex flex-col sm:flex-row sm:justify-between border-b py-2'>
                        <span className='text-gray-500 font-medium'>{spec.key}</span>
                        <span className='font-medium'>{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: VARIANTS - HORIZONTAL SCROLL ON MOBILE */}
          {activeTab === 'variants' && (
            <div className='overflow-x-auto'>
              <h3 className='font-semibold text-lg mb-4'>All Variants</h3>
              <table className='min-w-full text-sm'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='p-2 text-left whitespace-nowrap'>Model</th>
                    <th className='p-2 text-left whitespace-nowrap'>Variant</th>
                    <th className='p-2 text-left whitespace-nowrap'>SKU</th>
                    <th className='p-2 text-left whitespace-nowrap'>Price</th>
                    <th className='p-2 text-left whitespace-nowrap'>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {accessory.models?.map(model =>
                    model.variants?.map((v, idx) => (
                      <tr key={idx} className='border-b hover:bg-gray-50'>
                        <td className='p-2'>{model.name}</td>
                        <td className='p-2'>{v.name}</td>
                        <td className='p-2'>{v.sku}</td>
                        <td className='p-2 font-semibold'>${v.price}</td>
                        <td className='p-2'>{v.countInStock}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: SEO */}
          {activeTab === 'seo' && (
            <div className='space-y-4'>
              <h3 className='font-semibold text-lg mb-4'>SEO Information</h3>
              <div>
                <label className='text-sm text-gray-500'>Meta Title</label>
                <p className='p-3 bg-gray-50 rounded border text-sm break-words'>{accessory.metaTitle || 'Not set'}</p>
              </div>
              <div>
                <label className='text-sm text-gray-500'>Meta Description</label>
                <p className='p-3 bg-gray-50 rounded border text-sm break-words'>{accessory.metaDescription || 'Not set'}</p>
              </div>
              <div>
                <label className='text-sm text-gray-500'>Keywords</label>
                <p className='p-3 bg-gray-50 rounded border text-sm break-words'>{accessory.keywords || 'Not set'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccessoryDetailScreen;