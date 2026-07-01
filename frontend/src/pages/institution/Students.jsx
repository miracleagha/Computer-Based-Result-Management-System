import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineAcademicCap, HiOutlineMagnifyingGlass, HiOutlinePlusCircle,
  HiOutlineTrash, HiOutlinePencilSquare, HiOutlineEye, HiOutlineXMark,
} from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
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

const blankForm = { firstName: '', lastName: '', email: '', phone: '', level: 100, departmentId: '' };

const Students = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [form, setForm] = useState(blankForm);
  const [departments, setDepartments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [focused, setFocused] = useState(null);

  useEffect(() => { fetchStudents(); fetchDepartments(); }, [page, levelFilter]);

  const fetchDepartments = async () => {
    try { const res = await axios.get('/api/institution/departments'); setDepartments(res.data.data || []); }
    catch { setDepartments([]); }
  };

  const fetchStudents = async () => {
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (levelFilter) params.append('level', levelFilter);
      if (search) params.append('search', search);
      const res = await axios.get(`/api/institution/students?${params}`);
      // API returns { firstName, lastName, email, ..., profile: { matricNumber, departmentId, level, status, enrollmentDate } }
      setStudents(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch { setStudents([]); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setForm(blankForm); setEditingId(null); setShowAddModal(true); };
  const openEdit = (s) => {
    setForm({
      firstName: s.firstName || '',
      lastName: s.lastName || '',
      email: s.email || '',
      phone: s.phone || '',
      level: s.profile?.level || 100,
      departmentId: s.profile?.departmentId?._id || '',
    });
    setEditingId(s._id);
    setShowAddModal(true);
  };
  const closeModal = () => { setShowAddModal(false); setEditingId(null); setForm(blankForm); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName.trim()) { toast.error('First name is required'); return; }
    if (!form.email.trim()) { toast.error('Email is required'); return; }
    if (!form.departmentId) { toast.error('Please select a department'); return; }
    setSubmitting(true);
    try {
      if (editingId) {
        await axios.put(`/api/institution/students/${editingId}`, { ...form, level: Number(form.level) });
        toast.success('Student updated');
      } else {
        await axios.post('/api/institution/students', { ...form, level: Number(form.level) });
        toast.success('Student created — login credentials sent to their email 📧');
      }
      closeModal();
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    try { await axios.delete(`/api/institution/students/${id}`); toast.success('Student deleted'); fetchStudents(); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const inp = (name) => ({ ...baseInput, ...(focused === name ? focusInput : {}) });

  const statusBadge = (status) => {
    const map = { active: 'badge-success', suspended: 'badge-danger', graduated: 'badge-info', expelled: 'badge-danger' };
    return map[status] || 'badge-neutral';
  };

  if (loading) return <LoadingSkeleton type="table" rows={5} />;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>Students</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Manage student records and enrollment · {pagination.total ?? students.length} total
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', border: '2px solid #000', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', boxShadow: '2px 2px 0px #000' }}>
              <HiOutlineMagnifyingGlass style={{ color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Search students…" value={search}
                onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchStudents()}
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.875rem', color: 'var(--text-primary)', width: 180, fontFamily: 'inherit' }} />
            </div>
            {/* Level filter */}
            <select value={levelFilter} onChange={(e) => { setLevelFilter(e.target.value); setPage(1); }}
              style={{ ...baseInput, width: 'auto', padding: '0.5rem 2rem 0.5rem 0.75rem', cursor: 'pointer', boxShadow: '2px 2px 0px #000' }}>
              <option value="">All Levels</option>
              {[100,200,300,400,500].map(l => <option key={l} value={l}>{l} Level</option>)}
            </select>
            <button onClick={openAdd} className="btn btn-primary btn-sm">
              <HiOutlinePlusCircle size={16} /> Add Student
            </button>
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th><th>Matric No.</th><th>Department</th>
                <th>Level</th><th>Status</th><th>Enrolled</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No students found</td></tr>
              ) : students.map((s, i) => (
                <motion.tr key={s._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ffe17c', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 800, fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '0.75rem', boxShadow: '1px 1px 0px #000', flexShrink: 0 }}>
                        {s.firstName?.charAt(0)}{s.lastName?.charAt(0)}
                      </div>
                      <div>
                        {/* Real API: firstName/lastName directly on student object */}
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{s.firstName} {s.lastName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8125rem' }}>{s.profile?.matricNumber || '—'}</td>
                  <td style={{ fontSize: '0.8125rem' }}>{s.profile?.departmentId?.name || '—'}</td>
                  <td><span className="badge badge-info">{s.profile?.level ?? '—'} Level</span></td>
                  <td><span className={`badge ${statusBadge(s.profile?.status)}`}>{s.profile?.status || '—'}</span></td>
                  <td style={{ fontSize: '0.8125rem' }}>
                    {s.profile?.enrollmentDate ? new Date(s.profile.enrollmentDate).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button onClick={() => navigate(`/dashboard/students/${s._id}`)} className="btn btn-sm btn-outline" style={{ padding: '0.25rem 0.5rem' }} title="View">
                        <HiOutlineEye size={14} />
                      </button>
                      <button onClick={() => openEdit(s)} className="btn btn-sm btn-outline" style={{ padding: '0.25rem 0.5rem' }} title="Edit">
                        <HiOutlinePencilSquare size={14} />
                      </button>
                      <button onClick={() => handleDelete(s._id, `${s.firstName} ${s.lastName}`)} className="btn btn-sm btn-outline" style={{ padding: '0.25rem 0.5rem', color: '#dc2626', borderColor: '#dc2626' }} title="Delete">
                        <HiOutlineTrash size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Page {pagination.page} of {pagination.pages}</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-sm btn-outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <button className="btn btn-sm btn-outline" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Add / Edit Modal ── */}
      <AnimatePresence>
        {showAddModal && (
          <div onClick={(e) => e.target === e.currentTarget && closeModal()}
            style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', padding: '1rem' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ background: '#fff', border: '2px solid #000', borderRadius: '0.875rem', width: '100%', maxWidth: 520, boxShadow: '8px 8px 0px #000', overflow: 'hidden' }}>

              <div style={{ padding: '1.125rem 1.5rem', borderBottom: '2px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffe17c' }}>
                <h3 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '1rem', fontWeight: 800 }}>
                  {editingId ? 'Edit Student' : 'Add New Student'}
                </h3>
                <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4 }}>
                  <HiOutlineXMark size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                {!editingId && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.8125rem', color: '#166534', lineHeight: 1.5 }}>
                    📧 Login credentials will be auto-generated and emailed to the student.
                  </div>
                )}

                {/* Names */}
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

                {/* Email */}
                <Field label="Email Address" required hint={editingId ? '' : 'Student receives login credentials here'}>
                  <input style={inp('email')} type="email" placeholder="student@example.com"
                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                    required disabled={!!editingId} />
                </Field>

                {/* Phone */}
                <Field label="Phone Number">
                  <input style={inp('phone')} placeholder="+234…" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)} />
                </Field>

                {/* Level + Department */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Field label="Level" required>
                    <select style={{ ...inp('level'), cursor: 'pointer' }} value={form.level}
                      onChange={(e) => setForm({ ...form, level: Number(e.target.value) })}
                      onFocus={() => setFocused('level')} onBlur={() => setFocused(null)}>
                      {[100,200,300,400,500,600,700].map(l => <option key={l} value={l}>{l} Level</option>)}
                    </select>
                  </Field>
                  <Field label="Department" required>
                    <select style={{ ...inp('dept'), cursor: 'pointer' }} value={form.departmentId}
                      onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                      onFocus={() => setFocused('dept')} onBlur={() => setFocused(null)} required>
                      <option value="">— Select —</option>
                      {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                    </select>
                  </Field>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={closeModal} className="btn btn-outline" disabled={submitting}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting
                      ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                          style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%' }} />
                      : editingId ? 'Update Student' : 'Create Student'}
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

export default Students;
