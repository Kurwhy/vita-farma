import { cn } from '../../lib/cn';

export function Field({ label, htmlFor, hint, error, required, children, className }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className="flex items-baseline gap-1 text-small font-medium text-ink"
      >
        {label}
        {required ? (
          <span className="text-danger" aria-hidden="true">
            *
          </span>
        ) : null}
        {required ? <span className="sr-only">wajib diisi</span> : null}
      </label>
      {children}
      {error ? (
        <p className="text-small text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-small text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
