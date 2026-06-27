import { Link, useLocation } from 'react-router-dom';
import { HiOutlineChevronRight, HiOutlineHome } from 'react-icons/hi2';
import { motion } from 'framer-motion';

const routeLabels = {
  '':             'Dashboard',
  'institutions': 'Institutions',
  'users':        'Users',
  'audit-logs':   'Audit Logs',
  'settings':     'Settings',
};

const Breadcrumb = () => {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  return (
    <motion.nav
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.375rem',
        fontSize: '0.8125rem', marginBottom: '1.25rem',
        flexWrap: 'wrap',
      }}
    >
      <Link to="/"
        style={{ color: '#666', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
        onMouseEnter={e => e.currentTarget.style.color = '#000'}
        onMouseLeave={e => e.currentTarget.style.color = '#666'}
      >
        <HiOutlineHome size={14} />
      </Link>

      {segments.map((seg, idx) => {
        const path  = '/' + segments.slice(0, idx + 1).join('/');
        const isLast = idx === segments.length - 1;
        const label = routeLabels[seg] || seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

        return (
          <span key={path} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <HiOutlineChevronRight size={11} style={{ color: '#999', flexShrink: 0 }} />
            {isLast ? (
              <span style={{
                fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 800,
                color: '#000', fontSize: '0.8125rem',
                background: '#ffe17c', border: '2px solid #000',
                borderRadius: '0.375rem', padding: '0.125rem 0.5rem',
                boxShadow: '2px 2px 0px #000',
              }}>
                {label}
              </span>
            ) : (
              <Link to={path}
                style={{
                  fontFamily: "'Satoshi',sans-serif", fontWeight: 600,
                  color: '#666', textDecoration: 'none', transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#000'}
                onMouseLeave={e => e.currentTarget.style.color = '#666'}
              >
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </motion.nav>
  );
};

export default Breadcrumb;
