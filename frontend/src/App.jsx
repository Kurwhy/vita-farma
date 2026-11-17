import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { StaffLayout } from './components/layout/StaffLayout';
import { RequireAuth, RequireRole } from './components/layout/guards';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const KasirPage = lazy(() => import('./pages/KasirPage'));
const StokPage = lazy(() => import('./pages/StokPage'));
const ObatListPage = lazy(() => import('./pages/ObatListPage'));
const ObatDetailPage = lazy(() => import('./pages/ObatDetailPage'));
const ResepListPage = lazy(() => import('./pages/ResepListPage'));
const ResepBaruPage = lazy(() => import('./pages/ResepBaruPage'));
const ResepDetailPage = lazy(() => import('./pages/ResepDetailPage'));
const TransaksiListPage = lazy(() => import('./pages/TransaksiListPage'));
const TransaksiDetailPage = lazy(() => import('./pages/TransaksiDetailPage'));
const PenggunaPage = lazy(() => import('./pages/PenggunaPage'));

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface" role="status">
      <span className="flex items-center gap-2 text-small text-muted">
        <Loader2 className="h-5 w-5 animate-spin text-brand-700" aria-hidden="true" />
        Memuat halaman
      </span>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<RequireAuth />}>
          <Route element={<StaffLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />

            <Route element={<RequireRole roles={['admin', 'kasir']} />}>
              <Route path="/kasir" element={<KasirPage />} />
            </Route>

            <Route path="/stok" element={<StokPage />} />

            <Route element={<RequireRole roles={['admin', 'apoteker']} />}>
              <Route path="/obat" element={<ObatListPage />} />
              <Route path="/obat/:id" element={<ObatDetailPage />} />
              <Route path="/resep" element={<ResepListPage />} />
              <Route path="/resep/baru" element={<ResepBaruPage />} />
              <Route path="/resep/:id" element={<ResepDetailPage />} />
            </Route>

            <Route path="/transaksi" element={<TransaksiListPage />} />
            <Route path="/transaksi/:id" element={<TransaksiDetailPage />} />

            <Route element={<RequireRole roles={['admin']} />}>
              <Route path="/pengguna" element={<PenggunaPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
