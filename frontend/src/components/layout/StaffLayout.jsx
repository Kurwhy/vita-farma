import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DesktopSidebar, MobileSidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function StaffLayout() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuTriggerRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuTriggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
    menuTriggerRef.current?.focus();
  };

  return (
    <div className="flex min-h-screen bg-surface">
      <DesktopSidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          user={user}
          onMenu={() => setMenuOpen(true)}
          onLogout={logout}
          triggerRef={menuTriggerRef}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
          <div className="mx-auto w-full max-w-[1240px]">
            <Outlet />
          </div>
        </main>
      </div>
      <MobileSidebar open={menuOpen} user={user} onClose={closeMenu} />
    </div>
  );
}
