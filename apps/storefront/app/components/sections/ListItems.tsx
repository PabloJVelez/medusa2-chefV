import { Container } from '@app/components/common/container';
import { Image, ImageProps } from '@app/components/common/images/Image';
import clsx from 'clsx';

interface ListItemsSectionProps {
  className?: string;
  title?: string;
  itemsClassName?: string;
  useFillTitle?: boolean;
  items: {
    title?: string;
    description?: string;
    image?: ImageProps;
    className?: string;
    useFillTitle?: boolean;
  }[];
}

const Item = ({ title, description, image, className, useFillTitle }: ListItemsSectionProps['items'][number]) => {
  return (
    <div className={clsx('flex flex-col gap-5 text-sm font-sen', className)}>
      {image && <Image {...image} />}
      {title && (
        <div className="flex justify-center w-full">
          <h4 className="font-bold text-2xl">{title}</h4>
          {useFillTitle && <div className="flex-1 border-t border-black" />}
        </div>
      )}
      {description && <p>{description}</p>}
    </div>
  );
};

export const ListItems = ({ title, items = [], className, itemsClassName, useFillTitle }: ListItemsSectionProps) => {
  return (
    <Container className={clsx('p-14 pt-0 lg:px-16', className)}>
      {title && (
        <div className="flex flex-col items-center">
          <h3 className="text-4xl md:text-5xl lg:text-6xl font-italiana text-center">{title}</h3>
          <div className="w-full mt-3 mb-12 border-t border-primary" />
        </div>
      )}

      <div className={clsx("grid grid-cols-1 md:grid-cols-3 gap-8", itemsClassName)}>
        {items?.map((item) => (
          <Item key={item.title} useFillTitle={useFillTitle} {...item} />
        ))}
      </div>
    </Container>
  );
};
