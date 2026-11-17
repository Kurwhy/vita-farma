import { useEffect, useState } from 'react';
import { Ban, ShieldCheck, UserPlus, Users } from 'lucide-react';
import { PageHeader, Panel, PanelHeader } from '../components/ui/PageHeader';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Field } from '../components/ui/Field';
import { Input, Select } from '../components/ui/Inputs';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import { usePenggunaList } from '../hooks/useData';
import { useCreateUser, useDeactivateUser, useUpdateUserRole } from '../hooks/useMutations';
import { usePageMeta } from '../hooks/usePageMeta';
import { ROLE_LABEL } from '../lib/constants';
import { formatNumber, initials } from '../lib/format';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function UserFormModal({ open, onClose }) {
  const { notify } = useToast();
  const createUser = useCreateUser();
  const [form, setForm] = useState({ nama: '', email: '', password: '', role: 'kasir' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const saving = createUser.isPending;

  useEffect(() => {
    if (!open) return;
    setForm({ nama: '', email: '', password: '', role: 'kasir' });
    setErrors({});
    setFormError('');
  }, [open]);

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.nama.trim()) nextErrors.nama = 'Nama wajib diisi.';
    else if (form.nama.trim().length > 100) nextErrors.nama = 'Nama maksimal 100 karakter.';
    if (!form.email.trim()) nextErrors.email = 'Email wajib diisi.';
    else if (!EMAIL_PATTERN.test(form.email.trim())) nextErrors.email = 'Format email tidak valid.';
    if (!form.password) nextErrors.password = 'Kata sandi wajib diisi.';
    else if (form.password.length < 8) nextErrors.password = 'Kata sandi minimal 8 karakter.';
    if (!['admin', 'apoteker', 'kasir'].includes(form.role)) nextErrors.role = 'Peran wajib dipilih.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      await createUser.mutateAsync(form);
      notify(`Akun ${form.nama.trim()} ditambahkan.`);
      onClose();
    } catch (error) {
      const source = error.errors || {};
      const nextServerErrors = {};
      ['nama', 'email', 'password', 'role'].forEach((field) => {
        if (Array.isArray(source[field]) && source[field][0]) {
          nextServerErrors[field] = source[field][0];
        }
      });
      setErrors(nextServerErrors);
      setFormError(error.message || 'Akun tidak dapat disimpan.');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tambah akun staf"
      description="Akun baru langsung aktif dan dapat masuk."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button type="submit" form="pengguna-form" loading={saving}>
            Simpan akun
          </Button>
        </>
      }
    >
      <form id="pengguna-form" className="space-y-4" onSubmit={handleSubmit} noValidate>
        {formError ? (
          <p role="alert" className="text-small text-danger">
            {formError}
          </p>
        ) : null}
        <Field label="Nama" htmlFor="user_nama" required error={errors.nama}>
          <Input
            id="user_nama"
            value={form.nama}
            onChange={update('nama')}
            invalid={Boolean(errors.nama)}
            maxLength={100}
            placeholder="Nama lengkap staf"
          />
        </Field>
        <Field label="Email" htmlFor="user_email" required error={errors.email}>
          <Input
            id="user_email"
            type="email"
            value={form.email}
            onChange={update('email')}
            invalid={Boolean(errors.email)}
            placeholder="nama@vitafarma.test"
            autoComplete="off"
          />
        </Field>
        <Field
          label="Kata sandi"
          htmlFor="user_password"
          required
          error={errors.password}
          hint="Minimal 8 karakter."
        >
          <Input
            id="user_password"
            type="password"
            value={form.password}
            onChange={update('password')}
            invalid={Boolean(errors.password)}
            placeholder="Minimal 8 karakter"
            autoComplete="new-password"
          />
        </Field>
        <Field label="Peran" htmlFor="user_role" required error={errors.role}>
          <Select id="user_role" value={form.role} onChange={update('role')}>
            <option value="admin">Admin</option>
            <option value="apoteker">Apoteker</option>
            <option value="kasir">Kasir</option>
          </Select>
        </Field>
      </form>
    </Modal>
  );
}

function RoleModal({ target, onClose }) {
  const { notify } = useToast();
  const updateUserRole = useUpdateUserRole();
  const [role, setRole] = useState(target?.role || 'kasir');
  const saving = updateUserRole.isPending;

  useEffect(() => {
    if (target) setRole(target.role);
  }, [target]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await updateUserRole.mutateAsync({ id: target.id, role });
      notify(`Peran ${target.nama} diubah menjadi ${ROLE_LABEL[role]}.`);
      onClose();
    } catch (error) {
      notify(error.message || 'Peran tidak dapat diubah.', 'error');
    }
  };

  return (
    <Modal
      open={Boolean(target)}
      onClose={onClose}
      title="Ubah peran"
      description={target ? `${target.nama} · ${target.email}` : ''}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button type="submit" form="role-form" loading={saving}>
            Simpan peran
          </Button>
        </>
      }
    >
      <form id="role-form" onSubmit={handleSubmit}>
        <Field label="Peran" htmlFor="role_baru" required>
          <Select id="role_baru" value={role} onChange={(event) => setRole(event.target.value)}>
            <option value="admin">Admin</option>
            <option value="apoteker">Apoteker</option>
            <option value="kasir">Kasir</option>
          </Select>
        </Field>
      </form>
    </Modal>
  );
}

