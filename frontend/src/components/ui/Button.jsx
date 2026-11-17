import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

const VARIANTS = {
  primary: 'bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-900',
  secondary:
    'border border-line bg-white text-ink hover:border-brand-300 hover:bg-brand-50 active:bg-brand-100',
  ghost: 'text-ink hover:bg-brand-50 active:bg-brand-100',
  danger: 'bg-danger text-white hover:bg-red-800 active:bg-red-900',
  'danger-outline':
    'border border-red-200 bg-white text-danger hover:bg-red-50 active:bg-red-100',
  link: 'px-0 text-brand-700 hover:text-brand-900 hover:underline active:text-brand-900 min-h-11',
};

const SIZES = {
  md: 'min-h-11 px-4 text-small',
  sm: 'min-h-11 px-3 text-small',
  icon: 'h-11 w-11 shrink-0 p-0',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  type = 'button',
  disabled,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control font-semibold transition-colors duration-150',
        'disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        variant !== 'link' && SIZES[size],
        className,
      )}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 className="h-[18px] w-[18px] animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
