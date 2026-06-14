import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineClock } from 'react-icons/hi2';
import axios from '../api/axios';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => { fetchLogs(); }, [page, actionFilter]);

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (actionFilter) params.append('action', actionFilter);
      const res = await axios.get(`/api/admin/audit-logs?${params}`);
      setLogs(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      setLogs([
        { _id: '1', action: 'LOGIN', entity: 'User', description: 'Admin logged in successfully', ipAddress: '192.168.1.1', createdAt: new Date().toISOString(), userId: { firstName: 'Super', lastName: 'Admin', email: 'admin@resultmanager.com', role: 'admin' } },
        { _id: '2', action: 'INSTITUTION_STATUS_CHANGE', entity: 'Institution', description: 'UNILAG approved', ipAddress: '192.168.1.1', createdAt: new Date(Date.now() - 3600000).toISOString(), userId: { firstName: 'Super', lastName: 'Admin', email: 'admin@resultmanager.com', role: 'admin' } },
        { _id: '3', action: 'STUDENT_CREATE', entity: 'Student', description: '15 students bulk created', ipAddress: '10.0.0.5', createdAt: new Date(Date.now() - 7200000).toISOString(), userId: { firstName: 'John', lastName: 'Doe', email: 'john@unilag.edu.ng', role: 'institution' } },
        { _id: '4', action: 'RESULT_APPROVE', entity: 'Result', description: 'CSC301 results approved', ipAddress: '10.0.0.12', createdAt: new Date(Date.now() - 14400000).toISOString(), userId: { firstName: 'John', lastName: 'Doe', email: 'john@unilag.edu.ng', role: 'institution' } },
        { _id: '5', action: 'GRADE_MODIFY', entity: 'Result', description: 'Grade changed from B to A for student S001', ipAddress: '10.0.0.8', createdAt: new Date(Date.now() - 28800000).toISOString(), userId: { firstName: 'Prof. Sarah', lastName: 'Williams', email: 'sarah@unilag.edu.ng', role: 'teacher' }, oldValue: { grade: 'B', score: 65 }, newValue: { grade: 'A', score: 75 } },
        { _id: '6', action: 'PASSWORD_CHANGE', entity: 'User', description: 'Password changed', ipAddress: '172.16.0.1', createdAt: new Date(Date.now() - 43200000).toISOString(), userId: { firstName: 'Miracle', lastName: 'Johnson', email: 'miracle@student.unilag.edu.ng', role: 'student' } },
      ]);
      setPagination({ total: 6, page: 1, pages: 1 });
    } finally {
      setLoading(false);
    }
  };

  const actionChip = (action) => {
    const map = {
      LOGIN: { bg: '#dbeafe', color: '#1e40af', border: '#1e40af' },
      LOGOUT: { bg: '#b7c6c2', color: '#000', border: '#000' },
      PASSWORD_CHANGE: { bg: '#ffe17c', color: '#000', border: '#000' },
      PASSWORD_RESET: { bg: '#ffe17c', color: '#000', border: '#000' },
      USER_CREATE: { bg: '#dcfce7', color: '#166534', border: '#166534' },
      INSTITUTION_CREATE: { bg: '#dcfce7', color: '#166534', border: '#166534' },
      INSTITUTION_STATUS_CHANGE: { bg: '#ffe17c', color: '#000', border: '#000' },
      STUDENT_CREATE: { bg: '#dcfce7', color: '#166534', border: '#166534' },
      RESULT_APPROVE: { bg: '#dcfce7', color: '#166534', border: '#166534' },
      RESULT_REJECT: { bg: '#fee2e2', color: '#991b1b', border: '#991b1b' },
      GRADE_MODIFY: { bg: '#ffe17c', color: '#000', border: '#000' },
    };
    return map[action] || { bg: '#b7c6c2', color: '#000', border: '#000' };
  };

  const roleAvatarBg = { admin: '#171e19', institution: '#1e40af', teacher: '#000', student: '#b7c6c2' };
  const roleAvatarColor = { admin: '#ffe17c', institution: '#fff', teacher: '#ffe17c', student: '#000' };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' +
      d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <LoadingSkeleton rows={8} />;

  return (
    <div style={{ fontFamily: "'Satoshi', sans-serif" }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <div style={{ width: 8, height: 32, background: '#171e19', border: '2px solid #000', borderRadius: 2 }} />
              <h1 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '1.625rem', fontWeight: 800, color: '#000', letterSpacing: '-0.03em' }}>Audit Logs</h1>
            </div>
            <p style={{ fontFamily: "'Satoshi', sans-serif", fontSize: '0.875rem', fontWeight: 500, color: '#555', marginLeft: '1.25rem' }}>Track all critical actions across the platform</p>
          </div>
          <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}
            style={{
              border: '2px solid #000', borderRadius: '0.5rem', padding: '0.5rem 2.5rem 0.5rem 0.875rem',
              fontFamily: "'Satoshi', sans-serif", fontSize: '0.875rem', fontWeight: 700,
              background: '#fff', color: '#000', cursor: 'pointer', outline: 'none', boxShadow: '3px 3px 0px #000',
              backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23000000' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
              backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em', appearance: 'none',
            }}
          >
            <option value="">All Actions</option>
            <option value="LOGIN">Login</option>
            <option value="STUDENT_CREATE">Student Create</option>
            <option value="RESULT_APPROVE">Result Approve</option>
            <option value="GRADE_MODIFY">Grade Modify</option>
            <option value="INSTITUTION_STATUS_CHANGE">Institution Status</option>
            <option value="PASSWORD_CHANGE">Password Change</option>
          </select>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ background: '#fff', border: '2px solid #000', borderRadius: '0.75rem', boxShadow: '4px 4px 0px #000', overflow: 'hidden' }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Action</th>
                <th>Description</th>
                <th>IP Address</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <motion.tr key={log._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * i }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: roleAvatarBg[log.userId?.role] || '#b7c6c2',
                        border: '2px solid #000',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800,
                        color: roleAvatarColor[log.userId?.role] || '#000', fontSize: '0.6875rem',
                      }}>
                        {log.userId?.firstName?.[0]}{log.userId?.lastName?.[0]}
                      </div>
                      <div>
                        <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: '0.8125rem', color: '#000' }}>
                          {log.userId?.firstName} {log.userId?.lastName}
                        </div>
                        <div style={{ fontFamily: "'Satoshi', sans-serif", fontSize: '0.6875rem', fontWeight: 500, color: '#666', textTransform: 'capitalize' }}>
                          {log.userId?.role}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                      padding: '0.2rem 0.625rem', border: `2px solid ${actionChip(log.action).border}`,
                      borderRadius: 9999, fontFamily: "'Cabinet Grotesk', sans-serif",
                      fontSize: '0.6875rem', fontWeight: 800, letterSpacing: '0.02em',
                      background: actionChip(log.action).bg, color: actionChip(log.action).color,
                    }}>
                      {log.action?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, color: '#333', fontSize: '0.8125rem', maxWidth: 280 }}>
                    {log.description}
                    {log.oldValue && (
                      <div style={{ fontFamily: 'monospace', fontSize: '0.6875rem', color: '#888', marginTop: 3 }}>
                        {JSON.stringify(log.oldValue)} → {JSON.stringify(log.newValue)}
                      </div>
                    )}
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: '#555' }}>{log.ipAddress}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontFamily: "'Satoshi', sans-serif", fontWeight: 500, color: '#666', fontSize: '0.75rem' }}>
                      <HiOutlineClock size={13} />
                      {formatDate(log.createdAt)}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #000', background: '#f9f9f9' }}>
            <span style={{ fontFamily: "'Satoshi', sans-serif", fontSize: '0.8125rem', fontWeight: 500, color: '#555' }}>
              Page {pagination.page} of {pagination.pages} ({pagination.total} total)
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-sm btn-outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Previous</button>
              <button className="btn btn-sm btn-primary" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AuditLogs;
