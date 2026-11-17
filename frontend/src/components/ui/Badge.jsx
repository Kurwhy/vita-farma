import { cn } from '../../lib/cn';
import { BATCH_STATUS_LABEL, STATUS_RESEP_LABEL } from '../../lib/constants';

const VARIANTS = {
  success: 'border-green-200 bg-green-50 text-success',
  warning: 'border-amber-200 bg-amber-50 text-warning',
  danger: 'border-red-200 bg-red-50 text-danger',
  neutral: 'border-line bg-surface text-muted',
  brand: 'border-brand-200 bg-brand-50 text-brand-800',
};

export function Badge({ children, variant = 'neutral', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-control border px-2 py-0.5 text-micro font-semibold',
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

const BATCH_VARIANT = { tersedia: 'success', habis: 'neutral', expired: 'danger' };
const RESEP_VARIANT = { menunggu: 'warning', ditebus: 'success' };

export function BatchStatusBadge({ status }) {
  return <Badge variant={BATCH_VARIANT[status] || 'neutral'}>{BATCH_STATUS_LABEL[status]}</Badge>;
}

export function ResepStatusBadge({ status }) {
  return <Badge variant={RESEP_VARIANT[status] || 'neutral'}>{STATUS_RESEP_LABEL[status]}</Badge>;
}
