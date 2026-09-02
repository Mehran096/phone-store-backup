import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import {
  replaceCompareProduct,
  clearCompareSlot,
  setCompareProducts,
  clearCompare,
} from "../slices/compareSlice";

import CompareProducts from '../components/CompareProducts';
import  ComparePrint from '../components/ComparePrint';
import { useGetCompareProductsQuery } from "../slices/productsApiSlice";
 
import { 
  FaShareAlt,    
  FaFileExport,
  FaFilePdf,
  FaImage,
  FaPrint, } from "react-icons/fa";
import { toast } from 'react-toastify';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Loader from '../components/Loader';
 

const CompareScreen = () => {

  const compareRef = useRef(null);
  const printRef = useRef(null);
  const timeoutRef = useRef(null);
  const exportMenuRef = useRef(null);

  timeoutRef.current = setTimeout(() => setUpdating(false), 2000)
  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, [])

const dispatch = useDispatch();

const location = useLocation();
const navigate = useNavigate();

const backPath = location.state?.from || '/'; // fallback to home
const backLabel = backPath.includes('/product/') ? 'Go Back' : 'Go Back';

//const [searchParams] = useSearchParams();
const [searchParams, setSearchParams] = useSearchParams();
 

const phoneSlugs =
  searchParams.get("phones")?.split(",") || [];

// Only real slugs go to the API
const apiSlugs = phoneSlugs.filter((slug) => slug !== "_");

  //console.log("phoneSlugs:", phoneSlugs);

const {
  data: sharedProducts,
  isSuccess,
  isLoading
} = useGetCompareProductsQuery(apiSlugs, {
  skip: apiSlugs.length === 0,
});



//console.log(result);
 
  const { products } = useSelector((state) => state.compare);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [updating, setUpdating] = useState(false);

  const compareProducts =
  products.length > 0
    ? products
    : sharedProducts
    ? sharedProducts.map((product) => ({
        _id: product._id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        defaultImage:
          product.variants?.[0]?.colors?.[0]?.images?.[0]?.url ||
          product.defaultImage,
        defaultPrice:
          product.variants?.[0]?.colors?.[0]?.price ||
          product.defaultPrice,
        rating: product.rating,
        numReviews: product.numReviews,
        defaultStorage: product.variants?.[0]?.storage || "",
        defaultColor: product.variants?.[0]?.colors?.[0]?.name || "",
        specs: product.variants?.[0]?.specs || {},
        variants: product.variants || [],
      }))
    : [];
   
// console.log("RTK Query:", {
//   isSuccess,
//   sharedProducts,
//   products,
// });
 const replaceProduct = (index, product) => {
  setUpdating(true);
  const alreadyExists = products.some(
    (p, i) => i !== index && p?._id === product._id
  );

  if (alreadyExists) {
    toast.warning("This phone is already in the comparison.");
    return;
  }

  // Build the new compare product first
  const newProduct = {
    _id: product._id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    defaultImage:
      product.variants?.[0]?.colors?.[0]?.images?.[0]?.url ||
      product.defaultImage,
    defaultPrice:
      product.variants?.[0]?.colors?.[0]?.price ||
      product.defaultPrice,
    rating: product.rating,
    numReviews: product.numReviews,
    defaultStorage: product.variants?.[0].storage,
    defaultColor: product.variants?.[0].colors?.[0].name,
    specs: product.variants?.[0]?.specs || {},
    variants: product.variants,
  };

  // Create the updated compare array
  const updatedProducts = [...products];
  updatedProducts[index] = newProduct;

  // Update Redux
  dispatch(
    replaceCompareProduct({
      index,
      product: newProduct,
    })
  );
 setTimeout(() => {
    setUpdating(false);
  }, 2000);

  // Update URL from the updated compare array
  const finalSlugs = updatedProducts.map((p) => p ? p.slug : "_");

  setSearchParams(
    {
      phones: finalSlugs.join(","),
    },
    {
      replace: true,
    }
  );
};

useEffect(() => {
  if (!isSuccess || !sharedProducts) return;

  const formattedProducts = phoneSlugs.map((slug) => {
    if (slug === "_") return null;

    const product = sharedProducts.find((p) => p.slug === slug);

    if (!product) return null;

    return {
      _id: product._id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      defaultImage:
        product.variants?.[0]?.colors?.[0]?.images?.[0]?.url ||
        product.defaultImage,
      defaultPrice:
        product.variants?.[0]?.colors?.[0]?.price ||
        product.defaultPrice,
      rating: product.rating,
      numReviews: product.numReviews,
      defaultStorage: product.variants?.[0]?.storage || "",
      defaultColor: product.variants?.[0]?.colors?.[0]?.name || "",
      specs: product.variants?.[0]?.specs || {},
      variants: product.variants || [],
    };
  });

  

  // Prevent dispatching if nothing has changed
  const current = JSON.stringify(products);
  const next = JSON.stringify(formattedProducts);

  if (current !== next) {
    dispatch(setCompareProducts(formattedProducts));
  }
}, [
  dispatch,
  isSuccess,
  sharedProducts,
  phoneSlugs,
  products,
]);

