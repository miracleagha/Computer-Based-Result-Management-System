import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineBuildingOffice2, HiOutlineAcademicCap, HiOutlineUserGroup,
  HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlinePauseCircle,
  HiOutlineTrash, HiOutlineGlobeAlt, HiOutlineEnvelope,
  HiOutlinePhone, HiOutlineCalendar, HiOutlineDocumentText,
} from 'react-icons/hi2';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import StatCard from '../components/ui/StatCard';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';

/* ── helpers ── */
const statusStyle = (status) => {
  const m = {
    active:    { bg: '#dcfce7', color: '#166534', border: '#166534' },
    pending:   { bg: '#ffe17c', color: '#000',    border: '#000'    },
    suspended: { bg: '#fee2e2', color: '#991b1b', border: '#991b1b' },
  };
  return m[status] || { bg: '#b7c6c2', color: '#000', border: '#000' };
};

const NBadge = ({ label }) => {
  const s = statusStyle(label);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '0.2rem 0.625rem', border: `2px solid ${s.border}`,
      borderRadius: 9999, background: s.bg, color: s.color,
      fontFamily: "'Cabinet Grotesk',sans-serif",
      fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>
      {label}
    </span>
  );
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div style={{
    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
    padding: '0.625rem 0', borderBottom: '1px solid rgba(0,0,0,0.08)',
  }}>
    <Icon size={15} style={{ color: '#666', flexShrink: 0, marginTop: 2 }} />
    <span style={{ fontFamily: "'Satoshi',sans-serif", fontSize: '0.8125rem', fontWeight: 500, color: '#888', width: 90, flexShrink: 0 }}>{label}</span>
    <span style={{ fontFamily: "'Satoshi',sans-serif", fontSize: '0.875rem', fontWeight: 600, color: '#000', flex: 1, wordBreak: 'break-word' }}>{value || 'N/A'}</span>
  </div>
);

const TabBtn = ({ label, active, onClick }) => (
  <button onClick={onClick}
    style={{
      padding: '0.625rem 1.25rem',
      fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '0.875rem', fontWeight: 800,
      color: active ? '#000' : '#888', background: active ? '#ffe17c' : 'transparent',
      border: active ? '2px solid #000' : '2px solid transparent',
      borderRadius: '0.5rem',
      boxShadow: active ? '3px 3px 0px #000' : 'none',
      transform: active ? 'translate(0,0)' : 'translate(0,0)',
      cursor: 'pointer', transition: 'all 0.15s', textTransform: 'capitalize',
    }}
  >
    {label}
  </button>
);

