import { Container } from '../common/container';
import { StarIcon } from '@heroicons/react/24/solid';
import { useScrollArrows } from '@app/hooks/useScrollArrows';
import { ScrollArrowButtons } from '@app/components/common/buttons/ScrollArrowButtons';
import { memo, type FC, useState, useEffect } from 'react';
import clsx from 'clsx';

interface Review {
  reviewer_name: string;
  date: string;
  rating: number;
  content: string;
}

interface ReviewListProps {
  className?: string;
  heading?: string;
  reviews: Review[];
}

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: FC<ReviewCardProps> = ({ review }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongReview = review.content.length > 200;

  return (
    <div className="bg-highlight-900/70 rounded-2xl p-8 flex flex-col h-[350px]">
      <div className="flex items-center mb-4">
        <div className="flex">
          {[...Array(review.rating)].map((_, i) => (
            <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
          ))}
        </div>
        <span className="ml-auto text-sm text-gray-600">{review.date}</span>
      </div>

      <div className={clsx(
        "text-sm mb-4 flex-grow overflow-y-auto transition-all duration-300",
        isExpanded ? "h-full" : "h-[200px]"
      )}>
        <p>
          {isExpanded || !isLongReview
            ? review.content
            : `${review.content.substring(0, 200)}...`}
        </p>
        {isLongReview && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary-600 hover:text-primary-700 font-semibold mt-2 block"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-gray-200">
        <p className="font-semibold">{review.reviewer_name}</p>
      </div>
    </div>
  );
};

const ReviewGrid: FC<{ reviews: Review[] }> = memo(({ reviews }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {reviews.map((review, index) => (
        <ReviewCard key={index} review={review} />
      ))}
    </div>
  );
});

export default function ReviewList({ className = '', heading = 'What Our Clients Say', reviews }: ReviewListProps) {
  const { scrollableDivRef, ...scrollArrowProps } = useScrollArrows({
    buffer: 100,
    resetOnDepChange: [reviews],
  });

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth < 768
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const reviewsPerPage = isMobile ? 2 : 3;
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const reviewPages = Array.from({ length: totalPages }, (_, i) => 
    reviews.slice(i * reviewsPerPage, (i + 1) * reviewsPerPage)
  );

  return (
    <Container className={`py-16 ${className}`}>
      <div className="text-center mb-12">
        <h4 className="font-italiana text-2xl mb-2">TESTIMONIALS</h4>
        <h2 className="text-4xl lg:text-5xl font-aboreto">{heading}</h2>
      </div>

      <div className="review-carousel relative">
        {totalPages > 1 && (
          <ScrollArrowButtons 
            className="absolute top-1/2 -translate-y-1/2 w-full z-10" 
            {...scrollArrowProps} 
          />
        )}
        <div
          ref={scrollableDivRef}
          className="w-full snap-both snap-mandatory overflow-x-auto whitespace-nowrap pb-2 sm:snap-proximity"
        >
          {reviewPages.map((pageReviews, pageIndex) => (
            <div 
              key={pageIndex}
              className="inline-block w-full snap-center whitespace-normal px-4 first:pl-0 last:pr-0"
            >
              <ReviewGrid reviews={pageReviews} />
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
} 