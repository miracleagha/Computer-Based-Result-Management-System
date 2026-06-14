import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineBell,
  HiOutlineArrowRightOnRectangle,
  HiOutlineMagnifyingGlass,
  HiOutlineUser,
} from 'react-icons/hi2';

const Header = () => {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header style={{
      height: 72,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      background: '#ffe17c',
      borderBottom: '2px solid #000',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.625rem',
        background: '#fff', border: '2px solid #000', borderRadius: '0.625rem',
        padding: '0.5rem 1rem', width: 300,
        boxShadow: '3px 3px 0px #000',
        transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }}
        onFocus={(e) => { e.currentTarget.style.transform = 'translate(-1px,-1px)'; e.currentTarget.style.boxShadow = '4px 4px 0px #000'; }}
        onBlur={(e) => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = '3px 3px 0px #000'; }}
      >
        <HiOutlineMagnifyingGlass style={{ color: '#000', fontSize: '1.125rem', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search anything..."
          style={{
            border: 'none', outline: 'none', background: 'transparent',
            fontFamily: "'Satoshi', sans-serif", fontSize: '0.875rem',
            fontWeight: 500, color: '#000', width: '100%',
          }}
        />
        <kbd style={{
          background: '#ffe17c', border: '2px solid #000', borderRadius: '0.25rem',
          padding: '0.125rem 0.375rem', fontFamily: "'Cabinet Grotesk', sans-serif",
          fontSize: '0.625rem', fontWeight: 800, color: '#000', whiteSpace: 'nowrap',
        }}>⌘K</kbd>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>

        {/* Notifications */}
        <button style={{
          width: 40, height: 40, borderRadius: '0.5rem',
          border: '2px solid #000', background: '#fff',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#000', position: 'relative',
          boxShadow: '2px 2px 0px #000',
          transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translate(1px,1px)'; e.currentTarget.style.boxShadow = '1px 1px 0px #000'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = '2px 2px 0px #000'; }}
        >
          <HiOutlineBell size={18} />
          <span style={{
            position: 'absolute', top: 6, right: 6, width: 8, height: 8,
            borderRadius: '50%', background: '#dc2626', border: '2px solid #ffe17c',
          }} />
        </button>

        {/* Divider */}
        <div style={{ width: 2, height: 32, background: '#000', margin: '0 0.25rem' }} />

        {/* Profile Dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              padding: '0.375rem 0.75rem',
              border: '2px solid #000', borderRadius: '0.5rem',
              background: profileOpen ? '#000' : '#fff',
              cursor: 'pointer',
              boxShadow: '2px 2px 0px #000',
              transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}
            onMouseEnter={e => {
              if (!profileOpen) {
                e.currentTarget.style.transform = 'translate(1px,1px)';
                e.currentTarget.style.boxShadow = '1px 1px 0px #000';
              }
            }}
            onMouseLeave={e => {
              if (!profileOpen) {
                e.currentTarget.style.transform = 'translate(0,0)';
                e.currentTarget.style.boxShadow = '2px 2px 0px #000';
              }
            }}
          >
            {/* Avatar */}
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: profileOpen ? '#ffe17c' : '#171e19',
              border: '2px solid #000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Cabinet Grotesk', sans-serif",
              color: profileOpen ? '#000' : '#fff',
              fontSize: '0.75rem', fontWeight: 800,
            }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{
                fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '0.8125rem',
                fontWeight: 800, color: profileOpen ? '#fff' : '#000', lineHeight: 1.2,
              }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{
                fontFamily: "'Satoshi', sans-serif", fontSize: '0.6875rem',
                fontWeight: 500, color: profileOpen ? '#b7c6c2' : '#666',
                textTransform: 'capitalize',
              }}>
                {user?.role}
              </div>
            </div>
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 0.5rem)',
                  width: 200, background: '#fff',
                  border: '2px solid #000', borderRadius: '0.75rem',
                  boxShadow: '4px 4px 0px #000', overflow: 'hidden', zIndex: 50,
                }}
              >
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                  <div style={{ fontFamily: "'Satoshi', sans-serif", fontSize: '0.8125rem', fontWeight: 500, color: '#555' }}>
                    Signed in as
                  </div>
                  <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '0.875rem', fontWeight: 800, color: '#000', marginTop: 2 }}>
                    {user?.email}
                  </div>
                </div>
                <button
                  onClick={logout}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem 1rem', border: 'none', background: 'transparent',
                    cursor: 'pointer', color: '#dc2626',
                    fontFamily: "'Satoshi', sans-serif", fontSize: '0.875rem', fontWeight: 700,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <HiOutlineArrowRightOnRectangle size={16} />
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;
