import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaTrash, FaPlus } from 'react-icons/fa';
import Select from 'react-select';
import { 
  useCreateAccessoryMutation, 
  useUploadAccessoryImageMutation 
} from '../../slices/accessoriesApiSlice';
import { useGetProductsForDropdownQuery } from '../../slices/productsApiSlice'; // NEW
import Loader from '../../components/Loader';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';  
import { HiOutlineArrowsUpDown } from 'react-icons/hi2';  

const AccessoryCreateScreen = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [price, setPrice] = useState(0);
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [specsKey, setSpecsKey] = useState('');
  const [specsValue, setSpecsValue] = useState('');
  const [specs, setSpecs] = useState({}); // Object
  const [selectedProducts, setSelectedProducts] = useState([]); // V21.22.7.29 KEY: ObjectIds
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [search, setSearch] = useState('');
   

  const [createAccessory, { isLoading: loadingCreate }] = useCreateAccessoryMutation();
  const [uploadAccessoryImage] = useUploadAccessoryImageMutation();
  
const { data: productOptions, isLoading: loadingProducts } = useGetProductsForDropdownQuery('');
const options = useMemo(() => productOptions || [], [productOptions]);
 

  const addSpecHandler = () => {
    if (specsKey.trim() && specsValue.trim()) {
      setSpecs({...specs, [specsKey.trim()]: specsValue.trim()});
      setSpecsKey('');
      setSpecsValue('');
    }
  };

  const removeSpecHandler = (key) => {
    const newSpecs = {...specs};
    delete newSpecs[key];
    setSpecs(newSpecs);
  };

  // DRAG N DROP HANDLERS - REPLACE uploadFileHandler + removeImageHandler
const handleFileChange = (e) => {
  const selectedFiles = Array.from(e.target.files);
  if (!selectedFiles.length) return;
  setFiles((prev) => [...prev,...selectedFiles]);
  setPreviews((prev) => [...prev,...selectedFiles.map((file) => URL.createObjectURL(file))]);
};

const handleDrop = (e) => {
  e.preventDefault();
  const droppedFiles = Array.from(e.dataTransfer.files);
  if (!droppedFiles.length) return;
  setFiles((prev) => [...prev,...droppedFiles]);
  setPreviews((prev) => [...prev,...droppedFiles.map((file) => URL.createObjectURL(file))]);
};

const handleDragOver = (e) => {
  e.preventDefault();
};

const removeImageHandler = (index) => {
  URL.revokeObjectURL(previews[index]); // cleanup memory
  setFiles(files.filter((_, i) => i!== index));
  setPreviews(previews.filter((_, i) => i!== index));
  toast.success("Image removed")
};

