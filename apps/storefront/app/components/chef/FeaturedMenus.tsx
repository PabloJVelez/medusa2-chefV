import { Container } from '@app/components/common/container';
import { MenuListItem } from '@app/components/menu/MenuListItem';
import { FC, useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface FeaturedMenusProps {
  menus: any[];
  maxDisplay?: number;
}

export const FeaturedMenus: FC<FeaturedMenusProps> = ({ menus, maxDisplay = 3 }) => {
  // Validate and filter menus to ensure they have required properties
  const validMenus = menus?.filter(menu => 
    menu && 
    menu.id && 
    menu.name && 
    Array.isArray(menu.courses)
  ) || [];
  
  const displayMenus = validMenus.slice(0, maxDisplay);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-rotate carousel every 6 seconds
  useEffect(() => {
    if (displayMenus.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayMenus.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [displayMenus.length]);

  const handleNext = () => {
    if (isTransitioning || displayMenus.length <= 1) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % displayMenus.length);
      setIsTransitioning(false);
    }, 150);
  };

  const handlePrev = () => {
    if (isTransitioning || displayMenus.length <= 1) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + displayMenus.length) % displayMenus.length);
      setIsTransitioning(false);
    }, 150);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 150);
  };

  // If no valid menus are available, show a fallback message
  if (validMenus.length === 0) {
    return (
      <Container className="py-16 lg:py-24">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-italiana text-gray-900 mb-4">
            Featured Menus
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Our curated menus are being prepared. Please check back soon for our latest culinary offerings.
          </p>
          <div className="bg-gray-50 rounded-lg p-8">
            <p className="text-gray-500">
              Menu data is temporarily unavailable. We're working to bring you the best dining experiences.
            </p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-16 lg:py-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-italiana text-gray-900 mb-4">
          Featured Menus
        </h2>
        <p className="text-lg text-gray-600">
          Discover our carefully crafted menus, each designed to create unforgettable dining experiences.
        </p>
      </div>

      {/* Carousel Container */}
      <div className="relative max-w-2xl mx-auto">
        {/* Menu Carousel */}
        <div className="relative overflow-hidden">
          <div 
            className="flex transition-transform duration-300 ease-in-out"
            style={{ 
              transform: `translateX(-${currentIndex * 100}%)`,
              opacity: isTransitioning ? 0.7 : 1
            }}
          >
            {displayMenus.map((menu, index) => (
              <div key={menu.id} className="w-full flex-shrink-0 px-4">
                <MenuListItem 
                  menu={menu} 
                  isTransitioning={isTransitioning}
                  className="mx-auto"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        {displayMenus.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              disabled={isTransitioning}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center text-gray-600 hover:text-gray-900 z-10"
              aria-label="Previous menu"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            
            <button
              onClick={handleNext}
              disabled={isTransitioning}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center text-gray-600 hover:text-gray-900 z-10"
              aria-label="Next menu"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {displayMenus.length > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            {displayMenus.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? 'bg-accent-600 scale-110'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to menu ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {validMenus.length > maxDisplay && (
        <div className="text-center mt-12">
          <a
            href="/menus"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-accent-600 hover:bg-accent-700 transition-colors"
          >
            View All Menus
          </a>
        </div>
      )}
    </Container>
  );
};

export default FeaturedMenus; 