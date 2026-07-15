import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineBookOpen, HiOutlineMagnifyingGlass, HiOutlinePlusCircle,
  HiOutlineTrash, HiOutlinePencilSquare, HiOutlineXMark,
} from 'react-icons/hi2';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

/* ── shared field wrapper ── */
const Field = ({ label, required, hint, children, style }) => (
  <div style={{ marginBottom: '1rem', ...style }}>
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

const LEVELS = [100, 200, 300, 400, 500, 600, 700];
const SEMESTERS = [{ value: 'first', label: 'First Semester' }, { value: 'second', label: 'Second Semester' }, { value: 'third', label: 'Third Semester' }];

const blankForm = { title: '', code: '', creditUnits: 3, departmentId: '', semesterType: 'first', level: 100, teacherId: '', description: '' };

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(blankForm);
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [focused, setFocused] = useState(null);

  useEffect(() => { fetchCourses(); }, [page, deptFilter]);
  useEffect(() => { fetchDepartments(); fetchTeachers(); }, []);

  const fetchDepartments = async () => {
    try { const res = await axios.get('/api/institution/departments'); setDepartments(res.data.data || []); }
    catch { setDepartments([]); }
  };

  const fetchTeachers = async () => {
    try { const res = await axios.get('/api/institution/teachers?limit=200'); setTeachers(res.data.data || []); }
    catch { setTeachers([]); }
  };

  const fetchCourses = async () => {
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (search) params.append('search', search);
      if (deptFilter) params.append('departmentId', deptFilter);
      const res = await axios.get(`/api/institution/courses?${params}`);
      setCourses(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch { setCourses([]); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setForm(blankForm); setEditingId(null); setShowModal(true); };
  const openEdit = (c) => {
    setForm({
      title: c.title || '', code: c.code || '',
      creditUnits: c.creditUnits || 3,
      departmentId: c.departmentId?._id || '',
      semesterType: c.semesterType || 'first',
      level: Number(c.level) || 100,
      teacherId: c.teacherId?._id || '',
      description: c.description || '',
    });
    setEditingId(c._id);
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditingId(null); setForm(blankForm); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Course title is required'); return; }
    if (!form.code.trim()) { toast.error('Course code is required'); return; }
    if (!form.departmentId) { toast.error('Please select a department'); return; }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        teacherId: form.teacherId || null,
        level: Number(form.level),
        creditUnits: Number(form.creditUnits),
      };
      if (editingId) {
        await axios.put(`/api/institution/courses/${editingId}`, payload);
        toast.success('Course updated');
      } else {
        await axios.post('/api/institution/courses', payload);
        toast.success('Course created');
      }
      closeModal();
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try { await axios.delete(`/api/institution/courses/${id}`); toast.success('Course deleted'); fetchCourses(); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const inp = (name) => ({ ...baseInput, ...(focused === name ? focusInput : {}) });

  if (loading) return <LoadingSkeleton type="table" rows={5} />;

  return (
    <div>
      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Courses</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Manage course offerings · {pagination.total ?? courses.length} total
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', border: '2px solid #000', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', boxShadow: '2px 2px 0px #000' }}>
              <HiOutlineMagnifyingGlass style={{ color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Search courses…" value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchCourses()}
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.875rem', color: 'var(--text-primary)', width: 160, fontFamily: 'inherit' }} />
            </div>
            {/* Dept filter */}
            <select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
              style={{ ...baseInput, width: 'auto', minWidth: 140, padding: '0.5rem 2rem 0.5rem 0.75rem', cursor: 'pointer', boxShadow: '2px 2px 0px #000' }}>
              <option value="">All Depts</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
            <button onClick={openAdd} className="btn btn-primary btn-sm">
              <HiOutlinePlusCircle size={16} /> Add Course
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Table ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Course</th><th>Department</th><th>Credits</th>
                <th>Level</th><th>Semester</th><th>Lecturer</th>
                <th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No courses found</td></tr>
              ) : courses.map((c, i) => (
                <motion.tr key={c._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '0.375rem', background: '#ffe17c', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '1px 1px 0px #000', flexShrink: 0 }}>
                        <HiOutlineBookOpen size={16} style={{ color: '#000' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{c.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{c.code}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8125rem' }}>{c.departmentId?.name || '—'}</td>
                  <td style={{ fontWeight: 700, fontFamily: "'Cabinet Grotesk',sans-serif" }}>{c.creditUnits}</td>
                  <td><span className="badge badge-info">{c.level}</span></td>
                  <td style={{ textTransform: 'capitalize', fontSize: '0.8125rem' }}>{c.semesterType}</td>
                  <td style={{ fontSize: '0.8125rem' }}>
                    {c.teacherId
                      ? `${c.teacherId.firstName} ${c.teacherId.lastName}`
                      : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>}
                  </td>
                  <td><span className={`badge ${c.isActive ? 'badge-success' : 'badge-danger'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button onClick={() => openEdit(c)} className="btn btn-sm btn-outline" style={{ padding: '0.25rem 0.5rem' }} title="Edit">
                        <HiOutlinePencilSquare size={14} />
                      </button>
                      <button onClick={() => handleDelete(c._id, c.title)} className="btn btn-sm btn-outline" style={{ padding: '0.25rem 0.5rem', color: '#dc2626', borderColor: '#dc2626' }} title="Delete">
                        <HiOutlineTrash size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Page {pagination.page} of {pagination.pages} · {pagination.total} courses</span>
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
              style={{ background: '#fff', border: '2px solid #000', borderRadius: '0.875rem', width: '100%', maxWidth: 560, boxShadow: '8px 8px 0px #000', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

              {/* Header */}
              <div style={{ padding: '1.125rem 1.5rem', borderBottom: '2px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffe17c', flexShrink: 0 }}>
                <h3 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '1rem', fontWeight: 800 }}>
                  {editingId ? 'Edit Course' : 'Add Course'}
                </h3>
                <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#000', display: 'flex', padding: 4 }}>
                  <HiOutlineXMark size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: '1.5rem', overflowY: 'auto' }}>
                {/* Title */}
                <Field label="Course Title" required>
                  <input style={inp('title')} placeholder="e.g. Introduction to Programming"
                    value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    onFocus={() => setFocused('title')} onBlur={() => setFocused(null)} required autoFocus />
                </Field>

                {/* Code + Credits side by side */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Field label="Course Code" required>
                    <input style={inp('code')} placeholder="e.g. CSC101"
                      value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      onFocus={() => setFocused('code')} onBlur={() => setFocused(null)} required />
                  </Field>
                  <Field label="Credit Units" required>
                    <input style={inp('cu')} type="number" min={1} max={12}
                      value={form.creditUnits} onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') { setForm({ ...form, creditUnits: '' }); return; }
                        const num = parseInt(val);
                        if (!isNaN(num)) setForm({ ...form, creditUnits: Math.max(1, Math.min(12, num)) });
                      }}
                      onBlur={() => { setFocused(null); if (form.creditUnits === '' || isNaN(form.creditUnits)) setForm(f => ({ ...f, creditUnits: 1 })); }}
                      onFocus={() => setFocused('cu')} required />
                  </Field>
                </div>

                {/* Department */}
                <Field label="Department" required>
                  <select style={{ ...inp('dept'), cursor: 'pointer' }} value={form.departmentId}
                    onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                    onFocus={() => setFocused('dept')} onBlur={() => setFocused(null)} required>
                    <option value="">— Select a department —</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.name} ({d.code})</option>)}
                  </select>
                </Field>

                {/* Semester + Level side by side */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Field label="Semester" required>
                    <select style={{ ...inp('sem'), cursor: 'pointer' }} value={form.semesterType}
                      onChange={(e) => setForm({ ...form, semesterType: e.target.value })}
                      onFocus={() => setFocused('sem')} onBlur={() => setFocused(null)}>
                      {SEMESTERS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Level" required>
                    <select style={{ ...inp('level'), cursor: 'pointer' }} value={form.level}
                      onChange={(e) => setForm({ ...form, level: Number(e.target.value) })}
                      onFocus={() => setFocused('level')} onBlur={() => setFocused(null)}>
                      {LEVELS.map(l => <option key={l} value={l}>{l} Level</option>)}
                    </select>
                  </Field>
                </div>

                {/* Lecturer */}
                <Field label="Assigned Lecturer" hint="Optional — you can assign a lecturer later">
                  <select style={{ ...inp('teacher'), cursor: 'pointer' }} value={form.teacherId}
                    onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
                    onFocus={() => setFocused('teacher')} onBlur={() => setFocused(null)}>
                    <option value="">— Unassigned —</option>
                    {teachers.map(t => <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>)}
                  </select>
                </Field>

                {/* Description */}
                <Field label="Description">
                  <textarea style={{ ...inp('desc'), resize: 'vertical', minHeight: 64 }}
                    placeholder="Brief course description (optional)"
                    value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    onFocus={() => setFocused('desc')} onBlur={() => setFocused(null)} />
                </Field>

                {/* Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.25rem' }}>
                  <button type="button" onClick={closeModal} className="btn btn-outline" disabled={submitting}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting
                      ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                          style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%' }} />
                      : editingId ? 'Update Course' : 'Create Course'}
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

export default Courses;