/* ─────────────────────────────────────────────── */
const InstitutionDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState('overview');

  useEffect(() => { fetchInstitution(); }, [id]);

  const fetchInstitution = async () => {
    try {
      const res = await axios.get(`/api/admin/institutions/${id}`);
      setInstitution(res.data.data);
    } catch {
      setInstitution({
        _id: id, name: 'University of Lagos', code: 'UNILAG',
        type: 'university', status: 'active',
        email: 'admin@unilag.edu.ng', phone: '+234-1-2802439',
        website: 'https://unilag.edu.ng', address: 'Akoka, Yaba, Lagos, Nigeria',
        registrationDate: '2025-01-15', subscriptionPlan: 'premium',
        subscriptionExpiry: '2027-01-15',
        studentCount: 1200, teacherCount: 85, departmentCount: 12, courseCount: 156,
        adminUserId: { firstName: 'Admin', lastName: 'User', email: 'admin@unilag.edu.ng' },
        gradingScales: [
          { grade:'A', minScore:70, maxScore:100, gradePoint:5.0, remark:'Excellent' },
          { grade:'B', minScore:60, maxScore:69,  gradePoint:4.0, remark:'Very Good' },
          { grade:'C', minScore:50, maxScore:59,  gradePoint:3.0, remark:'Good'      },
          { grade:'D', minScore:45, maxScore:49,  gradePoint:2.0, remark:'Fair'      },
          { grade:'E', minScore:40, maxScore:44,  gradePoint:1.0, remark:'Pass'      },
          { grade:'F', minScore:0,  maxScore:39,  gradePoint:0.0, remark:'Fail'      },
        ],
        recentActivity: [
          { action:'Student enrolled',    details:'John Doe enrolled in CSC 101',          date:'2026-06-08' },
          { action:'Result submitted',    details:'Dr. Smith submitted CSC 201 results',   date:'2026-06-07' },
          { action:'Department created',  details:'Computer Science department added',     date:'2026-06-05' },
        ],
      });
    } finally { setLoading(false); }
  };

  const updateStatus = async (status) => {
    try {
      await axios.put(`/api/admin/institutions/${id}/status`, { status });
      toast.success(`Institution ${status} successfully`);
      fetchInstitution();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update status'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this institution? This cannot be undone.')) return;
    try {
      await axios.delete(`/api/admin/institutions/${id}`);
      toast.success('Institution deleted');
      navigate('/institutions');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

  if (loading) return <LoadingSkeleton rows={6} />;
  if (!institution) return (
    <div style={{ textAlign:'center', padding:'4rem', fontFamily:"'Satoshi',sans-serif", color:'#666' }}>Institution not found</div>
  );

  const tabs = ['overview', 'grading', 'activity'];

  return (
    <div style={{ fontFamily:"'Satoshi',sans-serif" }}>

      {/* ── Header ── */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <button onClick={() => navigate('/institutions')} className="btn btn-outline btn-sm" style={{ marginBottom:'1.25rem' }}>
          <HiOutlineArrowLeft size={15} /> Back
        </button>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.75rem', flexWrap:'wrap', gap:'1rem' }}>
          {/* Identity */}
          <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
            <div style={{ width:60, height:60, borderRadius:'0.75rem', background:'#ffe17c', border:'2px solid #000', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'4px 4px 0px #000', flexShrink:0 }}>
              <HiOutlineBuildingOffice2 size={26} style={{ color:'#000' }} />
            </div>
            <div>
              <h1 style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontSize:'1.5rem', fontWeight:800, color:'#000', letterSpacing:'-0.03em', marginBottom:'0.375rem' }}>
                {institution.name}
              </h1>
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexWrap:'wrap' }}>
                <span style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'0.875rem', fontWeight:600, color:'#555' }}>{institution.code}</span>
                <NBadge label={institution.status} />
                <span style={{ display:'inline-flex', alignItems:'center', padding:'0.2rem 0.625rem', border:'2px solid #1e40af', borderRadius:9999, background:'#dbeafe', color:'#1e40af', fontFamily:"'Cabinet Grotesk',sans-serif", fontSize:'0.6875rem', fontWeight:800, textTransform:'capitalize', letterSpacing:'0.03em' }}>
                  {institution.type}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
            {institution.status === 'pending' && (
              <button onClick={() => updateStatus('active')} className="btn btn-sm btn-secondary">
                <HiOutlineCheckCircle size={15} /> Approve
              </button>
            )}
            {institution.status === 'active' && (
              <button onClick={() => updateStatus('suspended')} className="btn btn-sm btn-outline">
                <HiOutlinePauseCircle size={15} /> Suspend
              </button>
            )}
            {institution.status === 'suspended' && (
              <button onClick={() => updateStatus('active')} className="btn btn-sm btn-secondary">
                <HiOutlineCheckCircle size={15} /> Reactivate
              </button>
            )}
            <button onClick={handleDelete} className="btn btn-sm btn-danger">
              <HiOutlineTrash size={15} /> Delete
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Stat cards ── */}
      <div className="stat-grid" style={{ marginBottom:'1.75rem' }}>
        <StatCard title="Total Students"  value={institution.studentCount}    icon={HiOutlineAcademicCap}    color="yellow"  delay={0} />
        <StatCard title="Total Teachers"  value={institution.teacherCount}    icon={HiOutlineUserGroup}      color="sage"    delay={1} />
        <StatCard title="Departments"     value={institution.departmentCount} icon={HiOutlineBuildingOffice2} color="white"   delay={2} />
        <StatCard title="Courses"         value={institution.courseCount}     icon={HiOutlineDocumentText}   color="dark"    delay={3} />
      </div>

      {/* ── Tabs ── */}
      <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
        {tabs.map(tab => (
          <TabBtn key={tab} label={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)} />
        ))}
      </div>

      {/* ── Tab content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
          exit={{ opacity:0, y:-8 }} transition={{ duration:0.2 }}
        >

          {/* Overview */}
          {activeTab === 'overview' && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'1.5rem' }}>
              <div style={{ background:'#fff', border:'2px solid #000', borderRadius:'0.75rem', padding:'1.5rem', boxShadow:'4px 4px 0px #000' }}>
                <h3 style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontSize:'1rem', fontWeight:800, color:'#000', marginBottom:'1rem', letterSpacing:'-0.02em' }}>Contact Information</h3>
                <InfoRow icon={HiOutlineEnvelope}        label="Email"    value={institution.email}   />
                <InfoRow icon={HiOutlinePhone}           label="Phone"    value={institution.phone}   />
                <InfoRow icon={HiOutlineGlobeAlt}        label="Website"  value={institution.website} />
                <InfoRow icon={HiOutlineBuildingOffice2} label="Address"  value={institution.address} />
              </div>
              <div style={{ background:'#fff', border:'2px solid #000', borderRadius:'0.75rem', padding:'1.5rem', boxShadow:'4px 4px 0px #000' }}>
                <h3 style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontSize:'1rem', fontWeight:800, color:'#000', marginBottom:'1rem', letterSpacing:'-0.02em' }}>Subscription Details</h3>
                <InfoRow icon={HiOutlineDocumentText} label="Plan"       value={institution.subscriptionPlan} />
                <InfoRow icon={HiOutlineCalendar}     label="Registered" value={institution.registrationDate ? new Date(institution.registrationDate).toLocaleDateString() : null} />
                <InfoRow icon={HiOutlineCalendar}     label="Expires"    value={institution.subscriptionExpiry ? new Date(institution.subscriptionExpiry).toLocaleDateString() : null} />
                <InfoRow icon={HiOutlineUserGroup}    label="Admin"      value={`${institution.adminUserId?.firstName} ${institution.adminUserId?.lastName}`} />
              </div>
            </div>
          )}

          {/* Grading */}
          {activeTab === 'grading' && (
            <div style={{ background:'#fff', border:'2px solid #000', borderRadius:'0.75rem', boxShadow:'4px 4px 0px #000', overflow:'hidden' }}>
              <div style={{ padding:'1.125rem 1.5rem', borderBottom:'2px solid #000', background:'#ffe17c' }}>
                <h3 style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontSize:'1rem', fontWeight:800, color:'#000' }}>Grading Scale</h3>
              </div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Grade</th><th>Min Score</th><th>Max Score</th><th>Grade Point</th><th>Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {institution.gradingScales?.map((scale, i) => (
                      <tr key={i}>
                        <td style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontWeight:800, fontSize:'1rem', color:'#000' }}>{scale.grade}</td>
                        <td>{scale.minScore}</td>
                        <td>{scale.maxScore}</td>
                        <td style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontWeight:800 }}>{scale.gradePoint.toFixed(1)}</td>
                        <td>
                          <span style={{ display:'inline-flex', padding:'0.2rem 0.625rem', border:'2px solid #1e40af', borderRadius:9999, background:'#dbeafe', color:'#1e40af', fontFamily:"'Cabinet Grotesk',sans-serif", fontSize:'0.6875rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.04em' }}>
                            {scale.remark}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Activity */}
          {activeTab === 'activity' && (
            <div style={{ background:'#fff', border:'2px solid #000', borderRadius:'0.75rem', padding:'1.5rem', boxShadow:'4px 4px 0px #000' }}>
              <h3 style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontSize:'1rem', fontWeight:800, color:'#000', marginBottom:'1.25rem', letterSpacing:'-0.02em' }}>Recent Activity</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.875rem' }}>
                {institution.recentActivity?.map((a, i) => (
                  <motion.div key={i}
                    initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.08 }}
                    style={{ display:'flex', gap:'1rem', padding:'1rem', borderRadius:'0.5rem', background:'#f9f9f9', border:'2px solid #000', boxShadow:'3px 3px 0px #000' }}
                  >
                    <div style={{ width:10, height:10, borderRadius:'50%', background:'#ffe17c', border:'2px solid #000', marginTop:4, flexShrink:0 }} />
                    <div>
                      <div style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontSize:'0.875rem', fontWeight:800, color:'#000' }}>{a.action}</div>
                      <div style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'0.8125rem', fontWeight:500, color:'#555', marginTop:'0.125rem' }}>{a.details}</div>
                      <div style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'0.75rem', color:'#888', marginTop:'0.25rem' }}>{new Date(a.date).toLocaleDateString()}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default InstitutionDetail;
