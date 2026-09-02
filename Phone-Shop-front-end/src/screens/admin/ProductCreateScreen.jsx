import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlus } from 'react-icons/fa';
import { useCreateProductMutation, useUploadProductImageMutation } from '../../slices/productsApiSlice';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { HiOutlineArrowsUpDown } from 'react-icons/hi2'; // V32.10 Drag handle icon
 

const ProductCreateScreen = () => {

  const navigate = useNavigate();
  const [createProduct, { isLoading: loadingCreate }] = useCreateProductMutation();
  const [uploadProductImage, { isLoading: loadingUpload }] = useUploadProductImageMutation();

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [keywords, setKeywords] = useState('');
  const [accessories, setAccessories] = useState('');
  const [variants, setVariants] = useState([{
    storage: '',
    description: '',
    specs: {},
    specsJson: '',
    colors: [{
      name: '', 
      hexCode: '#000000', 
      files: [], 
      images: [],
      price: '', 
      discount: {
        type: "percentage",
        value: "",
        startDate: "",
        endDate: "",
        isActive: false,
      }, 
      countInStock: '', 
      sku: '' 
  }] // V37.03 KEY: add files:[]
                }]);

  const [uploading, setUploading] = useState(false);

  const addVariantHandler = () => setVariants([...variants, {
    storage: '',
    description: '',
    specs: {},
    specsJson: '',
    colors: [{ name: '', hexCode: '#000000', files: [], images: [], price: '',discount: {
  type: "percentage",
  value: "",
  startDate: "",
  endDate: "",
  isActive: false,
}, countInStock: '', sku: '' }] // V37.03 KEY
          }]);
  const removeVariantHandler = (vIndex) => setVariants(variants.filter((_, i) => i !== vIndex));
  const updateVariant = (vIndex, field, value) => setVariants(v => v.map((item, i) => i === vIndex ?
    { ...item, [field]: value } : item));
  const updateVariantSpec = (vIndex, field, value) => setVariants(v => v.map((item, i) => i === vIndex ?
    { ...item, specs: { ...item.specs, [field]: value } } : item));
  const addColorHandler = (vIndex) => setVariants(v => v.map((item, i) => i === vIndex ? {
    ...item,
    colors: [...item.colors, { name: '', hexCode: '#000000', files: [], images: [], price: '', discount: {
  type: "percentage",
  value: "",
  startDate: "",
  endDate: "",
  isActive: false,
}, countInStock: '', sku: '' }]
        } : item));
  const removeColorHandler = (vIndex, cIndex) => setVariants(v => v.map((item, i) => i === vIndex ?
    { ...item, colors: item.colors.filter((_, ci) => ci !== cIndex) } : item));
  const updateColor = (vIndex, cIndex, field, value) =>
  setVariants((v) =>
    v.map((item, i) =>
      i === vIndex
        ? {
            ...item,
            colors: item.colors.map((c, ci) => {
              if (ci !== cIndex) return c;

              // Handle nested discount fields
              if (field.startsWith("discount.")) {
                const discountField = field.split(".")[1];

                return {
                  ...c,
                  discount: {
                    ...c.discount,
                    [discountField]: value,
                  },
                };
              }

              // Handle normal fields
              return {
                ...c,
                [field]: value,
              };
            }),
          }
        : item
    )
  );

 

  const uploadFileHandler = (vIndex, cIndex, e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setVariants(prev => prev.map((v, i) => i === vIndex ? {
      ...v, colors: v.colors.map((c, j) => j === cIndex ? {
        ...c,
        files: [...(c.files || []), ...files], // only files
      } : c)
    } : v));

    e.target.value = '';
  };


  const removeImageHandler = (vIndex, cIndex, fileIndex) => {
    const fileToRemove = variants[vIndex].colors[cIndex].files[fileIndex];
    URL.revokeObjectURL(URL.createObjectURL(fileToRemove)); // cleanup

    setVariants(prev => prev.map((v, i) => i === vIndex ? {
      ...v, colors: v.colors.map((c, j) => j === cIndex ? {
        ...c,
        files: (c.files || []).filter((_, idx) => idx !== fileIndex),
      } : c)
    } : v));
    toast.success("Image removed")
  };
  //drag n drop
  //drag n drop
  const onDragEnd = (result, vIndex, cIndex) => {
    if (!result.destination) return;

    setVariants(prev => {
      const newVariants = structuredClone(prev);
      const files = [...(newVariants[vIndex].colors[cIndex].files || [])];

      const [reordered] = files.splice(result.source.index, 1);
      files.splice(result.destination.index, 0, reordered);

      newVariants[vIndex].colors[cIndex].files = files;
      return newVariants;
    });
  };

   

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);

      // V37.01 KEY 1: UPLOAD ALL NEW FILES FIRST
      const formData = new FormData();
      variants.forEach(v => {
        v.colors.forEach(c => {
          c.files?.forEach(file => formData.append('images', file));
        })
      });

      let uploaded = [];
      if (formData.has('images')) {
        const data = await uploadProductImage(formData).unwrap();
        uploaded = Array.isArray(data) ? data : [data];
      }
      setUploading(false);

      // V37.01 KEY 2: MAP UPLOADED URLS BACK TO COLORS
      // V37.05 KEY: MAP UPLOADED URLS BACK TO COLORS
      // V37.06 KEY: MAP TO OBJECTS {url, imagePublicId}
      let uploadIndex = 0;
      const finalVariants = variants
        .filter(v => v.storage && v.colors.some(c => c.name && c.price))
        .map(v => ({
          storage: v.storage,
          description: v.description,
          specs: v.specs,
          colors: v.colors
            .filter(c => c.name && c.price)
            .map(c => {
              // V37.06 KEY 1: get uploaded objects
              const newImages = (c.files || []).map(() => {
                const img = uploaded[uploadIndex];
                uploadIndex++;
                return img; // img is already {url, imagePublicId}
              }) || [];

              // V37.06 KEY 2: keep old objects + filter out blob previews
              const oldImages = c.images.filter(i => typeof i === 'object' && i.url && !i.url.startsWith('blob:'));

              return {
                name: c.name,
                hexCode: c.hexCode || '',
                images: [...oldImages, ...newImages], // V37.06 KEY: send objects
                price: Number(c.price),
                discount: {
  type: c.discount?.type || "percentage",
  value: Number(c.discount?.value) || 0,
  startDate: c.discount?.startDate || null,
  endDate: c.discount?.endDate || null,
  isActive: c.discount?.isActive ?? false,
},
                countInStock: Number(c.countInStock),
                sku: c.sku
              }
            })
        }));

      const payload = {
        name,
        brand,
        category,
        keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
        // accessories: accessories.split(',').map(a => a.trim()).filter(Boolean),  
        variants: finalVariants,
      };

      await createProduct(payload).unwrap();
      toast.success('Product Created');
      navigate('/admin/productlist');
    } catch (err) {
      setUploading(false);
      toast.error(err?.data?.message || err.error);
    }
  };

  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
  const inputClass = 'w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none';
  const cardClass = 'bg-white p-6 rounded-xl shadow-sm border-gray-100';
  const btnSecondary = 'px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center gap-2';
  const btnPrimary = 'w-full mt-6 py-2.5 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors';

  return (
    <div className='max-w-5xl mx-auto p-5'>
      <Link to='/admin/productlist' className='text-blue-600 hover:underline mb-3 inline-block text-sm'> Go Back</Link>
      <h1 className='text-2xl font-bold mb-5 text-gray-800'>Create Product V9.63</h1>
      {loadingCreate && <div className='text-center py-4'>Loading...</div>}
      <form onSubmit={submitHandler} className='space-y-5'>
        <div className={cardClass}>
          <h2 className='text-lg font-semibold mb-4 border-b pb-2 text-gray-800'>Basic Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelClass}>Name *</label><input type='text' value={name} onChange={e => setName(e.target.value)} className={inputClass} required /></div>
            <div><label className={labelClass}>Brand *</label><input type='text' value={brand} onChange={e => setBrand(e.target.value)} className={inputClass} required /></div>
            <div><label className={labelClass}>Category *</label><input type='text' value={category} onChange={e => setCategory(e.target.value)} className={inputClass} required /></div>
            <div><label className={labelClass}>Keywords</label><input type='text' placeholder='comma, separated' value={keywords} onChange={e => setKeywords(e.target.value)} className={inputClass} /></div>
            {/* <div className='md:col-span-2'><label className={labelClass}>Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} className={inputClass} rows={3}/></div>
            <div className='md:col-span-2'><label className={labelClass}>Accessories</label><input type='text' placeholder='Box, Charger' value={accessories} onChange={e => setAccessories(e.target.value)} className={inputClass} /></div> */}
          </div>
        </div>

        <div className={cardClass}>
          <h2 className='text-lg font-semibold mb-4 border-b pb-2 text-gray-800'>Variants V9.47</h2>
          {variants.map((variant, vIndex) => (
            <div key={vIndex} className='border border-gray-200 p-5 mb-4 rounded-lg bg-gray-50'>
              <div className='flex justify-between items-center mb-3'>
                <h3 className='font-semibold text-gray-800'>Variant {vIndex + 1}</h3>
                {variants.length > 1 && <button type='button' onClick={() => removeVariantHandler(vIndex)} className='text-red-500 text-sm hover:underline'>Remove</button>}
              </div>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-4 mb-4'>
                <div><label className={labelClass}>Storage *</label><input type='text' placeholder='256GB' value={variant.storage} onChange={e => updateVariant(vIndex, 'storage', e.target.value)} className={inputClass} /></div>
                <div className='md:col-span-2'><label className={labelClass}>Variant Description</label><input type='text' placeholder='256GB Variant text' value={variant.description} onChange={e => updateVariant(vIndex, 'description', e.target.value)} className={inputClass} /></div>
              </div>
              <h4 className='font-semibold mt-2 mb-3 text-gray-700'>Specs for {variant.storage || 'Variant'}</h4>
              <div className='mb-4'>
                <label className={labelClass}>Specs JSON *</label>
                <textarea
                  rows={10}
                  placeholder={`{\n  "Display": "6.88 inch HD+ 120Hz",\n  "Processor": "Unisoc T7250",\n  "RAM": "3GB",\n  "Storage": "64GB eMMC 5.1",\n  "Camera": "32MP AI Dual Camera"\n}`}
                  value={variant.specsJson}
                  onChange={(e) => {
                    const specsJson = e.target.value;
                    let specs = {};
                    try { specs = JSON.parse(specsJson) } catch { } // ignore error while typing
                    updateVariant(vIndex, 'specsJson', specsJson);
                    updateVariant(vIndex, 'specs', specs);
                  }}
                  className={inputClass + ' font-mono text-sm'}
                />
                <p className='text-xs text-gray-500 mt-1'>Paste JSON here. Add unlimited keys. Comma between each line</p>
              </div>

              <h4 className='font-semibold mt-4 mb-3 text-gray-700'>Colors / SKUs</h4>
              {variant.colors.map((color, cIndex) => {
                const allPreviews = (color.files || []).map((f, i) => ({
                  type: 'file',
                  id: `file-${vIndex}-${cIndex}-${i}-${f.name}`,
                  file: f,
                  preview: URL.createObjectURL(f)
                }));
                return (
                  <div key={cIndex} className="border-l-4 border-blue-500 pl-4 mb-4 bg-white p-4 rounded-r-lg shadow-sm">
                    <div className='flex justify-between items-center mb-2'>
                      <label className={labelClass}>Color {cIndex + 1}</label>
                      {variant.colors.length > 1 && <button type='button' onClick={() => removeColorHandler(vIndex, cIndex)}
                        className='text-red-500 text-sm hover:underline'>Remove Color</button>}
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-2'>
                      <div><label className={labelClass}>Color Name *</label><input type='text' placeholder='Black Titanium'
                        value={color.name} onChange={e => updateColor(vIndex, cIndex, 'name', e.target.value)}
                        className={inputClass} /></div>
                      <div>
                        <label className={labelClass}>Hex Color *</label>
                        <input
                          type="color"
                          value={color.hexCode || '#000000'}
                          onChange={(e) =>
                            updateColor(vIndex, cIndex, 'hexCode', e.target.value)
                          }
                          className="w-16 h-10 border rounded cursor-pointer"
                        />
                        <span className="ml-2 text-sm text-gray-600">
                          {color.hexCode || '#000000'}
                        </span>
                      </div>
                      
                    </div>
                    <div className='grid grid-cols-2 gap-4 mb-3'>
                      <div><label className={labelClass}>Price *</label><input type='number'
                        value={color.price} onChange={e => updateColor(vIndex, cIndex, 'price', e.target.value)}
                        className={inputClass} /></div>
                      <div><label className={labelClass}>Stock *</label><input type='number'
                        value={color.countInStock} onChange={e => updateColor(vIndex, cIndex, 'countInStock', e.target.value)}
                        className={inputClass} /></div>
                    </div>
                    {/* discount date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

  <div>
    <label className={labelClass}>Start Date</label>
    <input
      type="date"
      value={color.discount?.startDate || ""}
      onChange={(e) =>
        updateColor(vIndex, cIndex, "discount.startDate", e.target.value)
      }
      className={inputClass}
    />
  </div>

  <div>
    <label className={labelClass}>End Date</label>
    <input
      type="date"
      value={color.discount?.endDate || ""}
      onChange={(e) =>
        updateColor(vIndex, cIndex, "discount.endDate", e.target.value)
      }
      className={inputClass}
    />
  </div>

</div>
                    {/* sku - discount*/}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-2 mt-2'>
                       
                      
                        <div>
  <label className={labelClass}>Discount Type</label>

  <select
    value={color.discount?.type || "percentage"}
    onChange={(e) =>
      updateColor(vIndex, cIndex, "discount.type", e.target.value)
    }
    className={inputClass}
  >
    <option value="percentage">Percentage (%)</option>
    <option value="fixed">Fixed Amount</option>
  </select>
</div>

<div>
  <label className={labelClass}>
    {color.discount?.type === "fixed"
      ? "Discount Amount"
      : "Discount (%)"}
  </label>

  <input
    type="number"
    min="0"
    placeholder="0"
    value={color.discount?.value || ""}
    onChange={(e) =>
      updateColor(vIndex, cIndex, "discount.value", e.target.value)
    }
    className={inputClass}
  />
</div>
<div><label className={labelClass}>SKU</label><input type='text' placeholder='A17-256-BLK'
                        value={color.sku} onChange={e => updateColor(vIndex, cIndex, 'sku', e.target.value)}
                        className={inputClass} /></div>
                    </div>
                    

                    {/* V9.63 KEY: Compact Clean Upload UI */}
                    <label className={labelClass}>Images *</label>
                    <div className='mb-3'>
                      <label className='inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-md border-dashed border-blue-300 cursor-pointer hover:bg-blue-100 transition-colors text-sm font-medium'>
                        <FaPlus />
                        <span>
                          {uploading[`v${vIndex}-c${cIndex}`] ? 'Uploading...' : 'Select Images'}
                        </span>
                        <input type='file' multiple accept="image/*" onChange={(e) => uploadFileHandler(vIndex, cIndex, e)}
                          className='hidden' disabled={uploading[`v${vIndex}-c${cIndex}`]} />
                      </label>
                    </div>
                    {uploading[`v${vIndex}-c${cIndex}`] && <div className='text-blue-600 text-sm mb-2 animate-pulse'>Uploading to Cloudinary...</div>}

                    <div className='flex flex-wrap gap-3 p-3 bg-gray-100 rounded-lg min-h-24'>
                      <DragDropContext onDragEnd={(result) => onDragEnd(result, vIndex, cIndex)}>
                        <Droppable droppableId={`dnd-${vIndex}-${cIndex}`} direction="horizontal">
                          {(provided) => (
                            <div className="flex gap-3 flex-wrap w-full" {...provided.droppableProps} ref={provided.innerRef}>

                              {allPreviews.map((item, imgIndex) => ( // ✅ FIX 1
                                <Draggable key={item.id} draggableId={item.id} index={imgIndex}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={`relative w-20 h-20 group ${snapshot.isDragging ? 'ring-2 ring-blue-500' : ''}`}
                                    >
                                      {/* DRAG HANDLE ONLY */}
                                      <div {...provided.dragHandleProps} className='absolute top-1 left-1 bg-black/60 p-1 rounded cursor-grab z-10'>
                                        <HiOutlineArrowsUpDown className="text-white text-xs" />
                                      </div>

                                      <img
                                        src={item.preview} // ✅ FIX 2: use item.preview
                                        alt={`img-${imgIndex}`}
                                        className="w-20 h-20 lg:w-24 lg:h-24 object-contain rounded-lg bg-white border-gray-200 p-1 flex-shrink-0"
                                      />

                                      {/* DELETE BUTTON */}
                                      <button
                                        onClick={() => removeImageHandler(vIndex, cIndex, imgIndex)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                                      >
                                        X
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
                    </div>
                    <button type='button' onClick={() => addColorHandler(vIndex)} className={btnSecondary + ' mt-3'}><FaPlus size={12} /> Add Color</button>
                  </div>
                )
              })}
              <button type='button' onClick={addVariantHandler} className={btnSecondary + ' mt-2'}><FaPlus size={12} /> Add Variant</button>
            </div>
          ))}
        </div>
        <button
          type='submit'
          disabled={loadingCreate || loadingUpload} // V38.75 KEY
          className={`${btnPrimary} w-full flex items-center justify-center gap-2 ${loadingCreate || loadingUpload ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          {loadingCreate || loadingUpload ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Product...
            </>
          ) : 'Create Product'}
        </button>
      </form>
    </div>
  );
};
export default ProductCreateScreen;