import { cn } from '../../lib/cn';

export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-[26px] font-bold leading-tight tracking-[-0.025em] sm:text-display">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-prose text-small text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Panel({ children, className = '' }) {
  return (
    <div className={cn('min-w-0 rounded-card border border-line bg-white', className)}>
      {children}
    </div>
  );
}

export function PanelHeader({ icon: Icon, title, description, actions, className, iconClassName }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {Icon ? (
          <span
            className={cn(
              'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-control border border-line bg-surface text-brand-700',
              iconClassName,
            )}
          >
            <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
        ) : null}
        <div className="min-w-0">
          <h2 className="text-subtitle leading-snug">{title}</h2>
          {description ? <p className="mt-0.5 text-small text-muted">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2 sm:shrink-0">{actions}</div> : null}
    </div>
  );
}
