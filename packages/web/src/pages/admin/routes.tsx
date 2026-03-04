import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../../components/Layout';
import { api } from '../../lib/api';

type Route = { id: string; status: string; totalDistanceKm: number; totalDurationMinutes: number; estimatedStart: string; estimatedEnd: string };

export default function AdminRoutesPage() {
  const router = useRouter();
  const [list, setList] = useState<Route[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    api<Route[]>('/routes').then(setList).catch(() => setList([]));
  }, [router]);

  return (
    <Layout nav="admin" title="Routes">
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>ID</th>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Distance (km)</th>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Duration (min)</th>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Start</th>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>End</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.75rem' }}>{r.id.slice(0, 8)}…</td>
                <td style={{ padding: '0.75rem' }}>{r.status}</td>
                <td style={{ padding: '0.75rem' }}>{r.totalDistanceKm}</td>
                <td style={{ padding: '0.75rem' }}>{r.totalDurationMinutes}</td>
                <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{r.estimatedStart ? new Date(r.estimatedStart).toLocaleString() : '—'}</td>
                <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{r.estimatedEnd ? new Date(r.estimatedEnd).toLocaleString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {list.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No routes. Use the API to optimize and create routes.</p>}
    </Layout>
  );
}
