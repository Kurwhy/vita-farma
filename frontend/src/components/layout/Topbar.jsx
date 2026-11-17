import { LogOut, Menu } from 'lucide-react';
import { ROLE_LABEL } from '../../lib/constants';
import { initials } from '../../lib/format';

export function Topbar({ user, onMenu, onLogout, triggerRef }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white px-4 sm:px-6">
      <button
        type="button"
        ref={triggerRef}
        onClick={onMenu}
        aria-label="Buka menu navigasi"
        aria-haspopup="dialog"
        className="flex min-h-11 items-center gap-2 rounded-control border border-line bg-white px-3 text-small font-semibold text-ink hover:border-brand-300 hover:bg-brand-50 lg:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
        Menu
      </button>

      <div className="flex-1" />

      <div className="flex min-w-0 items-center gap-3">
        <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-200 bg-brand-50 text-[12px] font-bold text-brand-800 sm:flex">
          {initials(user.nama)}
        </span>
        <div className="min-w-0 text-right">
          <p className="truncate text-small font-semibold text-ink">{user.nama}</p>
          <p className="text-micro text-muted">{ROLE_LABEL[user.role]}</p>
        </div>
        <span className="hidden h-8 w-px bg-line sm:block" />
        <button
          type="button"
          onClick={onLogout}
          className="flex min-h-11 items-center gap-2 rounded-control border border-line bg-white px-3 text-small font-semibold text-ink transition-colors hover:border-brand-300 hover:bg-brand-50"
        >
          <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
          <span className="hidden sm:inline">Keluar</span>
          <span className="sr-only sm:hidden">Keluar</span>
        </button>
      </div>
    </header>
  );
}
