import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, ClipboardList, FlaskConical, Pill, Plus, Stethoscope, Trash2, UserRound } from 'lucide-react';
import { PageHeader, Panel, PanelHeader } from '../components/ui/PageHeader';
import { LoadingState, ErrorState } from '../components/ui/States';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { Input, Select } from '../components/ui/Inputs';
import { useToast } from '../components/ui/Toast';
import { useSemuaObat } from '../hooks/useData';
import { useCreateResep } from '../hooks/useMutations';
import { usePageMeta } from '../hooks/usePageMeta';
import { formatRupiah, parseInteger } from '../lib/format';

const secondaryLink =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-control border border-line bg-white px-4 text-small font-semibold text-ink hover:border-brand-300 hover:bg-brand-50';

const makeItem = (key) => ({ key, obat_id: '', jumlah: '1', aturan_pakai: '' });

export default function ResepBaruPage() {
  usePageMeta('Catat resep baru');
  const navigate = useNavigate();
  const { notify } = useToast();
  const createResep = useCreateResep();
  const jadiQuery = useSemuaObat('jadi');
  const bahanQuery = useSemuaObat('bahan_racikan');
  const isLoading = jadiQuery.isLoading || bahanQuery.isLoading;
  const isError = jadiQuery.isError || bahanQuery.isError;
  const error = jadiQuery.error || bahanQuery.error;
  const refetch = () => {
    jadiQuery.refetch();
    bahanQuery.refetch();
  };

  const keyRef = useRef(2);
  const [form, setForm] = useState({
    nama_pasien: '',
    nomor_rm: '',
    nama_dokter: '',
    nomor_sip: '',
    jenis: 'jadi',
    nama_racikan: '',
    aturan_pakai: '',
    items: [makeItem(1)],
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const pilihanObat =
    (form.jenis === 'racikan' ? bahanQuery.data : jadiQuery.data) ?? [];
  const saving = createResep.isPending;

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError('');
  };

  const gantiJenis = (jenis) => {
    if (jenis === form.jenis) return;
    setForm((current) => ({
      ...current,
      jenis,
      nama_racikan: '',
      aturan_pakai: '',
      items: [makeItem(keyRef.current++)],
    }));
    setErrors({});
    setFormError('');
  };

  const updateItem = (index, field, value) => {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
    setErrors((current) => {
      if (!current.items) return current;
      const nextItems = [...current.items];
      nextItems[index] = { ...nextItems[index], [field]: undefined };
      return { ...current, items: nextItems };
    });
    setFormError('');
  };

  const tambahBaris = () => {
    setForm((current) => ({ ...current, items: [...current.items, makeItem(keyRef.current++)] }));
  };

  const hapusBaris = (index) => {
    setForm((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
    setErrors((current) => {
      if (!current.items) return current;
      return { ...current, items: current.items.filter((_, itemIndex) => itemIndex !== index) };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!form.nama_pasien.trim()) nextErrors.nama_pasien = 'Nama pasien wajib diisi.';
    else if (form.nama_pasien.trim().length > 100)
      nextErrors.nama_pasien = 'Nama pasien maksimal 100 karakter.';
    if (form.nomor_rm.trim().length > 30)
      nextErrors.nomor_rm = 'Nomor rekam medis maksimal 30 karakter.';
    if (!form.nama_dokter.trim()) nextErrors.nama_dokter = 'Nama dokter wajib diisi.';
    else if (form.nama_dokter.trim().length > 100)
      nextErrors.nama_dokter = 'Nama dokter maksimal 100 karakter.';
    if (form.nomor_sip.trim().length > 30)
      nextErrors.nomor_sip = 'Nomor SIP maksimal 30 karakter.';

    if (form.jenis === 'racikan') {
      if (!form.nama_racikan.trim()) nextErrors.nama_racikan = 'Nama racikan wajib diisi.';
      else if (form.nama_racikan.trim().length > 100)
        nextErrors.nama_racikan = 'Nama racikan maksimal 100 karakter.';
      if (!form.aturan_pakai.trim()) nextErrors.aturan_pakai = 'Aturan pakai racikan wajib diisi.';
    }

    const itemErrors = [];
    const seen = new Set();
    form.items.forEach((item, index) => {
      const row = {};
      if (!item.obat_id) {
        row.obat_id = 'Pilih obat atau bahan.';
      } else if (seen.has(item.obat_id)) {
        row.obat_id = 'Obat ini sudah ada di resep.';
      } else {
        seen.add(item.obat_id);
      }
      const jumlah = parseInteger(item.jumlah);
      if (item.jumlah === '') {
        row.jumlah = 'Jumlah wajib diisi.';
      } else if (jumlah === null || jumlah < 1) {
        row.jumlah = 'Jumlah minimal 1.';
      }
      if (item.aturan_pakai.trim().length > 255) {
        row.aturan_pakai = 'Aturan pakai maksimal 255 karakter.';
      }
      if (Object.keys(row).length) itemErrors[index] = row;
    });
    if (Object.keys(itemErrors).length) nextErrors.items = itemErrors;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setFormError('Beberapa isian belum valid. Periksa pesan pada kolom terkait.');
      return;
    }

    try {
      const result = await createResep.mutateAsync({
        nama_pasien: form.nama_pasien,
        nomor_rm: form.nomor_rm,
        nama_dokter: form.nama_dokter,
        nomor_sip: form.nomor_sip,
        jenis: form.jenis,
        nama_racikan: form.nama_racikan,
        aturan_pakai: form.aturan_pakai,
        items: form.items.map((item) => ({
          obat_id: Number(item.obat_id),
          jumlah: parseInteger(item.jumlah),
          aturan_pakai: form.jenis === 'jadi' ? item.aturan_pakai : null,
        })),
      });
      notify(`Resep ${result.resep.kode_resep} dicatat dengan status menunggu.`);
      navigate(`/resep/${result.resep.id}`, { replace: true });
    } catch (requestError) {
      setFormError(requestError.message || 'Resep tidak dapat disimpan.');
    }
  };

  if (isLoading) {
    return (
      <>
        <PageHeader title="Catat Resep Baru" description="Memuat daftar obat dan bahan." />
        <LoadingState rows={6} label="Memuat daftar obat" />
      </>
    );
  }

  if (isError) {
    return (
      <>
        <PageHeader title="Catat Resep Baru" />
        <ErrorState message={error?.message} onRetry={refetch} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Catat Resep Baru"
        description="Isi data pasien, dokter, jenis resep, dan daftar obat atau bahan."
      />

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel className="overflow-hidden">
            <PanelHeader
              icon={UserRound}
              title="Data pasien"
              description="Identitas pasien penerima resep."
            />
            <div className="space-y-4 p-5">
              <Field label="Nama pasien" htmlFor="nama_pasien" required error={errors.nama_pasien}>
                <Input
                  id="nama_pasien"
                  value={form.nama_pasien}
                  onChange={update('nama_pasien')}
                  invalid={Boolean(errors.nama_pasien)}
                  maxLength={100}
                  placeholder="Contoh: Bambang Hartono"
                />
              </Field>
              <Field label="Nomor rekam medis" htmlFor="nomor_rm" error={errors.nomor_rm} hint="Opsional, maksimal 30 karakter.">
                <Input
                  id="nomor_rm"
                  value={form.nomor_rm}
                  onChange={update('nomor_rm')}
                  invalid={Boolean(errors.nomor_rm)}
                  maxLength={30}
                  placeholder="RM-004521"
                  className="nums"
                />
              </Field>
            </div>
          </Panel>

          <Panel className="overflow-hidden">
            <PanelHeader
              icon={Stethoscope}
              title="Data dokter"
              description="Dokter penulis resep."
            />
            <div className="space-y-4 p-5">
              <Field label="Nama dokter" htmlFor="nama_dokter" required error={errors.nama_dokter}>
                <Input
                  id="nama_dokter"
                  value={form.nama_dokter}
                  onChange={update('nama_dokter')}
                  invalid={Boolean(errors.nama_dokter)}
                  maxLength={100}
                  placeholder="Contoh: dr. Anisa Rahayu"
                />
              </Field>
              <Field label="Nomor SIP dokter" htmlFor="nomor_sip" error={errors.nomor_sip} hint="Opsional, maksimal 30 karakter.">
                <Input
                  id="nomor_sip"
                  value={form.nomor_sip}
                  onChange={update('nomor_sip')}
                  invalid={Boolean(errors.nomor_sip)}
                  maxLength={30}
                  placeholder="SIP-446/0912/DU/2024"
                  className="nums"
                />
              </Field>
            </div>
          </Panel>
        </div>

        <Panel className="overflow-hidden">
          <PanelHeader
            icon={ClipboardList}
            title="Jenis resep"
            description="Pilih cara obat disiapkan untuk pasien."
          />
          <div className="p-5">
          <p id="jenis-label" className="sr-only">
            Jenis resep
          </p>
          <div role="radiogroup" aria-labelledby="jenis-label" className="grid gap-2 sm:grid-cols-2">
            {[
              { value: 'jadi', title: 'Resep jadi', desc: 'Obat jadi yang diserahkan sesuai resep.' },
              { value: 'racikan', title: 'Resep racikan', desc: 'Bahan racikan yang diracik untuk pasien.' },
            ].map((option) => {
              const active = form.jenis === option.value;
              return (
                <label
                  key={option.value}
                  className={`relative flex min-h-11 cursor-pointer flex-col rounded-card border p-4 pr-12 transition-colors focus-within:ring-2 focus-within:ring-brand-300 ${
                    active
                      ? 'border-brand-600 bg-brand-50'
                      : 'border-line bg-white hover:border-brand-300 hover:bg-surface'
                  }`}
                >
                  <input
                    type="radio"
                    name="jenis"
                    value={option.value}
                    checked={active}
                    onChange={() => gantiJenis(option.value)}
                    className="sr-only"
                  />
                  <span className="text-small font-semibold text-ink">{option.title}</span>
                  <span className="mt-0.5 text-small text-muted">{option.desc}</span>
                  {active ? (
                    <span className="absolute right-3.5 top-3.5 flex h-6 w-6 items-center justify-center rounded-full bg-brand-700 text-white">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  ) : null}
                </label>
              );
            })}
          </div>

          {form.jenis === 'racikan' ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Nama racikan" htmlFor="nama_racikan" required error={errors.nama_racikan}>
                <Input
                  id="nama_racikan"
                  value={form.nama_racikan}
                  onChange={update('nama_racikan')}
                  invalid={Boolean(errors.nama_racikan)}
                  maxLength={100}
                  placeholder="Contoh: Puyer Anak"
                />
              </Field>
              <Field
                label="Aturan pakai racikan"
                htmlFor="aturan_pakai"
                required
                error={errors.aturan_pakai}
              >
                <Input
                  id="aturan_pakai"
                  value={form.aturan_pakai}
                  onChange={update('aturan_pakai')}
                  invalid={Boolean(errors.aturan_pakai)}
                  maxLength={255}
                  placeholder="Contoh: 3 kali sehari 1 bungkus"
                />
              </Field>
            </div>
          ) : null}
          </div>
        </Panel>

        <Panel className="overflow-hidden">
          <PanelHeader
            icon={form.jenis === 'jadi' ? Pill : FlaskConical}
            title={form.jenis === 'jadi' ? 'Daftar obat' : 'Daftar bahan racikan'}
            description="Satu obat hanya boleh muncul satu kali dalam resep."
            actions={
              <Button variant="secondary" onClick={tambahBaris}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Tambah baris
              </Button>
            }
          />

          <div className="space-y-3 p-4">
            {form.items.map((item, index) => {
              const rowErrors = errors.items?.[index] || {};
              return (
                <div key={item.key} className="rounded-card border border-line bg-surface p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-micro font-semibold text-muted">Baris {index + 1}</p>
                    <button
                      type="button"
                      onClick={() => hapusBaris(index)}
                      disabled={form.items.length === 1}
                      aria-label={`Hapus baris ${index + 1}`}
                      className="flex h-11 w-11 items-center justify-center rounded-control text-muted transition-colors hover:bg-red-50 hover:text-danger disabled:pointer-events-none disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-12">
                    <div className={form.jenis === 'jadi' ? 'md:col-span-6' : 'md:col-span-10'}>
                      <Field
                        label={form.jenis === 'jadi' ? 'Obat' : 'Bahan'}
                        htmlFor={`item-obat-${index}`}
                        required
                        error={rowErrors.obat_id}
                      >
                        <Select
                          id={`item-obat-${index}`}
                          value={item.obat_id}
                          onChange={(event) => updateItem(index, 'obat_id', event.target.value)}
                          invalid={Boolean(rowErrors.obat_id)}
                        >
                          <option value="">Pilih {form.jenis === 'jadi' ? 'obat' : 'bahan'}</option>
                          {pilihanObat.map((obat) => (
                            <option key={obat.id} value={obat.id}>
                              {obat.kode_obat} · {obat.nama_obat} · {formatRupiah(obat.harga_jual)} / {obat.satuan}
                            </option>
                          ))}
                        </Select>
                      </Field>
                      {pilihanObat.length === 0 ? (
                        <p className="mt-1 text-small text-warning">
                          Belum ada {form.jenis === 'racikan' ? 'bahan racikan' : 'obat jadi'} yang tercatat.
                        </p>
                      ) : null}
                    </div>

                    <div className="md:col-span-2">
                      <Field label="Jumlah" htmlFor={`item-jumlah-${index}`} required error={rowErrors.jumlah}>
                        <Input
                          id={`item-jumlah-${index}`}
                          type="number"
                          inputMode="numeric"
                          min="1"
                          step="1"
                          value={item.jumlah}
                          onChange={(event) => updateItem(index, 'jumlah', event.target.value)}
                          invalid={Boolean(rowErrors.jumlah)}
                          className="nums"
                        />
                      </Field>
                    </div>

                    {form.jenis === 'jadi' ? (
                      <div className="md:col-span-4">
                        <Field
                          label="Aturan pakai"
                          htmlFor={`item-aturan-${index}`}
                          error={rowErrors.aturan_pakai}
                          hint="Opsional."
                        >
                          <Input
                            id={`item-aturan-${index}`}
                            value={item.aturan_pakai}
                            onChange={(event) => updateItem(index, 'aturan_pakai', event.target.value)}
                            invalid={Boolean(rowErrors.aturan_pakai)}
                            maxLength={255}
                            placeholder="3 kali sehari 1 tablet"
                          />
                        </Field>
                      </div>
                    ) : null}

                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel className="flex flex-col gap-3 border-brand-200 bg-brand-50/40 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {formError ? (
              <p className="text-small text-danger" role="alert">
                {formError}
              </p>
            ) : (
              <p className="text-small text-muted">Resep disimpan dengan status menunggu.</p>
            )}
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Link to="/resep" className={secondaryLink}>
              Batal
            </Link>
            <Button type="submit" loading={saving}>
              Simpan resep
            </Button>
          </div>
        </Panel>
      </form>
    </>
  );
}
