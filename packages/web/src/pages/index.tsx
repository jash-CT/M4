import Link from 'next/link';
import { Layout } from '../components/Layout';

export default function Home() {
  return (
    <Layout>
      <section style={{ textAlign: 'center', padding: '3rem 0' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Logistics & Supply Chain Platform</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: 560, margin: '0 auto 2rem' }}>
          Warehouse management, carrier integrations, route optimization, customs and compliance, real-time tracking, and vendor portals.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/tracking"
            style={{
              padding: '0.75rem 1.5rem',
              background: 'var(--accent)',
              color: 'white',
              borderRadius: 8,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Track Shipment
          </Link>
          <Link
            href="/vendor/login"
            style={{
              padding: '0.75rem 1.5rem',
              background: 'var(--surface)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Vendor Portal
          </Link>
          <Link
            href="/login"
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Admin Login
          </Link>
        </div>
      </section>
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginTop: '3rem' }}>
        {[
          { title: 'Warehouse Management', desc: 'Inventory, zones, receiving and shipment orders' },
          { title: 'Carrier Integrations', desc: 'Rates, labels, and multi-carrier support' },
          { title: 'Route Optimization', desc: 'TSP-based routing and delivery windows' },
          { title: 'Customs & Compliance', desc: 'Declarations, documents, and rules engine' },
          { title: 'Real-time Tracking', desc: 'Live updates via WebSocket and carrier APIs' },
          { title: 'Vendor Portals', desc: 'Self-service receiving orders and documents' },
        ].map((card) => (
          <div
            key={card.title}
            style={{
              padding: '1.5rem',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 12,
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>{card.title}</h3>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>{card.desc}</p>
          </div>
        ))}
      </section>
    </Layout>
  );
}
