import { ActionList } from '@app/components/common/actions-list/ActionList';
import { Container } from '@app/components/common/container/Container';
import type { CustomAction, ImageField } from '@libs/types';
import clsx from 'clsx';
import type { FC } from 'react';

export interface ChefHeroProps {
  className?: string;
  backgroundClassName?: string;
  actionsClassName?: string;
  chefName?: string;
  tagline?: string;
  description?: string;
  image?: ImageField;
  actions?: CustomAction[];
}

export const ChefHero: FC<ChefHeroProps> = ({ 
  className, 
  backgroundClassName, 
  actionsClassName,
  chefName = "Chef Elena Rodriguez",
  tagline = "CULINARY EXPERIENCES & PRIVATE DINING",
  description = "Transform your special occasions into unforgettable culinary experiences. From intimate cooking classes to elegant plated dinners, I bring restaurant-quality cuisine directly to your home.",
  image = {
    url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    alt: 'Chef Elena Rodriguez preparing an elegant dish'
  },
  actions = [
    {
      label: 'Browse Our Menus',
      url: '/menus',
    },
    {
      label: 'Request an Event',
      url: '/request',
    },
  ]
}) => {
  return (
    <>
      {image?.url && <link rel="preload" href={image?.url} as="image" />}
      <Container className={clsx('flex flex-col justify-center items-center relative w-full bg-accent-50', className)}>
        <div
          className={clsx(
            'mkt-section__background-overlay flex-1 z-0 bg-cover bg-no-repeat bg-center opacity-80',
            backgroundClassName,
          )}
          style={{
            backgroundImage: `url(${image?.url})`,
          }}
        />
        <div className="overflow-hidden z-10 w-full text-white">
          <div className="inline-grid gap-6 w-full text-center">
            <h4 className="font-italiana text-xl md:text-2xl tracking-wider text-accent-100">{tagline}</h4>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-italiana text-white drop-shadow-lg">{chefName}</h1>
            <p className="max-w-2xl mx-auto text-base md:text-lg leading-relaxed text-accent-100 drop-shadow-md">
              {description}
            </p>
          </div>

          {!!actions?.length && (
            <ActionList 
              actions={actions} 
              className={clsx('mt-8 lg:mt-10 flex-col gap-4 md:flex-row md:justify-center', actionsClassName)} 
            />
          )}
        </div>
      </Container>
    </>
  );
};

export default ChefHero; 