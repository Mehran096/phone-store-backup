import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FaTrash, FaHeart, FaShoppingCart } from 'react-icons/fa'
import Message from '../components/Message'
import Loader from '../components/Loader'
import { getWishlist, removeWishlistItem, clearWishlist } from '../slices/wishlistSlice'
import { addToCart } from '../slices/cartSlice'
import { toast } from 'react-toastify'

const WishlistScreen = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { userInfo } = useSelector((state) => state.auth)
  const { wishlist, loading, error } = useSelector((state) => state.wishlist)

  useEffect(() => {
    if (!userInfo) {
      navigate('/login')
    } else {
      dispatch(getWishlist())
    }
  }, [dispatch, userInfo, navigate])

  const removeHandler = (itemId) => {
    dispatch(removeWishlistItem(itemId)) // INSTANT DELETE now
    toast.success('Removed from wishlist')
  }

  const clearHandler = () => {
    dispatch(clearWishlist()) // INSTANT CLEAR now
    toast.success('Wishlist cleared')
  }

  //for links
  const getProductLink = (item) => {
    if (item.type === 'product') {
      const p = item.product
      const vIdx = item.productVariantIndex ?? 0
      const cIdx = item.productColorIndex ?? 0
      const variant = p.variants?.[vIdx]
      const color = variant?.colors?.[cIdx]

      const base = `/product/${p.slug}`
      const params = new URLSearchParams()

      if (color?.name) params.append('color', color.name)
      if (variant?.storage) params.append('storage', variant.storage)
      if (variant?.storage) params.append('v', vIdx) // for index
      if (color) params.append('c', cIdx) // for index

      return `${base}?${params.toString()}`
    }

    if (item.type === 'accessory') {
      const a = item.accessory
      const mIdx = item.modelIndex ?? 0
      const vIdx = item.accessoryVariantIndex ?? 0
      const model = a.models?.[mIdx]
      const variant = model?.variants?.[vIdx]

      const base = `/accessory/${a.slug}`
      const params = new URLSearchParams()

      if (model?.modelName) params.append('model', model.modelName)
      if (variant?.name) params.append('variant', variant.name)
      if (mIdx !== undefined) params.append('m', mIdx)
      if (vIdx !== undefined) params.append('v', vIdx)

      return `${base}?${params.toString()}`
    }
    return '/'
  }

  const getItemData = (item) => {
    if (item.type === 'product' && item.product) {
      const p = item.product
      const vIdx = item.productVariantIndex ?? 0
      const cIdx = item.productColorIndex ?? 0
      const variant = p.variants?.[vIdx]
      const color = variant?.colors?.[cIdx]

      if (!variant || !color) return null

      const price = Number(color?.price || 0)
      const originalPrice = Number(color?.originalPrice || price)
      const discountAmount = Number(color?.discountAmount || 0)
      const savingsPercent = color?.discount?.value || 0

      return {
        type: 'product',
        id: p._id,
        slug: p.slug,
        name: p.name,
        image: color?.images?.[0]?.url || p.images?.[0]?.url || '/placeholder.jpg',
        price,
        originalPrice,
        discountAmount,
        savingsPercent,
        link: getProductLink(item),
        subText: `Color: ${color?.name || 'N/A'} | Storage: ${variant?.storage || 'N/A'}`
      }
    }

    if (item.type === 'accessory' && item.accessory) {
      const a = item.accessory
      const mIdx = item.modelIndex ?? 0
      const vIdx = item.accessoryVariantIndex ?? 0
      const model = a.models?.[mIdx]
      const variant = model?.variants?.[vIdx]

      if (!model || !variant) return null

      const price = Number(variant.price || 0)
      const originalPrice = Number(variant.originalPrice || price)
      const discountAmount = Number(variant.discountAmount || 0)
      const savingsPercent = variant?.discount?.value || 0

      return {
        type: 'accessory',
        id: a._id,
        slug: a.slug,
        name: `${a.name} - ${model.modelName} ${variant.name}`,
        image: variant.images?.[0]?.url || a.image || '/placeholder.jpg',
        price,
        originalPrice,
        discountAmount,
        savingsPercent,
        link: getProductLink(item),
        subText: `Model: ${model.modelName} | ${variant.name}`
      }
    }
    return null
  }



  const addToCartHandler = (data, wishlistItem) => {
    if (data.type === 'product') {
      const p = wishlistItem.product
      const vIdx = wishlistItem.productVariantIndex ?? 0
      const cIdx = wishlistItem.productColorIndex ?? 0
      const variant = p.variants?.[vIdx]
      const color = variant?.colors?.[cIdx]

      if (!variant || !color) return toast.error('Variant not found')

      dispatch(addToCart({
        product: p._id,
        accessory: null,
        sku: color?.sku || variant?.sku || p?.sku || '', // <-- NOW WE HAVE SKU
        name: p.name,
        slug: p.slug,
        image: data.image,
        price: data.price,
        originalPrice: data.originalPrice,
        discountAmount: data.discountAmount,
        discount: color?.discount,

        variantType: 'phone',
        variant: variant?.storage || 'Default',
        variantName: variant?.storage || color?.name || 'Default',
        variantSubName: variant?.storage || '',

        model: p.name,
        color: color?.name || 'Default', // <-- NOW WE HAVE COLOR
        storage: variant?.storage || '', // <-- NOW WE HAVE STORAGE
        countInStock: color?.countInStock ?? variant?.countInStock ?? 0,
        qty: 1,
      }))
      toast.success(`${data.name} added to cart`)
    }

    if (data.type === 'accessory') {
      const a = wishlistItem.accessory
      const mIdx = wishlistItem.modelIndex ?? 0
      const vIdx = wishlistItem.accessoryVariantIndex ?? 0
      const model = a.models?.[mIdx]
      const variant = model?.variants?.[vIdx]

      if (!model || !variant) return toast.error('Variant not found')

      dispatch(addToCart({
        product: a._id,
        accessory: a._id,
        sku: variant?.sku || '', // <-- NOW WE HAVE SKU
        name: a.name,
        slug: a.slug,
        image: data.image,
        price: data.price,
        originalPrice: data.originalPrice,
        discountAmount: data.discountAmount,
        discountAmountPerItem: data.discountAmount,

        variantType: 'accessory',
        variantName: a.accessoryType,
        variant: variant?.name,
        variantSubName: variant?.name,

        model: model?.modelName || 'Universal',
        color: variant?.name, // <-- NOW WE HAVE COLOR
        storage: '',
        qty: 1,
        countInStock: variant?.countInStock || 0,
      }))
      toast.success(`${data.name} added to cart`)
    }

    navigate('/cart')
  }

  const items = wishlist?.items || []
  const validItems = items.map(getItemData).filter(Boolean)

  return (
    <>
      <Helmet>
        <title>Wishlist | Phone-Store</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
          <FaHeart className="text-red-500" />
          My Wishlist
        </h1>

        {loading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">{error}</Message>
        ) : validItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
            <FaHeart className="text-gray-200 text-6xl sm:text-8xl mb-6" />
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-500 mb-6 max-w-md">
              Save your favorite products and accessories here.
            </p>
            <Link to="/" className="bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-lg sm:rounded-xl hover:bg-blue-700 font-semibold inline-flex items-center gap-2">
              <FaShoppingCart /> Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
              <p className="text-gray-600 text-sm sm:text-base">{validItems.length} items saved</p>
              <button onClick={clearHandler} className="bg-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:bg-red-700 font-semibold flex items-center gap-2 text-sm sm:text-base">
                <FaTrash /> Clear All
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {validItems.map((data, index) => { // KEY FIX: map validItems
                const item = items[index] // get original item for _id
                return (
                  <div key={item._id} className="border border-gray-200 rounded-lg sm:rounded-xl p-2 sm:p-4 hover:shadow-lg transition flex-col">
                    <Link to={data.link}>
                      <div className="w-full aspect-square bg-gray-50 rounded-md sm:rounded-lg mb-2 sm:mb-4 flex items-center justify-center overflow-hidden">
                        <img src={data.image} alt={data.name} className="w-full h-full object-contain p-1 sm:p-2" />
                      </div>
                    </Link>

                    <Link to={data.link}>
                      <h3 className="font-semibold text-xs sm:text-base mb-1 hover:text-blue-600 line-clamp-2 flex-1">
                        {data.name}
                      </h3>
                    </Link>

                    <p className="text-xs text-gray-500 mb-2">{data.subText}</p>

                    <div className="mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg sm:text-xl font-bold text-red-600">
                          ${data.price.toFixed(2)}
                        </span>
                        {data.originalPrice > data.price && (
                          <>
                            <span className="text-xs sm:text-sm text-gray-500 line-through">
                              ${data.originalPrice.toFixed(2)}
                            </span>
                            {data.savingsPercent > 0 && (
                              <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded">
                                -{data.savingsPercent}%
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      {data.discountAmount > 0 && (
                        <p className="text-xs text-green-600 font-medium mt-1">
                          You save ${data.discountAmount.toFixed(2)}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => addToCartHandler(data, item)}
                        className="flex-1 bg-blue-600 text-white py-1.5 sm:py-2 rounded-md sm:rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold"
                      >
                        <FaShoppingCart /> Add
                      </button>
                      <button onClick={() => removeHandler(item._id)} className="px-3 py-1.5 sm:py-2 border-red-200 text-red-500 rounded-md sm:rounded-lg hover:bg-red-50 transition" title="Remove">
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default WishlistScreen