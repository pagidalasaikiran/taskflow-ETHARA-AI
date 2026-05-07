export default function Card({ children, className = '', hover = true, ...props }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-surface-200 shadow-sm p-6 overflow-hidden ${
        hover ? 'hover:shadow-md transition-shadow duration-200' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
