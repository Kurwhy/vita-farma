import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatNumber } from '../../lib/format';

export function Pagination({ page, perPage, total, onChange }) {
  if (!total) return null;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  return (
    <div className="flex flex-col gap-3 border-t border-line bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-small text-muted">
        Menampilkan {formatNumber(start)} sampai {formatNumber(end)} dari {formatNumber(total)} data
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Halaman sebelumnya"
          className="flex h-11 w-11 items-center justify-center rounded-control border border-line text-ink transition-colors hover:border-brand-300 hover:bg-brand-50 disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <span className="min-w-[126px] rounded-control bg-surface px-3 py-2 text-center text-small font-medium text-muted nums">
          Halaman {page} dari {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Halaman berikutnya"
          className="flex h-11 w-11 items-center justify-center rounded-control border border-line text-ink transition-colors hover:border-brand-300 hover:bg-brand-50 disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
