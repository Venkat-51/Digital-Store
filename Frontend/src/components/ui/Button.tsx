import React from 'react';
import { cn } from '@/utils/helpers';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:   'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm hover:shadow-md focus:ring-primary-500',
  secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 active:bg-secondary-700 shadow-sm hover:shadow-md focus:ring-secondary-400',
  outline:   'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 active:bg-primary-100 focus:ring-primary-500',
  ghost:     'text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 focus:ring-gray-400',
  danger:    'bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-800 shadow-sm hover:shadow-md focus:ring-danger-500',
  success:   'bg-success-600 text-white hover:bg-success-700 active:bg-success-800 shadow-sm hover:shadow-md focus:ring-success-500',
};

const sizeStyles: Record<Size, string> = {
  xs: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  sm: 'px-4 py-2 text-sm rounded-xl gap-2',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
  xl: 'px-8 py-4 text-lg rounded-2xl gap-3',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-semibold tracking-tight',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none',
          'select-none',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className,
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" size={size === 'xs' ? 14 : size === 'xl' ? 20 : 16} />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  },
);

Button.displayName = 'Button';
