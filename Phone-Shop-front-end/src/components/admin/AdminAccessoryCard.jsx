import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';

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

const getStockBadge = (stock) => {
  if (stock === 0) return <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">Out of Stock</span>;
  if (stock < 50) return <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700">{stock} Low</span>;
  return <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">{stock} In Stock</span>;
};

const AdminAccessoryCard = ({ accessory, onDelete }) => {
  const allModels = accessory.variants || [];
  
  // Get all prices
  const allPrices = [];
  allModels.forEach(model => {
    model.colorVariants?.forEach(cv => {
      if (Number(cv.price) > 0) allPrices.push(Number(cv.price));
    });
  });
  const minPrice = allPrices.length > 0? Math.min(...allPrices) : 0;
  const maxPrice = allPrices.length > 0? Math.max(...allPrices) : 0;
  const hasRange = minPrice!== maxPrice;

  // Stock
  const totalStock = allModels.reduce((acc, model) => 
    acc + (model.colorVariants || []).reduce((sum, cv) => sum + Number(cv.countInStock || 0), 0), 0
  );
  
  // Thumbnail
  const thumbnail = allModels[0]?.colorVariants?.[0]?.images?.[0]?.url || '/placeholder.jpg';
  const totalVariants = allModels.reduce((acc, model) => acc + (model.colorVariants?.length || 0), 0);

  return (
    <tr className="hover:bg-gray-50 border-b">
      {/* NAME + IMAGE */}
      <td className="p-3">
        <div className="flex items-center gap-3">
          <img src={thumbnail} alt={accessory.name} className="w-12 h-12 rounded-lg object-cover border" />
          <div>
            <Link to={`/admin/accessory/${accessory._id}`} className="font-semibold text-gray-800 hover:text-green-600">
              {accessory.name}
            </Link>
            <p className="text-xs text-gray-500">{accessory.brand}</p>
          </div>
        </div>
      </td>

      {/* TYPE BADGE */}
      <td className="p-3">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(accessory.type)}`}>
          {accessory.type}
        </span>
      </td>

      {/* MODELS */}
      <td className="p-3 text-center text-sm">{allModels.length}</td>

      {/* VARIANTS */}
      <td className="p-3 text-center text-sm">{totalVariants}</td>

      {/* PRICE RANGE */}
      <td className="p-3 text-sm font-semibold">
        ${hasRange? `${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}` : minPrice.toFixed(2)}
      </td>

      {/* STOCK */}
      <td className="p-3">{getStockBadge(totalStock)}</td>

      {/* ACTIONS */}
      <td className="p-3">
        <div className="flex gap-2">
          <Link to={`/admin/accessory/${accessory._id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
            <FaEye />
          </Link>
          <Link to={`/admin/accessory/edit/${accessory._id}`} className="p-2 text-green-600 hover:bg-green-50 rounded">
            <FaEdit />
          </Link>
          <button onClick={() => onDelete(accessory._id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
            <FaTrash />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default AdminAccessoryCard;