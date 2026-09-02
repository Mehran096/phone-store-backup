import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useParams } from "react-router-dom";
import { useSelector } from 'react-redux';
import {
    useGetProductBySlugQuery,
    useGetProductReviewsQuery,
    useMarkReviewHelpfulMutation,
    useMarkReviewNotHelpfulMutation,
    useAddAdminReplyMutation,
    useEditAdminReplyMutation,
    useDeleteAdminReplyMutation,
    useGetProductReviewImagesQuery,
} from '../slices/productsApiSlice';
import { FaStar, FaTimes, FaThumbsUp, FaThumbsDown, FaReply, FaEdit, FaTrash, FaChevronDown, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Rating from '../components/Rating';
import ReviewSkeleton from '../components/ReviewSkeleton';

const ProductReviewsScreen = () => {
    const { slug } = useParams();

    const [page, setPage] = useState(1);
    const [sort, setSort] = useState('helpful');
    const [colorFilter, setColorFilter] = useState('All');
    const [storageFilter, setStorageFilter] = useState('All');
    const [ratingFilter, setRatingFilter] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingReply, setEditingReply] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [search, setSearch] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);

    const { userInfo } = useSelector((state) => state.auth);

    // 1. GET PRODUCT BY SLUG
    const {
        data: product,
        isLoading: loadingProduct,
        error: errorProduct,
    } = useGetProductBySlugQuery(slug);

    // 2. GET REVIEWS BY SLUG
    const {
        data,
        isLoading,
        isFetching,
        error,
    } = useGetProductReviewsQuery(
        {
            slug,
            page,
            limit: 10,
            sort,
            color: colorFilter === "All" ? "" : colorFilter,
            storage: storageFilter === 'All' ? '' : storageFilter,
            keyword: search,
            rating: ratingFilter,
        },
        { skip: !slug }
    );

    //gets ALL images, not just loaded page
    const {
        data: customerPhotos = [],
        isLoading: loadingPhotos
    } = useGetProductReviewImagesQuery(slug, { skip: !slug });

    // 2. For pagination: use current page only, like accessory
    const reviews = data?.reviews || [];
    const totalReviews = data?.total || product?.numReviews || 0;

    const ratingBreakdown = useMemo(() => {
        // OPTION 1: If backend sends it - BEST
        if (data?.ratingBreakdown) {
            const breakdown = data.ratingBreakdown
            const total = totalReviews || 1
            return [5, 4, 3, 2, 1].map(star => ({
                star,
                count: breakdown[star] || 0,
                percent: total > 0 ? (breakdown[star] / total) * 100 : 0
            }))
        }

        // OPTION 2: Fallback - count from loaded reviews only
        const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => { breakdown[r.rating] = (breakdown[r.rating] || 0) + 1 });
        const total = totalReviews || 1;
        return [5, 4, 3, 2, 1].map(star => ({
            star,
            count: breakdown[star],
            percent: total > 0 ? (breakdown[star] / total) * 100 : 0
        }));
    }, [data, reviews, totalReviews]);

    const [markHelpful, { isLoading: loadingHelpful }] = useMarkReviewHelpfulMutation();
    const [markReviewNotHelpful, { isLoading: loadingNotHelpful }] = useMarkReviewNotHelpfulMutation();
    const [addAdminReply, { isLoading: loadingReply }] = useAddAdminReplyMutation();
    const [editAdminReply, { isLoading: loadingEdit }] = useEditAdminReplyMutation();
    const [deleteAdminReply, { isLoading: loadingDelete }] = useDeleteAdminReplyMutation();

    const colors = [...new Set(product?.variants?.flatMap(v => v.colors.map(c => c.name)) || [])];
    const storages = [...new Set(product?.variants?.map(v => v.storage) || [])];

    const selectedVariant = product?.variants?.find(v => storageFilter === 'All' || v.storage === storageFilter);
    const selectedColor = selectedVariant?.colors?.find(c => colorFilter === 'All' || c.name === colorFilter);
    const productImage = selectedColor?.images?.[0]?.url || selectedVariant?.colors?.[0]?.images?.[0]?.url || product?.variants?.[0]?.colors?.[0]?.images?.[0]?.url;

    useEffect(() => {
        setPage(1);
    }, [sort, colorFilter, storageFilter, ratingFilter, search, slug]);

    // const customerPhotos = useMemo(() =>
    //     reviews.flatMap((review) => (review.images || []).map((img) => ({ ...img, reviewId: review._id }))),
    //     [reviews]);

    const handleHelpful = async (reviewId) => {
        if (!userInfo) return toast.error('Please login to mark as helpful');
        try {
            const res = await markHelpful({ slug, reviewId }).unwrap();
            toast.success(res.userVoted ? 'Marked as helpful' : 'Vote removed');
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    const handleNotHelpful = async (reviewId) => {
        if (!userInfo) return toast.error("Please login to mark as not helpful");
        try {
            const res = await markReviewNotHelpful({ slug, reviewId }).unwrap();
            toast.success(res.userVoted ? 'Marked as not helpful' : 'Vote removed');
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    const handleReply = async (reviewId) => {
        if (!replyText.trim()) return toast.error('Reply cannot be empty');
        try {
            if (editingReply === reviewId) {
                await editAdminReply({ slug, reviewId, reply: replyText }).unwrap();
                toast.success('Reply updated');
            } else {
                await addAdminReply({ slug, reviewId, reply: replyText }).unwrap();
                toast.success('Reply posted');
            }
            setReplyText('');
            setReplyingTo(null);
            setEditingReply(null);
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    const handleDeleteReply = async (reviewId) => {
        if (window.confirm('Delete this admin reply?')) {
            try {
                await deleteAdminReply({ slug, reviewId }).unwrap();
                toast.success('Reply deleted');
            } catch (err) {
                toast.error(err?.data?.message || err.error);
            }
        }
    };

    const CustomDropdown = ({ value, onChange, options, label }) => {
        const [open, setOpen] = useState(false);
        const ref = useRef(null);
        useEffect(() => {
            const handleClickOutside = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);
        return (
            <div ref={ref} className="relative w-full md:w-auto md:min-w-[160px]">
                <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-2 border-gray-300 rounded-lg px-4 py-3 text-base bg-white hover:border-gray-400 transition">
                    <span className="text-gray-900">{options.find((opt) => opt.value === value)?.label || label}</span>
                    <FaChevronDown size={18} className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
                {open && (
                    <div className="absolute top-full mt-1 left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-[60] max-h-60 overflow-y-auto">
                        {options.map((opt) => (
                            <button key={opt.value} type="button" onClick={() => { onChange(opt.value); setOpen(false); }} className={`w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 ${value === opt.value ? 'bg-gray-100 font-medium' : ''}`}>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const CustomerPhotos = ({ photos = [] }) => {
    if (!photos || photos.length === 0) return null
    const [showAll, setShowAll] = useState(false)

    return (
        <>
            <div className="mt-6 bg-white border rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-semibold">Customer Photos ({photos.length})</h3>
                    {photos.length > 8 && (
                        <button onClick={() => setShowAll(true)} className="text-blue-600 text-sm font-medium hover:underline">
                            View all {photos.length}
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                    {photos.slice(0, 8).map((photo, i) => (
                        <div key={i} onClick={() => setSelectedImage(photo.url)} className="aspect-square border rounded-lg bg-white cursor-pointer hover:border-blue-500 transition p-1">
                            <img src={photo.url} alt="Customer photo" className="w-full h-full object-contain" />
                        </div>
                    ))}
                </div>
            </div>

            {/* FULL GALLERY MODAL */}
            {showAll && (
                <div className="fixed inset-0 bg-black/90 z-[100] overflow-y-auto" onClick={() => setShowAll(false)}>
                    <div className="max-w-5xl mx-auto p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6 text-white">
                            <h2 className="text-2xl font-bold">All Customer Photos ({photos.length})</h2>
                            <button onClick={() => setShowAll(false)}><FaTimes size={24} /></button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {photos.map((photo, i) => (
                                <div key={i} onClick={() => setSelectedImage(photo.url)} className="aspect-square bg-white p-2 rounded-lg cursor-pointer">
                                    <img src={photo.url} className="w-full h-full object-contain" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

    if (loadingProduct) return <Loader />;
    if (errorProduct) return <Message variant="danger">{errorProduct?.data?.message || errorProduct.error}</Message>;
    if (!product) return <Message>Product not found</Message>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <Link to={`/product/${product.slug}`} className="text-blue-600 hover:text-blue-700 text-sm">← Back to Product</Link>
            <h1 className="text-4xl font-bold mt-3">Customer Reviews</h1>

        {/* MAIN PRODUCT IMAGE + COLOR/STORAGE PREVIEW */}
<div className="mt-6 bg-white border rounded-xl p-6 shadow-sm flex flex-col sm:flex-row gap-6 items-center sm:items-start">
    {/* Left: Image */}
    <div className="w-40 h-40 sm:w-48 sm:h-48 flex-shrink-0 border rounded-lg p-2 bg-gray-50 mx-auto sm:mx-0">
        <img 
            src={productImage} 
            alt={product.name} 
            className="w-full h-full object-contain" 
        />
    </div>

    {/* Right: Info */}
    <div className="flex-1 text-center sm:text-left">
        <h2 className="text-xl font-bold">{product.name}</h2>
        <p className="text-sm text-gray-500 mt-1">
            <span className="text-gray-500">Color: </span>
            <span className="font-semibold text-gray-900">{selectedColor?.name!== 'All'? selectedColor?.name : 'All Colors'}</span>
        </p>
        <p className="text-sm text-gray-500">
            <span className="text-gray-500">Storage: </span>
            <span className="font-semibold text-gray-900">{selectedVariant?.storage!== 'All'? selectedVariant?.storage : 'All Storage'}</span>
        </p>
        <p className="text-sm text-gray-600 mt-3">
            Select Color and Storage from filters below to see reviews for that variant
        </p>
    </div>
</div>

            {/* SUMMARY */}
            <div className="mt-8 bg-white border rounded-xl p-6 mb-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-5">Customer Reviews Summary</h3>
                <div className="flex flex-col lg:flex-row gap-10">
                    <div className="lg:w-56 text-center">
                        <div className="text-5xl font-bold">{product.rating?.toFixed(1)}</div>
                        <div className="flex justify-center mt-2"><Rating value={product.rating} /></div>
                        <p className="text-sm text-gray-500 mt-3">Based on {totalReviews} customer reviews</p>
                    </div>
                    <div className="flex-1">
                        {ratingBreakdown.map(({ star, count, percent }) => (
                            <button key={star} onClick={() => { setRatingFilter(ratingFilter === star.toString() ? "" : star.toString()); setPage(1) }} className="flex items-center gap-3 mb-2 w-full group">
                                <span className={`w-8 text-sm flex items-center gap-1 ${ratingFilter === star.toString() ? 'text-blue-600 font-semibold' : 'text-gray-700 group-hover:text-blue-600'}`}>{star} <FaStar size={12} className="text-yellow-400" /></span>
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden"><div className="bg-yellow-400 h-2 rounded-full transition-all duration-300" style={{ width: `${percent}%` }}></div></div>
                                <span className={`w-16 text-right text-sm ${ratingFilter === star.toString() ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>{count}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* CUSTOMER PHOTOS */}
            {!loadingPhotos && customerPhotos.length > 0 && <CustomerPhotos photos={customerPhotos} />}

            {/* SEARCH */}
            <div className="mb-6 mt-6">
                <div className="relative w-full md:max-w-md">
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reviews..." className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.35-5.15a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
            </div>

            {/* FILTERS */}
            <div className="p-3 sm:p-4 border-b flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 gap-3">
                <span className="text-sm text-gray-600">{totalReviews} reviews</span>
                <div className="flex flex-col md:flex-row gap-2 sm:gap-3 w-full md:w-auto">
                    <CustomDropdown value={ratingFilter} onChange={(val) => { setRatingFilter(val); setPage(1) }} options={[{ label: "All Stars", value: "" }, { label: "5 Stars", value: "5" }, { label: "4 Stars", value: "4" }, { label: "3 Stars", value: "3" }, { label: "2 Stars", value: "2" }, { label: "1 Star", value: "1" }]} />
                    <CustomDropdown value={colorFilter} onChange={(val) => { setColorFilter(val); setPage(1) }} options={[{ label: 'All Colors', value: 'All' }, ...colors.map((color) => ({ label: color, value: color }))]} label="All Colors" />
                    <CustomDropdown value={storageFilter} onChange={(val) => { setStorageFilter(val); setPage(1) }} options={[{ label: 'All Storage', value: 'All' }, ...storages.map((storage) => ({ label: storage, value: storage }))]} label="All Storage" />
                    <CustomDropdown value={sort} onChange={(val) => { setSort(val); setPage(1) }} options={[{ label: 'Most Helpful', value: 'helpful' }, { label: 'Newest', value: 'newest' }, { label: 'Highest Rating', value: 'highest' }, { label: 'Lowest Rating', value: 'lowest' }]} label="Sort By" />
                </div>
            </div>

            {/* REVIEWS LIST */}
            <div className="overflow-y-auto p-3 sm:p-4 flex-1">
                {isLoading ? <Loader /> : error ? <Message variant="danger">{error?.data?.message || error.error}</Message> : reviews.length === 0 ? <Message>No reviews yet</Message> : (
                    reviews.map((review) => {
                        const hasMarkedHelpful = review.helpful?.includes(userInfo?._id);
                        const hasMarkedNotHelpful = review.notHelpful?.includes(userInfo?._id);
                        return (
                            <div key={review._id} className="border-b py-4 sm:py-6 last:border-b-0">
                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                    <span className="font-semibold">{review.name}</span>
                                    {review.verifiedPurchase && <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1"><FaCheck /> Verified</span>}
                                    <span className="text-gray-500">{review.color}{review.storage && ` / ${review.storage}`} | {new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>
                                <Rating value={review.rating} />
                                {review.title && <h4 className="font-semibold mt-2">{review.title}</h4>}
                                <p className="text-gray-800 mb-3">{review.comment}</p>

                                {review.images?.length > 0 && (
                                    <div className="flex gap-2 mb-3 flex-wrap">
                                        {review.images.map((img, idx) => <img key={idx} src={img.url} onClick={() => setSelectedImage(img.url)} className="w-20 h-20 object-contain border rounded bg-white p-1 cursor-pointer" />)}
                                    </div>
                                )}

                                {/* ADMIN REPLY */}
                                {review.adminReply?.reply && (
                                    <div className="bg-blue-50 p-3 rounded mt-3 ml-6">
                                        <div className="flex justify-between items-start">
                                            <div><span className='bg-blue-600 text-white text-xs px-2 py-0.5 rounded font-semibold'>Seller</span><strong className='text-sm ml-2'>{review.adminReply.name}</strong></div>
                                            {userInfo?.isAdmin && editingReply !== review._id && (
                                                <div className="flex gap-2"><button onClick={() => { setEditingReply(review._id); setReplyText(review.adminReply.reply); }} className="text-blue-600 text-xs"><FaEdit /></button><button onClick={() => handleDeleteReply(review._id)} className="text-red-600 text-xs"><FaTrash /></button></div>
                                            )}
                                        </div>
                                        {editingReply === review._id ? (
                                            <div className="mt-2"><textarea value={replyText} onChange={e => setReplyText(e.target.value)} className="w-full border p-2 rounded text-sm" rows={2} /><div className="flex gap-2 mt-2"><button onClick={() => handleReply(review._id)} disabled={loadingEdit} className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm">Update Reply</button><button onClick={() => { setEditingReply(null); setReplyText('') }} className="bg-gray-300 px-3 py-1 rounded text-xs">Cancel</button></div></div>
                                        ) : (<p className='text-sm mt-1'>{review.adminReply.reply}</p>)}
                                    </div>
                                )}

                                {/* ACTIONS */}
                                <div className="flex gap-4 mt-3">
                                    <button onClick={() => handleHelpful(review._id)} disabled={loadingHelpful} className={`flex items-center gap-1 text-sm ${hasMarkedHelpful ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`}><FaThumbsUp /> Helpful ({review.helpful?.length || 0})</button>
                                    <button onClick={() => handleNotHelpful(review._id)} disabled={loadingNotHelpful} className={`flex items-center gap-1 text-sm ${hasMarkedNotHelpful ? "text-red-600 font-semibold" : "text-gray-600 hover:text-red-600"}`}><FaThumbsDown /> Not Helpful ({review.notHelpful?.length || 0})</button>
                                    {userInfo?.isAdmin && !review.adminReply?.reply && <button onClick={() => setReplyingTo(review._id)} className="text-blue-600 text-sm"><FaReply /> Reply</button>}
                                </div>

                                {/* REPLY BOX */}
                                {userInfo?.isAdmin && replyingTo === review._id && (
                                    <div className="mt-3 ml-6"><textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Reply as Seller..." className="w-full border p-2 rounded text-sm" rows={2} /><div className="flex gap-2 mt-2"><button onClick={() => handleReply(review._id)} disabled={loadingReply} className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm">Post Reply</button><button onClick={() => { setReplyingTo(null); setReplyText('') }} className="bg-gray-300 text-gray-700 px-4 py-1.5 rounded text-sm">Cancel</button></div></div>
                                )}
                            </div>
                        )
                    })
                )}
                {isFetching && page > 1 && <div className="mt-4"><ReviewSkeleton /><ReviewSkeleton /></div>}
            </div>

            {/* LOAD MORE */}
            {data?.hasMore && (
                <div className="flex justify-center mt-10">
                    <button onClick={() => setPage(prev => prev + 1)} disabled={isFetching} className="px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-black disabled:opacity-50">
                        {isFetching ? "Loading..." : "Load More Reviews"}
                    </button>
                </div>
            )}

            {selectedImage && <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50" onClick={() => setSelectedImage(null)}><img src={selectedImage} className="max-w-[90%] max-h-[90%] rounded-lg" /></div>}
        </div>
    );
};

export default ProductReviewsScreen;