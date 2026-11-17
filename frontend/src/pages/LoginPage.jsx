import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2, LogIn } from 'lucide-react';
import logoMark from '../images/logo-mark.png';
import { useAuth } from '../context/AuthContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { Input } from '../components/ui/Inputs';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export default function LoginPage() {
  usePageMeta('Masuk');
  const { user, ready, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-brand-900" role="status">
        <span className="flex items-center gap-2 text-small text-brand-100">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          Memeriksa sesi
        </span>
      </main>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.email.trim()) {
      nextErrors.email = 'Email wajib diisi.';
    } else if (!EMAIL_PATTERN.test(form.email.trim())) {
      nextErrors.email = 'Format email tidak valid.';
    }
    if (!form.password) {
      nextErrors.password = 'Kata sandi wajib diisi.';
    } else if (form.password.length < 8) {
      nextErrors.password = 'Kata sandi minimal 8 karakter.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    setFormError('');
    const result = await login(form.email.trim(), form.password);
    setLoading(false);
    if (!result.ok) {
      setFormError(result.message);
      return;
    }
    navigate('/dashboard', { replace: true });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-brand-900 px-4 py-10">
      <div className="mb-7 flex items-center gap-3.5">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-card bg-white p-2 shadow-[0_10px_30px_rgba(4,47,46,0.35)]">
          <img src={logoMark} alt="" width="512" height="512" className="h-full w-full object-contain" />
        </span>
        <div>
          <p className="text-[32px] font-bold leading-none tracking-[-0.035em] text-white">
            Vitafarma
          </p>
          <p className="mt-2 text-small text-brand-200">Sistem kasir dan stok apotek</p>
        </div>
      </div>

      <div className="w-full max-w-[460px] overflow-hidden rounded-modal border border-brand-700/70 bg-white shadow-[0_28px_80px_rgba(4,47,46,0.45)]">
        <div className="px-6 pb-6 pt-7 sm:px-8">
          <h1 className="text-title">Masuk</h1>
          <p className="mt-1 text-small text-muted">
            Gunakan akun staf apotek untuk membuka dashboard.
          </p>

          {formError ? (
            <div
              role="alert"
              className="mt-5 flex items-start gap-2.5 rounded-control border border-red-200 bg-red-50 px-3.5 py-3 text-small text-danger"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{formError}</span>
            </div>
          ) : null}

          <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
            <Field label="Email" htmlFor="email" required error={errors.email}>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="nama@vitafarma.test"
                value={form.email}
                onChange={update('email')}
                invalid={Boolean(errors.email)}
                disabled={loading}
              />
            </Field>

            <Field label="Kata sandi" htmlFor="password" required error={errors.password}>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Minimal 8 karakter"
                value={form.password}
                onChange={update('password')}
                invalid={Boolean(errors.password)}
                disabled={loading}
              />
            </Field>

            <Button type="submit" className="w-full" loading={loading}>
              {!loading ? <LogIn className="h-[18px] w-[18px]" aria-hidden="true" /> : null}
              {loading ? 'Memeriksa akun' : 'Masuk'}
            </Button>
          </form>
        </div>

      </div>

      <p className="mt-6 text-micro font-medium text-brand-300">Hanya untuk staf apotek.</p>
    </main>
  );
}
