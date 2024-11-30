import { forwardRef } from 'react';
import { useField } from 'remix-validated-form';
import { DateTime } from 'luxon';

interface TimePickerProps extends React.InputHTMLAttributes<HTMLSelectElement> {
  name: string;
  startTime?: string;
  endTime?: string;
  interval?: number;
}

export const TimePicker = forwardRef<HTMLSelectElement, TimePickerProps>(
  ({ name, startTime = '17:00', endTime = '22:00', interval = 30, className = '', ...props }, ref) => {
    const { error, getInputProps } = useField(name);

    const generateTimeSlots = () => {
      const slots = [];
      const format = { hour: 'numeric', minute: '2-digit', hour12: true };
      
      let current = DateTime.fromFormat(startTime, 'HH:mm');
      const end = DateTime.fromFormat(endTime, 'HH:mm');

      while (current <= end) {
        slots.push({
          value: current.toFormat('HH:mm'),
          label: current.toLocaleString(format)
        });

        current = current.plus({ minutes: interval });
      }

      return slots;
    };

    const timeSlots = generateTimeSlots();

    return (
      <div className="relative">
        <select
          {...getInputProps({ ref })}
          className={`w-full rounded-md border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${className}`}
          {...props}
        >
          <option value="">Select a time</option>
          {timeSlots.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {error && <div className="mt-1 text-sm text-red-500">{error}</div>}
      </div>
    );
  }
);

TimePicker.displayName = 'TimePicker'; 