import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../../components/Layout';
import { api } from '../../lib/api';

type Warehouse = { id: string; code: string; name: string; status: string; address: { city: string; country: string }; zones: { code: string; type: string }[] };

export default function AdminWarehousesPage() {
  const router = useRouter();
  const [list, setList] = useState<Warehouse[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    api<Warehouse[]>('/warehouses').then(setList).catch(() => setList([]));
  }, [router]);

  return (
    <Layout nav="admin" title="Warehouses">
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Code</th>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Location</th>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Zones</th>
            </tr>
          </thead>
          <tbody>
            {list.map((w) => (
              <tr key={w.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.75rem' }}>{w.code}</td>
                <td style={{ padding: '0.75rem' }}>{w.name}</td>
                <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{w.address?.city}, {w.address?.country}</td>
                <td style={{ padding: '0.75rem' }}>{w.status}</td>
                <td style={{ padding: '0.75rem' }}>{w.zones?.map((z) => z.code).join(', ') || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {list.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No warehouses.</p>}
    </Layout>
  );
}
