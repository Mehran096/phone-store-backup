import { useState, useEffect } from 'react'
import { Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { addToCart } from '../slices/cartSlice'
import Loader from './Loader'

const FrequentlyBoughtTogether = ({ 
  product, 
  selectedVariant, 
  selectedColor, 
  finalPrice,
  frequentlyBought = [],
  loadingFBT 
}) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [selectedItems, setSelectedItems] = useState([])

  const phoneModel = selectedVariant?.modelName || product.name

  useEffect(() => {
    if (frequentlyBought?.length > 0) {
      setSelectedItems(frequentlyBought.map(item => item._id))
      console.log('FBT API Data:', frequentlyBought)
    }
  }, [frequentlyBought])

  const handleToggle = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId) ? prev.filter(id => id!== itemId) : [...prev, itemId]
    )
  }

  const getItemPrice = (item) => {
    return Number(item.price || item.originalPrice || item.regularPrice || item.cost || 0)
  }

  const handleAddAllToCart = () => {
  const price = Number(selectedColor?.price || selectedVariant?.price || product?.price || 0);
  const discount = selectedColor?.discount
  const isDiscountActive = discount?.isActive && discount?.value > 0
  const final = isDiscountActive? price - (price * discount.value / 100) : price
  const discountAmount = price - final
  const imageUrl = selectedColor?.images?.[0]?.url || product?.image || '/placeholder.png';

  // ADD MAIN PRODUCT
  dispatch(addToCart({
    product: product._id, name: product.name, slug: product.slug, image: imageUrl,
    price: final, originalPrice: price, discountAmount: discountAmount, discount: selectedColor?.discount,
    variantType: 'phone', variantName: selectedVariant?.storage || selectedColor?.name || 'Default',
    variantSubName: selectedVariant?.storage || '', model: phoneModel, color: selectedColor?.name || '',
    storage: selectedVariant?.storage || '', countInStock: selectedColor?.countInStock?? selectedVariant?.countInStock?? 0, qty: 1,
  }))

  const bundleDiscount = selectedItems.length >= 2? 0.05 : 0
  
  frequentlyBought.filter(item => selectedItems.includes(item._id)).forEach(item => {
  const originalPrice = getItemPrice(item)
  if(originalPrice <= 0) return;
  
  const accessoryDiscount = item.discount?.isActive? item.discount.value / 100 : 0
  const appliedDiscount = accessoryDiscount > 0? accessoryDiscount : bundleDiscount
  const discountedPrice = originalPrice * (1 - appliedDiscount)
  const savedAmount = originalPrice - discountedPrice

  // KEY FIX: Use first variant name for BOTH variant and color
  const firstVariant = item.variants?.[0] || {};
  const accVariantName = firstVariant.name || 'Default';

  dispatch(addToCart({ 
    product: item._id, 
    accessory: item._id, 
    name: item.name, 
    slug: item.slug, 
    image: firstVariant.images?.[0]?.url || item.image,
    price: discountedPrice, 
    originalPrice: originalPrice, 
    discountAmount: savedAmount, 
    discount: item.discount,
    variantType: 'accessory', 
    variantName: item.accessoryType || 'Accessory', // same as AccessoryScreen
    variant: accVariantName, // <-- ADD THIS. This is the match key
    variantSubName: accVariantName, 
    model: phoneModel, 
    color: accVariantName, // FORCE color = variant name
    storage: item.storage || '', 
    countInStock: firstVariant.countInStock || item.countInStock || 999, 
    qty: 1, 
    sku: firstVariant.sku || item.sku || '',
    bulkPricing: item.bulkPricing || []
  }))
})
  
  toast.success('Items added to cart')
  navigate('/cart')
}

  const bundleDiscount = selectedItems.length >= 2? 0.05 : 0
  const accessoriesSelected = (frequentlyBought || []).filter(item => selectedItems.includes(item._id))
  const accessoriesOriginalTotal = accessoriesSelected.reduce((acc, item) => acc + getItemPrice(item), 0)
  const accessoriesTotal = accessoriesSelected.reduce((acc, item) => {
    const originalPrice = getItemPrice(item)
    const accessoryDiscount = item.discount?.isActive? item.discount.value / 100 : 0
    const appliedDiscount = accessoryDiscount > 0? accessoryDiscount : bundleDiscount
    return acc + (originalPrice * (1 - appliedDiscount))
  }, 0)

  const savings = accessoriesOriginalTotal - accessoriesTotal
  const totalPrice = finalPrice + accessoriesTotal

  if (loadingFBT) return <Loader />
  if (!frequentlyBought || frequentlyBought.length === 0) return null

  return (
    <div className='mt-10 bg-white border rounded-xl p-6 shadow-sm'>
      <h3 className='text-xl font-bold mb-4'>Frequently Bought Together</h3>
      
      {bundleDiscount > 0 && (
        <div className='mb-4 p-3 bg-green-50 border border-green-200 rounded-lg'>
          <span className='text-green-700 font-semibold text-sm'>🎉 Save 5% when you buy 2 or more accessories!</span>
        </div>
      )}

      <div className='flex flex-wrap items-center gap-4'>
        <div className='text-center w-32'>
          <div className='relative'>
            <img src={selectedColor?.images?.[0]?.url || product.image} alt={product.name} className='w-24 h-24 object-contain mx-auto border rounded-lg p-1' />
            <div className='absolute top-0 left-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center'><span className='text-white text-xs'>✓</span></div>
          </div>
          <small className='block truncate mt-2'>{product.name}</small>
          <strong>${finalPrice.toFixed(2)}</strong>
        </div>

        {frequentlyBought.map((item) => {
          const originalPrice = getItemPrice(item)
          const accessoryDiscount = item.discount?.isActive? item.discount.value / 100 : 0
          const appliedDiscount = accessoryDiscount > 0? accessoryDiscount : bundleDiscount
          const discountedPrice = originalPrice * (1 - appliedDiscount)
          
          return (
            <div key={item._id} className='text-center w-32'>
              <span className='text-2xl text-gray-400 block mb-1'>+</span>
              <div className='relative'>
                <img src={item.image} alt={item.name} className='w-24 h-24 object-contain mx-auto border rounded-lg p-1' />
                <input type="checkbox" checked={selectedItems.includes(item._id)} onChange={() => handleToggle(item._id)} className='absolute top-0 left-0 w-5 h-5 cursor-pointer z-10'/>
              </div>
              <small className='block truncate mt-2' title={item.name}>{item.name}</small>
              
              {originalPrice > 0 && appliedDiscount > 0? (
                <div><strong className='text-green-600'>${discountedPrice.toFixed(2)}</strong><s className='text-gray-400 text-xs ml-1'>${originalPrice.toFixed(2)}</s></div>
              ) : originalPrice > 0 ? (
                <strong>${originalPrice.toFixed(2)}</strong>
              ) : (
                <strong className='text-red-500'>$0.00</strong>
              )}

              <p className='text-xs text-gray-400'>For: {phoneModel}</p>
              <p className='text-xs text-gray-500'>Bought {item.boughtTogetherCount} time{item.boughtTogetherCount!== 1? 's' : ''}</p>
            </div>
          )
        })}
      </div>

      <div className='mt-5 pt-5 border-t flex flex-col md:flex-row items-center justify-between gap-4'>
        <div>
          <h5 className='text-lg font-bold'>Total: ${totalPrice.toFixed(2)}</h5>
          {savings > 0 && (<p className='text-sm text-green-600 font-semibold'>You save: ${savings.toFixed(2)}</p>)}
          <p className='text-sm text-gray-500'>{selectedItems.length} of {frequentlyBought.length} accessories selected</p>
        </div>
        <Button onClick={handleAddAllToCart} className='bg-[#FFD814] hover:bg-[#F7CA00] border-none text-[#111] font-semibold px-8 py-2.5 rounded-lg shadow-sm w-full md:w-auto'>Add Selected To Cart</Button>
      </div>
    </div>
  )
}

export default FrequentlyBoughtTogether