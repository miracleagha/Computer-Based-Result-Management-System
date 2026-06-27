import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineAcademicCap,
  HiOutlineMagnifyingGlass,
  HiOutlinePlusCircle,
  HiOutlineTrash,
  HiOutlinePencilSquare,
  HiOutlineEye,
  HiOutlineArrowUpTray
} from 'react-icons/hi2';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', level: '100', departmentId: '' });
  const [departments, setDepartments] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { fetchStudents(); fetchDepartments(); }, [page, levelFilter]);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get('/api/institution/departments');
      setDepartments(res.data.data || []);
    } catch { setDepartments([{ _id: '1', name: 'Computer Science' }, { _id: '2', name: 'Mathematics' }, { _id: '3', name: 'Physics' }]); }
  };

  const fetchStudents = async () => {
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (levelFilter) params.append('level', levelFilter);
      if (search) params.append('search', search);
      const res = await axios.get(`/api/institution/students?${params}`);
      setStudents(res.data.data);
      setPagination(res.data.pagination || {});
    } catch {
      setStudents([
        { _id: '1', userId: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' }, matricNumber: 'CSC/2024/001', level: '100', departmentId: { name: 'Computer Science' }, status: 'active', enrollmentDate: '2024-09-01' },
        { _id: '2', userId: { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' }, matricNumber: 'MTH/2024/005', level: '200', departmentId: { name: 'Mathematics' }, status: 'active', enrollmentDate: '2023-09-01' },
        { _id: '3', userId: { firstName: 'Mike', lastName: 'Johnson', email: 'mike@example.com' }, matricNumber: 'PHY/2024/012', level: '300', departmentId: { name: 'Physics' }, status: 'active', enrollmentDate: '2022-09-01' },
        { _id: '4', userId: { firstName: 'Sarah', lastName: 'Williams', email: 'sarah@example.com' }, matricNumber: 'CSC/2024/008', level: '100', departmentId: { name: 'Computer Science' }, status: 'suspended', enrollmentDate: '2024-09-01' }
      ]);
      setPagination({ total: 4, page: 1, pages: 1 });
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/api/institution/students/${editingId}`, form);
        toast.success('Student updated successfully');
      } else {
        await axios.post('/api/institution/students', form);
        toast.success('Student created successfully');
      }
      setShowAddModal(false);
      setForm({ firstName: '', lastName: '', email: '', level: '100', departmentId: '' });
      setEditingId(null);
      fetchStudents();
    } catch (error) { toast.error(error.response?.data?.message || 'Operation failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    try {
      await axios.delete(`/api/institution/students/${id}`);
      toast.success('Student deleted');
      fetchStudents();
    } catch (error) { toast.error(error.response?.data?.message || 'Delete failed'); }
  };

  const handleEdit = (student) => {
    setForm({
      firstName: student.userId?.firstName || '',
      lastName: student.userId?.lastName || '',
      email: student.userId?.email || '',
      level: student.level || '100',
      departmentId: student.departmentId?._id || ''
    });
    setEditingId(student._id);
    setShowAddModal(true);
  };

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
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Manage student records and enrollment</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem' }}>
              <HiOutlineMagnifyingGlass style={{ color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchStudents()}
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.875rem', color: 'var(--text-primary)', width: 200, fontFamily: 'inherit' }} />
            </div>
            <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="form-input form-select" style={{ width: 'auto', padding: '0.5rem 2.5rem 0.5rem 0.75rem' }}>
              <option value="">All Levels</option>
              <option value="100">100 Level</option>
              <option value="200">200 Level</option>
              <option value="300">300 Level</option>
              <option value="400">400 Level</option>
              <option value="500">500 Level</option>
            </select>
            <button onClick={() => { setShowAddModal(true); setEditingId(null); setForm({ firstName: '', lastName: '', email: '', level: '100', departmentId: '' }); }} className="btn btn-primary btn-sm">
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
                <th>Student</th>
                <th>Matric No.</th>
                <th>Department</th>
                <th>Level</th>
                <th>Status</th>
                <th>Enrolled</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <motion.tr key={s._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--yellow)', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 800, fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '0.75rem', boxShadow: '1px 1px 0px #000' }}>
                        {s.userId?.firstName?.charAt(0)}{s.userId?.lastName?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{s.userId?.firstName} {s.userId?.lastName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.userId?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8125rem' }}>{s.matricNumber}</td>
                  <td>{s.departmentId?.name}</td>
                  <td><span className="badge badge-info">{s.level} Level</span></td>
                  <td><span className={`badge ${statusBadge(s.status)}`}>{s.status}</span></td>
                  <td style={{ fontSize: '0.8125rem' }}>{new Date(s.enrollmentDate).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button onClick={() => handleEdit(s)} className="btn btn-sm btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                        <HiOutlinePencilSquare size={14} />
                      </button>
                      <button onClick={() => handleDelete(s._id)} className="btn btn-sm btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--danger)' }}>
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
              <button className="btn btn-sm btn-outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
              <button className="btn btn-sm btn-outline" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)} style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: '1rem' }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ background: '#fff', border: '2px solid #000', borderRadius: 'var(--radius)', width: '100%', maxWidth: 500, boxShadow: '8px 8px 0px #000', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{editingId ? 'Edit Student' : 'Add New Student'}</h3>
              <button onClick={() => setShowAddModal(false)} className="btn btn-sm btn-outline" style={{ padding: '0.25rem 0.5rem' }}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
              <div className="grid-layout-1-1" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input className="form-input" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input className="form-input" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="grid-layout-1-1" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Level</label>
                  <select className="form-input form-select" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                    <option value="100">100</option><option value="200">200</option><option value="300">300</option>
                    <option value="400">400</option><option value="500">500</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select className="form-input form-select" value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}>
                    <option value="">Select...</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Create'} Student</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Students;
