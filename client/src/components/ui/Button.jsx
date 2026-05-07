import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm shadow-primary-200',
  secondary: 'bg-surface-100 hover:bg-surface-200 text-surface-700 border border-surface-200',
  danger: 'bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-200',
  ghost: 'bg-transparent hover:bg-surface-100 text-surface-600',
  outline: 'bg-transparent border border-primary-300 text-primary-600 hover:bg-primary-50',
};

const sizes = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${variants[variant]} ${sizes[size]} ${
        disabled || loading ? 'opacity-60 cursor-not-allowed' : ''
      } ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
