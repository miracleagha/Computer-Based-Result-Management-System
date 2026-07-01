import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineUser, HiOutlinePencilSquare, HiOutlineKey, HiOutlineAcademicCap,
  HiOutlinePhone, HiOutlineEnvelope, HiOutlineXMark, HiOutlineEye, HiOutlineEyeSlash,
  HiOutlineCheckCircle, HiOutlineIdentification, HiOutlineCalendarDays,
} from 'react-icons/hi2';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { formatGPA, formatDate } from '../../utils/formatters';

/* ── shared input style ───────────────────── */
const baseInput = {
  width: '100%',
  padding: '0.6875rem 0.875rem',
  border: '2px solid #000',
  borderRadius: '0.5rem',
  fontFamily: "'Satoshi',sans-serif",
  fontSize: '0.875rem',
  fontWeight: 500,
  color: '#000',
  background: '#fff',
  outline: 'none',
  boxShadow: '3px 3px 0px #000',
  transition: 'box-shadow 0.15s, transform 0.15s',
  boxSizing: 'border-box',
};
const focusInput = { boxShadow: '5px 5px 0px #000', transform: 'translate(-1px,-1px)' };
const disabledInput = { background: '#f5f5f0', opacity: 0.65, cursor: 'not-allowed', boxShadow: 'none' };

