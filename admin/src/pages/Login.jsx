import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  HiOutlineEye, HiOutlineEyeSlash, HiOutlineEnvelope,
  HiOutlineLockClosed, HiOutlineArrowRightOnRectangle, HiOutlineBolt,
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

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please enter email and password'); return; }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back, Admin!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: '#171e19',
      backgroundImage: 'radial-gradient(circle, rgba(183,198,194,0.08) 1px, transparent 1px)',
      backgroundSize: '32px 32px',
    }}>
      {/* Left panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '4rem', background: '#111611', borderRight: '2px solid #000',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Big decorative text */}
        <div style={{
          position: 'absolute', bottom: -20, right: -20,
          fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800,
          fontSize: '14rem', lineHeight: 1, color: 'rgba(255,225,124,0.04)',
          userSelect: 'none', letterSpacing: '-0.05em', pointerEvents: 'none',
        }}>
          ADM
        </div>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '3rem' }}>
          <div style={{ width: 48, height: 48, background: '#ffe17c', border: '2px solid #000', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '4px 4px 0px #000' }}>
            <HiOutlineBolt style={{ color: '#000', fontSize: '1.5rem' }} />
          </div>
          <div>
            <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: '1.125rem', color: '#fff', letterSpacing: '-0.02em' }}>Result Manager</div>
            <div style={{ fontFamily: "'Satoshi', sans-serif", fontSize: '0.75rem', fontWeight: 500, color: '#b7c6c2' }}>Super Admin Panel</div>
          </div>
        </div>

        <h1 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: 'clamp(2rem, 3.5vw, 3rem)', letterSpacing: '-0.04em', color: '#fff', lineHeight: 1.1, marginBottom: '1rem' }}>
          Control the<br />
          <span style={{ color: '#ffe17c' }}>Entire Platform</span>
        </h1>
        <p style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, color: '#b7c6c2', fontSize: '1rem', lineHeight: 1.65, maxWidth: 320, marginBottom: '2.5rem' }}>
          Manage all institutions, users, and activity across the student result management system.
        </p>

        {/* Feature list */}
        {['Approve & manage institutions', 'Monitor all system activity', 'Full user management', 'Audit logs & analytics'].map((f) => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: 24, height: 24, background: '#ffe17c', border: '2px solid #000', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '2px 2px 0px #000' }}>
              <span style={{ fontSize: '0.625rem', fontWeight: 800 }}>✓</span>
            </div>
            <span style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, color: '#b7c6c2', fontSize: '0.9375rem' }}>{f}</span>
          </div>
        ))}
      </div>

      {/* Right — Login form */}
      <div style={{ width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ width: '100%', maxWidth: 400 }}
        >
          {/* Card */}
          <div style={{ background: '#fff', border: '2px solid #000', borderRadius: '1rem', padding: '2.25rem', boxShadow: '8px 8px 0px #000' }}>

            <div style={{ marginBottom: '1.75rem' }}>
              <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: '1.625rem', letterSpacing: '-0.03em', color: '#000', marginBottom: '0.375rem' }}>
                Sign In
              </h2>
              <p style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, color: '#666', fontSize: '0.875rem' }}>
                Enter your admin credentials to continue
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.35 }}
                style={{ marginBottom: '1.125rem' }}
              >
                <label style={{ display: 'block', fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '0.5rem' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#666', display: 'flex' }}>
                    <HiOutlineEnvelope style={{ width: 18, height: 18 }} />
                  </div>
                  <input
                    type="email" placeholder="admin@resultmanager.com" value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                    autoComplete="email" autoFocus
                    style={{
                      width: '100%', paddingLeft: '2.75rem', paddingRight: '1rem',
                      paddingTop: '0.75rem', paddingBottom: '0.75rem',
                      border: `2px solid ${focusedField === 'email' ? '#000' : '#ccc'}`,
                      borderRadius: '0.625rem',
                      fontFamily: "'Satoshi', sans-serif", fontSize: '0.9rem', fontWeight: 500,
                      color: '#000', background: '#fff', outline: 'none',
                      boxShadow: focusedField === 'email' ? '4px 4px 0px #000' : '2px 2px 0px #ccc',
                      transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      transform: focusedField === 'email' ? 'translate(-1px,-1px)' : 'translate(0,0)',
                    }}
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25, duration: 0.35 }}
                style={{ marginBottom: '1.5rem' }}
              >
                <label style={{ display: 'block', fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '0.5rem' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#666', display: 'flex' }}>
                    <HiOutlineLockClosed style={{ width: 18, height: 18 }} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'} placeholder="Enter your password"
                    value={password} onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                    autoComplete="current-password"
                    style={{
                      width: '100%', paddingLeft: '2.75rem', paddingRight: '3rem',
                      paddingTop: '0.75rem', paddingBottom: '0.75rem',
                      border: `2px solid ${focusedField === 'password' ? '#000' : '#ccc'}`,
                      borderRadius: '0.625rem',
                      fontFamily: "'Satoshi', sans-serif", fontSize: '0.9rem', fontWeight: 500,
                      color: '#000', background: '#fff', outline: 'none',
                      boxShadow: focusedField === 'password' ? '4px 4px 0px #000' : '2px 2px 0px #ccc',
                      transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      transform: focusedField === 'password' ? 'translate(-1px,-1px)' : 'translate(0,0)',
                    }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 4, display: 'flex' }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <HiOutlineEyeSlash style={{ width: 20, height: 20 }} /> : <HiOutlineEye style={{ width: 20, height: 20 }} />}
                  </button>
                </div>
              </motion.div>

              {/* Submit */}
              <motion.button
                type="submit" disabled={loading}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.35 }}
                whileHover={!loading ? { x: 4, y: 4, boxShadow: '4px 4px 0px #000' } : {}}
                whileTap={!loading ? { x: 8, y: 8, boxShadow: '0px 0px 0px #000' } : {}}
                style={{
                  width: '100%', padding: '0.875rem 1.5rem',
                  border: '2px solid #000', borderRadius: '0.75rem',
                  background: loading ? '#555' : '#000',
                  color: '#fff',
                  fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '1rem', fontWeight: 800,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  boxShadow: '8px 8px 0px #000',
                  opacity: loading ? 0.75 : 1,
                  letterSpacing: '-0.01em',
                }}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}
                  />
                ) : (
                  <><HiOutlineArrowRightOnRectangle style={{ fontSize: '1.15rem' }} /> Sign In to Admin</>
                )}
              </motion.button>
            </form>

            {/* Default creds hint */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.4 }}
              style={{ marginTop: '1.25rem', padding: '0.875rem', background: '#ffe17c', border: '2px solid #000', borderRadius: '0.5rem', boxShadow: '3px 3px 0px #000' }}
            >
              <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#000', marginBottom: '0.25rem' }}>
                Default Credentials
              </p>
              <p style={{ fontFamily: 'monospace', fontSize: '0.8125rem', fontWeight: 500, color: '#333' }}>
                admin@resultmanager.com<br />Admin@123456
              </p>
            </motion.div>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontFamily: "'Satoshi', sans-serif", fontSize: '0.75rem', fontWeight: 500, color: '#475569' }}>
            © {new Date().getFullYear()} Student Result Manager
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
