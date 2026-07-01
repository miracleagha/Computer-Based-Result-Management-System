import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineBuildingOffice, HiOutlinePlusCircle, HiOutlineTrash,
  HiOutlinePencilSquare, HiOutlineXMark, HiOutlineUserCircle,
  HiOutlineBookOpen, HiOutlineAcademicCap,
} from 'react-icons/hi2';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

/* ── Shared field wrapper ───────────────────────────── */
const Field = ({ label, required, hint, children }) => (
  <div style={{ marginBottom: '1.125rem' }}>
    <label style={{
      display: 'block', fontFamily: "'Cabinet Grotesk',sans-serif",
      fontSize: '0.6875rem', fontWeight: 800,
      textTransform: 'uppercase', letterSpacing: '0.06em',
      color: '#000', marginBottom: '0.375rem'
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

/* ── Modal shell ───────────────────────────────────── */
const Modal = ({ title, onClose, children }) => (
  <div
    onClick={(e) => e.target === e.currentTarget && onClose()}
    style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', padding: '1rem'
    }}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 16 }}
      style={{
        background: '#fff', border: '2px solid #000', borderRadius: '0.875rem',
        width: '100%', maxWidth: 500, boxShadow: '8px 8px 0px #000', overflow: 'hidden'
      }}
    >
      <div style={{
        padding: '1.125rem 1.5rem', borderBottom: '2px solid #000',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: '#ffe17c'
      }}>
        <h3 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '1rem', fontWeight: 800 }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#000', display: 'flex', padding: 4 }}>
          <HiOutlineXMark size={20} />
        </button>
      </div>
      {children}
    </motion.div>
  </div>
);

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [focused, setFocused] = useState(null);

  const blankForm = { name: '', code: '', description: '', headOfDepartment: '' };
  const [form, setForm] = useState(blankForm);

  useEffect(() => { fetchDepartments(); fetchTeachers(); }, []);

  const fetchTeachers = async () => {
    try {
      const res = await axios.get('/api/institution/teachers?limit=200');
      // Real API returns User docs directly: { _id, firstName, lastName, ... }
      setTeachers(res.data.data || []);
    } catch { setTeachers([]); }
  };

  const fetchDepartments = async () => {
    try { const res = await axios.get('/api/institution/departments'); setDepartments(res.data.data || []); }
    catch { setDepartments([]); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setForm(blankForm); setEditingId(null); setShowModal(true); };
  const openEdit = (dept) => {
    setForm({
      name: dept.name || '', code: dept.code || '',
      description: dept.description || '',
      headOfDepartment: dept.headOfDepartment?._id || '',
    });
    setEditingId(dept._id);
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditingId(null); setForm(blankForm); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Department name is required'); return; }
    if (!form.code.trim()) { toast.error('Department code is required'); return; }
    setSubmitting(true);
    try {
      const payload = { ...form, headOfDepartment: form.headOfDepartment || null };
      if (editingId) {
        await axios.put(`/api/institution/departments/${editingId}`, payload);
        toast.success('Department updated');
      } else {
        await axios.post('/api/institution/departments', payload);
        toast.success('Department created');
      }
      closeModal();
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try { await axios.delete(`/api/institution/departments/${id}`); toast.success('Deleted'); fetchDepartments(); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const inp = (name) => ({ ...baseInput, ...(focused === name ? focusInput : {}) });

  if (loading) return <LoadingSkeleton type="table" rows={4} />;

  return (
    <div>
      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Departments</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Manage academic departments · {departments.length} total
            </p>
          </div>
          <button onClick={openAdd} className="btn btn-primary btn-sm">
            <HiOutlinePlusCircle size={16} /> Add Department
          </button>
        </div>
      </motion.div>

      {/* ── Cards Grid ── */}
      {departments.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <HiOutlineBuildingOffice size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No Departments Yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Create your first department to get started.</p>
          <button onClick={openAdd} className="btn btn-primary btn-sm"><HiOutlinePlusCircle size={16} /> Add Department</button>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {departments.map((dept, i) => (
            <motion.div key={dept._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="card">
              {/* top row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '0.5rem', background: '#ffe17c', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '2px 2px 0px #000', flexShrink: 0 }}>
                    <HiOutlineBuildingOffice size={20} style={{ color: '#000' }} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{dept.name}</h3>
                    <code style={{ fontSize: '0.75rem', color: '#555', background: '#f5f5f0', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', border: '1px solid #ddd' }}>{dept.code}</code>
                  </div>
                </div>
                <span className={`badge ${dept.isActive !== false ? 'badge-success' : 'badge-danger'}`}>
                  {dept.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* counts */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.875rem' }}>
                {[{ icon: HiOutlineBookOpen, label: 'Courses', val: dept.courseCount ?? 0 }, { icon: HiOutlineAcademicCap, label: 'Students', val: dept.studentCount ?? 0 }].map(({ icon: Icon, label, val }) => (
                  <div key={label} style={{ padding: '0.625rem', borderRadius: '0.375rem', background: '#fafafa', border: '2px solid #000', boxShadow: '2px 2px 0px #000', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', marginBottom: '0.125rem' }}>
                      <Icon size={13} style={{ color: '#555' }} />
                      <span style={{ fontSize: '0.6125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#555' }}>{label}</span>
                    </div>
                    <div style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '1.25rem', fontWeight: 800, color: '#000' }}>{val}</div>
                  </div>
                ))}
              </div>

              {/* HOD */}
              {dept.headOfDepartment ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', background: '#f5f5f0', border: '1px solid #e0e0e0', marginBottom: '0.875rem' }}>
                  <HiOutlineUserCircle size={16} style={{ color: '#555', flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, color: '#555' }}>HOD:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{dept.headOfDepartment.firstName} {dept.headOfDepartment.lastName}</span>
                </div>
              ) : (
                <div style={{ marginBottom: '0.875rem', fontSize: '0.8125rem', color: '#aaa', fontStyle: 'italic' }}>No HOD assigned</div>
              )}

              {dept.description && (
                <p style={{ fontSize: '0.8125rem', color: '#666', lineHeight: 1.5, marginBottom: '0.875rem' }}>{dept.description}</p>
              )}

              {/* actions */}
              <div style={{ display: 'flex', gap: '0.375rem' }}>
                <button onClick={() => openEdit(dept)} className="btn btn-sm btn-outline" style={{ flex: 1 }}>
                  <HiOutlinePencilSquare size={14} /> Edit
                </button>
                <button onClick={() => handleDelete(dept._id, dept.name)} className="btn btn-sm btn-outline" style={{ padding: '0.375rem 0.625rem', color: '#dc2626', borderColor: '#dc2626' }}>
                  <HiOutlineTrash size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Modal ── */}
      <AnimatePresence>
        {showModal && (
          <Modal title={editingId ? 'Edit Department' : 'Add Department'} onClose={closeModal}>
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
              <Field label="Department Name" required>
                <input style={inp('name')} placeholder="e.g. Computer Science" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} required autoFocus />
              </Field>

              <Field label="Department Code" required hint="Short uppercase abbreviation, e.g. CSC">
                <input style={inp('code')} placeholder="e.g. CSC" value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  onFocus={() => setFocused('code')} onBlur={() => setFocused(null)} maxLength={10} required />
              </Field>

              <Field label="Description">
                <textarea style={{ ...inp('desc'), resize: 'vertical', minHeight: 72 }}
                  placeholder="Brief description (optional)" value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  onFocus={() => setFocused('desc')} onBlur={() => setFocused(null)} />
              </Field>

              <Field label="Head of Department" hint="Optional — only lists teachers you have already added">
                <select style={{ ...inp('hod'), cursor: 'pointer' }} value={form.headOfDepartment}
                  onChange={(e) => setForm({ ...form, headOfDepartment: e.target.value })}
                  onFocus={() => setFocused('hod')} onBlur={() => setFocused(null)}>
                  <option value="">— None —</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>
                  ))}
                </select>
              </Field>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={closeModal} className="btn btn-outline" disabled={submitting}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting
                    ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%' }} />
                    : editingId ? 'Update Department' : 'Create Department'}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Departments;
