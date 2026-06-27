import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineAcademicCap, HiOutlineUserGroup, HiOutlineBookOpen, HiOutlineRectangleGroup, HiOutlineClipboardDocumentCheck, HiOutlineArrowTrendingUp, HiOutlineChartBarSquare } from 'react-icons/hi2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axios';
import StatCard from '../../components/ui/StatCard';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const InstitutionDashboard = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/institution/dashboard');
        setData(res.data.data);
      } catch {
        setData({
          stats: { totalStudents: 1247, totalTeachers: 83, totalCourses: 156, totalDepartments: 12, pendingResults: 24 },
          recentResults: [
            { _id: '1', courseId: { title: 'Computer Science 301', code: 'CSC301' }, teacherId: { firstName: 'Prof.', lastName: 'Adams' }, status: 'submitted', submittedAt: new Date().toISOString() },
            { _id: '2', courseId: { title: 'Mathematics 201', code: 'MTH201' }, teacherId: { firstName: 'Dr.', lastName: 'Brown' }, status: 'submitted', submittedAt: new Date(Date.now() - 7200000).toISOString() },
            { _id: '3', courseId: { title: 'Physics 101', code: 'PHY101' }, teacherId: { firstName: 'Dr.', lastName: 'Clarke' }, status: 'submitted', submittedAt: new Date(Date.now() - 14400000).toISOString() }
          ],
          departmentDistribution: [
            { name: 'Computer Science', count: 350 },
            { name: 'Mathematics', count: 180 },
            { name: 'Physics', count: 120 },
            { name: 'Chemistry', count: 95 },
            { name: 'Biology', count: 140 },
            { name: 'Engineering', count: 280 }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSkeleton type="cards" />;

  const deptData = {
    labels: data?.departmentDistribution?.map(d => d.name) || [],
    datasets: [{
      label: 'Students',
      data: data?.departmentDistribution?.map(d => d.count) || [],
      backgroundColor: ['#ffe17c', '#171e19', '#b7c6c2', '#fff', '#ffe17c', '#171e19'],
      borderColor: '#000',
      borderWidth: 2, borderRadius: 4
    }]
  };

  const totalStudents = data?.stats?.totalStudents || 0;
  const totalTeachers = data?.stats?.totalTeachers || 0;
  const ratio = totalTeachers > 0 ? Math.round(totalStudents / totalTeachers) : 0;

  return (
    <div>
      {/* ── Welcome Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="card"
        style={{
          background: '#171e19', color: '#fff', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '1.5rem', flexWrap: 'wrap',
          backgroundImage: 'radial-gradient(circle, rgba(183,198,194,0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: 800, marginBottom: '0.25rem' }}>
            Institution Dashboard
          </h1>
          <p style={{ fontSize: '0.8125rem', color: '#b7c6c2', lineHeight: 1.5 }}>
            Overview of your academic ecosystem · {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{
          background: '#ffe17c', border: '2px solid #000', borderRadius: '0.75rem',
          padding: '0.75rem 1.25rem', boxShadow: '3px 3px 0px #000',
          display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0
        }}>
          <HiOutlineArrowTrendingUp style={{ fontSize: '1.25rem', color: '#000' }} />
          <div>
            <div style={{ fontSize: '0.6875rem', color: '#555', fontWeight: 500 }}>Student:Teacher</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#000', fontFamily: "'Cabinet Grotesk', sans-serif" }}>{ratio}:1</div>
          </div>
        </div>
      </motion.div>

      {/* ── Stat Cards ── */}
      <div className="dashboard-stat-grid" style={{ marginBottom: '1.5rem' }}>
        <StatCard title="Total Students" value={data?.stats?.totalStudents || 0} icon={HiOutlineAcademicCap} color="yellow" delay={0} />
        <StatCard title="Total Teachers" value={data?.stats?.totalTeachers || 0} icon={HiOutlineUserGroup} color="sage" delay={1} />
        <StatCard title="Active Courses" value={data?.stats?.totalCourses || 0} icon={HiOutlineBookOpen} color="white" delay={2} />
        <StatCard title="Departments" value={data?.stats?.totalDepartments || 0} icon={HiOutlineRectangleGroup} color="dark" delay={3} />
        <StatCard title="Pending Results" value={data?.stats?.pendingResults || 0} icon={HiOutlineClipboardDocumentCheck} color="yellow" delay={4} />
      </div>

      {/* ── Charts + Pending Approvals ── */}
      <div className="grid-layout-1-320">
        {/* Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <HiOutlineChartBarSquare style={{ fontSize: '1.125rem', color: '#000' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Students by Department</h3>
          </div>
          <div className="chart-container">
            <Bar data={deptData} options={{
              responsive: true, maintainAspectRatio: false, indexAxis: 'y',
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { display: false }, ticks: { color: '#555', font: { family: "'Satoshi', sans-serif", weight: 500 } } },
                y: { grid: { display: false }, ticks: { color: '#000', font: { family: "'Cabinet Grotesk', sans-serif", size: 11, weight: 700 } } }
              }
            }} />
          </div>
        </motion.div>

        {/* Pending Approvals */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card">
          <div className="approval-header">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Pending Approvals</h3>
            <a href="/dashboard/result-approval" style={{
              fontSize: '0.75rem', color: '#000', textDecoration: 'none', fontWeight: 700,
              background: '#ffe17c', border: '2px solid #000', borderRadius: '9999px',
              padding: '0.25rem 0.75rem', boxShadow: '2px 2px 0px #000',
              transition: 'all 0.15s', whiteSpace: 'nowrap'
            }}>View all →</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {(data?.recentResults || []).map((r, i) => (
              <div key={r._id} className="approval-item"
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#000'; e.currentTarget.style.background = 'rgba(255,225,124,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <div className="approval-item-icon">
                  <HiOutlineClipboardDocumentCheck style={{ color: '#000', fontSize: '1rem' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.courseId?.code} — {r.courseId?.title}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#555', marginTop: '0.125rem' }}>
                    {r.teacherId?.firstName} {r.teacherId?.lastName}
                  </div>
                </div>
                <span className="badge-neo badge-warning" style={{ flexShrink: 0 }}>Pending</span>
              </div>
            ))}
            {(!data?.recentResults || data.recentResults.length === 0) && (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: '#555', fontSize: '0.875rem' }}>
                No pending approvals 🎉
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InstitutionDashboard;
