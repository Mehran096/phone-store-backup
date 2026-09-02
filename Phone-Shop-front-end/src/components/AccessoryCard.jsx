import { Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import Rating from './Rating'; // import your rating component

const getTypeColor = (type) => {
  const colors = {
    Charger: 'bg-blue-100 text-blue-700',
    Cable: 'bg-green-100 text-green-700',
    Audio: 'bg-purple-100 text-purple-700',
    Holder: 'bg-orange-100 text-orange-700',
    Case: 'bg-pink-100 text-pink-700',
    Glass: 'bg-gray-100 text-gray-700',
  };
  return colors[type] || 'bg-gray-100 text-gray-700';
};

const AccessoryCard = ({ accessory, onAddToCart }) => {
  const allModels = accessory.models || [];
  
  // Get all prices
  const getAllPrices = () => {
    const prices = [];
    allModels.forEach(model => {
      model.variants?.forEach(v => {
        if (Number(v.price) > 0) prices.push(Number(v.price));
      });
    });
    return prices;
  };

  const allPrices = getAllPrices();
  const minPrice = allPrices.length > 0? Math.min(...allPrices) : 0;
  const maxPrice = allPrices.length > 0? Math.max(...allPrices) : 0;
  const hasRange = minPrice!== maxPrice;

  const firstDiscountedVariant = allModels
   .flatMap(m => m.variants || [])
   .find(v => v.discount?.isActive && v.discount?.value > 0);
  
  const discountValue = firstDiscountedVariant?.discount?.value || 0;
  const finalMinPrice = discountValue > 0? minPrice * (1 - discountValue / 100) : minPrice;
  const finalMaxPrice = discountValue > 0? maxPrice * (1 - discountValue / 100) : maxPrice;
  
  const totalStock = allModels.reduce((acc, model) => 
    acc + (model.variants || []).reduce((sum, v) => sum + Number(v.countInStock || 0), 0), 0
  );
  
  const firstVariant = allModels[0]?.variants?.[0];
  const thumbnail = firstVariant?.images?.[0]?.url || '/placeholder.jpg';
  const totalImages = allModels.reduce((acc, model) => 
    acc + (model.variants || []).reduce((sum, v) => sum + (v.images?.length || 0), 0), 0
  );
  const totalVariants = allModels.reduce((acc, model) => acc + (model.variants?.length || 0), 0);
  const typeLabel = accessory.accessoryType?.charAt(0).toUpperCase() + accessory.accessoryType?.slice(1);

  return (
    <Link to={`/accessory/${accessory.slug}`} className="group block bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border-gray-100 h-full">
      <div className="flex flex-col h-full">
        
        {/* IMAGE */}
<div className="relative overflow-hidden p-3 sm:p-4 bg-gray-50">
  <img
    src={thumbnail}
    alt={accessory.name}
    loading="lazy"
    className="w-full h-32 sm:h-36 md:h-40 object-contain group-hover:scale-105 transition-transform duration-300 rounded-lg"
  />
          {/* BADGES */}
 {/* BADGES - Mobile: smaller + split left/right */}
<div className="absolute top-1 left-1 right-1 flex justify-between items-center gap-1">
  {/* LEFT: TYPE */}
  <span className={`text-[7px] sm:text-[10px] font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full ${getTypeColor(typeLabel)}`}>
    {typeLabel}
  </span>

  {/* RIGHT: DISCOUNT + OUT OF STOCK */}
  <div className="flex gap-1">
    {discountValue > 0 && (
      <span className="bg-red-500 text-white text-[7px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
        -{discountValue}%
      </span>
    )}
    {totalStock === 0 && (
      <span className="bg-gray-900/80 text-white text-[9px] sm:text-[10px] px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
        Out
      </span>
    )}
  </div>
</div>
          {totalImages > 1 && (
            <span className="hidden sm:block absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">
              {totalImages} imgs
            </span>
          )}
        </div>

        {/* CONTENT */}
        <div className="p-3 sm:p-4 flex flex-col flex-1">
          <h3 className="text-sm sm:text-base font-semibold text-gray-800 line-clamp-2 mb-1 group-hover:text-green-600 leading-tight h-12">
            {accessory.name}
          </h3>
          <p className="text-xs text-gray-500 mb-2">{accessory.brand}</p>
          
          {/* Models + Variants Count - Hide on mobile */}
          <div className="hidden sm:flex gap-2 text-[11px] text-gray-400 mb-2">
            <span>{allModels.length} Models</span>
            <span>•</span>
            <span>{totalVariants} Variants</span>
          </div>

          {/* RATING - FIXED WITH COMPONENT */}
          <div className="mb-2">
            <Rating 
              value={accessory.rating || 0} 
              text={`(${accessory.numReviews || 0})`}
              color='#f59e0b'
            />
          </div>
          
          {/* PRICE */}
          <div className="flex items-center gap-2 mt-auto mb-3">
            <span className="text-base sm:text-lg font-bold text-green-600">
              ${hasRange? `${finalMinPrice.toFixed(2)} - ${finalMaxPrice.toFixed(2)}` : finalMinPrice.toFixed(2)}
            </span>
            {discountValue > 0 && (
              <span className="text-xs text-gray-400 line-through">
                ${hasRange? `${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}` : minPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* STOCK STATUS */}
          {totalStock > 0 && totalStock < 20 && (
            <p className="text-[11px] text-orange-600 mb-2">Only {totalStock} left!</p>
          )}

          {/* BUTTON - REMOVED SELECT OPTIONS */}
          <button 
            disabled={totalStock === 0}
            className={`w-full py-2 px-3 rounded-lg font-semibold text-sm transition
              ${totalStock === 0 
               ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
          >
            {totalStock === 0? 'Out of Stock' : 'View Product'}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default AccessoryCard;