// Close export menu when clicking outside
useEffect(() => {
  const handleClickOutside = (event) => {
    if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
      setShowExportMenu(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

//useEffect for clearComapare bar when a user go back from compare page
 useEffect(() => {
    return () => { 
      dispatch(clearCompare());
    }
  }, [dispatch]);

//handler for Export start
const handleExportPDF = async () => {
  setShowExportMenu(false);

  const element = compareRef.current;

  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

  heightLeft -= pdfHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;

    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

    heightLeft -= pdfHeight;
  }

  pdf.save("phone-comparison.pdf");
};

const handleExportImage = async () => {
  setShowExportMenu(false);

  const element = compareRef.current;

  if (!element) return;

  const canvas = await html2canvas(element, {
  scale: window.devicePixelRatio > 2 ? 2 : 3,
  useCORS: true,
  backgroundColor: "#ffffff",
  scrollY: -window.scrollY,
});

  const image = canvas.toDataURL("image/png");

  const link = document.createElement("a");
  link.href = image;
  link.download = "phone-comparison.png";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  toast.success("Image exported successfully!");
};

const handlePrint = () => {
  setShowExportMenu(false);

  if (!printRef.current) return;

  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    toast.error("Please allow popups to print.");
    return;
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>Phone Comparison</title>

        <style>
          @page {
            size: A4 landscape;
            margin: 6mm;
          }

          body {
            margin: 0;
            padding: 0;
            background: white;
            font-family: Arial, sans-serif;
          }
        </style>
      </head>

      <body>
        ${printRef.current.innerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();

  printWindow.focus();

  printWindow.onload = () => {
    printWindow.print();
    printWindow.close();
  };
};
//end Export handler

const clearSlot = (index) => {
  setUpdating(true);
  // Create updated array
  const updatedProducts = [...products];
  updatedProducts[index] = null;

  // Update Redux
  dispatch(clearCompareSlot(index));

   setTimeout(() => {
    setUpdating(false);
  }, 2000);

  // Update URL
  const finalSlugs = updatedProducts.map((p) =>
    p ? p.slug : "_"
  );

  setSearchParams(
    {
      phones: finalSlugs.join(","),
    },
    {
      replace: true,
    }
  );
};

//handler for share
const handleShare = async () => {
  const activeProducts = compareProducts.filter(Boolean);

  if (!activeProducts.length) {
    toast.warning("Please add at least one phone.");
    return;
  }

  const slugs = activeProducts.map((p) => p.slug).join(",");
  const compareUrl = `${window.location.origin}/compare?phones=${slugs}`;

  try {
    if (navigator.share && navigator.canShare?.({ url: compareUrl })) {
      await navigator.share({
        title: "Compare Phones",
        text: "Check out this phone comparison",
        url: compareUrl,
      });
      //console.log("navigator.share:", navigator.share);
    } else {
      await navigator.clipboard.writeText(compareUrl);
      toast.success("Comparison link copied!");
    }
  } catch (err) {
    console.log(err);
  }
};

if (isLoading) return <Loader />;
  return (
    <>
      <div className="grid grid-cols-3 items-center mb-6 mt-5 px-4">
  {/* Left */}
  <div>
    <button
       onClick={() => navigate(backPath)}
      className="text-blue-600 text-sm print:hidden"
    >
      ← {backLabel}
    </button>
  </div>

  {/* Center */}
  <div className="text-center">
    <h1 className="font-bold">
      <span className="text-xl lg:hidden print:hidden">Compare</span>
      <span className="hidden lg:inline print:inline text-3xl">
        Compare Phones
      </span>
    </h1>
  </div>

  {/* Right */}
  <div className="flex justify-end gap-2 print:hidden">
    {/* Share Button */}
   <button
  onClick={handleShare}
  className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-100 transition"
>
  <FaShareAlt />
  <span className="hidden sm:inline">Share</span>
</button>

    {/* Export Button */}
   <div className="relative" ref={exportMenuRef}>
  <button
    onClick={() => setShowExportMenu((prev) => !prev)}
    className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-100 transition"
  >
    <FaFileExport />
    <span className="hidden sm:inline">Export</span>
  </button>

  {showExportMenu && (
    <div className="absolute right-0 mt-2 w-52 bg-white border rounded-xl shadow-xl overflow-hidden z-50">
      <button
       onClick={handleExportPDF}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
      >
        <FaFilePdf className="text-red-600" />
        Export PDF
      </button>

      <button
      onClick={handleExportImage}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
      >
        <FaImage className="text-blue-600" />
        Export Image
      </button>

      <button
      onClick={handlePrint}
        className="w-full hidden lg:flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
      >
        <FaPrint className="text-gray-700" />
        Print
      </button>
    </div>
  )}
</div>
  </div>
</div>



<div ref={compareRef}>
<CompareProducts
  products={compareProducts}
  onReplace={replaceProduct}
  onClear={clearSlot}
  updating={updating}
/>
</div>

<div className="hidden">
  <div ref={printRef}>
    <ComparePrint
      products={compareProducts}
    />
  </div>
</div>



    </>
  );
};

export default CompareScreen;