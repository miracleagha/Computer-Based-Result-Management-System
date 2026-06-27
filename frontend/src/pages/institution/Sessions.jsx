import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineCalendarDays, HiOutlinePlusCircle, HiOutlinePencilSquare, HiOutlineTrash, HiOutlineCheckCircle } from 'react-icons/hi2';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '' });
  const [editingId, setEditingId] = useState(null);
  const [showSemesterModal, setShowSemesterModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [semesterForm, setSemesterForm] = useState({ name: 'First Semester', startDate: '', endDate: '', registrationDeadline: '' });

  useEffect(() => { fetchSessions(); }, []);

  const fetchSessions = async () => {
    try { const res = await axios.get('/api/institution/sessions'); setSessions(res.data.data || []); }
    catch {
      setSessions([
        { _id: '1', name: '2024/2025', startDate: '2024-09-01', endDate: '2025-08-31', isActive: true, semesters: [
          { _id: 's1', name: 'First Semester', startDate: '2024-09-01', endDate: '2025-02-28', isActive: false },
          { _id: 's2', name: 'Second Semester', startDate: '2025-03-01', endDate: '2025-08-31', isActive: true }
        ]},
        { _id: '2', name: '2025/2026', startDate: '2025-09-01', endDate: '2026-08-31', isActive: false, semesters: [
          { _id: 's3', name: 'First Semester', startDate: '2025-09-01', endDate: '2026-02-28', isActive: false }
        ]},
        { _id: '3', name: '2023/2024', startDate: '2023-09-01', endDate: '2024-08-31', isActive: false, semesters: [
          { _id: 's4', name: 'First Semester', startDate: '2023-09-01', endDate: '2024-02-28', isActive: false },
          { _id: 's5', name: 'Second Semester', startDate: '2024-03-01', endDate: '2024-08-31', isActive: false }
        ]}
      ]);
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) { await axios.put(`/api/institution/sessions/${editingId}`, form); toast.success('Session updated'); }
      else { await axios.post('/api/institution/sessions', form); toast.success('Session created'); }
      setShowModal(false); setForm({ name: '', startDate: '', endDate: '' }); setEditingId(null); fetchSessions();
    } catch (error) { toast.error(error.response?.data?.message || 'Operation failed'); }
  };

  const handleAddSemester = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/institution/sessions/${selectedSession}/semesters`, semesterForm);
      toast.success('Semester added');
      setShowSemesterModal(false); fetchSessions();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to add semester'); }
  };

  const setActive = async (sessionId) => {
    try { await axios.put(`/api/institution/sessions/${sessionId}/activate`); toast.success('Session activated'); fetchSessions(); }
    catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  if (loading) return <LoadingSkeleton type="table" rows={3} />;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Academic Sessions</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Manage sessions and semesters</p>
          </div>
          <button onClick={() => { setShowModal(true); setEditingId(null); setForm({ name: '', startDate: '', endDate: '' }); }} className="btn btn-primary btn-sm">
            <HiOutlinePlusCircle size={16} /> New Session
          </button>
        </div>
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {sessions.map((session, i) => (
          <motion.div key={session._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', background: session.isActive ? 'var(--yellow)' : '#fff', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '2px 2px 0px #000', flexShrink: 0 }}>
                  <HiOutlineCalendarDays size={20} style={{ color: '#000' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{session.name}</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {new Date(session.startDate).toLocaleDateString()} — {new Date(session.endDate).toLocaleDateString()}
                  </p>
                </div>
                {session.isActive && <span className="badge badge-success" style={{ marginLeft: '0.5rem' }}>Current</span>}
              </div>
              <div style={{ display: 'flex', gap: '0.375rem' }}>
                {!session.isActive && (
                  <button onClick={() => setActive(session._id)} className="btn btn-sm btn-secondary" style={{ fontSize: '0.75rem' }}>
                    <HiOutlineCheckCircle size={14} /> Set Active
                  </button>
                )}
                <button onClick={() => { setSelectedSession(session._id); setShowSemesterModal(true); }} className="btn btn-sm btn-outline" style={{ fontSize: '0.75rem' }}>
                  <HiOutlinePlusCircle size={14} /> Semester
                </button>
                <button onClick={() => { setForm({ name: session.name, startDate: session.startDate?.split('T')[0], endDate: session.endDate?.split('T')[0] }); setEditingId(session._id); setShowModal(true); }} className="btn btn-sm btn-outline" style={{ padding: '0.25rem 0.5rem' }}>
                  <HiOutlinePencilSquare size={14} />
                </button>
              </div>
            </div>

            {session.semesters?.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem' }}>
                {session.semesters.map((sem) => (
                  <div key={sem._id} style={{ padding: '0.875rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-primary)', border: `1px solid ${sem.isActive ? 'var(--secondary)' : 'var(--border-light)'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{sem.name}</span>
                      {sem.isActive && <span className="badge badge-success" style={{ fontSize: '0.625rem', padding: '0.125rem 0.5rem' }}>Active</span>}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {new Date(sem.startDate).toLocaleDateString()} — {new Date(sem.endDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Session Modal */}
      {showModal && (
        <div onClick={(e) => e.target === e.currentTarget && setShowModal(false)} style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: '1rem' }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: '#fff', borderRadius: 'var(--radius)', border: '2px solid #000', width: '100%', maxWidth: 480, boxShadow: '8px 8px 0px #000', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}><h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{editingId ? 'Edit' : 'New'} Session</h3></div>
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
              <div className="form-group"><label className="form-label">Session Name</label><input className="form-input" required placeholder="e.g., 2025/2026" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid-layout-1-1" style={{ gap: '1rem' }}>
                <div className="form-group"><label className="form-label">Start Date</label><input className="form-input" type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">End Date</label><input className="form-input" type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Semester Modal */}
      {showSemesterModal && (
        <div onClick={(e) => e.target === e.currentTarget && setShowSemesterModal(false)} style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: '1rem' }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: '#fff', borderRadius: 'var(--radius)', border: '2px solid #000', width: '100%', maxWidth: 480, boxShadow: '8px 8px 0px #000', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}><h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Add Semester</h3></div>
            <form onSubmit={handleAddSemester} style={{ padding: '1.5rem' }}>
              <div className="form-group"><label className="form-label">Semester Name</label>
                <select className="form-input form-select" value={semesterForm.name} onChange={(e) => setSemesterForm({ ...semesterForm, name: e.target.value })}>
                  <option>First Semester</option><option>Second Semester</option>
                </select>
              </div>
              <div className="grid-layout-1-1" style={{ gap: '1rem' }}>
                <div className="form-group"><label className="form-label">Start Date</label><input className="form-input" type="date" required value={semesterForm.startDate} onChange={(e) => setSemesterForm({ ...semesterForm, startDate: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">End Date</label><input className="form-input" type="date" required value={semesterForm.endDate} onChange={(e) => setSemesterForm({ ...semesterForm, endDate: e.target.value })} /></div>
              </div>
              <div className="form-group"><label className="form-label">Registration Deadline</label><input className="form-input" type="date" value={semesterForm.registrationDeadline} onChange={(e) => setSemesterForm({ ...semesterForm, registrationDeadline: e.target.value })} /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowSemesterModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Add Semester</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Sessions;
