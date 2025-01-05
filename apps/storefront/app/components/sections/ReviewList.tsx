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

const ReviewCard: FC<ReviewCardProps & { isLast?: boolean }> = ({ review, isLast }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongReview = review.content.length > 200;

  return (
    <div className={clsx(
      "bg-highlight-900/80 backdrop-blur-sm rounded-2xl p-8 flex flex-col h-[350px] shadow-xl hover:shadow-2xl transition-all duration-300 border border-accent-50/20 hover:bg-highlight-900/70 group relative overflow-hidden",
      isLast && "animate-fade-slide-in"
    )}>
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-accent-50/5 rounded-full blur-2xl group-hover:bg-accent-50/10 transition-all duration-500" />
      <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-accent-50/5 rounded-full blur-2xl group-hover:bg-accent-50/10 transition-all duration-500" />

      <div className="flex items-center mb-6 relative">
        <div className="flex space-x-1">
          {[...Array(review.rating)].map((_, i) => (
            <StarIcon key={i} className="h-5 w-5 text-accent-50 drop-shadow-glow" />
          ))}
        </div>
        <span className="ml-auto text-sm text-accent-50/80 font-light">{review.date}</span>
      </div>

      <div className={clsx(
        "mb-4 flex-grow overflow-y-auto transition-all duration-300 pr-2 scrollbar-thin scrollbar-thumb-accent-50/20 scrollbar-track-transparent hover:scrollbar-thumb-accent-50/30",
        isExpanded ? "h-full" : "h-[200px]"
      )}>
        <p className="text-accent-50/90 text-[15px] leading-relaxed">
          {isExpanded || !isLongReview
            ? review.content
            : `${review.content.substring(0, 200)}...`}
        </p>
        {isLongReview && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-4 px-4 py-1.5 bg-accent-50/10 hover:bg-accent-50/20 rounded-full text-accent-50 text-sm font-medium transition-all duration-200 flex items-center gap-1 group/button"
          >
            <span>{isExpanded ? 'Show less' : 'Read more'}</span>
            <span className="transform transition-transform duration-200 group-hover/button:translate-y-[2px]">
              {isExpanded ? '↑' : '↓'}
            </span>
          </button>
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-accent-50/20">
        <p className="font-italiana text-lg tracking-wide text-accent-50">{review.reviewer_name}</p>
      </div>
    </div>
  );
};

const ReviewGrid: FC<{ reviews: Review[] }> = memo(({ reviews }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {reviews.map((review, index) => (
        <ReviewCard 
          key={index} 
          review={review} 
          isLast={index === reviews.length - 1}
        />
      ))}
    </div>
  );
});

export default function ReviewList({ className = '', heading = 'What Our Clients Say', reviews }: ReviewListProps) {
  const { scrollableDivRef, ...scrollArrowProps } = useScrollArrows({
    buffer: 20,
    resetOnDepChange: [reviews],
  });

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth < 768
  );

  const [visiblePages, setVisiblePages] = useState(3);
  const [isLoading, setIsLoading] = useState(false);

  const reviewsPerPage = isMobile ? 2 : 4;
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle scroll and lazy loading
  useEffect(() => {
    const handleScroll = async () => {
      if (!scrollableDivRef.current || isLoading) return;

      const { scrollLeft, scrollWidth, clientWidth } = scrollableDivRef.current;
      const scrollPercentage = (scrollLeft + clientWidth) / scrollWidth;

      // If user has scrolled to 80% of the content, load more
      if (scrollPercentage > 0.8) {
        setIsLoading(true);
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setVisiblePages(prev => Math.min(prev + 2, totalPages));
        setIsLoading(false);
      }
    };

    const scrollContainer = scrollableDivRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [scrollableDivRef, isLoading, totalPages]);

  const reviewPages = Array.from({ length: totalPages }, (_, i) => 
    reviews.slice(i * reviewsPerPage, (i + 1) * reviewsPerPage)
  ).slice(0, visiblePages);

  return (
    <Container className={`py-16 ${className}`}>
      <div className="text-center mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl" />
        <h4 className="font-italiana text-2xl mb-2 text-gray-300 tracking-widest relative">GUEST EXPERIENCES</h4>
        <h2 className="text-4xl lg:text-5xl font-aboreto relative">{heading}</h2>
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
          className="w-full overflow-x-auto whitespace-nowrap pb-2 scroll-smooth"
        >
          {reviewPages.map((pageReviews, pageIndex) => (
            <div 
              key={pageIndex}
              className="inline-block w-full whitespace-normal px-4 first:pl-0 last:pr-0"
            >
              <ReviewGrid reviews={pageReviews} />
            </div>
          ))}
          {isLoading && (
            <div className="inline-block w-full text-center py-8">
              <div className="animate-pulse text-gray-400 font-italiana tracking-wider">
                Loading more experiences...
              </div>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
} 