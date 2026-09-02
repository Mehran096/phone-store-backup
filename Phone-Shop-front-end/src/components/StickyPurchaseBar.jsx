import { FaShoppingCart, FaBolt } from "react-icons/fa";
import WishlistButton from "./WishlistButton";

const StickyPurchaseBar = ({
  product,
  selectedVariantIndex, // STORAGE INDEX FIRST
  selectedColorIndex, // COLOR INDEX INSIDE VARIANT
  qty,
  setQty,
  addToCartHandler,
  buyNowHandler,
}) => {
  // FLIPPED: variants first, then colors
  const selectedVariant = product?.variants?.[selectedVariantIndex]
  const selectedColor = selectedVariant?.colors?.[selectedColorIndex]
 

  const inStock = selectedColor?.countInStock > 0

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg md:hidden">
      <div className="max-w-7xl mx-auto px-2 py-1.5 flex items-center gap-2">

        {/* Wishlist - NOW CORRECT ORDER */}
        <WishlistButton
          type="product"
          product={product}
          productVariantIndex={selectedVariantIndex} // storage
          productColorIndex={selectedColorIndex} // color
          className="w-10 h-10 rounded-lg flex items-center justify-center border border-gray-300 bg-white flex-shrink-0 disabled:opacity-50"
          showText={false}
        />

        {/* Only show when in stock */}
        {inStock? (
          <>
            <button
              onClick={addToCartHandler}
              className="flex-1 h-10 rounded-xl bg-[#FFD814] hover:bg-[#F7CA00] font-semibold flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <FaShoppingCart size={15} />
              Add to Cart
            </button>

            <button
              onClick={buyNowHandler}
              className="flex-1 h-10 rounded-xl bg-[#111827] hover:bg-black text-white font-semibold flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <FaBolt size={15} />
              Buy Now
            </button>
          </>
        ) : (
          <div className="flex-1 h-10 rounded-xl bg-gray-300 text-gray-600 font-semibold flex items-center justify-center">
            Out of Stock
          </div>
        )}
      </div>
    </div>
  );
};

export default StickyPurchaseBar;