import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../../components/Layout';
import { api } from '../../lib/api';

export default function VendorDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<{ name: string; code: string; status: string } | null>(null);
  const [orders, setOrders] = useState<Array<{ id: string; status: string; warehouse: { name: string }; expectedAt?: string }>>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const vendor = localStorage.getItem('vendor');
    if (!token || !vendor) {
      router.replace('/vendor/login');
      return;
    }
    const v = JSON.parse(vendor) as { id: string };
    Promise.all([
      api<{ name: string; code: string; status: string }>('/vendor/profile').catch(() => null),
      api<typeof orders>('/vendor/receiving-orders').catch(() => []),
    ]).then(([p, o]) => {
      if (p) setProfile(p);
      if (Array.isArray(o)) setOrders(o);
    });
  }, [router]);

  return (
    <Layout nav="vendor" title="Vendor Dashboard">
      {profile && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <strong>{profile.name}</strong> ({profile.code}) — {profile.status}
        </div>
      )}
      <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Recent Receiving Orders</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Order ID</th>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Warehouse</th>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Expected</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 10).map((o) => (
              <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.75rem' }}>{o.id.slice(0, 8)}…</td>
                <td style={{ padding: '0.75rem' }}>{o.warehouse?.name ?? '—'}</td>
                <td style={{ padding: '0.75rem' }}>{o.status}</td>
                <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{o.expectedAt ? new Date(o.expectedAt).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {orders.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No receiving orders yet.</p>}
    </Layout>
  );
}
