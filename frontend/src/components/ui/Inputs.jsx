import { cn } from '../../lib/cn';

const BASE =
  'w-full min-h-11 rounded-control border bg-white px-3.5 text-body text-ink placeholder:text-muted transition-colors duration-150 disabled:bg-surface disabled:text-muted';

const NORMAL =
  'border-line hover:border-brand-300 focus:border-brand-600 focus:ring-4 focus:ring-brand-100/70';
const INVALID =
  'border-danger hover:border-danger focus:border-danger focus:ring-4 focus:ring-red-100';

export function Input({ className, invalid, ...props }) {
  return (
    <input
      className={cn(BASE, invalid ? INVALID : NORMAL, className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export function Select({ className, invalid, children, ...props }) {
  return (
    <select
      className={cn(
        BASE,
        'appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10',
        'bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 24 24%27 stroke=%27%235B6B6A%27 stroke-width=%272%27%3E%3Cpath stroke-linecap=%27round%27 stroke-linejoin=%27round%27 d=%27m6 9 6 6 6-6%27/%3E%3C/svg%3E")]',
        invalid ? INVALID : NORMAL,
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ className, invalid, ...props }) {
  return (
    <textarea
      className={cn(
        BASE,
        'min-h-[96px] py-2.5 leading-relaxed',
        invalid ? INVALID : NORMAL,
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}
