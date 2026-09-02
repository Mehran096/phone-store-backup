import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearCompare, removeFromCompare } from '../slices/compareSlice';

const CompareBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showCompareBar, setShowCompareBar] = useState(true);

  const { products } = useSelector((state) => state.compare);

  const maxCompare = window.innerWidth < 1024 ? 2 : 4;

 
  const realProducts = products.filter(Boolean); // only real data
  const displayProducts = [...realProducts]; // for UI

while (displayProducts.length < maxCompare) {
  displayProducts.push(null);
}

const hasProducts = realProducts.length > 0;

const handleCompareClick = () => {
  const compareUrl = `/compare?phones=${products
    .filter(Boolean)
    .map((product) => product.slug)
    .join(",")}`;

  navigate(compareUrl, { 
    state: { from: `/` } // <-- because CompareBar is on Home
  });
};
  //console.log(products)
   if (!hasProducts) return null;


  return (
    <>
       
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-2xl">
          {/* Toggle Button */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowCompareBar((prev) => !prev)}
              className="bg-blue-600 text-white text-xs px-4 py-2 rounded-t-lg shadow"
            >
              {showCompareBar
                ? "Hide Compare"
                : `Show Compare (${realProducts.length})`}
            </button>
          </div>
          {/* Compare Bar */}
          <div
            className={`bg-white border-t shadow-2xl overflow-hidden transition-all duration-300 ${showCompareBar
                ? "max-h-[400px] opacity-100"
                : "max-h-0 opacity-0"
              }`}
          >
            <div className="w-full lg:max-w-7xl lg:mx-auto px-4 py-4 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">

              <div className="flex gap-3 overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">

                {displayProducts.map((product, index) => {
                   //console.log(product);
                   if (!product) {
                        return (
                          <div
                            key={`empty-${index}`}
                            className="w-12 h-12 border rounded flex items-center justify-center text-gray-400"
                          >
                            +
                          </div>
                        );
                      }

                      return (
                  <div
                    key={product._id}
                    className="relative flex-shrink-0 w-30 h-30 lg:w-auto lg:h-auto flex items-center gap-2 bg-gray-100 rounded-lg p-2"
                  >
                    {/* Remove Button */}
                    <button
                      onClick={() => dispatch(removeFromCompare(product._id))}
                      className="lg:hidden absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs shadow"
                    >
                      ✕
                    </button>

                    {/* Image */}
                    <img
                      src={product?.defaultImage}
                      alt={product?.name || ""}
                      className="w-12 h-12 lg:w-16 lg:h-16 object-contain rounded"
                       //onError={(e) => console.log("Broken image:", product)}
                    />
                   <div className="flex flex-1  lg:hidden">
                      <p className="text-xs font-medium line-clamp-1">
                        {product.name}
                      </p>
 
                    </div>

                    {/* Desktop Only */}
                    <div className="hidden lg:block">
                      <p className="text-sm font-medium line-clamp-1">
                        {product.name}
                      </p>

                      <button
                        onClick={() => dispatch(removeFromCompare(product._id))}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                      )
})}
              </div>

              <div className="flex w-full lg:w-auto gap-3">

                <button
                  onClick={() => dispatch(clearCompare())}
                  className="
                    flex-1 lg:flex-none
                    py-2 px-4 lg:py-2
                    border rounded-lg
                    text-center
                    font-medium
                  "
                >
                  Clear
                </button>
            {hasProducts && (
                <button
                onClick={handleCompareClick}
                className="
                  flex-1 lg:flex-none
                  py-2 px-4 lg:py-2
                  rounded-lg
                  bg-blue-600
                  text-white
                  text-center
                  font-medium
                "
              >
                Compare ({realProducts.length})
              </button>
                )}

              </div>

            </div>
          </div>
        </div>
     
    </>
  );
};

export default CompareBar;