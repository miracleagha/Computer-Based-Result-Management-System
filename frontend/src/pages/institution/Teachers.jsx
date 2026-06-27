import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineUserGroup, HiOutlineMagnifyingGlass, HiOutlinePlusCircle, HiOutlineTrash, HiOutlinePencilSquare } from 'react-icons/hi2';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', departmentId: '' });
  const [departments, setDepartments] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { fetchTeachers(); fetchDepartments(); }, [page]);

  const fetchDepartments = async () => {
    try { const res = await axios.get('/api/institution/departments'); setDepartments(res.data.data || []); }
    catch { setDepartments([{ _id: '1', name: 'Computer Science' }, { _id: '2', name: 'Mathematics' }]); }
  };

  const fetchTeachers = async () => {
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (search) params.append('search', search);
      const res = await axios.get(`/api/institution/teachers?${params}`);
      setTeachers(res.data.data); setPagination(res.data.pagination || {});
    } catch {
      setTeachers([
        { _id: '1', userId: { firstName: 'Dr. James', lastName: 'Wilson', email: 'jwilson@university.edu' }, departmentId: { name: 'Computer Science' }, coursesCount: 4, isActive: true },
        { _id: '2', userId: { firstName: 'Prof. Sarah', lastName: 'Chen', email: 'schen@university.edu' }, departmentId: { name: 'Mathematics' }, coursesCount: 3, isActive: true },
        { _id: '3', userId: { firstName: 'Dr. Michael', lastName: 'Brown', email: 'mbrown@university.edu' }, departmentId: { name: 'Physics' }, coursesCount: 2, isActive: false }
      ]);
      setPagination({ total: 3, page: 1, pages: 1 });
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) { await axios.put(`/api/institution/teachers/${editingId}`, form); toast.success('Teacher updated'); }
      else { await axios.post('/api/institution/teachers', form); toast.success('Teacher created'); }
      setShowModal(false); setForm({ firstName: '', lastName: '', email: '', departmentId: '' }); setEditingId(null); fetchTeachers();
    } catch (error) { toast.error(error.response?.data?.message || 'Operation failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this teacher?')) return;
    try { await axios.delete(`/api/institution/teachers/${id}`); toast.success('Teacher deleted'); fetchTeachers(); }
    catch (error) { toast.error(error.response?.data?.message || 'Delete failed'); }
  };

  if (loading) return <LoadingSkeleton type="table" rows={5} />;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>Teachers</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Manage teaching staff</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem' }}>
              <HiOutlineMagnifyingGlass style={{ color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Search teachers..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchTeachers()}
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.875rem', color: 'var(--text-primary)', width: 200, fontFamily: 'inherit' }} />
            </div>
            <button onClick={() => { setShowModal(true); setEditingId(null); setForm({ firstName: '', lastName: '', email: '', departmentId: '' }); }} className="btn btn-primary btn-sm">
              <HiOutlinePlusCircle size={16} /> Add Teacher
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead><tr><th>Teacher</th><th>Department</th><th>Courses</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {teachers.map((t, i) => (
              <motion.tr key={t._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--yellow)', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 800, fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '0.75rem', boxShadow: '1px 1px 0px #000' }}>
                      {t.userId?.firstName?.charAt(0)}{t.userId?.lastName?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{t.userId?.firstName} {t.userId?.lastName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.userId?.email}</div>
                    </div>
                  </div>
                </td>
                <td>{t.departmentId?.name}</td>
                <td style={{ fontWeight: 600 }}>{t.coursesCount || 0}</td>
                <td><span className={`badge ${t.isActive !== false ? 'badge-success' : 'badge-danger'}`}>{t.isActive !== false ? 'Active' : 'Inactive'}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    <button onClick={() => { setForm({ firstName: t.userId?.firstName, lastName: t.userId?.lastName, email: t.userId?.email, departmentId: t.departmentId?._id || '' }); setEditingId(t._id); setShowModal(true); }} className="btn btn-sm btn-outline" style={{ padding: '0.25rem 0.5rem' }}>
                      <HiOutlinePencilSquare size={14} />
                    </button>
                    <button onClick={() => handleDelete(t._id)} className="btn btn-sm btn-outline" style={{ padding: '0.25rem 0.5rem', color: 'var(--danger)' }}>
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
            style={{ background: '#fff', border: '2px solid #000', borderRadius: 'var(--radius)', width: '100%', maxWidth: 500, boxShadow: '8px 8px 0px #000', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{editingId ? 'Edit Teacher' : 'Add New Teacher'}</h3>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
              <div className="grid-layout-1-1" style={{ gap: '1rem' }}>
                <div className="form-group"><label className="form-label">First Name</label><input className="form-input" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Last Name</label><input className="form-input" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
              </div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Department</label>
                <select className="form-input form-select" value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}>
                  <option value="">Select...</option>{departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
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

export default Teachers;
