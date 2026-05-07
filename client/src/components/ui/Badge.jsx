export default function Badge({ children, className = '', variant = 'default' }) {
  const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

  return (
    <span className={`${base} ${className}`}>
      {children}
    </span>
  );
}
