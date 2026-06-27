import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineUser, HiOutlinePencilSquare, HiOutlineKey } from 'react-icons/hi2';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const TeacherProfile = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ firstName: user.firstName || '', lastName: user.lastName || '', email: user.email || '', phone: user.phone || '' });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await axios.put('/api/auth/profile', form);
      toast.success('Profile updated');
      setEditing(false);
    } catch (error) { toast.error(error.response?.data?.message || 'Update failed'); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    try {
      await axios.put('/api/auth/change-password', { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      toast.success('Password changed');
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>My Profile</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Manage your account details</p>
      </motion.div>

      <div className="grid-layout-2-sidebar">
        {/* Avatar Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ textAlign: 'center' }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--yellow)', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 800, fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '2.5rem', margin: '0 auto 1rem', boxShadow: '3px 3px 0px #000' }}>
            {form.firstName?.charAt(0)}{form.lastName?.charAt(0)}
          </div>
          <h3 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{form.firstName} {form.lastName}</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Teacher</p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{form.email}</p>
          <button onClick={() => setShowPasswordModal(true)} className="btn btn-outline btn-sm" style={{ marginTop: '1rem', width: '100%' }}>
            <HiOutlineKey size={16} /> Change Password
          </button>
        </motion.div>

        {/* Profile Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Personal Information</h3>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="btn btn-outline btn-sm"><HiOutlinePencilSquare size={16} /> Edit</button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setEditing(false)} className="btn btn-outline btn-sm">Cancel</button>
                <button onClick={handleSave} className="btn btn-primary btn-sm">Save</button>
              </div>
            )}
          </div>
          <div className="grid-layout-1-1" style={{ gap: '1rem' }}>
            <div className="form-group"><label className="form-label">First Name</label><input className="form-input" disabled={!editing} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Last Name</label><input className="form-input" disabled={!editing} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
          </div>
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" disabled value={form.email} style={{ opacity: 0.6 }} /></div>
          <div className="form-group"><label className="form-label">Phone</label><input className="form-input" disabled={!editing} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+234..." /></div>
        </motion.div>
      </div>

      {showPasswordModal && (
        <div onClick={(e) => e.target === e.currentTarget && setShowPasswordModal(false)} style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: '1rem' }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: '#fff', borderRadius: 'var(--radius)', border: '2px solid #000', width: '100%', maxWidth: 440, boxShadow: '8px 8px 0px #000', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}><h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Change Password</h3></div>
            <form onSubmit={handlePasswordChange} style={{ padding: '1.5rem' }}>
              <div className="form-group"><label className="form-label">Current Password</label><input className="form-input" type="password" required value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">New Password</label><input className="form-input" type="password" required minLength={6} value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Confirm Password</label><input className="form-input" type="password" required value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowPasswordModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Update Password</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TeacherProfile;
