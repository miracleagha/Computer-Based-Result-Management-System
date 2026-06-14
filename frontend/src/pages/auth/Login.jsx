import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
  HiOutlineEye, HiOutlineEyeSlash, HiOutlineArrowLeft,
  HiOutlineBolt, HiOutlineEnvelope, HiOutlineLockClosed,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please enter email and password'); return; }
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.firstName}!`);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Login failed');
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
        <button onClick={() => navigate('/')} style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: '#fff', border: '2px solid #000', borderRadius: '0.5rem',
          padding: '0.5rem 1rem', fontFamily: "'Satoshi', sans-serif", fontWeight: 700,
          fontSize: '0.875rem', color: '#000', cursor: 'pointer', boxShadow: '3px 3px 0px #000',
          transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translate(1px,1px)'; e.currentTarget.style.boxShadow = '2px 2px 0px #000'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = '3px 3px 0px #000'; }}
        >
          <HiOutlineArrowLeft /> Back to Home
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ width: '100%', maxWidth: 440 }}
      >
        <div style={{ background: '#fff', border: '2px solid #000', borderRadius: '1rem', padding: '2.5rem', boxShadow: '8px 8px 0px #000' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: 56, height: 56, background: '#000', border: '2px solid #000', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '4px 4px 0px #000' }}>
              <HiOutlineBolt style={{ color: '#ffe17c', fontSize: '1.625rem' }} />
            </div>
            <h1 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '1.625rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#000', marginBottom: '0.375rem' }}>
              Welcome Back
            </h1>
            <p style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, color: '#666', fontSize: '0.875rem' }}>
              Sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: '1.125rem' }}>
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
                  autoComplete="email" autoFocus style={inputStyle('email')}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1.625rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000' }}>
                  Password
                </label>
                <Link to="/forgot-password" style={{ fontFamily: "'Satoshi', sans-serif", fontSize: '0.75rem', fontWeight: 700, color: '#000', textDecoration: 'underline' }}>
                  Forgot Password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#666', display: 'flex' }}>
                  <HiOutlineLockClosed style={{ width: 18, height: 18 }} />
                </div>
                <input type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                  autoComplete="current-password"
                  style={{ ...inputStyle('password'), paddingRight: '3rem' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 4, display: 'flex' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <HiOutlineEyeSlash style={{ width: 20, height: 20 }} /> : <HiOutlineEye style={{ width: 20, height: 20 }} />}
                </button>
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
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}
                />
              ) : 'Sign In'}
            </motion.button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
            <p style={{ fontFamily: "'Satoshi', sans-serif", fontSize: '0.875rem', fontWeight: 500, color: '#555' }}>
              Don&apos;t have an account?{' '}
              <Link to="/register" style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, color: '#000', textDecoration: 'none', borderBottom: '2px solid #000' }}>
                Register Institution
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
