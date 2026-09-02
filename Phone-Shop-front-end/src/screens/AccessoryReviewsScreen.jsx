import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useParams } from "react-router-dom";
import { useSelector } from 'react-redux';
import {
    useGetAccessoryBySlugQuery,
    useGetAccessoryReviewsQuery,
    useGetAccessoryReviewImagesQuery,
    useVoteReviewMutation,
    useReplyToReviewMutation,
    useUpdateReplyMutation,
    useDeleteReplyMutation,
} from '../slices/accessoriesApiSlice';
import { FaStar, FaTimes, FaThumbsUp, FaThumbsDown, FaReply, FaEdit, FaTrash, FaChevronDown, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Rating from '../components/Rating';
import ReviewSkeleton from '../components/ReviewSkeleton';
import { Helmet } from 'react-helmet-async'; 

const AccessoryReviewsScreen = () => {
    const { slug } = useParams();

    const [page, setPage] = useState(1);
    const [sort, setSort] = useState('helpful');
    const [modelFilter, setModelFilter] = useState('All');
    const [variantFilter, setVariantFilter] = useState('All');
    const [ratingFilter, setRatingFilter] = useState("");
    const [hasPhotosFilter, setHasPhotosFilter] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingReplyId, setEditingReplyId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [search, setSearch] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);




    const { userInfo } = useSelector((state) => state.auth);

    // 1. GET ACCESSORY BY SLUG
    const {
        data: accessory,
        isLoading: loadingAccessory,
        error: errorAccessory,
    } = useGetAccessoryBySlugQuery(slug);

    // 2. GET REVIEWS BY SLUG
    const {
        data,
        isLoading,
        isFetching,
        error,
    } = useGetAccessoryReviewsQuery(
        {
            slug, // CHANGED: use slug instead of productId
            page,
            limit: 10,
            sort,
            model: modelFilter === "All" ? "" : modelFilter,
            variant: variantFilter === 'All' ? '' : variantFilter,
            keyword: search,
            rating: ratingFilter,
            hasPhotos: hasPhotosFilter,
        },
        {
            skip: !slug,
        }
    );

    // 2. For pagination: append new pages
    const reviews = data?.reviews || [];
    const totalReviews = data?.totalReviews || 0;

    const ratingBreakdown = useMemo(() => {
        const breakdown = data?.ratingBreakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        const total = data?.totalReviews || accessory?.numReviews || 1
        return [5, 4, 3, 2, 1].map(star => ({
            star,
            count: breakdown[star],
            percent: total > 0 ? (breakdown[star] / total) * 100 : 0
        }))
    }, [data, accessory])

    const [voteReview, { isLoading: voting }] = useVoteReviewMutation();
    const [replyToReview, { isLoading: loadingReply }] = useReplyToReviewMutation();
    const [updateReply, { isLoading: loadingEdit }] = useUpdateReplyMutation();
    const [deleteReply, { isLoading: loadingDelete }] = useDeleteReplyMutation();

    // 3. GET ALL REVIEW IMAGES - NOT PAGINATED
    const {
        data: allPhotos = [],
        isLoading: loadingPhotos
    } = useGetAccessoryReviewImagesQuery(slug, { skip: !slug });



    const models = [...new Set(accessory?.models?.map(m => m.modelName) || [])];
    const variants = [...new Set(accessory?.models?.flatMap(m => m.variants.map(v => v.name)) || [])];

    // Filter image
    const selectedModelObj = accessory?.models?.find(m => modelFilter === 'All' || m.modelName === modelFilter);
    const selectedVariantObj = selectedModelObj?.variants?.find(v => variantFilter === 'All' || v.name === variantFilter);
    const accessoryImage = selectedVariantObj?.images?.[0]?.url || accessory?.models?.[0]?.variants?.[0]?.images?.[0]?.url || '/placeholder.png';

    
const siteUrl = 'https://phone-store.asia';  
// SEO VARS - ADD THIS
const seoTitle = accessory? `${accessory.name} Reviews - Customer Ratings & Photos | phone-store.asia` : 'Customer Reviews';
const seoDescription = accessory? `Read ${totalReviews} verified customer reviews for ${accessory.name} by ${accessory.brand}. See ratings, photos, pros and cons. Buy with confidence at phone-store.asia` : 'Customer Reviews';

    useEffect(() => {
        setPage(1);

    }, [sort, modelFilter, variantFilter, ratingFilter, search, hasPhotosFilter,]);



    const startEditReply = (reviewId, reply) => {
        setEditingReplyId(reply._id);
        setReplyingTo(null); // <-- KEY: close new reply box
        setReplyText(reply.comment);
    }



    const handleVote = async (reviewId, type) => {
        if (!userInfo) return toast.error('Please login to vote');

        // FIX: use 'reviews' instead of 'data?.reviews'
        const review = reviews.find(r => r._id === reviewId);
        if (!review) return;

        const userIdStr = userInfo._id;
        const alreadyVotedHelpful = review.helpful?.some(id => id.toString() === userIdStr);
        const alreadyVotedNotHelpful = review.notHelpful?.some(id => id.toString() === userIdStr);

        let message = '';

        try {
            await voteReview({ slug, reviewId, type }).unwrap();

            if (type === 'helpful') {
                if (alreadyVotedHelpful) message = 'Removed helpful vote 👍';
                else if (alreadyVotedNotHelpful) message = 'Changed to helpful 👍';
                else message = 'Thanks for marking this helpful! 👍';
            }
            else {
                if (alreadyVotedNotHelpful) message = 'Removed not helpful vote 👎';
                else if (alreadyVotedHelpful) message = 'Changed to not helpful 👎';
                else message = 'Thanks for your feedback! 👎';
            }

            toast.success(message);

        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    const handleReply = async (reviewId) => {
        if (!replyText.trim()) return toast.error('Reply cannot be empty');

        const currentText = replyText; // save for rollback
        setReplyText(''); // clear input instantly for UX

        try {
            if (editingReplyId) { // <-- EDIT MODE
                await updateReply({
                    slug,
                    reviewId,
                    replyId: editingReplyId,
                    comment: currentText
                }).unwrap();
                toast.success('Reply updated');
            } else { // <-- POST MODE
                await replyToReview({
                    slug,
                    reviewId,
                    comment: currentText
                }).unwrap();
                toast.success('Reply posted');
            }

            // <-- MOVE THESE 3 LINES HERE, AFTER SUCCESS
            setReplyingTo(null);
            setEditingReplyId(null);
        } catch (err) {
            setReplyText(currentText); // put text back if failed
            toast.error(err?.data?.message || err.error);
        }
    };

    const handleDeleteReply = async (reviewId, replyId) => {
        if (window.confirm('Delete this admin reply?')) {
            try {
                await deleteReply({ slug, reviewId, replyId }).unwrap();
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
                    <div className="absolute top-full mt-1 left-0 w-full bg-white border-gray-200 rounded-lg shadow-lg z-[60] max-h-60 overflow-y-auto">
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
                        {photos.length > 8 && ( // <-- ONLY View All button now
                            <button
                                onClick={() => setShowAll(true)}
                                className="text-blue-600 text-sm font-medium hover:underline"
                            >
                                View all {photos.length}
                            </button>
                        )}
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {photos.slice(0, 8).map((photo, i) => (
                            <div
                                key={i}
                                onClick={() => setSelectedImage(photo.url || photo)}
                                className="w-24 h-24 border rounded-lg bg-white flex-shrink-0 cursor-pointer hover:border-blue-500 transition p-1"
                            >
                                <img src={photo.url || photo} alt="Customer photo" className="w-full h-full object-contain" />
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
                                    <div key={i} onClick={() => setSelectedImage(photo.url || photo)} className="aspect-square bg-white p-2 rounded-lg cursor-pointer">
                                        <img src={photo.url || photo} className="w-full h-full object-contain" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </>
        )
    }

    if (loadingAccessory) return <Loader />;
    if (errorAccessory) return <Message variant="danger">{errorAccessory?.data?.message || errorAccessory.error}</Message>;
    if (!accessory) return <Message>Accessory not found</Message>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* ===== SEO HELMET BLOCK FOR REVIEWS PAGE ===== */}
        {accessory && (
            <Helmet>
                <title>{seoTitle}</title>
                <meta name="description" content={seoDescription} />
                <meta name="keywords" content={`${accessory.name} reviews, ${accessory.brand} reviews, ${accessory.accessoryType} customer rating`} />
                <link rel="canonical" href={`${siteUrl}/accessory/${accessory.slug}/reviews`} />

                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDescription} />
                <meta property="og:image" content={accessoryImage} />
                <meta property="og:url" content={`${siteUrl}/accessory/${accessory.slug}/reviews`} />

                {totalReviews > 0 && (
                    <script type="application/ld+json">
                        {JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Product",
                            "name": accessory.name,
                            "brand": { "@type": "Brand", "name": accessory.brand },
                            "image": accessoryImage,
                            "aggregateRating": {
                                "@type": "AggregateRating",
                                "ratingValue": accessory.rating?.toFixed(1),
                                "reviewCount": totalReviews
                            }
                        })}
                    </script>
                )}
            </Helmet>
        )}
        {/* ===== END SEO BLOCK ===== */}
        
            <Link to={`/accessory/${accessory.slug}`} className="text-blue-600 hover:text-blue-700 text-sm">← Back to Accessory</Link>
            <h1 className="text-4xl font-bold mt-3">Customer Reviews</h1>

            {/* MAIN ACCESSORY IMAGE + MODEL/VARIANT PREVIEW */}
            <div className="mt-6 bg-white border rounded-xl p-6 shadow-sm flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                {/* Left: Image */}
                <div className="w-40 h-40 sm:w-48 sm:h-48 flex-shrink-0 border rounded-lg p-2 bg-gray-50 mx-auto sm:mx-0">
                    <img
                        src={accessoryImage}
                        alt={accessory.name}
                        className="w-full h-full object-contain"
                    />
                </div>

                {/* Right: Info */}
                <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-xl font-bold">{accessory.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        <span className="text-gray-500">Model: </span>
                        <span className="font-semibold text-gray-900">{modelFilter !== 'All' ? modelFilter : 'All Models'}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                        <span className="text-gray-500">Variant: </span>
                        <span className="font-semibold text-gray-900">{variantFilter !== 'All' ? variantFilter : 'All Variants'}</span>
                    </p>
                    <p className="text-sm text-gray-600 mt-3">
                        Select Model and Variant from filters below to see reviews for that variant
                    </p>
                </div>
            </div>


            {/* 1. SUMMARY - SAME AS MAIN PAGE */}
            <div className="mt-8 bg-white border rounded-xl p-6 mb-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-5">Customer Reviews Summary</h3>
                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Left: Big Score */}
                    <div className="lg:w-56 text-center">
                        <div className="text-5xl font-bold">
                            {accessory.rating?.toFixed(1)}
                        </div>
                        <div className="flex justify-center mt-2">
                            <Rating value={accessory.rating} />
                        </div>
                        <p className="text-sm text-gray-500 mt-3">
                            Based on {accessory.numReviews} customer reviews
                        </p>
                    </div>

                    {/* Right: Breakdown Bars */}
                    <div className="flex-1">
                        {ratingBreakdown.map(({ star, count, percent }) => (
                            <button
                                key={star}
                                onClick={() => { setRatingFilter(ratingFilter === star.toString() ? "" : star.toString()); setPage(1) }}
                                className="flex items-center gap-3 mb-2 w-full group"
                            >
                                <span className={`w-8 text-sm flex items-center gap-1 ${ratingFilter === star.toString() ? 'text-blue-600 font-semibold' : 'text-gray-700 group-hover:text-blue-600'}`}>
                                    {star} <FaStar size={12} className="text-yellow-400" />
                                </span>
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="bg-yellow-400 h-2 rounded-full transition-all duration-300" style={{ width: `${percent}%` }}></div>
                                </div>
                                <span className={`w-16 text-right text-sm ${ratingFilter === star.toString() ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>{count}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {!loadingPhotos && allPhotos.length > 0 && <CustomerPhotos photos={allPhotos} />}

            {/* SEARCH */}
            <div className="mb-6 mt-6">
                <div className="relative w-full md:max-w-md">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1) }} // <-- reset page on type
                        placeholder="Search reviews..."
                        className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.35-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>


            {/* FILTERS */}
            <div className="p-3 mt-8 sm:p-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 gap-3">
                <span className="text-sm text-gray-600">{data?.totalReviews || 0} reviews</span>

                <div className="flex flex-col md:flex-row gap-2 sm:gap-3 w-full md:w-auto items-center">
                    {/* NEW: Has Photos Checkbox */}
                    <label className="flex items-center gap-2 text-sm px-3 py-2 bg-white border rounded-lg cursor-pointer hover:border-blue-500">
                        <input
                            type="checkbox"
                            checked={hasPhotosFilter}
                            onChange={(e) => { setHasPhotosFilter(e.target.checked); setPage(1) }}
                            className="rounded text-blue-600"
                        />
                        With Photos
                    </label>

                    <CustomDropdown value={ratingFilter} onChange={(val) => { setRatingFilter(val); setPage(1) }} options={[{ label: "All Stars", value: "" }, { label: "5 Stars", value: "5" }, { label: "4 Stars", value: "4" }, { label: "3 Stars", value: "3" }, { label: "2 Stars", value: "2" }, { label: "1 Star", value: "1" }]} />
                    <CustomDropdown value={modelFilter} onChange={(val) => { setModelFilter(val); setPage(1) }} options={[{ label: 'All Models', value: 'All' }, ...models.map(m => ({ label: m, value: m }))]} />
                    <CustomDropdown value={variantFilter} onChange={(val) => { setVariantFilter(val); setPage(1) }} options={[{ label: 'All Variants', value: 'All' }, ...variants.map(v => ({ label: v, value: v }))]} />
                    <CustomDropdown value={sort} onChange={(val) => { setSort(val); setPage(1) }} options={[{ label: 'Most Helpful', value: 'helpful' }, { label: 'Newest', value: 'newest' }, { label: 'Highest Rating', value: 'highest' }, { label: 'Lowest Rating', value: 'lowest' }]} />
                </div>
            </div>

            {/* REVIEWS LIST */}
            <div className="overflow-y-auto p-3 sm:p-4 flex-1">
                {/* Initial load */}
                {isLoading ? (
                    <Loader />
                ) : error ? (
                    <Message variant="danger">{error?.data?.message || error.error}</Message>
                ) : reviews.length === 0 ? (
                    <Message>No reviews yet</Message>
                ) : (
                    <>
                        {reviews.map((review) => {
                            const hasMarkedHelpful = review.helpful?.some(id => id.toString() === userInfo?._id);
                            const hasMarkedNotHelpful = review.notHelpful?.some(id => id.toString() === userInfo?._id);
                            return (
                                <div key={review._id} className="border-b py-4 sm:py-6 last:border-b-0">
                                    <div className="flex flex-wrap items-center gap-2 text-sm">
                                        <span className="font-semibold">{review.name}</span>
                                        {review.verifiedPurchase && <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1"><FaCheck /> Verified</span>}
                                        <span className="text-gray-500">{review.model} {review.variant && `/ ${review.variant}`} | {new Date(review.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <Rating value={review.rating} />
                                    <h4 className="font-semibold mt-2">{review.title}</h4>
                                    <p className="text-gray-800 mb-3">{review.comment}</p>

                                    {review.images?.length > 0 && (
                                        <div className="flex gap-2 mb-3 flex-wrap">
                                            {review.images.map((img, idx) => (
                                                <img key={idx} src={img.url} onClick={() => setSelectedImage(img.url)} className="w-20 h-20 object-contain border rounded bg-white p-1 cursor-pointer" />
                                            ))}
                                        </div>
                                    )}

                                    {/* REPLIES */}
                                    {review.replies?.map((reply) => (
                                        <div key={reply._id} className="bg-blue-50 p-3 rounded mt-3 ml-6">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className='bg-blue-600 text-white text-xs px-2 py-0.5 rounded font-semibold'>Admin</span>
                                                    <strong className='text-sm ml-2'>{reply.name}</strong>
                                                </div>
                                                {userInfo?.isAdmin && editingReplyId !== reply._id && (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => startEditReply(review._id, reply)} className="text-blue-600 text-xs"><FaEdit /></button>
                                                        <button onClick={() => handleDeleteReply(review._id, reply._id)} className="text-red-600 text-xs"><FaTrash /></button>
                                                    </div>
                                                )}
                                            </div>

                                            {editingReplyId === reply._id ? (
                                                <div className="mt-2">
                                                    <textarea value={replyText} onChange={e => setReplyText(e.target.value)} className="w-full border p-2 rounded text-sm" rows={2} />
                                                    <div className="flex gap-2 mt-2">
                                                        <button onClick={() => handleReply(review._id)} disabled={loadingEdit} className={`bg-blue-600 text-white px-4 py-1.5 rounded text-sm ${loadingEdit ? 'opacity-50 cursor-not-allowed' : ''}`}>Update Reply</button>
                                                        <button onClick={() => { setEditingReplyId(null); setReplyText('') }} className="bg-gray-300 px-3 py-1 rounded text-xs">Cancel</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className='text-sm mt-1'>{reply.comment}</p>
                                            )}
                                        </div>
                                    ))}

                                    {/* ACTIONS */}
                                    <div className="flex gap-4 mt-3">
                                        <button
                                            onClick={() => handleVote(review._id, 'helpful')}
                                            disabled={voting}
                                            className={`flex items-center gap-1 text-sm transition ${hasMarkedHelpful ? 'text-green-600 font-semibold' : 'text-gray-600 hover:text-green-600'}`}
                                        >
                                            <FaThumbsUp /> Helpful ({review.helpful?.length || 0})
                                        </button>

                                        <button
                                            onClick={() => handleVote(review._id, 'notHelpful')}
                                            disabled={voting}
                                            className={`flex items-center gap-1 text-sm transition ${hasMarkedNotHelpful ? 'text-red-600 font-semibold' : 'text-gray-600 hover:text-red-600'}`}
                                        >
                                            <FaThumbsDown /> Not Helpful ({review.notHelpful?.length || 0})
                                        </button>
                                        {userInfo?.isAdmin && <button onClick={() => setReplyingTo(review._id)} className="text-blue-600 text-sm"><FaReply /> Reply</button>}
                                    </div>

                                    {/* NEW REPLY BOX */}
                                    {userInfo?.isAdmin && replyingTo === review._id && !editingReplyId && (
                                        <div className="mt-3 ml-6">
                                            <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                                                placeholder="Reply as Admin..." className="w-full border p-2 rounded text-sm" rows={2} />
                                            <div className="flex gap-2 mt-2">
                                                <button onClick={() => handleReply(review._id)} disabled={loadingReply}
                                                    className={`bg-blue-600 text-white px-4 py-1.5 rounded text-sm ${loadingReply ? 'opacity-50 cursor-not-allowed' : ''}`}>Post Reply</button>
                                                <button onClick={() => { setReplyingTo(null); setReplyText('') }}
                                                    className="bg-gray-300 text-gray-700 px-4 py-1.5 rounded text-sm">Cancel</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}

                        {/* Show skeleton when loading next page */}
                        {isFetching && !voting && page > 1 && (
                            <div className="mt-4">
                                <ReviewSkeleton />
                                <ReviewSkeleton />
                            </div>
                        )}
                    </>
                )}
            </div>

            {page < data?.totalPages && (
                <div className="flex justify-center mt-10">
                    <button
                        onClick={() => setPage(prev => prev + 1)}
                        disabled={isFetching}
                        className="px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isFetching ? "Loading..." : "Load More Reviews"}
                    </button>
                </div>
            )}

            {selectedImage && <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50" onClick={() => setSelectedImage(null)}><img src={selectedImage} className="max-w-[90%] max-h-[90%] rounded-lg" /></div>}
        </div>
    );
};

export default AccessoryReviewsScreen;