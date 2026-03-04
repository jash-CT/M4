import React from 'react';
import Link from 'next/link';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  nav?: 'vendor' | 'admin' | 'public';
}

export function Layout({ children, title, nav = 'public' }: LayoutProps) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          borderBottom: '1px solid var(--border)',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--surface)',
        }}
      >
        <Link href="/" style={{ fontWeight: 700, fontSize: '1.25rem', color: 'inherit', textDecoration: 'none' }}>
          Logistics Platform
        </Link>
        <nav style={{ display: 'flex', gap: '1.5rem' }}>
          {nav === 'vendor' && (
            <>
              <Link href="/vendor">Dashboard</Link>
              <Link href="/vendor/orders">Receiving Orders</Link>
              <a href="#" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('vendor'); window.location.href = '/'; }}>Sign out</a>
            </>
          )}
          {nav === 'admin' && (
            <>
              <Link href="/admin">Dashboard</Link>
              <Link href="/admin/warehouses">Warehouses</Link>
              <Link href="/admin/carriers">Carriers</Link>
              <Link href="/admin/routes">Routes</Link>
              <a href="#" onClick={() => { localStorage.removeItem('token'); window.location.href = '/'; }}>Sign out</a>
            </>
          )}
          {nav === 'public' && (
            <>
              <Link href="/tracking">Track Shipment</Link>
              <Link href="/login">Admin Login</Link>
              <Link href="/vendor/login">Vendor Portal</Link>
            </>
          )}
        </nav>
      </header>
      <main style={{ flex: 1, padding: '1.5rem', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        {title && <h1 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem' }}>{title}</h1>}
        {children}
      </main>
    </div>
  );
}
