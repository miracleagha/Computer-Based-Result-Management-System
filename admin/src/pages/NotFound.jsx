import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineHome } from 'react-icons/hi2';

const NotFound = () => (
  <div style={{
    minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    textAlign: 'center', padding: '2rem',
  }}>
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55 }}
    >
      <div style={{
        display: 'inline-block', padding: '1.5rem 3rem',
        background: '#ffe17c', border: '2px solid #000', borderRadius: '1rem',
        boxShadow: '8px 8px 0px #000', marginBottom: '2rem',
      }}>
        <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '7rem', fontWeight: 800, color: '#000', lineHeight: 1, letterSpacing: '-0.05em' }}>
          404
        </div>
      </div>
      <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '1.625rem', fontWeight: 800, color: '#000', marginBottom: '0.75rem', letterSpacing: '-0.03em' }}>
        Page Not Found
      </h2>
      <p style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, color: '#555', fontSize: '1rem', marginBottom: '2rem', maxWidth: 380, margin: '0 auto 2rem' }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <HiOutlineHome size={18} />
        Back to Dashboard
      </Link>
    </motion.div>
  </div>
);

export default NotFound;
