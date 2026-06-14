import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import axios from '../api/axios';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => { fetchUsers(); }, [page, roleFilter]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (roleFilter) params.append('role', roleFilter);
      if (search) params.append('search', search);
      const res = await axios.get(`/api/admin/users?${params}`);
      setUsers(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      setUsers([
        { _id: '1', firstName: 'Super', lastName: 'Admin', email: 'admin@resultmanager.com', role: 'admin', isActive: true, createdAt: '2025-01-01', lastLogin: new Date().toISOString(), institutionId: null },
        { _id: '2', firstName: 'John', lastName: 'Doe', email: 'john@unilag.edu.ng', role: 'institution', isActive: true, createdAt: '2025-03-15', lastLogin: new Date(Date.now() - 86400000).toISOString(), institutionId: { name: 'University of Lagos', code: 'UNILAG' } },
        { _id: '3', firstName: 'Prof. Sarah', lastName: 'Williams', email: 'sarah.w@unilag.edu.ng', role: 'teacher', isActive: true, createdAt: '2025-05-20', lastLogin: new Date(Date.now() - 172800000).toISOString(), institutionId: { name: 'University of Lagos', code: 'UNILAG' } },
        { _id: '4', firstName: 'Miracle', lastName: 'Johnson', email: 'miracle@student.unilag.edu.ng', role: 'student', isActive: true, createdAt: '2025-09-01', lastLogin: new Date(Date.now() - 7200000).toISOString(), institutionId: { name: 'University of Lagos', code: 'UNILAG' } },
        { _id: '5', firstName: 'Grace', lastName: 'Peters', email: 'grace@cu.edu.ng', role: 'student', isActive: false, createdAt: '2025-10-15', lastLogin: null, institutionId: { name: 'Covenant University', code: 'CU' } },
      ]);
      setPagination({ total: 5, page: 1, pages: 1 });
    } finally {
      setLoading(false);
    }
  };

  const roleStyle = (role) => {
    const map = {
      admin: { background: '#171e19', color: '#ffe17c', borderColor: '#000' },
      institution: { background: '#dbeafe', color: '#1e40af', borderColor: '#1e40af' },
      teacher: { background: '#ffe17c', color: '#000', borderColor: '#000' },
      student: { background: '#b7c6c2', color: '#000', borderColor: '#000' },
    };
    return map[role] || { background: '#b7c6c2', color: '#000', borderColor: '#000' };
  };

  const roleAvatarBg = { admin: '#171e19', institution: '#1e40af', teacher: '#000', student: '#b7c6c2' };
  const roleAvatarColor = { admin: '#ffe17c', institution: '#fff', teacher: '#ffe17c', student: '#000' };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) return <LoadingSkeleton type="table" rows={5} />;

  return (
    <div style={{ fontFamily: "'Satoshi', sans-serif" }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <div style={{ width: 8, height: 32, background: '#b7c6c2', border: '2px solid #000', borderRadius: 2 }} />
              <h1 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '1.625rem', fontWeight: 800, color: '#000', letterSpacing: '-0.03em' }}>Users</h1>
            </div>
            <p style={{ fontFamily: "'Satoshi', sans-serif", fontSize: '0.875rem', fontWeight: 500, color: '#555', marginLeft: '1.25rem' }}>Manage all users across institutions</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: '#fff', border: '2px solid #000', borderRadius: '0.5rem',
              padding: '0.5rem 0.875rem', boxShadow: '3px 3px 0px #000',
            }}>
              <HiOutlineMagnifyingGlass style={{ color: '#000' }} />
              <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchUsers()}
                style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: "'Satoshi', sans-serif", fontSize: '0.875rem', fontWeight: 500, color: '#000', width: 200 }}
              />
            </div>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              style={{
                border: '2px solid #000', borderRadius: '0.5rem', padding: '0.5rem 2.5rem 0.5rem 0.875rem',
                fontFamily: "'Satoshi', sans-serif", fontSize: '0.875rem', fontWeight: 700,
                background: '#fff', color: '#000', cursor: 'pointer', outline: 'none', boxShadow: '3px 3px 0px #000',
                backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23000000' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em', appearance: 'none',
              }}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="institution">Institution</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
          </div>
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
                <th>Role</th>
                <th>Institution</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <motion.tr key={user._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: '50%',
                        background: roleAvatarBg[user.role] || '#b7c6c2',
                        border: '2px solid #000',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800,
                        color: roleAvatarColor[user.role] || '#000', fontSize: '0.75rem',
                        boxShadow: '2px 2px 0px #000',
                      }}>
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                      <div>
                        <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, color: '#000', fontSize: '0.875rem' }}>{user.firstName} {user.lastName}</div>
                        <div style={{ fontFamily: "'Satoshi', sans-serif", fontSize: '0.75rem', color: '#666', fontWeight: 500 }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', padding: '0.2rem 0.625rem',
                      border: `2px solid ${roleStyle(user.role).borderColor}`,
                      borderRadius: 9999, fontFamily: "'Cabinet Grotesk', sans-serif",
                      fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
                      background: roleStyle(user.role).background, color: roleStyle(user.role).color,
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, color: '#444' }}>
                    {user.institutionId?.name || '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: user.isActive ? '#059669' : '#dc2626', border: '2px solid #000' }} />
                      <span style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#000' }}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, color: '#666', fontSize: '0.8125rem' }}>{formatDate(user.lastLogin)}</td>
                  <td style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, color: '#666', fontSize: '0.8125rem' }}>{formatDate(user.createdAt)}</td>
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

export default Users;
