import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCreateAccessoryMutation, useUploadAccessoryImageMutation } from '../../slices/accessoriesApiSlice';
import { toast } from 'react-toastify';
import Loader from '../../components/Loader';
import { FaPlus, FaTrash, FaGripVertical, FaTimes, FaInfoCircle } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const ACCESSORY_TYPES = [
  { value: "case", label: "Case" },
  { value: "charger", label: "Charger" },
  { value: "cable", label: "Cable" },
  { value: "glass", label: "Screen Protector" },
  { value: "audio", label: "Audio" },
  { value: "holder", label: "Holder / Stand" },
];

const ACCESSORY_CATEGORIES = [
  { value: "iPhone Cases", label: "iPhone Cases" },
  { value: "Samsung Cases", label: "Samsung Cases" },
  { value: "Google Pixel Cases", label: "Google Pixel Cases" },
  { value: "Realme Cases", label: "Realme Cases" },
  { value: "Chargers", label: "Chargers" },
  { value: "Fast Chargers", label: "Fast Chargers 20W+" },
  { value: "Cables", label: "Cables" },
  { value: "USB-C Cables", label: "USB-C Cables" },
  { value: "Lightning Cables", label: "Lightning Cables" },
  { value: "Screen Protectors", label: "Screen Protectors" },
  { value: "Audio Adapters", label: "Audio Adapters" },
  { value: "Adapters", label: "Adapters" },
  { value: "Holders", label: "Holders / Stands" },
  { value: "Other", label: "Other" },
];

