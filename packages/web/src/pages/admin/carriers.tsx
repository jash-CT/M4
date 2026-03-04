import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../../components/Layout';
import { api } from '../../lib/api';

type Carrier = { id: string; code: string; name: string; type: string; integrationId: string; isActive: boolean };

export default function AdminCarriersPage() {
  const router = useRouter();
  const [list, setList] = useState<Carrier[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    api<Carrier[]>('/carriers').then(setList).catch(() => setList([]));
  }, [router]);

  return (
    <Layout nav="admin" title="Carriers">
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Code</th>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Type</th>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Integration</th>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Active</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.75rem' }}>{c.code}</td>
                <td style={{ padding: '0.75rem' }}>{c.name}</td>
                <td style={{ padding: '0.75rem' }}>{c.type}</td>
                <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{c.integrationId}</td>
                <td style={{ padding: '0.75rem' }}>{c.isActive ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {list.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No carriers.</p>}
    </Layout>
  );
}
