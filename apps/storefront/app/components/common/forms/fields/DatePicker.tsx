import { forwardRef } from 'react';
import { useField } from 'remix-validated-form';

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  minDate?: Date;
  maxDate?: Date;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ name, minDate, maxDate, className = '', ...props }, ref) => {
    const { error, getInputProps } = useField(name);
    
    const today = new Date().toISOString().split('T')[0];
    const maxDateStr = maxDate?.toISOString().split('T')[0];
    const minDateStr = minDate?.toISOString().split('T')[0] || today;

    return (
      <div className="relative">
        <input
          type="date"
          {...getInputProps({
            ref,
            min: minDateStr,
            max: maxDateStr,
          })}
          className={`w-full rounded-md border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${className}`}
          {...props}
        />
        {error && <div className="mt-1 text-sm text-red-500">{error}</div>}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker'; 