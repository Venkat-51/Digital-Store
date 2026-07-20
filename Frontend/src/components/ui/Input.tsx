import React from 'react';
import { cn } from '@/utils/helpers';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  inputSize?: 'sm' | 'md' | 'lg';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, inputSize = 'md', className, id, ...props }, ref) => {
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-sm',
      lg: 'px-4 py-3.5 text-base',
    }[inputSize];

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-semibold text-gray-700">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-gray-400 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              'w-full rounded-xl border bg-white text-gray-900',
              'placeholder:text-gray-400 font-medium',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              'transition-all duration-200',
              'disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500',
              error ? 'border-danger-500 focus:ring-danger-500' : 'border-gray-200 hover:border-gray-300',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              sizeClasses,
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 text-gray-400 flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-danger-600 font-medium">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';

// ── Textarea ──
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        className={cn(
          'w-full px-4 py-3 rounded-xl border bg-white text-gray-900 text-sm font-medium',
          'placeholder:text-gray-400 resize-none',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'transition-all duration-200',
          error ? 'border-danger-500' : 'border-gray-200 hover:border-gray-300',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger-600 font-medium">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  ),
);

Textarea.displayName = 'Textarea';

// ── Select ──
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={cn(
          'w-full px-4 py-3 rounded-xl border bg-white text-gray-900 text-sm font-medium',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'transition-all duration-200 cursor-pointer',
          error ? 'border-danger-500' : 'border-gray-200 hover:border-gray-300',
          className,
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-danger-600 font-medium">{error}</p>}
    </div>
  ),
);

Select.displayName = 'Select';
