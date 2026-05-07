import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, icon: Icon, className = '', ...props }, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-surface-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
            <Icon className="w-5 h-5 text-surface-400" />
          </div>
        )}
        <input
          ref={ref}
          className={`w-full min-w-0 flex-1 h-11 bg-white border rounded-xl text-sm text-surface-800 placeholder:text-surface-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 ${
            Icon ? 'pl-11 pr-4' : 'px-4'
          } ${
            error
              ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
              : 'border-surface-200 hover:border-surface-300'
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
