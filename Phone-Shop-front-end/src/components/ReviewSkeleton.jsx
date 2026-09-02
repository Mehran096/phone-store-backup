const ReviewSkeleton = () => {
  return (
    <div className="py-6 border-b animate-pulse">
      {/* User */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-300"></div>

        <div className="flex-1">
          <div className="h-4 w-32 bg-gray-300 rounded mb-2"></div>
          <div className="h-3 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Stars */}
      <div className="flex gap-1 mt-4">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="w-4 h-4 rounded bg-yellow-200"
          ></div>
        ))}
      </div>

      {/* Review text */}
      <div className="mt-4 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-11/12"></div>
        <div className="h-3 bg-gray-200 rounded w-9/12"></div>
      </div>

      {/* Image placeholder */}
      <div className="mt-4 w-24 h-24 rounded-lg bg-gray-200"></div>

      {/* Helpful button */}
      <div className="mt-5 h-8 w-24 bg-gray-200 rounded"></div>
    </div>
  );
};

export default ReviewSkeleton;