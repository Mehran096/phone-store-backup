import { FaFire, FaCrown, FaTag, FaBan } from "react-icons/fa";
import { Sparkles } from "lucide-react";

const ProductBadge = ({ type, stock }) => {
  const badges = {
    soldout: {
      text: "SOLD OUT",
      icon: <FaBan size={12} />,
      className:
        "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-red-300 animate-pulse",
    },

    lowstock: {
      text: `ONLY ${stock} LEFT`,
      icon: <FaFire size={12} />,
      className:
        "bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-orange-300",
    },

    bestseller: {
      text: "BEST SELLER",
      icon: <FaCrown size={12} />,
      className:
        "bg-gradient-to-r from-yellow-500 to-amber-300 text-black shadow-yellow-300",
    },

    sale: {
      text: "SALE",
      icon: <FaTag size={12} />,
      className:
        "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-pink-300",
    },

    new: {
      text: "NEW",
      icon: <Sparkles size={12} />,
      className:
        "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-blue-300",
    },
  };

  const badge = badges[type];

  if (!badge) return null;

  return (
    <div
      className={`
        absolute
        top-3
        left-3
        z-30
        inline-flex
        items-center
        gap-2
        rounded-full
        px-4
        py-2
        text-xs
        sm:text-sm
        font-bold
        tracking-wide
        shadow-xl
        ${badge.className}
      `}
    >
      {badge.icon}
      {badge.text}
    </div>
  );
};

export default ProductBadge;