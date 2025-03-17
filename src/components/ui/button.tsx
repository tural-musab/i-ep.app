import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Düğme çeşidi */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  /** Düğme boyutu */
  size?: 'sm' | 'md' | 'lg';
  /** Full width için kullanılır */
  fullWidth?: boolean;
}

/**
 * Uygulamada kullanılacak standart düğme bileşeni
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    className, 
    variant = 'primary', 
    size = 'md', 
    fullWidth = false,
    disabled = false,
    ...props 
  }, ref) => {
    const variantClasses = {
      primary: 'bg-primary text-white hover:bg-primary-dark',
      secondary: 'bg-secondary text-white hover:bg-secondary-dark',
      danger: 'bg-red-600 text-white hover:bg-red-700',
      ghost: 'bg-transparent text-gray-600 hover:bg-gray-100'
    };
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };
    
    return (
      <button
        ref={ref}
        className={cn(
          'rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth ? 'w-full' : '',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
          className
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button; 