const AccessoryCreateScreen = () => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [accessoryType, setAccessoryType] = useState('case');
  const [keywords, setKeywords] = useState('');
  const [category, setCategory] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  const [models, setModels] = useState([
    {
      modelName: 'Universal',
      description: '',
      specs: [{ key: '', value: '' }],
      variants: [
        {
          sku: '', name: '', color: '', colorHex: '#000', 
          originalPrice: 0, price: 0, countInStock: 0, // NEW: originalPrice
          bulkBase: 'discounted',
          wattage: '', cableType: '', cableLength: '',
          hardness: '', thickness: '', glassType: '',
          connectorType: '', audioBits: '',
          files: [], images: [],
          bulkPricing: [{ qty: 1, price: 0, discountLabel: '' }],
          discount: { type: 'percentage', value: 0, startDate: '', endDate: '', isActive: false }
        }
      ]
    }
  ]);

  const [uploading, setUploading] = useState(false);
  const [uploadAccessoryImage] = useUploadAccessoryImageMutation();
  const [createAccessory, { isLoading }] = useCreateAccessoryMutation();
  const navigate = useNavigate();

  const uploadImageHandler = (e, mIdx, vIdx) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const updated = [...models];
    updated[mIdx].variants[vIdx].files = [...(updated[mIdx].variants[vIdx].files || []),...files];
    setModels(updated);
    e.target.value = '';
  };

  const removeImageHandler = (mIdx, vIdx, imgIndex) => {
    const updated = [...models];
    updated[mIdx].variants[vIdx].files = updated[mIdx].variants[vIdx].files.filter((_, idx) => idx!== imgIndex);
    setModels(updated);
  };

  const onDragEnd = (result, mIdx, vIdx) => {
    if (!result.destination) return;
    const updated = [...models];
    const files = [...updated[mIdx].variants[vIdx].files];
    const [reordered] = files.splice(result.source.index, 1);
    files.splice(result.destination.index, 0, reordered);
    updated[mIdx].variants[vIdx].files = files;
    setModels(updated);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      const formData = new FormData();
      models.forEach(m => {
        m.variants.forEach(v => {
          (v.files || []).forEach(file => formData.append('images', file));
        })
      });

      let uploaded = [];
      if (formData.has('images')) {
        const data = await uploadAccessoryImage(formData).unwrap();
        uploaded = Array.isArray(data)? data : [data];
      }
      setUploading(false);

      let uploadIndex = 0;
      const finalModels = models
   .filter(m => m.modelName)
   .map(m => ({
     ...m,
          specs: (m.specs || []).filter(s => s.key && s.value),
          variants: (m.variants || []).filter(v => v.sku && v.name).map(v => {
            const variantImages = (v.files || []).map(() => {
              const img = uploaded[uploadIndex];
              uploadIndex++;
              return img;
            });
            return {
              sku: v.sku,
              name: v.name,
              color: v.color,
              colorHex: v.colorHex || '#000',
              originalPrice: Number(v.originalPrice), // NEW
              price: Number(v.price), // After single discount
              bulkBase: v.bulkBase || 'discounted',
              countInStock: Number(v.countInStock),
              wattage: v.wattage || '',
              cableType: v.cableType || '',
              cableLength: v.cableLength || '',
              hardness: v.hardness || '',
              thickness: v.thickness || '',
              glassType: v.glassType || '',
              connectorType: v.connectorType || '',
              audioBits: v.audioBits || '',
              images: variantImages,
              bulkPricing: (v.bulkPricing || []).filter(b => b.qty > 0).map(b => ({
                qty: Number(b.qty),
                price: Number(b.price),
                discountLabel: b.discountLabel || ''
              })),
              discount: {
                type: v.discount.type || null,
                value: Number(v.discount.value) || 0,
                startDate: v.discount.startDate || null,
                endDate: v.discount.endDate || null,
                isActive: v.discount.isActive || false,
              }
            }
          })
        })).filter(m => m.variants.length > 0);

      const accessoryData = {
        name,
        brand,
        accessoryType,
        category: category || accessoryType,
        keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
        metaTitle,
        metaDescription,
        models: finalModels,
      };

      await createAccessory(accessoryData).unwrap();
      toast.success('Accessory Created');
      navigate('/admin/accessorylist');

    } catch (err) {
      toast.error(err?.data?.message || err.error);
    } finally {
      setUploading(false);
    }
  };

  const addModel = () => setModels([...models, { modelName: '', description: '', specs: [{ key: '', value: '' }], variants: [{ sku: '', name: '', originalPrice: 0, price: 0, countInStock: 0, bulkBase: 'discounted', files: [], bulkPricing: [{ qty: 1, price: 0, discountLabel: '' }], discount: { type: 'percentage', value: 0, isActive: false } }] }]);
  const removeModel = (mIdx) => setModels(models.filter((_, i) => i!== mIdx));
  const handleModelChange = (mIdx, field, value) => { const updated = [...models]; updated[mIdx][field] = value; setModels(updated); };

  const addSpec = (mIdx) => { const updated = [...models]; updated[mIdx].specs.push({ key: '', value: '' }); setModels(updated); };
  const removeSpec = (mIdx, sIdx) => { const updated = [...models]; updated[mIdx].specs = updated[mIdx].specs.filter((_, i) => i!== sIdx); setModels(updated); };
  const handleSpecChange = (mIdx, sIdx, field, value) => { const updated = [...models]; updated[mIdx].specs[sIdx][field] = value; setModels(updated); };

  const addVariant = (mIdx) => {
    const updated = [...models];
    updated[mIdx].variants.push({ sku: '', name: '', originalPrice: 0, price: 0, bulkBase: 'discounted', countInStock: 0, files: [], bulkPricing: [{ qty: 1, price: 0, discountLabel: '' }], discount: { type: 'percentage', value: 0, isActive: false } });
    setModels(updated);
  };
  const removeVariant = (mIdx, vIdx) => { const updated = [...models]; updated[mIdx].variants = updated[mIdx].variants.filter((_, i) => i!== vIdx); setModels(updated); };
  const updateVariant = (mIdx, vIdx, field, value) => { const updated = [...models]; updated[mIdx].variants[vIdx][field] = value; setModels(updated); };
  const updateDiscount = (mIdx, vIdx, field, value) => { const updated = [...models]; updated[mIdx].variants[vIdx].discount[field] = field === 'value'? Number(value) : value; setModels(updated); };

  const addBulk = (mIdx, vIdx) => { const updated = [...models]; updated[mIdx].variants[vIdx].bulkPricing.push({ qty: 2, price: 0, discountLabel: '' }); setModels(updated); };
  const removeBulk = (mIdx, vIdx, bIdx) => {
    const updated = [...models];
    updated[mIdx].variants[vIdx].bulkPricing = updated[mIdx].variants[vIdx].bulkPricing.filter((_, i) => i!== bIdx);
    setModels(updated);
  };
  const updateBulk = (mIdx, vIdx, bIdx, field, value) => {
    const updated = [...models];
    updated[mIdx].variants[vIdx].bulkPricing[bIdx][field] = field === 'qty'? Number(value) : field === 'price'? Number(value) : value;
    setModels(updated);
  };

  return (
    <div className="max-w-5xl mx-auto p-3 sm:p-6">
      <Link to='/admin/accessorylist' className='inline-block mb-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm'>← Go Back</Link>
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Create Accessory</h1>
      {isLoading && <Loader />}

      <form onSubmit={submitHandler} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select className="p-3 border rounded-lg text-sm" value={accessoryType} onChange={(e) => setAccessoryType(e.target.value)}>
            {ACCESSORY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select 
    className="p-3 border rounded-lg text-sm" 
    value={category} 
    onChange={(e) => setCategory(e.target.value)}
  >
    <option value="">Select Category</option>
    {ACCESSORY_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
  </select>
          
          <input className="p-3 border rounded-lg text-sm" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className="p-3 border rounded-lg text-sm" placeholder="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} required />
        </div>
        <input className="w-full p-3 border rounded-lg text-sm" placeholder="Keywords, comma separated" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
        <input className="w-full p-3 border rounded-lg text-sm" placeholder="Meta Title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
        <textarea className="w-full p-3 border rounded-lg text-sm" rows="2" placeholder="Meta Description" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} />

        <div className="bg-white p-3 sm:p-4 rounded-xl shadow border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-base sm:text-lg">Models</h2>
            <button type="button" onClick={addModel} className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm">
              <FaPlus /> <span className="hidden sm:inline">Add Model</span>
            </button>
          </div>

          {models.map((m, mIdx) => (
            <div key={mIdx} className="mb-4 p-3 sm:p-4 border rounded-lg bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-sm sm:text-base">Model {mIdx + 1}</h3>
                <button type="button" onClick={() => removeModel(mIdx)} className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs sm:text-sm">
                  <FaTrash size={12} /> <span className="hidden sm:inline">Remove</span>
                </button>
              </div>

              <input className="w-full p-3 border rounded-lg mb-3 text-sm" placeholder="Model Name: iPhone 17 Pro Max or Universal" value={m.modelName} onChange={(e) => handleModelChange(mIdx, 'modelName', e.target.value)} required />
              <textarea className="w-full p-3 border rounded-lg mb-3 text-sm" rows="2" placeholder="Model Description" value={m.description} onChange={(e) => handleModelChange(mIdx, 'description', e.target.value)} />

              <div className="mb-4 p-3 bg-white rounded-lg border">
                <h4 className="font-semibold mb-2 text-sm">Specs</h4>
                {m.specs.map((s, sIdx) => (
                  <div key={sIdx} className="flex flex-col sm:flex-row gap-2 mb-2">
                    <input className="p-2.5 border rounded flex-1 text-sm" placeholder="Key: Material" value={s.key} onChange={(e) => handleSpecChange(mIdx, sIdx, 'key', e.target.value)} />
                    <div className="flex gap-2">
                      <input className="p-2.5 border rounded flex-1 text-sm" placeholder="Value: Silicone" value={s.value} onChange={(e) => handleSpecChange(mIdx, sIdx, 'value', e.target.value)} />
                      <button type="button" onClick={() => removeSpec(mIdx, sIdx)} className="px-3 bg-red-50 text-red-600 rounded"><FaTrash size={12} /></button>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => addSpec(mIdx)} className="text-sm text-blue-600"><FaPlus size={12} /> Add Spec</button>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Variants</h3>
                {m.variants.map((v, vIdx) => (
                  <div key={vIdx} className="border p-3 rounded-lg bg-white">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-medium text-sm text-blue-600">Variant {vIdx + 1}</h5>
                      <button type="button" onClick={() => removeVariant(mIdx, vIdx)} className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs sm:text-sm"><FaTrash size={12} /> <span className="hidden sm:inline">Remove</span></button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
                      <input className="p-2.5 border rounded text-sm" placeholder="SKU" value={v.sku} onChange={(e) => updateVariant(mIdx, vIdx, 'sku', e.target.value)} required />
                      <input className="p-2.5 border rounded text-sm" placeholder="Variant Name" value={v.name} onChange={(e) => updateVariant(mIdx, vIdx, 'name', e.target.value)} required />
                      <input className="p-2.5 border rounded text-sm" placeholder="Color" value={v.color} onChange={(e) => updateVariant(mIdx, vIdx, 'color', e.target.value)} />
                      <input type="color" className="p-1 border rounded h-10 w-16" value={v.colorHex} onChange={(e) => updateVariant(mIdx, vIdx, 'colorHex', e.target.value)} />
                      
                      {/* NEW: ORIGINAL PRICE + PRICE */}
                      <div className="sm:col-span-2 lg:col-span-2">
                        <label className="text-[11px] text-gray-500 flex items-center gap-1 mb-1"><FaInfoCircle /> Original Price = Before any discount</label>
                        <input type="number" step="0.01" className="p-2.5 border rounded text-sm w-full" placeholder="Original Price: 19.99" value={v.originalPrice} onChange={(e) => updateVariant(mIdx, vIdx, 'originalPrice', e.target.value)} required />
                      </div>
                      <div className="sm:col-span-2 lg:col-span-1">
                        <label className="text-[11px] text-gray-500 flex items-center gap-1 mb-1"><FaInfoCircle /> Selling Price = After discount</label>
                        <input type="number" step="0.01" className="p-2.5 border rounded text-sm w-full" placeholder="Price: 9.99" value={v.price} onChange={(e) => updateVariant(mIdx, vIdx, 'price', e.target.value)} required />
                      </div>
                      <input type="number" className="p-2.5 border rounded text-sm sm:col-span-2 lg:col-span-1" placeholder="Stock" value={v.countInStock} onChange={(e) => updateVariant(mIdx, vIdx, 'countInStock', e.target.value)} />
                    </div>

                    <div className="p-3 bg-yellow-50 rounded mb-3 border-yellow-200">
                      <h6 className="font-semibold text-xs mb-2 text-yellow-800">Single Discount - Percentage / Fixed</h6>
                      <div className="flex items-center gap-2 mb-2">
                        <input type="checkbox" className="w-4 h-4" checked={v.discount.isActive} onChange={(e) => updateDiscount(mIdx, vIdx, 'isActive', e.target.checked)} />
                        <label className="text-xs font-medium">Enable Discount</label>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        <select className="p-2.5 border rounded text-sm" value={v.discount.type} onChange={(e) => updateDiscount(mIdx, vIdx, 'type', e.target.value)}>
                          <option value="percentage">Percentage %</option>
                          <option value="fixed">Fixed $</option>
                        </select>
                        <input type="number" step="0.01" className="p-2.5 border rounded text-sm" placeholder="Value: 10" value={v.discount.value} onChange={(e) => updateDiscount(mIdx, vIdx, 'value', e.target.value)} />
                        <input type="date" className="p-2.5 border rounded text-sm" value={v.discount.startDate} onChange={(e) => updateDiscount(mIdx, vIdx, 'startDate', e.target.value)} />
                        <input type="date" className="p-2.5 border rounded text-sm" value={v.discount.endDate} onChange={(e) => updateDiscount(mIdx, vIdx, 'endDate', e.target.value)} />
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded mb-3">
  <h6 className="font-semibold text-xs mb-2 text-blue-800">Bulk Pricing Base</h6>
  <select
    className="p-2.5 border rounded text-sm w-full"
    value={v.bulkBase || 'discounted'}
    onChange={(e) => updateVariant(mIdx, vIdx, 'bulkBase', e.target.value)}
  >
    <option value="discounted">Bulk from Discounted Price - Stacked. Best for sales</option>
    <option value="original">Bulk from Original Price - No Stack. Protect margin</option>
  </select>
  <p className="text-[11px] text-gray-500 mt-1">
    Stacked: $9.99 → 10% off = $8.99 → Bulk 17% = $7.45
    <br/>
    No Stack: $9.99 → Bulk 17% = $8.29. Ignores 10% off
  </p>
</div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                      {(accessoryType === 'charger' || accessoryType === 'cable') && (
                        <>
                          <input className="p-2.5 border rounded text-sm" placeholder="Wattage: 20W" value={v.wattage || ''} onChange={(e) => updateVariant(mIdx, vIdx, 'wattage', e.target.value)} />
                          <input className="p-2.5 border rounded text-sm" placeholder="Cable Type: USB-C" value={v.cableType || ''} onChange={(e) => updateVariant(mIdx, vIdx, 'cableType', e.target.value)} />
                          <input className="p-2.5 border rounded text-sm" placeholder="Cable Length: 1m" value={v.cableLength || ''} onChange={(e) => updateVariant(mIdx, vIdx, 'cableLength', e.target.value)} />
                        </>
                      )}
                      {accessoryType === 'glass' && (
                        <>
                          <input className="p-2.5 border rounded text-sm" placeholder="Hardness: 9H" value={v.hardness || ''} onChange={(e) => updateVariant(mIdx, vIdx, 'hardness', e.target.value)} />
                          <input className="p-2.5 border rounded text-sm" placeholder="Thickness: 0.3mm" value={v.thickness || ''} onChange={(e) => updateVariant(mIdx, vIdx, 'thickness', e.target.value)} />
                          <input className="p-2.5 border rounded text-sm" placeholder="Glass Type: Tempered Glass" value={v.glassType || ''} onChange={(e) => updateVariant(mIdx, vIdx, 'glassType', e.target.value)} />
                        </>
                      )}
                      {accessoryType === 'audio' && (
                        <>
                          <input className="p-2.5 border rounded text-sm" placeholder="Audio Bits: 32-Bit" value={v.audioBits || ''} onChange={(e) => updateVariant(mIdx, vIdx, 'audioBits', e.target.value)} />
                          <input className="p-2.5 border rounded text-sm" placeholder="Connector Type: USB-C" value={v.connectorType || ''} onChange={(e) => updateVariant(mIdx, vIdx, 'connectorType', e.target.value)} />
                        </>
                      )}
                    </div>

                    <div className="p-3 bg-purple-50 rounded mb-3">
                      <h6 className="font-semibold text-xs mb-2">Bulk Pricing - Like Bol.com</h6>
                      <p className="text-[11px] text-gray-500 mb-2">Price = price per item. Qty 3 should be cheaper than Qty 1</p>
                      {v.bulkPricing.map((b, bIdx) => (
                        <div key={bIdx} className="flex flex-col sm:flex-row gap-2 mb-2 items-stretch">
                          <input type="number" className="p-2.5 border rounded text-sm sm:w-20" placeholder="Qty" value={b.qty} onChange={(e) => updateBulk(mIdx, vIdx, bIdx, 'qty', e.target.value)} />
                          <input type="number" step="0.01" className="p-2.5 border rounded text-sm sm:w-28" placeholder="Price" value={b.price} onChange={(e) => updateBulk(mIdx, vIdx, bIdx, 'price', e.target.value)} />
                          <input type="text" className="p-2.5 border rounded text-sm flex-1" placeholder="Label: 10% OFF" value={b.discountLabel} onChange={(e) => updateBulk(mIdx, vIdx, bIdx, 'discountLabel', e.target.value)} />
                          {v.bulkPricing.length > 1 && (
                            <button type="button" onClick={() => removeBulk(mIdx, vIdx, bIdx)} className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200">
                              <FaTrash size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={() => addBulk(mIdx, vIdx)} className="text-sm text-purple-600 font-medium"><FaPlus size={12} /> Add Tier</button>
                    </div>

                    <div className="mt-3">
                      <label className='inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer text-sm font-medium w-full justify-center transition'>
                        <FaPlus /> Upload Variant Images
                        <input type='file' multiple accept="image/*" onChange={(e) => uploadImageHandler(e, mIdx, vIdx)} className='hidden' />
                      </label>
                      {v.files?.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-gray-600 mb-2">Uploaded Images <span className="text-blue-500">({v.files.length})</span></p>
                          <DragDropContext onDragEnd={(result) => onDragEnd(result, mIdx, vIdx)}>
                            <Droppable droppableId={`dnd-${mIdx}-${vIdx}`} direction="horizontal">
                              {(provided) => (
                                <div className="flex gap-3 overflow-x-auto pb-2 pt-1" {...provided.droppableProps} ref={provided.innerRef}>
                                  {v.files.map((img, imgIndex) => (
                                    <Draggable key={img.name + imgIndex} draggableId={img.name + imgIndex} index={imgIndex}>
                                      {(provided, snapshot) => (
                                        <div ref={provided.innerRef} {...provided.draggableProps} className={`relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 group ${snapshot.isDragging? 'opacity-50' : ''}`}>
                                          <div {...provided.dragHandleProps} className='absolute top-1 left-1 bg-black/70 p-1.5 rounded-md cursor-grab z-10 hover:bg-black/90'><FaGripVertical className="text-white text-xs" /></div>
                                          <img src={URL.createObjectURL(img)} className="w-full h-full object-contain rounded-lg border bg-white p-1" alt={`preview ${imgIndex}`} />
                                          <span className="absolute -top-2 -left-2 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">NEW</span>
                                          <button type="button" onClick={() => removeImageHandler(mIdx, vIdx, imgIndex)} className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg z-10"><FaTimes size={12} /></button>
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
                      )}
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => addVariant(mIdx)} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-600 rounded-lg border-2 border-dashed w-full text-sm font-medium hover:bg-green-100">
                  <FaPlus /> Add Variant
                </button>
              </div>
            </div>
          ))}
        </div>

        <button type="submit" disabled={isLoading || uploading} className={`w-full py-3 rounded-xl font-bold text-white text-sm sm:text-base ${isLoading || uploading? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}>
          {isLoading || uploading? 'Creating...' : 'Create Accessory'}
        </button>
      </form>
    </div>
  );
};

export default AccessoryCreateScreen;