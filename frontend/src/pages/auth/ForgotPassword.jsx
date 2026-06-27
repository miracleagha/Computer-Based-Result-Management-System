import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineEnvelope, HiOutlineArrowLeft, HiOutlineBolt } from 'react-icons/hi2';
import axios from '../../api/axios';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email'); return; }
    setLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem',
    border: `2px solid ${focusedField === field ? '#000' : '#ccc'}`,
    borderRadius: '0.625rem',
    fontFamily: "'Satoshi', sans-serif", fontSize: '0.9rem', fontWeight: 500,
    color: '#000', background: '#fff', outline: 'none',
    boxShadow: focusedField === field ? '4px 4px 0px #000' : '2px 2px 0px #ccc',
    transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    transform: focusedField === field ? 'translate(-1px,-1px)' : 'translate(0,0)',
  });

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#ffe17c', padding: '2rem', position: 'relative', overflow: 'hidden',
      backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)',
      backgroundSize: '32px 32px',
    }}>
      {/* Back link */}
      <div style={{ position: 'absolute', top: 24, left: 24 }}>
        <button onClick={() => navigate('/login')} style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: '#fff', border: '2px solid #000', borderRadius: '0.5rem',
          padding: '0.5rem 1rem', fontFamily: "'Satoshi', sans-serif", fontWeight: 700,
          fontSize: '0.875rem', color: '#000', cursor: 'pointer', boxShadow: '3px 3px 0px #000',
          transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translate(1px,1px)'; e.currentTarget.style.boxShadow = '2px 2px 0px #000'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = '3px 3px 0px #000'; }}
        >
          <HiOutlineArrowLeft /> Back to Login
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ background: '#fff', border: '2px solid #000', borderRadius: '1rem', padding: '2.5rem', boxShadow: '8px 8px 0px #000' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: 56, height: 56, background: '#000', border: '2px solid #000', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '4px 4px 0px #000' }}>
              <HiOutlineEnvelope style={{ color: '#ffe17c', fontSize: '1.625rem' }} />
            </div>
            <h1 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '1.625rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#000', marginBottom: '0.375rem' }}>
              Forgot Password
            </h1>
            <p style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, color: '#666', fontSize: '0.875rem' }}>
              Enter your email to receive a reset link
            </p>
          </div>

          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉️</div>
              <p style={{ fontFamily: "'Satoshi', sans-serif", color: '#333', marginBottom: '1.5rem', fontWeight: 500, lineHeight: 1.6 }}>
                If an account exists for <strong>{email}</strong>, you will receive a password reset link.
              </p>
              <Link to="/login" style={{
                width: '100%', padding: '0.875rem',
                background: '#000', color: '#fff',
                border: '2px solid #000', borderRadius: '0.75rem',
                fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '1rem', fontWeight: 800,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: '4px 4px 0px #000', textDecoration: 'none', transition: 'all 0.15s'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(1px,1px)'; e.currentTarget.style.boxShadow = '3px 3px 0px #000'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = '4px 4px 0px #000'; }}
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '0.5rem' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#666', display: 'flex' }}>
                    <HiOutlineEnvelope style={{ width: 18, height: 18 }} />
                  </div>
                  <input type="email" placeholder="your@email.com" value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                    autoFocus style={inputStyle('email')}
                  />
                </div>
              </div>

              <motion.button
                type="submit" disabled={loading}
                whileHover={!loading ? { x: 4, y: 4, boxShadow: '4px 4px 0px #000' } : {}}
                whileTap={!loading ? { x: 8, y: 8, boxShadow: '0px 0px 0px #000' } : {}}
                style={{
                  width: '100%', padding: '0.875rem',
                  background: loading ? '#555' : '#000', color: '#fff',
                  border: '2px solid #000', borderRadius: '0.75rem',
                  fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '1rem', fontWeight: 800,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  boxShadow: '8px 8px 0px #000', opacity: loading ? 0.75 : 1,
                  letterSpacing: '-0.01em',
                }}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </motion.button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
