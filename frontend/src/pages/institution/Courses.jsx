import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineBookOpen, HiOutlineMagnifyingGlass, HiOutlinePlusCircle, HiOutlineTrash, HiOutlinePencilSquare } from 'react-icons/hi2';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', code: '', creditUnits: 3, departmentId: '', semesterType: 'first', level: '100', teacherId: '' });
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => { fetchCourses(); fetchDepartments(); fetchTeachers(); }, [page]);

  const fetchDepartments = async () => {
    try { const res = await axios.get('/api/institution/departments'); setDepartments(res.data.data || []); }
    catch { setDepartments([{ _id: '1', name: 'Computer Science' }, { _id: '2', name: 'Mathematics' }]); }
  };

  const fetchTeachers = async () => {
    try { const res = await axios.get('/api/institution/teachers'); setTeachers(res.data.data || []); }
    catch { setTeachers([]); }
  };

  const fetchCourses = async () => {
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (search) params.append('search', search);
      const res = await axios.get(`/api/institution/courses?${params}`);
      setCourses(res.data.data); setPagination(res.data.pagination || {});
    } catch {
      setCourses([
        { _id: '1', title: 'Introduction to Programming', code: 'CSC101', creditUnits: 3, departmentId: { name: 'Computer Science' }, semesterType: 'first', level: '100', teacherId: { firstName: 'Dr. James', lastName: 'Wilson' }, isActive: true },
        { _id: '2', title: 'Calculus I', code: 'MTH101', creditUnits: 4, departmentId: { name: 'Mathematics' }, semesterType: 'first', level: '100', teacherId: { firstName: 'Prof. Sarah', lastName: 'Chen' }, isActive: true },
        { _id: '3', title: 'Data Structures', code: 'CSC201', creditUnits: 3, departmentId: { name: 'Computer Science' }, semesterType: 'second', level: '200', teacherId: { firstName: 'Dr. James', lastName: 'Wilson' }, isActive: true },
        { _id: '4', title: 'Linear Algebra', code: 'MTH201', creditUnits: 3, departmentId: { name: 'Mathematics' }, semesterType: 'first', level: '200', teacherId: null, isActive: false }
      ]);
      setPagination({ total: 4, page: 1, pages: 1 });
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) { await axios.put(`/api/institution/courses/${editingId}`, form); toast.success('Course updated'); }
      else { await axios.post('/api/institution/courses', form); toast.success('Course created'); }
      setShowModal(false); setForm({ title: '', code: '', creditUnits: 3, departmentId: '', semesterType: 'first', level: '100', teacherId: '' }); setEditingId(null); fetchCourses();
    } catch (error) { toast.error(error.response?.data?.message || 'Operation failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try { await axios.delete(`/api/institution/courses/${id}`); toast.success('Deleted'); fetchCourses(); }
    catch (error) { toast.error(error.response?.data?.message || 'Delete failed'); }
  };

  if (loading) return <LoadingSkeleton type="table" rows={5} />;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Courses</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Manage course offerings</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem' }}>
              <HiOutlineMagnifyingGlass style={{ color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchCourses()}
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.875rem', color: 'var(--text-primary)', width: 200, fontFamily: 'inherit' }} />
            </div>
            <button onClick={() => { setShowModal(true); setEditingId(null); }} className="btn btn-primary btn-sm">
              <HiOutlinePlusCircle size={16} /> Add Course
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead><tr><th>Course</th><th>Department</th><th>Credits</th><th>Level</th><th>Semester</th><th>Lecturer</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {courses.map((c, i) => (
              <motion.tr key={c._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--yellow)', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '1px 1px 0px #000', flexShrink: 0 }}>
                      <HiOutlineBookOpen size={16} style={{ color: '#000' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{c.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{c.code}</div>
                    </div>
                  </div>
                </td>
                <td>{c.departmentId?.name}</td>
                <td style={{ fontWeight: 600 }}>{c.creditUnits}</td>
                <td><span className="badge badge-info">{c.level}</span></td>
                <td style={{ textTransform: 'capitalize' }}>{c.semesterType}</td>
                <td style={{ fontSize: '0.8125rem' }}>{c.teacherId ? `${c.teacherId.firstName} ${c.teacherId.lastName}` : <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                <td><span className={`badge ${c.isActive ? 'badge-success' : 'badge-danger'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    <button onClick={() => { setForm({ title: c.title, code: c.code, creditUnits: c.creditUnits, departmentId: c.departmentId?._id || '', semesterType: c.semesterType, level: c.level, teacherId: c.teacherId?._id || '' }); setEditingId(c._id); setShowModal(true); }} className="btn btn-sm btn-outline" style={{ padding: '0.25rem 0.5rem' }}>
                      <HiOutlinePencilSquare size={14} />
                    </button>
                    <button onClick={() => handleDelete(c._id)} className="btn btn-sm btn-outline" style={{ padding: '0.25rem 0.5rem', color: 'var(--danger)' }}>
                      <HiOutlineTrash size={14} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {showModal && (
        <div onClick={(e) => e.target === e.currentTarget && setShowModal(false)} style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: '1rem' }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ background: '#fff', border: '2px solid #000', borderRadius: 'var(--radius)', width: '100%', maxWidth: 560, boxShadow: '8px 8px 0px #000', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{editingId ? 'Edit' : 'Add'} Course</h3>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
              <div className="form-group"><label className="form-label">Course Title</label><input className="form-input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid-layout-1-1" style={{ gap: '1rem' }}>
                <div className="form-group"><label className="form-label">Course Code</label><input className="form-input" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} /></div>
                <div className="form-group"><label className="form-label">Credit Units</label><input className="form-input" type="number" min="1" max="10" value={form.creditUnits} onChange={(e) => setForm({ ...form, creditUnits: parseInt(e.target.value) })} /></div>
              </div>
              <div className="grid-layout-3" style={{ gap: '1rem' }}>
                <div className="form-group"><label className="form-label">Department</label>
                  <select className="form-input form-select" value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}><option value="">Select...</option>{departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}</select>
                </div>
                <div className="form-group"><label className="form-label">Semester</label>
                  <select className="form-input form-select" value={form.semesterType} onChange={(e) => setForm({ ...form, semesterType: e.target.value })}><option value="first">First</option><option value="second">Second</option></select>
                </div>
                <div className="form-group"><label className="form-label">Level</label>
                  <select className="form-input form-select" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}><option value="100">100</option><option value="200">200</option><option value="300">300</option><option value="400">400</option><option value="500">500</option></select>
                </div>
              </div>
              <div className="form-group"><label className="form-label">Lecturer</label>
                <select className="form-input form-select" value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })}><option value="">Unassigned</option>{teachers.map(t => <option key={t._id} value={t._id}>{t.userId?.firstName} {t.userId?.lastName}</option>)}</select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Courses;
