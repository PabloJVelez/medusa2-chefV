import { forwardRef } from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, wrapperClassName, ...props }, ref) => {
    return (
      <div className={clsx('w-full', wrapperClassName)}>
        {label && (
          <label
            htmlFor={props.id || props.name}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <div className="mt-1">
          <input
            ref={ref}
            className={clsx(
              'block w-full rounded-md border border-gray-300',
              'px-4 py-3 bg-white',
              'text-gray-900 placeholder-gray-400',
              'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20',
              'appearance-none',
              {
                'border-red-500 focus:border-red-500 focus:ring-red-500': error,
              },
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-500" id={`${props.name}-error`}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input'; 