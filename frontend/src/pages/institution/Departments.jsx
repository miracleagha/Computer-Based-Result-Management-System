import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineBuildingOffice, HiOutlinePlusCircle, HiOutlineTrash, HiOutlinePencilSquare } from 'react-icons/hi2';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', headOfDepartment: '' });
  const [editingId, setEditingId] = useState(null);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => { fetchDepartments(); fetchTeachers(); }, []);

  const fetchTeachers = async () => {
    try { const res = await axios.get('/api/institution/teachers'); setTeachers(res.data.data || []); }
    catch { setTeachers([]); }
  };

  const fetchDepartments = async () => {
    try { const res = await axios.get('/api/institution/departments'); setDepartments(res.data.data || []); }
    catch {
      setDepartments([
        { _id: '1', name: 'Computer Science', code: 'CSC', headOfDepartment: { firstName: 'Dr. James', lastName: 'Wilson' }, courseCount: 24, studentCount: 180, isActive: true },
        { _id: '2', name: 'Mathematics', code: 'MTH', headOfDepartment: { firstName: 'Prof. Sarah', lastName: 'Chen' }, courseCount: 18, studentCount: 120, isActive: true },
        { _id: '3', name: 'Physics', code: 'PHY', headOfDepartment: null, courseCount: 15, studentCount: 95, isActive: true },
        { _id: '4', name: 'Chemistry', code: 'CHM', headOfDepartment: { firstName: 'Dr. Alice', lastName: 'Brown' }, courseCount: 12, studentCount: 75, isActive: false }
      ]);
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) { await axios.put(`/api/institution/departments/${editingId}`, form); toast.success('Department updated'); }
      else { await axios.post('/api/institution/departments', form); toast.success('Department created'); }
      setShowModal(false); setForm({ name: '', code: '', headOfDepartment: '' }); setEditingId(null); fetchDepartments();
    } catch (error) { toast.error(error.response?.data?.message || 'Operation failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    try { await axios.delete(`/api/institution/departments/${id}`); toast.success('Deleted'); fetchDepartments(); }
    catch (error) { toast.error(error.response?.data?.message || 'Delete failed'); }
  };

  if (loading) return <LoadingSkeleton type="table" rows={4} />;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Departments</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Manage academic departments</p>
          </div>
          <button onClick={() => { setShowModal(true); setEditingId(null); setForm({ name: '', code: '', headOfDepartment: '' }); }} className="btn btn-primary btn-sm">
            <HiOutlinePlusCircle size={16} /> Add Department
          </button>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {departments.map((dept, i) => (
          <motion.div key={dept._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="card" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', background: 'var(--yellow)', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '2px 2px 0px #000', flexShrink: 0 }}>
                  <HiOutlineBuildingOffice size={20} style={{ color: '#000' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{dept.name}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{dept.code}</span>
                </div>
              </div>
              <span className={`badge ${dept.isActive !== false ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.6875rem' }}>
                {dept.isActive !== false ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="grid-layout-1-1" style={{ gap: '0.5rem', marginTop: '1rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: '#fff', border: '2px solid #000', boxShadow: '2px 2px 0px #000', textAlign: 'center' }}>
                <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Cabinet Grotesk', sans-serif" }}>{dept.courseCount || 0}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Courses</div>
              </div>
              <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: '#fff', border: '2px solid #000', boxShadow: '2px 2px 0px #000', textAlign: 'center' }}>
                <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Cabinet Grotesk', sans-serif" }}>{dept.studentCount || 0}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Students</div>
              </div>
            </div>
            {dept.headOfDepartment && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--text-muted)' }}>HOD:</span> {dept.headOfDepartment.firstName} {dept.headOfDepartment.lastName}
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.75rem' }}>
              <button onClick={() => { setForm({ name: dept.name, code: dept.code, headOfDepartment: '' }); setEditingId(dept._id); setShowModal(true); }} className="btn btn-sm btn-outline" style={{ flex: 1 }}>
                <HiOutlinePencilSquare size={14} /> Edit
              </button>
              <button onClick={() => handleDelete(dept._id)} className="btn btn-sm btn-outline" style={{ color: 'var(--danger)' }}>
                <HiOutlineTrash size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div onClick={(e) => e.target === e.currentTarget && setShowModal(false)} style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: '1rem' }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: '#fff', borderRadius: 'var(--radius)', border: '2px solid #000', width: '100%', maxWidth: 480, boxShadow: '8px 8px 0px #000', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{editingId ? 'Edit' : 'Add'} Department</h3>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
              <div className="form-group"><label className="form-label">Department Name</label><input className="form-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Computer Science" /></div>
              <div className="form-group"><label className="form-label">Code</label><input className="form-input" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g., CSC" /></div>
              <div className="form-group"><label className="form-label">Head of Department</label>
                <select className="form-input form-select" value={form.headOfDepartment} onChange={(e) => setForm({ ...form, headOfDepartment: e.target.value })}>
                  <option value="">Select (Optional)</option>{teachers.map(t => <option key={t._id} value={t._id}>{t.userId?.firstName} {t.userId?.lastName}</option>)}
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

export default Departments;
