import { forwardRef } from 'react';
import { useField } from 'remix-validated-form';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'options'> {
  name: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ name, options, placeholder = 'Select an option', className = '', ...props }, ref) => {
    const { error, getInputProps } = useField(name);

    return (
      <div className="relative">
        <select
          {...getInputProps({ ref })}
          className={`w-full rounded-md border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${className}`}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <div className="mt-1 text-sm text-red-500">{error}</div>}
      </div>
    );
  }
);

Select.displayName = 'Select'; 