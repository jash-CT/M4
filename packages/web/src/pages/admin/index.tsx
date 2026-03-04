import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../../components/Layout';
import { api } from '../../lib/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<unknown[]>([]);
  const [carriers, setCarriers] = useState<unknown[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    Promise.all([
      api<unknown[]>('/warehouses').catch(() => []),
      api<unknown[]>('/carriers').catch(() => []),
    ]).then(([w, c]) => {
      setWarehouses(Array.isArray(w) ? w : []);
      setCarriers(Array.isArray(c) ? c : []);
    });
  }, [router]);

  return (
    <Layout nav="admin" title="Admin Dashboard">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{warehouses.length}</div>
          <div style={{ color: 'var(--text-muted)' }}>Warehouses</div>
        </div>
        <div style={{ padding: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{carriers.length}</div>
          <div style={{ color: 'var(--text-muted)' }}>Carriers</div>
        </div>
      </div>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Quick links</h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        <li style={{ marginBottom: '0.5rem' }}><a href="/admin/warehouses">Warehouses</a> — View and manage warehouses</li>
        <li style={{ marginBottom: '0.5rem' }}><a href="/admin/carriers">Carriers</a> — Carrier integrations and rates</li>
        <li style={{ marginBottom: '0.5rem' }}><a href="/admin/routes">Routes</a> — Route optimization and planning</li>
      </ul>
    </Layout>
  );
}
