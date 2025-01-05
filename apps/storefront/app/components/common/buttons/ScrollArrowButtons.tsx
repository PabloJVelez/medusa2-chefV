import type { FC } from 'react';
import { IconButton } from './IconButton';
import clsx from 'clsx';
import ArrowLeftIcon from '@heroicons/react/24/solid/ArrowLeftIcon';
import ArrowRightIcon from '@heroicons/react/24/solid/ArrowRightIcon';

interface ScrollArrowButtonsProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  showStartArrow: boolean;
  showEndArrow: boolean;
  handleArrowClick: (direction: 'start' | 'end') => void;
}

export const ScrollArrowButtons: FC<ScrollArrowButtonsProps> = ({
  className,
  orientation = 'horizontal',
  showStartArrow,
  showEndArrow,
  handleArrowClick,
}) => {
  return (
    <div
      className={clsx(
        'scroll-arrow-buttons pointer-events-none absolute flex justify-between',
        {
          '-left-4 top-1/2 w-[calc(100%+2rem)]': orientation === 'horizontal',
          '-top-5 left-1/2 h-[calc(100%+2.3rem)] flex-col': orientation === 'vertical',
        },
        className,
      )}
    >
      <IconButton
        aria-label="Scroll section toward the start"
        onClick={() => handleArrowClick('start')}
        className={clsx(
          'bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 focus:text-white z-10 opacity-0 transition-all duration-300',
          {
            'pointer-events-auto opacity-100': showStartArrow,
            'rotate-90 transform': orientation === 'vertical',
          },
        )}
        iconProps={{ className: 'h-5 w-5' }}
        icon={ArrowLeftIcon}
      />
      <IconButton
        aria-label="Scroll section toward the end"
        onClick={() => handleArrowClick('end')}
        className={clsx(
          'bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 focus:text-white z-10 opacity-0 transition-all duration-300',
          {
            'pointer-events-auto opacity-100': showEndArrow,
            'rotate-90 transform': orientation === 'vertical',
          },
        )}
        iconProps={{ className: 'h-5 w-5' }}
        icon={ArrowRightIcon}
      />
    </div>
  );
};
