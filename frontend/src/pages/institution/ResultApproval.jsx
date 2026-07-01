import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineEye, HiOutlineDocumentText } from 'react-icons/hi2';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

const ResultApproval = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectId, setRejectId] = useState(null);

  useEffect(() => { fetchResults(); }, []);

  const fetchResults = async () => {
    try {
      const res = await axios.get('/api/institution/results?status=submitted');
      setResults(res.data.data || []);
    } catch {
      setResults([]);
    } finally { setLoading(false); }
  };

  const handleApprove = async (batch) => {
    try {
      await axios.post('/api/institution/results/bulk-approve', {
        courseId: batch.courseId?._id,
        semesterId: batch.semesterId?._id,
        sessionId: batch.sessionId?._id,
        resultIds: batch.resultIds
      });
      toast.success('Results approved — students notified');
      fetchResults();
    } catch (error) { toast.error(error.response?.data?.message || 'Approval failed'); }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) { toast.error('Reason required'); return; }
    try {
      const batch = results.find(r => r._id === rejectId);
      if (!batch) throw new Error('Batch not found');
      await axios.post('/api/institution/results/bulk-reject', {
        courseId: batch.courseId?._id,
        semesterId: batch.semesterId?._id,
        sessionId: batch.sessionId?._id,
        resultIds: batch.resultIds,
        reason: rejectionReason
      });
      toast.success('Results rejected');
      setShowRejectModal(false); setRejectionReason(''); setRejectId(null); fetchResults();
    } catch (error) { toast.error(error.response?.data?.message || 'Rejection failed'); }
  };

  if (loading) return <LoadingSkeleton type="table" rows={3} />;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Result Approval</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Review and approve submitted results</p>
      </motion.div>

      {results.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h3 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>All Clear!</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>No pending results to approve</p>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {results.map((result, i) => (
            <motion.div key={result._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', background: 'var(--yellow)', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '2px 2px 0px #000', flexShrink: 0 }}>
                    <HiOutlineDocumentText size={22} style={{ color: '#000' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{result.courseId?.title}</h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                      {result.courseId?.code} • {result.semesterId?.name} • {result.sessionId?.name}
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', fontSize: '0.8125rem' }}>
                      <div><span style={{ color: 'var(--text-muted)' }}>Lecturer:</span> <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{result.teacherId?.firstName} {result.teacherId?.lastName}</span></div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Students:</span> <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{result.studentsCount}</span></div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Avg Score:</span> <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{result.avgScore?.toFixed(1)}</span></div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Submitted:</span> <span style={{ color: 'var(--text-secondary)' }}>{new Date(result.submittedAt).toLocaleDateString()}</span></div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleApprove(result)} className="btn btn-sm btn-secondary">
                    <HiOutlineCheckCircle size={16} /> Approve
                  </button>
                  <button onClick={() => { setRejectId(result._id); setShowRejectModal(true); }} className="btn btn-sm btn-danger">
                    <HiOutlineXCircle size={16} /> Reject
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showRejectModal && (
        <div onClick={(e) => e.target === e.currentTarget && setShowRejectModal(false)} style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: '1rem' }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: '#fff', borderRadius: 'var(--radius)', border: '2px solid #000', width: '100%', maxWidth: 480, boxShadow: '8px 8px 0px #000', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}><h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Reject Results</h3></div>
            <div style={{ padding: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Reason for Rejection</label>
                <textarea className="form-input" rows={4} required value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Provide a reason for rejecting these results..." style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button onClick={() => setShowRejectModal(false)} className="btn btn-outline">Cancel</button>
                <button onClick={handleReject} className="btn btn-danger" disabled={!rejectionReason.trim()}>Reject Results</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ResultApproval;
