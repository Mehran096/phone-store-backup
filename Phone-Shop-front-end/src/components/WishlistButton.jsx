import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import { toggleWishlist, getWishlist } from '../slices/wishlistSlice'
import { toast } from 'react-toastify'

// Now supports BOTH product and accessory with variants
const WishlistButton = ({ 
  type = 'product', // 'product' or 'accessory'
  product, // pass full product object
  accessory, // pass full accessory object
  productVariantIndex = 0, // for product: storage index
  productColorIndex = 0,   // for product: color index
  modelIndex = 0, // for accessory: which model in models[]
  accessoryVariantIndex = 0, // for accessory: which variant in models[].variants[]
  className,
  showText = false,
}) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false) 
  
  const { userInfo } = useSelector((state) => state.auth)
  const { wishlist } = useSelector((state) => state.wishlist)
  
  useEffect(() => {
    if (userInfo) {
      dispatch(getWishlist())
    }
  }, [dispatch, userInfo])

  const productId = product?._id
  const accessoryId = accessory?._id
  
  // Check if THIS EXACT variant is in wishlist
  const isWishlisted = wishlist.items.some(item => {
    if (type === 'product') {
      return item.type === 'product' && 
             item.product?._id === productId &&
             item.productVariantIndex === productVariantIndex &&
             item.productColorIndex === productColorIndex
    }
    if (type === 'accessory') {
      return item.type === 'accessory' && 
             item.accessory?._id === accessoryId && 
             item.modelIndex === modelIndex && 
             item.accessoryVariantIndex === accessoryVariantIndex
    }
    return false
  })

  const wishlistHandler = async () => {  
    if (!userInfo) {
      navigate('/login')
      return
    }

    if (isLoading) return 
    setIsLoading(true)

    try {
      await dispatch(toggleWishlist({
        type,
        productId,
        accessoryId,
        modelIndex,
        accessoryVariantIndex,
        productVariantIndex,
        productColorIndex,
      })).unwrap()

      toast.success(isWishlisted ? 'Removed from Wishlist' : 'Added to Wishlist')
    } catch (err) {
      toast.error(err || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      type='button'
      onClick={wishlistHandler}
      disabled={isLoading}  
      className={
        className ||
        `w-full h-12 flex items-center justify-center gap-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`
      }
      title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
    >
      {isLoading ? (  
        <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : isWishlisted ? (
        <>
          <FaHeart className="text-red-500 text-xl" />
          {showText && <span>Remove from Wishlist</span>}
        </>
      ) : (
        <>
          <FaRegHeart className="text-gray-700 text-xl" />
          {showText && <span>Add to Wishlist</span>}
        </>
      )}
    </button>
  )
}

export default WishlistButton