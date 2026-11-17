import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { navigationForRole } from './navigation';
import { cn } from '../../lib/cn';
import logoMark from '../../images/logo-mark.png';

function SidebarContent({ user, onNavigate, showClose, onClose }) {
  const groups = navigationForRole(user.role);

  return (
    <div className="flex h-full flex-col bg-brand-900 text-white">
      <div className="flex h-[84px] items-center gap-3 border-b border-white/10 px-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-white p-1.5">
          <img src={logoMark} alt="" width="512" height="512" className="h-full w-full object-contain" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[20px] font-bold leading-none tracking-[-0.03em] text-white">
            Vitafarma
          </p>
          <p className="mt-1.5 truncate text-[11px] font-medium text-brand-300">
            Sistem kasir dan stok apotek
          </p>
        </div>
        {showClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu"
            className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-control text-brand-200 hover:bg-brand-800 hover:text-white focus-visible:outline-white"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <nav className="flex-1 overflow-y-auto scroll-thin px-3 py-5" aria-label="Navigasi utama">
        {groups.map((group) => (
          <div key={group.label} className="mb-6">
            <p className="px-3 pb-2 text-[12px] font-semibold text-brand-300">{group.label}</p>
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        'group flex min-h-11 items-center gap-3 rounded-control px-3 text-small transition-colors duration-150 focus-visible:outline-white',
                        isActive
                          ? 'bg-brand-800 font-semibold text-white ring-1 ring-inset ring-white/10'
                          : 'font-medium text-brand-100 hover:bg-brand-800/70 hover:text-white',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          className={cn(
                            'h-[18px] w-[18px] shrink-0 transition-colors',
                            isActive ? 'text-brand-200' : 'text-brand-300 group-hover:text-brand-200',
                          )}
                          aria-hidden="true"
                        />
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}

export function DesktopSidebar({ user }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 lg:block">
      <SidebarContent user={user} />
    </aside>
  );
}

export function MobileSidebar({ open, user, onClose }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      panelRef.current?.querySelector('a[href], button:not([disabled])')?.focus();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <button
        type="button"
        aria-label="Tutup menu"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-ink/55"
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu navigasi"
        className="relative h-full w-[288px] max-w-[86vw] shadow-[0_0_50px_rgba(15,31,30,0.3)]"
      >
        <SidebarContent user={user} onNavigate={onClose} showClose onClose={onClose} />
      </aside>
    </div>
  );
}
