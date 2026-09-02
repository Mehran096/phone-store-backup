import { useState, useMemo, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  useGetProductReviewsQuery,
  useMarkReviewHelpfulMutation,
  useAddAdminReplyMutation,
  useEditAdminReplyMutation,
  useDeleteAdminReplyMutation,
} from '../slices/productsApiSlice';
import { FaStar, FaTimes, FaThumbsUp, FaReply, FaEdit, FaTrash, FaChevronDown } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Loader from './Loader';
import Message from './Message';
import Rating from './Rating';


const ReviewsModal = ({ productId, productColor, onClose, product }) => {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('helpful');
  const [colorFilter, setColorFilter] = useState('All');
  const [storageFilter, setStorageFilter] = useState('All');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [editingReply, setEditingReply] = useState(null);

  const { userInfo } = useSelector((state) => state.auth);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useGetProductReviewsQuery(
    {
      productId,
      page,
      limit: 10,
      sort,
      color: colorFilter === "All" ? "" : colorFilter,
      storage: storageFilter === 'All' ? '' : storageFilter,
    },
    {
      skip: !productId,
    }
  );



  const [markHelpful, { isLoading: loadingHelpful }] = useMarkReviewHelpfulMutation();
  const [addAdminReply, { isLoading: loadingReply }] = useAddAdminReplyMutation();
  const [editAdminReply, { isLoading: loadingEdit }] = useEditAdminReplyMutation();
  const [deleteAdminReply, { isLoading: loadingDelete }] = useDeleteAdminReplyMutation();

  const colors = product?.colors?.map((c) => c.name) || [];
  //console.log(colors)
  const storages = [...new Set(product?.variants?.map(v => v.storage) || [])];
  //console.log(storages)

  const reviews = data?.reviews || [];

  const handleHelpful = async (reviewId) => {
    if (!userInfo) {
      toast.error('Please login to mark as helpful');
      return;
    }
    try {
      await markHelpful({ productId, reviewId }).unwrap();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleReply = async (reviewId) => {
    if (!replyText.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }
    try {
      if (editingReply === reviewId) {
        await editAdminReply({
          productId,
          reviewId,
          reply: replyText,
        }).unwrap();
        toast.success('Reply updated');
      } else {
        await addAdminReply({
          productId,
          reviewId,
          reply: replyText,
        }).unwrap();
        toast.success('Reply posted');
      }
      refetch();
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
        await deleteAdminReply({ productId, reviewId }).unwrap();
        toast.success('Reply deleted');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };


  const CustomDropdown = ({ value, onChange, options, label, displayMap = {} }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
      const handleClickOutside = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
      <div ref={ref} className="relative w-full md:w-auto md:min-w-[160px]">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between gap-2 border-gray-300 rounded-lg px-4 py-3 text-base bg-white 
          hover:border-gray-400 transition"
        >
          <span className="text-gray-900">
            {value === 'All'
              ? label
              : displayMap[value] || value}
          </span>
          <FaChevronDown size={18} className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute top-full mt-1 left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-[60] 
          max-h-60 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm text-gray-900
                   hover:bg-gray-100 ${value === opt ? 'bg-gray-100 font-medium' : ''}`}
              >
                {opt === 'All'
                  ? label
                  : displayMap[opt] || opt}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!productId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col mx-2 sm:mx-0">
        {/* Header */}
        <div className="flex justify-between items-center p-3 sm:p-4 md:p-6 border-b">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
            All Reviews {productColor && `(${productColor})`}
          </h2>
          <button onClick={onClose} className="p-1">
            <FaTimes className="text-xl sm:text-2xl text-gray-500 hover:text-black" />
          </button>
        </div>

        {/* Sort + Stats */}
        <div className="p-3 sm:p-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 gap-3">
          <span className="text-sm text-gray-600">
            {data?.totalReviews || 0} reviews
          </span>

          <div className="flex flex-col md:flex-row gap-2 sm:gap-3 w-full md:w-auto">
            <CustomDropdown
              value={colorFilter}
              onChange={(val) => {
                setColorFilter(val);
                setPage(1);
              }}
              options={['All', ...colors]}
              label="All Colors"
            />
            <CustomDropdown
              value={storageFilter}
              onChange={(val) => {
                setStorageFilter(val);
                setPage(1);
              }}
              options={['All', ...storages]}
              label="All Storage"
            />
            <CustomDropdown
              value={sort}
              onChange={(val) => {
                setSort(val);
                setPage(1);
              }}
              options={['helpful', 'newest', 'highest', 'lowest']}
              label="Sort By"
              displayMap={{
                helpful: 'Most Helpful',
                newest: 'Newest',
                highest: 'Highest Rating',
                lowest: 'Lowest Rating',
              }}
            />
          </div>
        </div>

        {/* Reviews list */}
        <div className="overflow-y-auto p-3 sm:p-4 flex-1">
          {isLoading ? (
            <Loader />
          ) : error ? (
            <Message variant="danger">{error?.data?.message || error.error}</Message>
          ) : (
            <>
              {reviews.length === 0 ? (
                <Message>No reviews yet</Message>
              ) : (
                reviews.map((review) => {
                  const hasMarkedHelpful = review.helpful?.includes(userInfo?._id);

                  return (
                    <div key={review._id} className="border-b py-4 sm:py-6 last:border-b-0">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-semibold">{review.name}</span>
                        <span className="text-gray-500">
                          {review.color || review.storage ? (
                            <>
                              {review.color}
                              {review.storage && ` / ${review.storage}`}
                              {' | '}
                            </>
                          ) : null}
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <Rating value={review.rating} />

                      <p className="text-gray-800 mb-3 break-words text-sm sm:text-base">{review.comment}</p>

                      {review.images?.length > 0 && (
                        <div className="flex gap-2 mb-3 flex-wrap">
                          {review.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img.url}
                              alt={`review-${idx}`}
                              className='w-20 h-20 lg:w-24 lg:h-24 object-contain rounded-lg bg-white border border-gray-200'
                            />
                          ))}
                        </div>
                      )}

                      {/* Admin Reply Section */}
                      {review.adminReply?.reply && (
                        <div className="bg-blue-50 p-3 rounded mt-3 text-sm">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1">
                              <p className="font-semibold text-blue-800">
                                {review.adminReply.name || 'Seller'} Response:
                              </p>
                              {editingReply === review._id ? (
                                <div className="mt-2">
                                  <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    className="w-full border rounded p-2 text-sm"
                                    rows="2"
                                  />
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      onClick={() => handleReply(review._id)}
                                      disabled={loadingEdit}
                                      className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                                    >
                                      {loadingEdit ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingReply(null);
                                        setReplyText('');
                                      }}
                                      className="bg-gray-300 px-3 py-1 rounded text-xs"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="text-gray-700 mt-1 break-words">
                                    {review.adminReply.reply}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {review.adminReply?.createdAt
                                      ? new Date(review.adminReply.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                      })
                                      : 'Just now'}
                                  </p>
                                </>
                              )}
                            </div>
                            {userInfo?.isAdmin && editingReply !== review._id && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditingReply(review._id);
                                    setReplyingTo(null);
                                    setReplyText(review.adminReply.reply);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => handleDeleteReply(review._id)}
                                  disabled={loadingDelete}
                                  className="text-red-600 hover:text-red-800 flex-shrink-0"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-4 mt-3">
                        <button
                          onClick={() => handleHelpful(review._id)}
                          disabled={loadingHelpful}
                          className={`flex items-center gap-1 text-sm ${hasMarkedHelpful
                            ? 'text-blue-600 font-semibold'
                            : 'text-gray-600 hover:text-blue-600'
                            }`}
                        >
                          <FaThumbsUp className={hasMarkedHelpful ? 'fill-current' : ''} />
                          Helpful ({review.helpful?.length || 0})
                        </button>

                        {userInfo?.isAdmin && !review.adminReply?.reply && (
                          <button
                            onClick={() => {
                              setReplyingTo(review._id === replyingTo ? null : review._id);
                              setEditingReply(null);
                              setReplyText('');
                            }}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                          >
                            <FaReply />
                            {replyingTo === review._id ? 'Cancel' : 'Reply as Admin'}
                          </button>
                        )}
                      </div>

                      {/* New Reply Form */}
                      {replyingTo === review._id && (
                        <div className="mt-3 bg-gray-50 p-3 rounded">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write your reply..."
                            className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500"
                            rows={3}
                          />
                          <button
                            onClick={() => handleReply(review._id)}
                            disabled={loadingReply || loadingEdit}
                            className="mt-2 bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700 
                            disabled:bg-gray-400"
                          >
                            {loadingReply || loadingEdit ? 'Posting...' : editingReply ? 'Update Reply' : 'Post Reply'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>

        {/* Pagination */}
        {data?.totalPages > 1 && (
          <div className="p-3 sm:p-4 border-t flex justify-between items-center bg-gray-50">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 sm:px-4 py-2 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-xs sm:text-sm">
              Page {page} of {data.totalPages}
            </span>
            <button
              disabled={page === data.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 sm:px-4 py-2 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsModal;