export function SkeletonLine({ className = '' }) {
  return <div className={`skeleton h-4 rounded ${className}`} />;
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-surface-100 p-5 ${className}`}>
      <div className="skeleton h-5 w-3/4 mb-3 rounded" />
      <div className="skeleton h-4 w-full mb-2 rounded" />
      <div className="skeleton h-4 w-2/3 mb-4 rounded" />
      <div className="flex gap-2">
        <div className="skeleton h-6 w-16 rounded-full" />
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonStats({ className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-surface-100 p-5 ${className}`}>
      <div className="skeleton h-4 w-24 mb-3 rounded" />
      <div className="skeleton h-8 w-16 mb-2 rounded" />
      <div className="skeleton h-3 w-32 rounded" />
    </div>
  );
}

export function SkeletonChart({ className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-surface-100 p-5 ${className}`}>
      <div className="skeleton h-5 w-40 mb-4 rounded" />
      <div className="skeleton h-48 w-full rounded" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <div className="skeleton h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