const Field = ({ label, required, hint, children }) => (
  <div style={{ marginBottom: '1rem' }}>
    <label style={{
      display: 'block',
      fontFamily: "'Cabinet Grotesk',sans-serif",
      fontSize: '0.6875rem', fontWeight: 800,
      textTransform: 'uppercase', letterSpacing: '0.06em',
      color: '#000', marginBottom: '0.35rem',
    }}>
      {label}{required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
    </label>
    {children}
    {hint && <p style={{ fontSize: '0.6875rem', color: '#888', marginTop: '0.25rem' }}>{hint}</p>}
  </div>
);

const StudentProfile = () => {
  const { user, checkAuth } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [focused, setFocused] = useState(null);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/student/profile');
      const { user: u, profile: p } = res.data.data || {};
      const merged = {
        firstName: u?.firstName || user?.firstName || '',
        lastName: u?.lastName || user?.lastName || '',
        email: u?.email || user?.email || '',
        phone: u?.phone || '',
        matricNumber: p?.matricNumber,
        department: p?.departmentId?.name,
        level: p?.level,
        enrollmentDate: p?.enrollmentDate,
        status: p?.status,
        cgpa: p?.cgpa,
      };
      setProfile(merged);
      setForm({ firstName: merged.firstName, lastName: merged.lastName, email: merged.email, phone: merged.phone });
    } catch {
      const fallback = { firstName: user?.firstName || '', lastName: user?.lastName || '', email: user?.email || '', phone: '', matricNumber: '—', department: '—', level: '—', enrollmentDate: null, status: 'active', cgpa: 0 };
      setProfile(fallback);
      setForm({ firstName: fallback.firstName, lastName: fallback.lastName, email: fallback.email, phone: fallback.phone });
    } finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!form.firstName.trim()) { toast.error('First name is required'); return; }
    setSaving(true);
    try {
      await axios.put('/api/auth/profile', { firstName: form.firstName, lastName: form.lastName, phone: form.phone });
      toast.success('Profile updated');
      setEditing(false);
      await Promise.all([fetchProfile(), checkAuth()]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const handleCancelEdit = () => {
    setForm({ firstName: profile?.firstName, lastName: profile?.lastName, email: profile?.email, phone: profile?.phone });
    setEditing(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    setPwdSaving(true);
    try {
      await axios.put('/api/auth/change-password', { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      toast.success('Password changed successfully');
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPwd({ current: false, new: false, confirm: false });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setPwdSaving(false); }
  };

  const inp = (name, disabled = false) => ({
    ...baseInput,
    ...(focused === name && !disabled ? focusInput : {}),
    ...(disabled ? disabledInput : {}),
  });

  const pwdMatch = passwordForm.confirmPassword && passwordForm.newPassword === passwordForm.confirmPassword;
  const pwdMismatch = passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword;

  if (loading) return (
    <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ width: 20, height: 20, border: '2px solid #ccc', borderTopColor: '#000', borderRadius: '50%' }} />
      Loading profile…
    </div>
  );

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>My Profile</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>View and manage your account information</p>
      </motion.div>

      <div className="grid-layout-2-sidebar">

        {/* ── Left: Avatar card ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ textAlign: 'center' }}>
          {/* Avatar */}
          <div style={{
            width: 96, height: 96, borderRadius: '50%',
            background: '#ffe17c', border: '3px solid #000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#000', fontWeight: 800, fontFamily: "'Cabinet Grotesk',sans-serif",
            fontSize: '2.25rem', margin: '0 auto 1rem',
            boxShadow: '4px 4px 0px #000',
          }}>
            {form.firstName?.charAt(0)}{form.lastName?.charAt(0)}
          </div>

          <h3 style={{ fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '1.125rem' }}>
            {form.firstName} {form.lastName}
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#555', marginTop: '0.25rem', fontFamily: 'monospace' }}>{profile?.matricNumber}</p>

          <div style={{ marginTop: '0.625rem' }}>
            <span className={`badge ${profile?.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
              {profile?.status || 'active'}
            </span>
          </div>

          {/* CGPA tile */}
          <div style={{
            marginTop: '1.25rem', padding: '1rem',
            borderRadius: '0.625rem', background: '#ffe17c',
            border: '2px solid #000', boxShadow: '3px 3px 0px #000',
          }}>
            <div style={{ fontSize: '0.6875rem', color: '#555', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
              Cumulative GPA
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#000', fontFamily: "'Cabinet Grotesk',sans-serif", lineHeight: 1 }}>
              {formatGPA(profile?.cgpa)}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#666', marginTop: '0.25rem' }}>out of 5.00</div>
          </div>

          <button
            onClick={() => setShowPasswordModal(true)}
            className="btn btn-outline btn-sm"
            style={{ marginTop: '1.25rem', width: '100%', justifyContent: 'center' }}
          >
            <HiOutlineKey size={15} /> Change Password
          </button>
        </motion.div>

        {/* ── Right: Details ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Personal Information */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.375rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HiOutlineUser size={18} style={{ color: '#555' }} />
                <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>Personal Information</h3>
              </div>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="btn btn-outline btn-sm">
                  <HiOutlinePencilSquare size={15} /> Edit
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={handleCancelEdit} className="btn btn-outline btn-sm" disabled={saving}>Cancel</button>
                  <button onClick={handleSave} className="btn btn-primary btn-sm" disabled={saving}>
                    {saving
                      ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                          style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%' }} />
                      : <><HiOutlineCheckCircle size={14} /> Save</>}
                  </button>
                </div>
              )}
            </div>

            {/* Names */}
            <div className="grid-layout-1-1" style={{ gap: '1rem' }}>
              <Field label="First Name" required>
                <input
                  style={inp('fn', !editing)}
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  onFocus={() => setFocused('fn')} onBlur={() => setFocused(null)}
                  disabled={!editing}
                  placeholder="First name"
                />
              </Field>
              <Field label="Last Name">
                <input
                  style={inp('ln', !editing)}
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  onFocus={() => setFocused('ln')} onBlur={() => setFocused(null)}
                  disabled={!editing}
                  placeholder="Last name"
                />
              </Field>
            </div>

            {/* Email — always locked */}
            <Field label="Email Address" hint="Email cannot be changed. Contact your institution.">
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa', display: 'flex' }}>
                  <HiOutlineEnvelope size={17} />
                </div>
                <input
                  style={{ ...inp('email', true), paddingLeft: '2.375rem' }}
                  value={form.email}
                  disabled
                  readOnly
                />
              </div>
            </Field>

            {/* Phone */}
            <Field label="Phone Number">
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: editing ? '#555' : '#aaa', display: 'flex' }}>
                  <HiOutlinePhone size={17} />
                </div>
                <input
                  style={{ ...inp('phone', !editing), paddingLeft: '2.375rem' }}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)}
                  disabled={!editing}
                  placeholder="+234 …"
                />
              </div>
            </Field>
          </motion.div>

          {/* Academic Information */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.125rem' }}>
              <HiOutlineAcademicCap size={18} style={{ color: '#555' }} />
              <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>Academic Information</h3>
            </div>
            <div className="grid-layout-1-1" style={{ gap: '0.75rem' }}>
              {[
                { icon: HiOutlineIdentification, label: 'Department',      value: profile?.department },
                { icon: HiOutlineAcademicCap,   label: 'Level',            value: profile?.level ? `${profile.level} Level` : '—' },
                { icon: HiOutlineIdentification, label: 'Matric Number',   value: profile?.matricNumber },
                { icon: HiOutlineCalendarDays,   label: 'Enrollment Date', value: formatDate(profile?.enrollmentDate) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                  padding: '0.875rem 1rem',
                  borderRadius: '0.5rem', background: '#fafafa',
                  border: '2px solid #000', boxShadow: '2px 2px 0px #000',
                }}>
                  <Icon size={16} style={{ color: '#555', marginTop: '0.125rem', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888', marginBottom: '0.25rem' }}>{label}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#000', fontFamily: label === 'Matric Number' ? 'monospace' : 'inherit' }}>{value || '—'}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Change Password Modal ── */}
      <AnimatePresence>
        {showPasswordModal && (
          <div
            onClick={(e) => e.target === e.currentTarget && setShowPasswordModal(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', padding: '1rem' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ background: '#fff', borderRadius: '0.875rem', border: '2px solid #000', width: '100%', maxWidth: 440, boxShadow: '8px 8px 0px #000', overflow: 'hidden' }}
            >
              {/* Modal header */}
              <div style={{ padding: '1.125rem 1.5rem', borderBottom: '2px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffe17c' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HiOutlineKey size={18} />
                  <h3 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '1rem', fontWeight: 800 }}>Change Password</h3>
                </div>
                <button onClick={() => setShowPasswordModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4 }}>
                  <HiOutlineXMark size={20} />
                </button>
              </div>

              <form onSubmit={handlePasswordChange} style={{ padding: '1.5rem' }}>
                {/* Current Password */}
                <Field label="Current Password" required>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPwd.current ? 'text' : 'password'}
                      style={{ ...inp('cp'), paddingRight: '2.75rem' }}
                      placeholder="Your current password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      onFocus={() => setFocused('cp')} onBlur={() => setFocused(null)}
                      required autoFocus
                    />
                    <button type="button" onClick={() => setShowPwd(p => ({ ...p, current: !p.current }))}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#666', display: 'flex', padding: 2 }}>
                      {showPwd.current ? <HiOutlineEyeSlash size={18} /> : <HiOutlineEye size={18} />}
                    </button>
                  </div>
                </Field>

                {/* New Password */}
                <Field label="New Password" required hint="Minimum 6 characters">
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPwd.new ? 'text' : 'password'}
                      style={{ ...inp('np'), paddingRight: '2.75rem' }}
                      placeholder="Choose a strong password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      onFocus={() => setFocused('np')} onBlur={() => setFocused(null)}
                      required minLength={6}
                    />
                    <button type="button" onClick={() => setShowPwd(p => ({ ...p, new: !p.new }))}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#666', display: 'flex', padding: 2 }}>
                      {showPwd.new ? <HiOutlineEyeSlash size={18} /> : <HiOutlineEye size={18} />}
                    </button>
                  </div>
                </Field>

                {/* Confirm Password */}
                <Field label="Confirm New Password" required>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPwd.confirm ? 'text' : 'password'}
                      style={{
                        ...inp('conf'), paddingRight: '2.75rem',
                        ...(pwdMismatch ? { borderColor: '#dc2626', boxShadow: '3px 3px 0px #dc2626' } : {}),
                        ...(pwdMatch ? { borderColor: '#10b981', boxShadow: '3px 3px 0px #10b981' } : {}),
                      }}
                      placeholder="Re-enter new password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      onFocus={() => setFocused('conf')} onBlur={() => setFocused(null)}
                      required
                    />
                    <button type="button" onClick={() => setShowPwd(p => ({ ...p, confirm: !p.confirm }))}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#666', display: 'flex', padding: 2 }}>
                      {showPwd.confirm ? <HiOutlineEyeSlash size={18} /> : <HiOutlineEye size={18} />}
                    </button>
                  </div>
                  {pwdMismatch && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.3rem', fontWeight: 600 }}>Passwords do not match</p>}
                  {pwdMatch && <p style={{ color: '#10b981', fontSize: '0.75rem', marginTop: '0.3rem', fontWeight: 600 }}>✓ Passwords match</p>}
                </Field>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.25rem' }}>
                  <button type="button" onClick={() => setShowPasswordModal(false)} className="btn btn-outline" disabled={pwdSaving}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={pwdSaving || pwdMismatch}>
                    {pwdSaving
                      ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                          style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%' }} />
                      : 'Update Password'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentProfile;
