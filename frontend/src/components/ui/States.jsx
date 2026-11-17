import { AlertTriangle, PackageOpen, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../lib/cn';

export function LoadingState({ rows = 5, label = 'Memuat data' }) {
  return (
    <div className="overflow-hidden rounded-card border border-line bg-white" aria-busy="true" role="status">
      <span className="sr-only">{label}</span>
      <div className="divide-y divide-line">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 px-5 py-4">
            <div className="h-3.5 animate-pulse rounded-full bg-line" style={{ width: `${34 - (index % 3) * 6}%` }} />
            <div className="h-3.5 w-1/5 animate-pulse rounded-full bg-line" />
            <div className="ml-auto h-3.5 w-20 animate-pulse rounded-full bg-line" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon = PackageOpen, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-12 text-center', className)}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-brand-100 bg-brand-50 text-brand-700">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="text-subtitle">{title}</h2>
      {description ? <p className="mt-1 max-w-prose text-small text-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ title = 'Data gagal dimuat', message, onRetry }) {
  return (
    <div className="flex flex-col items-center rounded-card border border-red-200 bg-white px-6 py-10 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-red-200 bg-red-50 text-danger">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="text-subtitle">{title}</h2>
      <p className="mt-1 max-w-prose text-small text-muted">
        {message || 'Terjadi kesalahan saat membaca data. Coba muat ulang.'}
      </p>
      {onRetry ? (
        <Button variant="secondary" className="mt-5" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Muat ulang
        </Button>
      ) : null}
    </div>
  );
}
