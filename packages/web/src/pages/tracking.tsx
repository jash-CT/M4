import { useState } from 'react';
import { Layout } from '../components/Layout';
import { getTracking } from '../lib/api';

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [data, setData] = useState<Awaited<ReturnType<typeof getTracking>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setData(null);
    if (!trackingNumber.trim()) return;
    setLoading(true);
    try {
      const res = await getTracking(trackingNumber.trim());
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tracking');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout title="Track Shipment">
      <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', maxWidth: 480 }}>
        <input
          type="text"
          placeholder="Enter tracking number"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            color: 'var(--text)',
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          {loading ? 'Loading…' : 'Track'}
        </button>
      </form>
      {error && <p style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</p>}
      {data && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem' }}>
          <p style={{ marginTop: 0, color: 'var(--text-muted)' }}>
            <strong>Tracking:</strong> {data.trackingNumber} — Status: <strong style={{ color: 'var(--accent)' }}>{data.status}</strong>
          </p>
          {data.estimatedDelivery && <p style={{ color: 'var(--text-muted)' }}>Estimated delivery: {new Date(data.estimatedDelivery).toLocaleDateString()}</p>}
          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Events</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {data.events.map((ev, i) => (
              <li
                key={i}
                style={{
                  padding: '0.75rem',
                  borderLeft: '3px solid var(--border)',
                  marginBottom: '0.5rem',
                  paddingLeft: '1rem',
                  background: 'var(--bg)',
                  borderRadius: 4,
                }}
              >
                <div>{ev.description}</div>
                {ev.location && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{ev.location}</div>}
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(ev.occurredAt).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Layout>
  );
}