function DeactivateModal({ target, onClose }) {
  const { notify } = useToast();
  const deactivateUser = useDeactivateUser();
  const saving = deactivateUser.isPending;

  const handleConfirm = async () => {
    try {
      await deactivateUser.mutateAsync({ id: target.id });
      notify(`Akun ${target.nama} dinonaktifkan.`);
      onClose();
    } catch (error) {
      notify(error.message || 'Akun tidak dapat dinonaktifkan.', 'error');
    }
  };

  return (
    <Modal
      open={Boolean(target)}
      onClose={onClose}
      title="Nonaktifkan akun"
      description={target ? `${target.nama} · ${target.email}` : ''}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button variant="danger" onClick={handleConfirm} loading={saving}>
            Nonaktifkan
          </Button>
        </>
      }
    >
      <p className="text-small text-ink">
        Akun yang nonaktif tidak dapat masuk ke Vitafarma. Data transaksi dan resep yang sudah
        tercatat tetap tersimpan.
      </p>
    </Modal>
  );
}

export default function PenggunaPage() {
  usePageMeta('Pengguna');
  const { data, isLoading, isError, error, refetch } = usePenggunaList();
  const { user: currentUser } = useAuth();
  const [addOpen, setAddOpen] = useState(false);
  const [roleTarget, setRoleTarget] = useState(null);
  const [deactivateTarget, setDeactivateTarget] = useState(null);

  return (
    <>
      <PageHeader
        title="Kelola Pengguna"
        description="Daftar akun staf apotek, peran, dan status aktif."
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Tambah akun
          </Button>
        }
      />

      {isLoading ? (
        <LoadingState rows={5} label="Memuat daftar pengguna" />
      ) : isError ? (
        <ErrorState message={error?.message} onRetry={refetch} />
      ) : (
        <Panel className="overflow-hidden">
          <PanelHeader
            icon={Users}
            title="Akun staf"
            description="Akses masuk dan peran setiap staf apotek."
            actions={<Badge variant="neutral">{formatNumber(data.length)} akun</Badge>}
          />
          {data.length === 0 ? (
            <EmptyState
              title="Belum ada akun staf"
              description="Tambahkan akun agar staf dapat masuk ke Vitafarma."
              action={<Button onClick={() => setAddOpen(true)}>Tambah akun</Button>}
            />
          ) : (
            <Table minWidth="880px">
              <THead>
                <TR height="compact">
                  <TH>Nama</TH>
                  <TH>Email</TH>
                  <TH>Peran</TH>
                  <TH>Status</TH>
                  <TH align="right">Aksi</TH>
                </TR>
              </THead>
              <TBody>
                {data.map((user) => (
                  <TR key={user.id}>
                    <TD>
                      <span className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand-100 bg-brand-50 text-[11px] font-bold text-brand-800">
                          {initials(user.nama)}
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="font-medium text-ink">{user.nama}</span>
                          {currentUser.id === user.id ? <Badge variant="brand">Anda</Badge> : null}
                        </span>
                      </span>
                    </TD>
                    <TD className="text-muted">{user.email}</TD>
                    <TD>
                      <Badge variant={user.role === 'admin' ? 'brand' : 'neutral'}>
                        {ROLE_LABEL[user.role]}
                      </Badge>
                    </TD>
                    <TD>
                      {user.is_active ? (
                        <Badge variant="success">Aktif</Badge>
                      ) : (
                        <Badge variant="neutral">Nonaktif</Badge>
                      )}
                    </TD>
                    <TD align="right">
                      <span className="flex flex-wrap justify-end gap-2">
                        <Button variant="secondary" size="sm" onClick={() => setRoleTarget(user)}>
                          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                          Ubah peran
                          <span className="sr-only"> {user.nama}</span>
                        </Button>
                        <Button
                          variant="danger-outline"
                          size="sm"
                          onClick={() => setDeactivateTarget(user)}
                          disabled={!user.is_active}
                        >
                          <Ban className="h-4 w-4" aria-hidden="true" />
                          Nonaktifkan
                          <span className="sr-only"> {user.nama}</span>
                        </Button>
                      </span>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </Panel>
      )}

      <UserFormModal open={addOpen} onClose={() => setAddOpen(false)} />
      <RoleModal target={roleTarget} onClose={() => setRoleTarget(null)} />
      <DeactivateModal target={deactivateTarget} onClose={() => setDeactivateTarget(null)} />
    </>
  );
}
