import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineXMark } from 'react-icons/hi2';

const sizeMap = { sm: 420, md: 560, lg: 720, xl: 900 };

const Modal = ({ isOpen, onClose, title, children, size = 'md', footer }) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === overlayRef.current && onClose()}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
            background: 'rgba(0,0,0,0.65)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            style={{
              background: '#fff',
              border: '2px solid #000',
              borderRadius: '0.75rem',
              boxShadow: '8px 8px 0px #000',
              width: '100%',
              maxWidth: sizeMap[size],
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1.125rem 1.5rem',
              borderBottom: '2px solid #000',
              background: '#ffe17c',
            }}>
              <h3 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '1.0625rem', fontWeight: 800, color: '#000', letterSpacing: '-0.02em' }}>
                {title}
              </h3>
              <button
                onClick={onClose}
                style={{
                  width: 34, height: 34, background: '#000', border: '2px solid #000',
                  borderRadius: '0.5rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '2px 2px 0px #000',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(1px,1px)'; e.currentTarget.style.boxShadow = '1px 1px 0px #000'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = '2px 2px 0px #000'; }}
              >
                <HiOutlineXMark style={{ color: '#ffe17c', fontSize: '1rem' }} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div style={{
                display: 'flex', justifyContent: 'flex-end', gap: '0.75rem',
                padding: '1rem 1.5rem',
                borderTop: '2px solid #000',
                background: '#f9f9f9',
              }}>
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
