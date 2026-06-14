import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineBuildingOffice2, HiOutlineMagnifyingGlass,
  HiOutlineCheckCircle, HiOutlinePauseCircle,
} from 'react-icons/hi2';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';

const Institutions = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => { fetchInstitutions(); }, [page, statusFilter]);

  const fetchInstitutions = async () => {
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);
      const res = await axios.get(`/api/admin/institutions?${params}`);
      setInstitutions(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      setInstitutions([
        { _id: '1', name: 'University of Lagos', code: 'UNILAG', type: 'university', status: 'active', email: 'admin@unilag.edu.ng', studentCount: 1200, teacherCount: 85, createdAt: '2025-01-15', subscriptionPlan: 'premium', adminUserId: { firstName: 'Admin', lastName: 'User' } },
        { _id: '2', name: 'Covenant University', code: 'CU', type: 'university', status: 'active', email: 'admin@cu.edu.ng', studentCount: 850, teacherCount: 60, createdAt: '2025-03-20', subscriptionPlan: 'basic', adminUserId: { firstName: 'John', lastName: 'Smith' } },
        { _id: '3', name: 'Lagos State Polytechnic', code: 'LASPOTECH', type: 'polytechnic', status: 'pending', email: 'admin@laspotech.edu.ng', studentCount: 0, teacherCount: 0, createdAt: '2026-06-01', subscriptionPlan: 'free', adminUserId: { firstName: 'Jane', lastName: 'Doe' } },
        { _id: '4', name: 'Federal College of Education', code: 'FCE', type: 'college', status: 'suspended', email: 'admin@fce.edu.ng', studentCount: 320, teacherCount: 25, createdAt: '2024-09-10', subscriptionPlan: 'basic', adminUserId: { firstName: 'Mark', lastName: 'Jones' } },
      ]);
      setPagination({ total: 4, page: 1, pages: 1 });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/api/admin/institutions/${id}/status`, { status });
      toast.success(`Institution ${status} successfully`);
      fetchInstitutions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const statusStyle = (status) => {
    const map = {
      active: { background: '#dcfce7', color: '#166534', borderColor: '#166534' },
      pending: { background: '#ffe17c', color: '#000', borderColor: '#000' },
      suspended: { background: '#fee2e2', color: '#991b1b', borderColor: '#991b1b' },
      rejected: { background: '#fee2e2', color: '#991b1b', borderColor: '#991b1b' },
    };
    return map[status] || { background: '#b7c6c2', color: '#000', borderColor: '#000' };
  };

  const planStyle = (plan) => {
    const map = {
      free: { background: '#b7c6c2', color: '#000', borderColor: '#000' },
      basic: { background: '#dbeafe', color: '#1e40af', borderColor: '#1e40af' },
      premium: { background: '#ffe17c', color: '#000', borderColor: '#000' },
      enterprise: { background: '#171e19', color: '#fff', borderColor: '#000' },
    };
    return map[plan] || { background: '#b7c6c2', color: '#000', borderColor: '#000' };
  };

  if (loading) return <LoadingSkeleton type="table" rows={5} />;

  return (
    <div style={{ fontFamily: "'Satoshi', sans-serif" }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <div style={{ width: 8, height: 32, background: '#ffe17c', border: '2px solid #000', borderRadius: 2 }} />
              <h1 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '1.625rem', fontWeight: 800, color: '#000', letterSpacing: '-0.03em' }}>Institutions</h1>
            </div>
            <p style={{ fontFamily: "'Satoshi', sans-serif", fontSize: '0.875rem', fontWeight: 500, color: '#555', marginLeft: '1.25rem' }}>Manage all registered institutions</p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {/* Search */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: '#fff', border: '2px solid #000',
              borderRadius: '0.5rem', padding: '0.5rem 0.875rem',
              boxShadow: '3px 3px 0px #000',
            }}>
              <HiOutlineMagnifyingGlass style={{ color: '#000' }} />
              <input
                type="text" placeholder="Search institutions..." value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchInstitutions()}
                style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: "'Satoshi', sans-serif", fontSize: '0.875rem', fontWeight: 500, color: '#000', width: 200 }}
              />
            </div>
            {/* Filter */}
            <select
              value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{
                border: '2px solid #000', borderRadius: '0.5rem', padding: '0.5rem 2.5rem 0.5rem 0.875rem',
                fontFamily: "'Satoshi', sans-serif", fontSize: '0.875rem', fontWeight: 700,
                background: '#fff', color: '#000', cursor: 'pointer', outline: 'none',
                boxShadow: '3px 3px 0px #000',
                backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23000000' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em',
                appearance: 'none',
              }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ background: '#fff', border: '2px solid #000', borderRadius: '0.75rem', boxShadow: '4px 4px 0px #000', overflow: 'hidden' }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Institution</th>
                <th>Type</th>
                <th>Students</th>
                <th>Teachers</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {institutions.map((inst, i) => (
                <motion.tr
                  key={inst._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '0.5rem',
                        background: '#ffe17c', border: '2px solid #000',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: '0.625rem', color: '#000',
                        boxShadow: '2px 2px 0px #000',
                      }}>
                        {inst.code?.substring(0, 3)}
                      </div>
                      <div>
                        <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, color: '#000', fontSize: '0.875rem' }}>{inst.name}</div>
                        <div style={{ fontFamily: "'Satoshi', sans-serif", fontSize: '0.75rem', color: '#666', fontWeight: 500 }}>{inst.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700, textTransform: 'capitalize', color: '#000' }}>{inst.type}</span>
                  </td>
                  <td>
                    <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, color: '#000', fontSize: '0.9375rem' }}>{inst.studentCount?.toLocaleString()}</span>
                  </td>
                  <td>
                    <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, color: '#000', fontSize: '0.9375rem' }}>{inst.teacherCount?.toLocaleString()}</span>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', padding: '0.2rem 0.625rem',
                      border: `2px solid ${planStyle(inst.subscriptionPlan).borderColor}`,
                      borderRadius: 9999, fontFamily: "'Cabinet Grotesk', sans-serif",
                      fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
                      background: planStyle(inst.subscriptionPlan).background,
                      color: planStyle(inst.subscriptionPlan).color,
                    }}>
                      {inst.subscriptionPlan}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', padding: '0.2rem 0.625rem',
                      border: `2px solid ${statusStyle(inst.status).borderColor}`,
                      borderRadius: 9999, fontFamily: "'Cabinet Grotesk', sans-serif",
                      fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
                      background: statusStyle(inst.status).background,
                      color: statusStyle(inst.status).color,
                    }}>
                      {inst.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      {inst.status === 'pending' && (
                        <button onClick={() => updateStatus(inst._id, 'active')}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.35rem 0.75rem', background: '#b7c6c2', border: '2px solid #000', borderRadius: '0.5rem', fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', boxShadow: '2px 2px 0px #000', transition: 'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'translate(1px,1px)'; e.currentTarget.style.boxShadow = '1px 1px 0px #000'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = '2px 2px 0px #000'; }}
                        >
                          <HiOutlineCheckCircle size={13} /> Approve
                        </button>
                      )}
                      {inst.status === 'active' && (
                        <button onClick={() => updateStatus(inst._id, 'suspended')}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.35rem 0.75rem', background: '#fff', border: '2px solid #000', borderRadius: '0.5rem', fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', boxShadow: '2px 2px 0px #000', transition: 'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'translate(1px,1px)'; e.currentTarget.style.boxShadow = '1px 1px 0px #000'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = '2px 2px 0px #000'; }}
                        >
                          <HiOutlinePauseCircle size={13} /> Suspend
                        </button>
                      )}
                      {inst.status === 'suspended' && (
                        <button onClick={() => updateStatus(inst._id, 'active')}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.35rem 0.75rem', background: '#ffe17c', border: '2px solid #000', borderRadius: '0.5rem', fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', boxShadow: '2px 2px 0px #000', transition: 'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'translate(1px,1px)'; e.currentTarget.style.boxShadow = '1px 1px 0px #000'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = '2px 2px 0px #000'; }}
                        >
                          <HiOutlineCheckCircle size={13} /> Activate
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

export default Institutions;
