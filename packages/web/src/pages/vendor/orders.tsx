import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../../components/Layout';
import { api } from '../../lib/api';

type Order = {
  id: string;
  status: string;
  warehouse: { name: string; code: string };
  expectedAt?: string;
  receivedAt?: string;
  lines: Array<{ sku: string; expectedQuantity: number; receivedQuantity: number; unit: string }>;
  createdAt: string;
};

export default function VendorOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/vendor/login');
      return;
    }
    const q = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : '';
    api<Order[]>(`/vendor/receiving-orders${q}`)
      .then(setOrders)
      .catch(() => setOrders([]));
  }, [router, statusFilter]);

  return (
    <Layout nav="vendor" title="Receiving Orders">
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <label style={{ color: 'var(--text-muted)' }}>Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '0.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }}
        >
          <option value="">All</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="receiving">Receiving</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Order</th>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Warehouse</th>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Expected</th>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Lines</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.75rem' }}>{o.id.slice(0, 8)}…</td>
                <td style={{ padding: '0.75rem' }}>{o.warehouse?.name ?? '—'}</td>
                <td style={{ padding: '0.75rem' }}>{o.status}</td>
                <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{o.expectedAt ? new Date(o.expectedAt).toLocaleDateString() : '—'}</td>
                <td style={{ padding: '0.75rem' }}>{o.lines?.length ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {orders.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No orders match the filter.</p>}
    </Layout>
  );
}
