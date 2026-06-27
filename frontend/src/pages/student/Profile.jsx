import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineUser, HiOutlinePencilSquare, HiOutlineKey, HiOutlineAcademicCap } from 'react-icons/hi2';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { formatGPA, formatDate } from '../../utils/formatters';

const StudentProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/student/profile');
      setProfile(res.data.data);
      setForm({ firstName: res.data.data.firstName || '', lastName: res.data.data.lastName || '', email: res.data.data.email || '', phone: res.data.data.phone || '' });
    } catch {
      const mock = { firstName: user?.firstName || 'John', lastName: user?.lastName || 'Doe', email: user?.email || 'john@example.com', phone: '+234-800-000-0000', matricNumber: 'CSC/2024/001', department: 'Computer Science', level: '200', enrollmentDate: '2024-09-01', status: 'active', cgpa: 4.25 };
      setProfile(mock);
      setForm({ firstName: mock.firstName, lastName: mock.lastName, email: mock.email, phone: mock.phone });
    } finally { setLoading(false); }
  };

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

  if (loading) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading...</div>;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>My Profile</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>View and update your profile</p>
      </motion.div>

      <div className="grid-layout-2-sidebar">
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ textAlign: 'center' }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--yellow)', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 800, fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '2.5rem', margin: '0 auto 1rem', boxShadow: '3px 3px 0px #000' }}>
            {form.firstName?.charAt(0)}{form.lastName?.charAt(0)}
          </div>
          <h3 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{form.firstName} {form.lastName}</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.125rem', fontFamily: 'monospace' }}>{profile?.matricNumber}</p>
          <span className={`badge ${profile?.status === 'active' ? 'badge-success' : 'badge-neutral'}`} style={{ marginTop: '0.5rem' }}>{profile?.status}</span>

          <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'var(--yellow)', border: '2px solid #000', boxShadow: '2px 2px 0px #000' }}>
            <div style={{ fontSize: '0.75rem', color: '#555', fontWeight: 700, textTransform: 'uppercase' }}>CGPA</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#000', marginTop: '0.25rem', fontFamily: "'Cabinet Grotesk', sans-serif" }}>{formatGPA(profile?.cgpa)}</div>
          </div>

          <button onClick={() => setShowPasswordModal(true)} className="btn btn-outline btn-sm" style={{ marginTop: '1rem', width: '100%' }}>
            <HiOutlineKey size={16} /> Change Password
          </button>
        </motion.div>

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Personal Info */}
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
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" disabled value={form.email} style={{ opacity: 0.6 }} /></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" disabled={!editing} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          </motion.div>

          {/* Academic Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
            <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Academic Information</h3>
            <div className="grid-layout-1-1" style={{ gap: '1rem' }}>
              {[
                ['Department', profile?.department],
                ['Level', `${profile?.level} Level`],
                ['Matric Number', profile?.matricNumber],
                ['Enrollment Date', formatDate(profile?.enrollmentDate)]
              ].map(([label, value]) => (
                <div key={label} style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: '#fff', border: '2px solid #000', boxShadow: '2px 2px 0px #000' }}>
                  <div style={{ fontSize: '0.75rem', color: '#555', fontWeight: 700 }}>{label}</div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#000', marginTop: '0.25rem' }}>{value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
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
                <button type="submit" className="btn btn-primary">Update</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;
