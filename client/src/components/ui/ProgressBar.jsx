export default function ProgressBar({ value = 0, size = 'md', showLabel = true, className = '' }) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const getColor = () => {
    if (clampedValue >= 80) return 'bg-emerald-500';
    if (clampedValue >= 50) return 'bg-primary-500';
    if (clampedValue >= 25) return 'bg-amber-500';
    return 'bg-surface-400';
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-surface-500">Progress</span>
          <span className="text-xs font-medium text-surface-700">{clampedValue}%</span>
        </div>
      )}
      <div className={`w-full bg-surface-100 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${getColor()} ${sizeClasses[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
