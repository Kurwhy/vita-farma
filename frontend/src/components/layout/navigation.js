import {
  ClipboardList,
  LayoutDashboard,
  PackageSearch,
  Pill,
  ReceiptText,
  ScanBarcode,
  Users,
} from 'lucide-react';

export const NAV_GROUPS = [
  {
    label: 'Ringkasan',
    items: [
      {
        to: '/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        roles: ['admin', 'apoteker', 'kasir'],
      },
    ],
  },
  {
    label: 'Operasional',
    items: [
      { to: '/kasir', label: 'Kasir Penjualan', icon: ScanBarcode, roles: ['admin', 'kasir'] },
      {
        to: '/transaksi',
        label: 'Transaksi',
        icon: ReceiptText,
        roles: ['admin', 'apoteker', 'kasir'],
      },
    ],
  },
  {
    label: 'Inventori dan resep',
    items: [
      { to: '/stok', label: 'Stok', icon: PackageSearch, roles: ['admin', 'apoteker', 'kasir'] },
      { to: '/obat', label: 'Obat', icon: Pill, roles: ['admin', 'apoteker'] },
      { to: '/resep', label: 'Resep', icon: ClipboardList, roles: ['admin', 'apoteker'] },
    ],
  },
  {
    label: 'Administrasi',
    items: [{ to: '/pengguna', label: 'Pengguna', icon: Users, roles: ['admin'] }],
  },
];

export function navigationForRole(role) {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(role)),
  })).filter((group) => group.items.length > 0);
}
