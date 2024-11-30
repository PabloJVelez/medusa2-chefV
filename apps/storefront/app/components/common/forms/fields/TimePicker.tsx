import { forwardRef } from 'react';
import { useField } from 'remix-validated-form';

interface TimePickerProps extends React.InputHTMLAttributes<HTMLSelectElement> {
  name: string;
  startTime?: string;
  endTime?: string;
  interval?: number;
}

export const TimePicker = forwardRef<HTMLSelectElement, TimePickerProps>(
  ({ name, startTime = '09:00', endTime = '17:00', interval = 30, className = '', ...props }, ref) => {
    const { error, getInputProps } = useField(name);

    const generateTimeSlots = () => {
      const slots = [];
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      let currentHour = startHour;
      let currentMinute = startMinute;

      while (
        currentHour < endHour ||
        (currentHour === endHour && currentMinute <= endMinute)
      ) {
        const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        slots.push(timeString);

        currentMinute += interval;
        if (currentMinute >= 60) {
          currentHour += Math.floor(currentMinute / 60);
          currentMinute = currentMinute % 60;
        }
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
          {timeSlots.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
        {error && <div className="mt-1 text-sm text-red-500">{error}</div>}
      </div>
    );
  }
);

TimePicker.displayName = 'TimePicker'; 