import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineBookOpen, HiOutlineDocumentText, HiOutlineClipboardDocumentCheck, HiOutlinePaperAirplane, HiOutlineArrowRight } from 'react-icons/hi2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axios';
import StatCard from '../../components/ui/StatCard';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

ChartJS.register(ArcElement, Tooltip, Legend);

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/teacher/dashboard');
        setData(res.data.data);
      } catch {
        setData({
          stats: { totalCourses: 5, draftResults: 42, submittedResults: 18, approvedResults: 156 },
          myCourses: [
            { _id: '1', title: 'Computer Science 301', code: 'CSC301', creditUnits: 3, departmentId: { name: 'Computer Science' }, level: 300 },
            { _id: '2', title: 'Data Structures', code: 'CSC203', creditUnits: 4, departmentId: { name: 'Computer Science' }, level: 200 },
            { _id: '3', title: 'Operating Systems', code: 'CSC401', creditUnits: 3, departmentId: { name: 'Computer Science' }, level: 400 },
            { _id: '4', title: 'Introduction to Programming', code: 'CSC101', creditUnits: 3, departmentId: { name: 'Computer Science' }, level: 100 },
            { _id: '5', title: 'Database Management', code: 'CSC305', creditUnits: 3, departmentId: { name: 'Computer Science' }, level: 300 }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSkeleton type="cards" />;

  const resultStatusData = {
    labels: ['Draft', 'Submitted', 'Approved'],
    datasets: [{
      data: [data?.stats?.draftResults || 0, data?.stats?.submittedResults || 0, data?.stats?.approvedResults || 0],
      backgroundColor: ['#ffe17c', '#b7c6c2', '#171e19'],
      borderColor: '#000',
      borderWidth: 2, spacing: 3
    }]
  };

  const totalResults = (data?.stats?.draftResults || 0) + (data?.stats?.submittedResults || 0) + (data?.stats?.approvedResults || 0);

  return (
    <div>
      {/* ── Welcome Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="card"
        style={{
          background: '#171e19', color: '#fff', marginBottom: '1.5rem',
          backgroundImage: 'radial-gradient(circle, rgba(183,198,194,0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: 800, marginBottom: '0.25rem' }}>
              Welcome, {user?.firstName}! 📚
            </h1>
            <p style={{ fontSize: '0.8125rem', color: '#b7c6c2' }}>
              Manage your courses and student results
            </p>
          </div>
          <div style={{
            background: '#ffe17c', border: '2px solid #000', borderRadius: '0.75rem',
            padding: '0.625rem 1rem', boxShadow: '3px 3px 0px #000',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#000', fontFamily: "'Cabinet Grotesk', sans-serif" }}>{totalResults}</div>
            <div style={{ fontSize: '0.6875rem', color: '#555', fontWeight: 600, lineHeight: 1.3 }}>Total<br />Results</div>
          </div>
        </div>
      </motion.div>

      {/* ── Stat Cards ── */}
      <div className="dashboard-stat-grid" style={{ marginBottom: '1.5rem' }}>
        <StatCard title="My Courses" value={data?.stats?.totalCourses || 0} icon={HiOutlineBookOpen} color="yellow" delay={0} />
        <StatCard title="Draft Results" value={data?.stats?.draftResults || 0} icon={HiOutlineDocumentText} color="white" delay={1} />
        <StatCard title="Submitted" value={data?.stats?.submittedResults || 0} icon={HiOutlinePaperAirplane} color="sage" delay={2} />
        <StatCard title="Approved" value={data?.stats?.approvedResults || 0} icon={HiOutlineClipboardDocumentCheck} color="dark" delay={3} />
      </div>

      {/* ── Courses + Result Status ── */}
      <div className="grid-layout-1-320">
        {/* My Courses */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>My Courses</h3>
            <a href="/dashboard/my-courses" style={{
              fontSize: '0.75rem', color: '#000', textDecoration: 'none', fontWeight: 700,
              background: '#ffe17c', border: '2px solid #000', borderRadius: '9999px',
              padding: '0.25rem 0.75rem', boxShadow: '2px 2px 0px #000',
              display: 'flex', alignItems: 'center', gap: '0.375rem'
            }}>
              View all <HiOutlineArrowRight size={12} />
            </a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {(data?.myCourses || []).map((course, i) => (
              <motion.div key={course._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.05 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem',
                  border: '2px solid rgba(0,0,0,0.1)', borderRadius: 'var(--radius-sm)',
                  transition: 'all 0.15s', cursor: 'pointer'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#000'; e.currentTarget.style.background = 'rgba(255,225,124,0.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-sm)',
                  background: '#ffe17c', border: '2px solid #000',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.6875rem', color: '#000', boxShadow: '2px 2px 0px #000',
                  flexShrink: 0
                }}>
                  {course.code?.substring(0, 3)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {course.code} — {course.title}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#555', marginTop: '0.125rem' }}>
                    {course.departmentId?.name} · L{course.level} · {course.creditUnits} CU
                  </div>
                </div>
                <span className="badge-neo badge-info" style={{ flexShrink: 0 }}>Active</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Result Status Doughnut */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Result Status</h3>
          <div style={{ height: 180, display: 'flex', justifyContent: 'center' }}>
            <Doughnut data={resultStatusData} options={{
              responsive: true, maintainAspectRatio: false, cutout: '65%',
              plugins: { legend: { display: false } }
            }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginTop: '1.5rem' }}>
            {[
              { label: 'Draft', color: '#ffe17c', count: data?.stats?.draftResults },
              { label: 'Submitted', color: '#b7c6c2', count: data?.stats?.submittedResults },
              { label: 'Approved', color: '#171e19', count: data?.stats?.approvedResults }
            ].map(item => (
              <div key={item.label} style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                fontSize: '0.8125rem', padding: '0.5rem 0.75rem',
                border: '1px solid rgba(0,0,0,0.08)', borderRadius: 'var(--radius-sm)'
              }}>
                <div style={{
                  width: 14, height: 14, borderRadius: '0.25rem',
                  background: item.color, border: '2px solid #000', flexShrink: 0
                }} />
                <span style={{ color: '#555', flex: 1 }}>{item.label}</span>
                <span style={{ fontWeight: 800, color: '#000', fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '0.9375rem' }}>{item.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
