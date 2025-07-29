import { StoreProductVariant } from '@medusajs/types';
import clsx from 'clsx';
import { FC } from 'react';
import { Controller } from 'react-hook-form';
import { useRemixFormContext } from 'remix-hook-form';

interface QuantitySelectorProps {
  variant: StoreProductVariant | undefined;
  maxInventory?: number;
  className?: string;
  formId?: string;
  onChange?: (quantity: number) => void;
}

export const QuantitySelector: FC<QuantitySelectorProps> = ({ className, variant, maxInventory = 10, onChange }) => {
  const formContext = useRemixFormContext();

  if (!formContext) {
    console.error('QuantitySelector must be used within a RemixFormProvider');
    return null;
  }

  const { control } = formContext;

  const variantInventory =
    variant?.manage_inventory && !variant.allow_backorder ? variant.inventory_quantity || 0 : maxInventory;

  const optionsArray = [...Array(Math.min(variantInventory, maxInventory))].map((_, index) => ({
    label: `${index + 1}`,
    value: index + 1,
  }));

  return (
    <Controller
      name="quantity"
      control={control}
      render={({ field }) => (
        <div className={clsx('w-full', className)}>
          <label htmlFor="quantity" className="sr-only">
            Quantity
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-medium">Tickets</span>
            <select
              {...field}
              className="focus:border-orange-500 focus:ring-orange-500 !h-14 !w-full rounded-xl border-2 border-gray-200 pl-20 pr-4 text-lg font-semibold bg-white shadow-sm hover:border-orange-300 transition-colors"
              value={field.value || '1'}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                field.onChange(value);
                onChange?.(value);
              }}
            >
              {optionsArray.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} {option.value === 1 ? 'Ticket' : 'Tickets'}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    />
  );
};