const onDragEnd = (result) => { // FOR REORDER
  if (!result.destination) return;

  const newFiles = structuredClone(files);
  const [reorderedFile] = newFiles.splice(result.source.index, 1);
  newFiles.splice(result.destination.index, 0, reorderedFile);
  setFiles(newFiles);

  const newPreviews = structuredClone(previews);
  const [reorderedPreview] = newPreviews.splice(result.source.index, 1);
  newPreviews.splice(result.destination.index, 0, reorderedPreview);
  setPreviews(newPreviews);
};

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!type) {
      toast.error('Please select accessory type');
      return;
    }
    if (files.length === 0) {
      toast.error('Please upload at least 1 image');
      return;
    }
    if (selectedProducts.length === 0) {
      toast.error('Please select at least 1 compatible device');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('images', file));
      const uploadedImages = await uploadAccessoryImage(formData).unwrap();

      const payload = {
        name,
        brand,
        category,
        type,
        price: Number(price),
        countInStock: Number(countInStock),
        description,
        specs, // Object
        compatibleWith: selectedProducts.map(s => s.value), // Array of ObjectIds
        keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
        images: uploadedImages,
        image: uploadedImages[0]?.url || '',
      };

      await createAccessory(payload).unwrap();
      toast.success('Accessory Created');
      navigate('/admin/accessorylist');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    } finally {
      setUploading(false);
    }
  };

  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
  const inputClass = 'w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500';
  const cardClass = 'bg-white p-6 rounded-xl shadow-sm border-gray-100';
  const btnPrimary = 'w-full mt-6 py-2.5 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:opacity-50';

  return (
    <div className='max-w-5xl mx-auto p-5'>
      <Link to='/admin/accessorylist' className='text-blue-600 hover:underline mb-3 inline-block text-sm'>Go Back</Link>
      <h1 className='text-2xl font-bold mb-5 text-gray-800'>Create Accessory V21.22.7.29</h1>
      {(loadingCreate || uploading) && <div className='text-center py-4'>Processing...</div>}
      {loadingProducts && <Loader />}
      <form onSubmit={submitHandler} className='space-y-5'>
        
        <div className={cardClass}>
          <h2 className='text-lg font-semibold mb-4 border-b pb-2'>Basic Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelClass}>Name *</label><input type='text' value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required /></div>
            <div><label className={labelClass}>Brand *</label><input type='text' value={brand} onChange={(e) => setBrand(e.target.value)} className={inputClass} required /></div>
            <div><label className={labelClass}>Category *</label><input type='text' value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass} required /></div>
            <div><label className={labelClass}>Type *</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass} required>
                <option value=''>Select Type</option>
                <option value='Case'>Case</option><option value='Charger'>Charger</option>
                <option value='Cable'>Cable</option><option value='Glass'>Glass</option>
                <option value='Headphone'>Headphone</option><option value='Other'>Other</option>
              </select>
            </div>
            <div className='md:col-span-2'><label className={labelClass}>Keywords</label><input type='text' placeholder='comma, separated' value={keywords} onChange={(e) => setKeywords(e.target.value)} className={inputClass} /></div>
          </div>
        </div>

        <div className={cardClass}>
          <h2 className='text-lg font-semibold mb-4 border-b pb-2'>Details</h2>
          <div className="grid grid-cols-1 gap-4">
            {/* SPECS OBJECT */}
            <div>
              <label className={labelClass}>Specs</label>
              <div className='flex gap-2 mb-2'>
                <input type='text' placeholder='Key: Material' value={specsKey} onChange={(e) => setSpecsKey(e.target.value)} className={inputClass} />
                <input type='text' placeholder='Value: TPU' value={specsValue} onChange={(e) => setSpecsValue(e.target.value)} className={inputClass} />
                <button type='button' onClick={addSpecHandler} className='px-4 bg-indigo-600 text-white rounded-md'><FaPlus /></button>
              </div>
              <div className='flex flex-wrap gap-2'>
                {Object.entries(specs).map(([key, val]) => (
                  <div key={key} className='bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2'>
                    <b>{key}:</b> {val}
                    <button type='button' onClick={() => removeSpecHandler(key)} className='text-red-500'><FaTrash size={10}/></button>
                  </div>
                ))}
              </div>
            </div>

            {/* COMPATIBLE WITH - PRODUCT MULTISELECT */}
            <div>
              <label className={labelClass}>Compatible With *</label>
              <Select
                isMulti
                options={options}
                isLoading={loadingProducts}
                onInputChange={(val) => setSearch(val)} // search as you type
                onChange={(selected) => setSelectedProducts(selected || [])}
                value={selectedProducts}
                placeholder="Search iPhone, Samsung, Pixel..."
                noOptionsMessage={() => search? 'No products found' : 'Type to search products'}
                className='text-sm'
              />
              <p className='text-xs text-gray-500 mt-1'>Type to search. You can select multiple devices</p>
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <h2 className='text-lg font-semibold mb-4 border-b pb-2'>Pricing & Stock</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelClass}>Price *</label><input type='number' value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} required /></div>
            <div><label className={labelClass}>Count In Stock *</label><input type='number' value={countInStock} onChange={(e) => setCountInStock(e.target.value)} className={inputClass} required /></div>
          </div>
          <div className='mt-4'><label className={labelClass}>Description</label><textarea rows='4' value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass}></textarea></div>
        </div>

        <div className={cardClass}>
  <h2 className='text-lg font-semibold mb-4 border-b pb-2'>Images</h2>
  
  {/* DRAG DROP ZONE */}
  <div 
    onDrop={handleDrop}
    onDragOver={handleDragOver}
    className='border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 cursor-pointer'
  >
    <p className='text-gray-500'>Drag & drop images here, or</p>
    <input 
      type='file' 
      multiple 
      onChange={handleFileChange} 
      className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:bg-indigo-50 file:text-indigo-700'
    />
  </div>

  {/* PREVIEW + REORDER */}
  {previews.length > 0 && (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="accessory-images" direction="horizontal">
        {(provided) => (
          <div 
            {...provided.droppableProps} 
            ref={provided.innerRef}
            className='grid grid-cols-3 md:grid-cols-6 gap-3 mt-4'
          >
            {previews.map((preview, i) => (
              <Draggable key={i} draggableId={`img-${i}`} index={i}>
                {(provided) => (
                  <div 
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className='relative group'
                  >
                    <img src={preview} alt='preview' className='w-full h-24 object-cover rounded-md border' />
                    <div {...provided.dragHandleProps} className='absolute top-1 left-1 bg-white p-1 rounded cursor-grab'>
                      <HiOutlineArrowsUpDown />
                    </div>
                    <button 
                      type='button' 
                      onClick={() => removeImageHandler(i)} 
                      className='absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100'
                    >
                      <FaTrash size={10} />
                    </button>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )}
</div>

        <button type='submit' disabled={loadingCreate || uploading} className={btnPrimary}>
          <FaPlus className='inline mr-2' /> {uploading? 'Uploading...' : 'Create Accessory'}
        </button>
      </form>
    </div>
  );
};
export default AccessoryCreateScreen;