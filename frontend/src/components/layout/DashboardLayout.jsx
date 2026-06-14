import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import { motion } from 'framer-motion';

const DashboardLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#171e19',
        backgroundImage: 'radial-gradient(circle, rgba(183,198,194,0.08) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{
              width: 44, height: 44, margin: '0 auto 1rem',
              border: '3px solid #272727', borderTopColor: '#ffe17c', borderRadius: '50%',
            }}
          />
          <p style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700, color: '#b7c6c2', fontSize: '0.875rem' }}>
            Loading…
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f0' }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <motion.main
        initial={false}
        animate={{ marginLeft: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}
      >
        <Header />
        <div style={{ flex: 1, padding: '1.75rem 2rem', maxWidth: 1400, width: '100%', margin: '0 auto' }}>
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
};

export default DashboardLayout;
