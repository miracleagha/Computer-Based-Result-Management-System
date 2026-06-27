import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineBuildingLibrary, HiOutlineCheck, HiOutlineArrowLeft,
  HiOutlineArrowRight, HiOutlineEye, HiOutlineEyeSlash, HiOutlineBolt,
} from 'react-icons/hi2';
import axios from '../../api/axios';
import toast from 'react-hot-toast';

const steps = ['Institution Details', 'Admin Account', 'Confirmation'];

const RegisterInstitution = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [form, setForm] = useState({
    name: '', code: '', type: 'university', email: '', phone: '', address: '', website: '', motto: '',
    adminFirstName: '', adminLastName: '', adminEmail: '', adminPassword: '', confirmPassword: ''
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const canProceed = () => {
    if (currentStep === 0) return form.name && form.code && form.type && form.email;
    if (currentStep === 1) return form.adminFirstName && form.adminLastName && form.adminEmail && form.adminPassword && form.adminPassword === form.confirmPassword;
    return true;
  };

  const handleSubmit = async () => {
    if (form.adminPassword !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      await axios.post('/api/institution/register', data);
      setSuccess(true);
      setCurrentStep(2);
      toast.success('Institution registered successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    width: '100%', padding: '0.75rem 1rem',
    border: `2px solid ${focusedField === field ? '#000' : '#ccc'}`,
    borderRadius: '0.625rem',
    fontFamily: "'Satoshi', sans-serif", fontSize: '0.9rem', fontWeight: 500,
    color: '#000', background: '#fff', outline: 'none',
    boxShadow: focusedField === field ? '4px 4px 0px #000' : '2px 2px 0px #ccc',
    transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    transform: focusedField === field ? 'translate(-1px,-1px)' : 'translate(0,0)',
    boxSizing: 'border-box'
  });

  const labelStyle = {
    display: 'block', fontFamily: "'Cabinet Grotesk', sans-serif",
    fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase',
    letterSpacing: '0.05em', color: '#000', marginBottom: '0.5rem'
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#ffe17c', padding: '2rem', position: 'relative', overflow: 'hidden',
      backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)',
      backgroundSize: '32px 32px',
    }}>
      {/* Back to home */}
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

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}
        style={{ width: '100%', maxWidth: 560, position: 'relative', zIndex: 10 }}>

        <div style={{ background: '#fff', border: '2px solid #000', borderRadius: '1rem', padding: '2.5rem', boxShadow: '8px 8px 0px #000' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: 56, height: 56, background: '#000', border: '2px solid #000', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '4px 4px 0px #000' }}>
              <HiOutlineBuildingLibrary style={{ color: '#ffe17c', fontSize: '1.625rem' }} />
            </div>
            <h1 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '1.625rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#000', marginBottom: '0.375rem' }}>
              Register Institution
            </h1>
            <p style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, color: '#666', fontSize: '0.875rem' }}>
              Create an account for your university or college
            </p>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '2.5rem' }}>
            {steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 800, fontFamily: "'Cabinet Grotesk', sans-serif",
                  background: i <= currentStep ? '#ffe17c' : '#fff',
                  border: '2px solid #000',
                  color: '#000',
                  boxShadow: i <= currentStep ? '2px 2px 0px #000' : 'none'
                }}>
                  {i < currentStep || success ? <HiOutlineCheck style={{ strokeWidth: 3 }} /> : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div style={{ width: 40, height: 2, background: '#000', borderTop: '2px solid #000' }} />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Institution Details */}
            {currentStep === 0 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div style={{ display: 'grid', gap: '1.125rem' }}>
                  <div>
                    <label style={labelStyle}>Institution Name *</label>
                    <input style={inputStyle('name')} placeholder="e.g. University of Technology" value={form.name} onChange={e => update('name', e.target.value)} onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)} />
                  </div>
                  <div className="grid-layout-1-1" style={{ gap: '1.125rem' }}>
                    <div>
                      <label style={labelStyle}>Institution Code *</label>
                      <input style={inputStyle('code')} placeholder="e.g. UNILAG" value={form.code} onChange={e => update('code', e.target.value.toUpperCase())} maxLength={10} onFocus={() => setFocusedField('code')} onBlur={() => setFocusedField(null)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Type *</label>
                      <select style={inputStyle('type')} value={form.type} onChange={e => update('type', e.target.value)} onFocus={() => setFocusedField('type')} onBlur={() => setFocusedField(null)}>
                        <option value="university">University</option>
                        <option value="college">College</option>
                        <option value="polytechnic">Polytechnic</option>
                        <option value="school">School</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Institution Email *</label>
                    <input style={inputStyle('email')} type="email" placeholder="info@university.edu" value={form.email} onChange={e => update('email', e.target.value)} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} />
                  </div>
                  <div className="grid-layout-1-1" style={{ gap: '1.125rem' }}>
                    <div>
                      <label style={labelStyle}>Phone</label>
                      <input style={inputStyle('phone')} placeholder="+234..." value={form.phone} onChange={e => update('phone', e.target.value)} onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField(null)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Website</label>
                      <input style={inputStyle('website')} placeholder="https://..." value={form.website} onChange={e => update('website', e.target.value)} onFocus={() => setFocusedField('website')} onBlur={() => setFocusedField(null)} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Address</label>
                    <input style={inputStyle('address')} placeholder="Institution address" value={form.address} onChange={e => update('address', e.target.value)} onFocus={() => setFocusedField('address')} onBlur={() => setFocusedField(null)} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Admin Account */}
            {currentStep === 1 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <p style={{ fontFamily: "'Satoshi', sans-serif", fontSize: '0.8125rem', color: '#666', marginBottom: '1.5rem', lineHeight: 1.5, fontWeight: 500 }}>
                  This will be the administrator account for your institution. You&apos;ll use these credentials to log in and manage everything.
                </p>
                <div style={{ display: 'grid', gap: '1.125rem' }}>
                  <div className="grid-layout-1-1" style={{ gap: '1.125rem' }}>
                    <div>
                      <label style={labelStyle}>First Name *</label>
                      <input style={inputStyle('adminFirstName')} placeholder="John" value={form.adminFirstName} onChange={e => update('adminFirstName', e.target.value)} onFocus={() => setFocusedField('adminFirstName')} onBlur={() => setFocusedField(null)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Last Name *</label>
                      <input style={inputStyle('adminLastName')} placeholder="Doe" value={form.adminLastName} onChange={e => update('adminLastName', e.target.value)} onFocus={() => setFocusedField('adminLastName')} onBlur={() => setFocusedField(null)} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Admin Email *</label>
                    <input style={inputStyle('adminEmail')} type="email" placeholder="admin@university.edu" value={form.adminEmail} onChange={e => update('adminEmail', e.target.value)} onFocus={() => setFocusedField('adminEmail')} onBlur={() => setFocusedField(null)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Password *</label>
                    <div style={{ position: 'relative' }}>
                      <input style={{ ...inputStyle('adminPassword'), paddingRight: '2.75rem' }} type={showPassword ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.adminPassword} onChange={e => update('adminPassword', e.target.value)} onFocus={() => setFocusedField('adminPassword')} onBlur={() => setFocusedField(null)} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#666', display: 'flex', padding: 0 }}>
                        {showPassword ? <HiOutlineEyeSlash size={18} /> : <HiOutlineEye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Confirm Password *</label>
                    <input style={inputStyle('confirmPassword')} type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} onFocus={() => setFocusedField('confirmPassword')} onBlur={() => setFocusedField(null)} />
                    {form.confirmPassword && form.adminPassword !== form.confirmPassword && (
                      <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4, fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}>Passwords do not match</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Success */}
            {currentStep === 2 && success && (
              <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
                style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%', background: '#ffe17c',
                  border: '2px solid #000',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
                  boxShadow: '4px 4px 0px #000'
                }}>
                  <HiOutlineCheck style={{ color: '#000', fontSize: '2rem', strokeWidth: 3 }} />
                </div>
                <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '1.375rem', fontWeight: 800, marginBottom: '0.75rem', color: '#000' }}>Registration Successful!</h2>
                <p style={{ fontFamily: "'Satoshi', sans-serif", color: '#555', lineHeight: 1.6, marginBottom: '0.5rem', fontWeight: 500 }}>
                  Your institution <strong>{form.name}</strong> has been registered successfully.
                </p>
                <div style={{
                  background: '#ffe17c',
                  border: '2px solid #000',
                  borderRadius: 12, padding: '1.25rem', margin: '1.5rem 0', textAlign: 'left',
                  boxShadow: '4px 4px 0px #000'
                }}>
                  <p style={{ fontSize: '0.8125rem', color: '#000', fontWeight: 800, marginBottom: 6, fontFamily: "'Cabinet Grotesk', sans-serif", textTransform: 'uppercase', letterSpacing: '0.04em' }}>📋 What happens next?</p>
                  <ul style={{ fontSize: '0.8125rem', color: '#333', paddingLeft: '1.25rem', margin: 0, lineHeight: 1.8, fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}>
                    <li>A system admin will review and approve your institution</li>
                    <li>Once approved, log in with your admin credentials</li>
                    <li>Start setting up departments, courses, teachers, and students</li>
                  </ul>
                </div>
                <button onClick={() => navigate('/login')} style={{
                  background: '#000', color: '#fff', border: '2px solid #000',
                  padding: '0.75rem 2rem', borderRadius: 10, fontSize: '0.9375rem', fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem',
                  boxShadow: '4px 4px 0px #000', transition: 'all 0.15s',
                  fontFamily: "'Satoshi', sans-serif"
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translate(1px,1px)'; e.currentTarget.style.boxShadow = '3px 3px 0px #000'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = '4px 4px 0px #000'; }}
                >
                  Go to Login
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          {!success && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem' }}>
              {currentStep > 0 ? (
                <button onClick={() => setCurrentStep(currentStep - 1)} style={{
                  background: '#fff', border: '2px solid #000',
                  color: '#000', padding: '0.625rem 1.5rem', borderRadius: 10,
                  fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  boxShadow: '3px 3px 0px #000', transition: 'all 0.15s',
                  fontFamily: "'Satoshi', sans-serif"
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translate(1px,1px)'; e.currentTarget.style.boxShadow = '2px 2px 0px #000'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = '3px 3px 0px #000'; }}
                >
                  <HiOutlineArrowLeft /> Back
                </button>
              ) : <div />}

              {currentStep === 0 && (
                <button onClick={() => setCurrentStep(1)} disabled={!canProceed()} style={{
                  background: canProceed() ? '#000' : '#555',
                  color: '#fff',
                  border: '2px solid #000', padding: '0.625rem 1.5rem', borderRadius: 10,
                  fontSize: '0.875rem', fontWeight: 700, cursor: canProceed() ? 'pointer' : 'not-allowed',
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  boxShadow: canProceed() ? '3px 3px 0px #000' : 'none', transition: 'all 0.15s',
                  fontFamily: "'Satoshi', sans-serif",
                  opacity: canProceed() ? 1 : 0.6
                }}
                  onMouseEnter={e => { if (canProceed()) { e.currentTarget.style.transform = 'translate(1px,1px)'; e.currentTarget.style.boxShadow = '2px 2px 0px #000'; } }}
                  onMouseLeave={e => { if (canProceed()) { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = '3px 3px 0px #000'; } }}
                >
                  Next <HiOutlineArrowRight />
                </button>
              )}

              {currentStep === 1 && (
                <button onClick={handleSubmit} disabled={!canProceed() || loading} style={{
                  background: canProceed() && !loading ? '#000' : '#555',
                  color: '#fff',
                  border: '2px solid #000', padding: '0.625rem 1.5rem', borderRadius: 10,
                  fontSize: '0.875rem', fontWeight: 700, cursor: canProceed() && !loading ? 'pointer' : 'not-allowed',
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  boxShadow: canProceed() && !loading ? '3px 3px 0px #000' : 'none', transition: 'all 0.15s',
                  fontFamily: "'Satoshi', sans-serif",
                  opacity: (canProceed() && !loading) ? 1 : 0.6
                }}
                  onMouseEnter={e => { if (canProceed() && !loading) { e.currentTarget.style.transform = 'translate(1px,1px)'; e.currentTarget.style.boxShadow = '2px 2px 0px #000'; } }}
                  onMouseLeave={e => { if (canProceed() && !loading) { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = '3px 3px 0px #000'; } }}
                >
                  {loading ? 'Registering...' : 'Register Institution'}
                </button>
              )}
            </div>
          )}

          {/* Login link */}
          {!success && (
            <div style={{ textAlign: 'center', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
              <p style={{ fontFamily: "'Satoshi', sans-serif", fontSize: '0.875rem', fontWeight: 500, color: '#555' }}>
                Already have an account?{' '}
                <a href="/login" style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, color: '#000', textDecoration: 'none', borderBottom: '2px solid #000' }}>
                  Sign In
                </a>
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterInstitution;
