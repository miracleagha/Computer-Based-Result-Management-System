import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineUser, HiOutlineLockClosed, HiOutlineCheckCircle } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const endpoint = user?.role === 'teacher' ? '/api/teacher/profile' : '/api/auth/me';
      await axios.put(user?.role === 'teacher' ? '/api/teacher/profile' : '/api/auth/change-password', profileForm);
      toast.success('Profile updated');
      if (refreshUser) refreshUser();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passwordForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSaving(true);
    try {
      await axios.put('/api/auth/change-password', { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      toast.success('Password changed');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: HiOutlineUser },
    { id: 'security', label: 'Security', icon: HiOutlineLockClosed }
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Profile</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Manage your account settings</p>
      </motion.div>

      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--yellow)', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 800, fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '1.75rem', flexShrink: 0, boxShadow: '2px 2px 0px #000' }}>
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-primary)' }}>{user?.firstName} {user?.lastName}</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{user?.email}</p>
          <span className="badge badge-info" style={{ marginTop: '0.25rem', textTransform: 'capitalize' }}>{user?.role}</span>
        </div>
      </motion.div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: '#fff', border: '2px solid #000', borderRadius: 'var(--radius-sm)', padding: '0.25rem', width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-sm)', border: tab === t.id ? '2px solid #000' : '2px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', fontWeight: 700, transition: 'var(--transition)', background: tab === t.id ? 'var(--yellow)' : 'transparent', color: '#000', boxShadow: tab === t.id ? '2px 2px 0px #000' : 'none' }}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Personal Information</h3>
          <form onSubmit={handleProfileUpdate}>
            <div className="grid-layout-1-1" style={{ gap: '1rem' }}>
              <div className="form-group"><label className="form-label">First Name</label><input className="form-input" value={profileForm.firstName} onChange={e => setProfileForm(f => ({ ...f, firstName: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Last Name</label><input className="form-input" value={profileForm.lastName} onChange={e => setProfileForm(f => ({ ...f, lastName: e.target.value }))} /></div>
            </div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </motion.div>
      )}

      {tab === 'security' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Change Password</h3>
          <form onSubmit={handlePasswordChange} style={{ maxWidth: 400 }}>
            <div className="form-group"><label className="form-label">Current Password</label><input type="password" className="form-input" value={passwordForm.currentPassword} onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))} required /></div>
            <div className="form-group"><label className="form-label">New Password</label><input type="password" className="form-input" value={passwordForm.newPassword} onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))} required minLength={6} /></div>
            <div className="form-group"><label className="form-label">Confirm New Password</label><input type="password" className="form-input" value={passwordForm.confirmPassword} onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))} required /></div>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Changing...' : 'Change Password'}</button>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default Profile;
