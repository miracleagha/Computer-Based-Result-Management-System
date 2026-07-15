import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineUserGroup, HiOutlineMagnifyingGlass, HiOutlinePlusCircle, HiOutlineTrash, HiOutlinePencilSquare, HiOutlineXMark } from 'react-icons/hi2';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

/* ── shared field wrapper ── */
const Field = ({ label, required, hint, children }) => (
  <div style={{ marginBottom: '1rem' }}>
    <label style={{
      display: 'block', fontFamily: "'Cabinet Grotesk',sans-serif",
      fontSize: '0.6875rem', fontWeight: 800,
      textTransform: 'uppercase', letterSpacing: '0.06em',
      color: '#000', marginBottom: '0.35rem'
    }}>
      {label}{required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
    </label>
    {children}
    {hint && <p style={{ fontSize: '0.6875rem', color: '#888', marginTop: '0.25rem' }}>{hint}</p>}
  </div>
);

const baseInput = {
  width: '100%', padding: '0.6875rem 0.875rem',
  border: '2px solid #000', borderRadius: '0.5rem',
  fontFamily: "'Satoshi',sans-serif", fontSize: '0.875rem', fontWeight: 500,
  color: '#000', background: '#fff', outline: 'none',
  boxShadow: '3px 3px 0px #000',
  transition: 'box-shadow 0.15s, transform 0.15s',
  boxSizing: 'border-box',
};
const focusInput = { boxShadow: '5px 5px 0px #000', transform: 'translate(-1px,-1px)' };

const blankForm = { firstName: '', lastName: '', email: '', phone: '' };

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState(null);
  const [focused, setFocused] = useState(null);

  useEffect(() => { fetchTeachers(); }, [page]);

  const fetchTeachers = async () => {
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (search) params.append('search', search);
      const res = await axios.get(`/api/institution/teachers?${params}`);
      // Real API returns User docs directly: { _id, firstName, lastName, email, courseCount }
      setTeachers(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch { setTeachers([]); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setForm(blankForm); setEditingId(null); setShowModal(true); };
  const openEdit = (t) => {
    setForm({ firstName: t.firstName || '', lastName: t.lastName || '', email: t.email || '', phone: t.phone || '' });
    setEditingId(t._id);
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditingId(null); setForm(blankForm); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.email.trim()) { toast.error('Name and email are required'); return; }
    setSubmitting(true);
    try {
      if (editingId) {
        await axios.put(`/api/institution/teachers/${editingId}`, form);
        toast.success('Teacher updated');
      } else {
        await axios.post('/api/institution/teachers', form);
        toast.success('Teacher created — credentials sent to their email 📧');
      }
      closeModal();
      fetchTeachers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try { await axios.delete(`/api/institution/teachers/${id}`); toast.success('Teacher deleted'); fetchTeachers(); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const inp = (name) => ({ ...baseInput, ...(focused === name ? focusInput : {}) });

  if (loading) return <LoadingSkeleton type="table" rows={5} />;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>Teachers</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Manage teaching staff · {pagination.total ?? teachers.length} total
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', border: '2px solid #000', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', boxShadow: '2px 2px 0px #000' }}>
              <HiOutlineMagnifyingGlass style={{ color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Search teachers…" value={search}
                onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchTeachers()}
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.875rem', color: 'var(--text-primary)', width: 180, fontFamily: 'inherit' }} />
            </div>
            <button onClick={openAdd} className="btn btn-primary btn-sm">
              <HiOutlinePlusCircle size={16} /> Add Teacher
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead><tr><th>Teacher</th><th>Courses Assigned</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {teachers.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No teachers yet</td></tr>
            ) : teachers.map((t, i) => (
              <motion.tr key={t._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ffe17c', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 800, fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '0.75rem', boxShadow: '1px 1px 0px #000', flexShrink: 0 }}>
                      {t.firstName?.charAt(0)}{t.lastName?.charAt(0)}
                    </div>
                    <div>
                      {/* Real API: firstName/lastName directly on user object */}
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{t.firstName} {t.lastName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontWeight: 700, fontFamily: "'Cabinet Grotesk',sans-serif" }}>{t.courseCount ?? 0}</td>
                <td><span className={`badge ${t.isActive !== false ? 'badge-success' : 'badge-danger'}`}>{t.isActive !== false ? 'Active' : 'Inactive'}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    <button onClick={() => openEdit(t)} className="btn btn-sm btn-outline" style={{ padding: '0.25rem 0.5rem' }} title="Edit">
                      <HiOutlinePencilSquare size={14} />
                    </button>
                    <button onClick={() => handleDelete(t._id, `${t.firstName} ${t.lastName}`)} className="btn btn-sm btn-outline" style={{ padding: '0.25rem 0.5rem', color: '#dc2626', borderColor: '#dc2626' }} title="Delete">
                      <HiOutlineTrash size={14} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        </div>        {pagination.pages > 1 && (
          <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Page {pagination.page} of {pagination.pages}</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-sm btn-outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <button className="btn btn-sm btn-outline" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {showModal && (
          <div onClick={(e) => e.target === e.currentTarget && closeModal()}
            style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', padding: '1rem' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ background: '#fff', border: '2px solid #000', borderRadius: '0.875rem', width: '100%', maxWidth: 500, boxShadow: '8px 8px 0px #000', overflow: 'hidden' }}>

              <div style={{ padding: '1.125rem 1.5rem', borderBottom: '2px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffe17c' }}>
                <h3 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '1rem', fontWeight: 800 }}>
                  {editingId ? 'Edit Teacher' : 'Add New Teacher'}
                </h3>
                <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4 }}>
                  <HiOutlineXMark size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                {!editingId && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.8125rem', color: '#166534', lineHeight: 1.5 }}>
                    📧 Login credentials will be auto-generated and emailed to the teacher.
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Field label="First Name" required>
                    <input style={inp('fn')} placeholder="John" value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      onFocus={() => setFocused('fn')} onBlur={() => setFocused(null)} required autoFocus />
                  </Field>
                  <Field label="Last Name" required>
                    <input style={inp('ln')} placeholder="Doe" value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      onFocus={() => setFocused('ln')} onBlur={() => setFocused(null)} required />
                  </Field>
                </div>

                <Field label="Email Address" required hint={editingId ? 'Updating email will change the teacher\'s login credentials' : 'Teacher receives login credentials here'}>
                  <input style={inp('email')} type="email" placeholder="teacher@university.edu"
                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                    required />
                </Field>

                <Field label="Phone Number">
                  <input style={inp('phone')} placeholder="+234…" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)} />
                </Field>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={closeModal} className="btn btn-outline" disabled={submitting}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting
                      ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                          style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%' }} />
                      : editingId ? 'Update Teacher' : 'Create Teacher'}
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

export default Teachers;
