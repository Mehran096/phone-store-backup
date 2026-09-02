import { useState } from 'react';
import { FaStar } from 'react-icons/fa';

const RatingStars = ({ rating, setRating }) => {
  const [hover, setHover] = useState(null);

  return (
    <div className='flex gap-1'>
      {[...Array(5)].map((_, index) => {
        const currentRating = index + 1;
        return (
          <label key={index}>
            <input
              type='radio'
              name='rating'
              value={currentRating}
              onClick={() => setRating(currentRating)}
              className='hidden'
            />
            <FaStar
              className='cursor-pointer transition-colors'
              color={currentRating <= (hover || rating) ? '#ffc107' : '#e4e5e9'}
              size={28}
              onMouseEnter={() => setHover(currentRating)}
              onMouseLeave={() => setHover(null)}
            />
          </label>
        );
      })}
    </div>
  );
};

export default RatingStars;