import { forwardRef } from 'react';

const Select = forwardRef(({ label, error, options = [], placeholder, className = '', ...props }, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-surface-700">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`w-full px-3 py-2 bg-white border rounded-lg text-sm text-surface-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 ${
          error
            ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
            : 'border-surface-200 hover:border-surface-300'
        } ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
