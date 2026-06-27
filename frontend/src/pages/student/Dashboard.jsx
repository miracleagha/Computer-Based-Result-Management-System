import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineBookOpen, HiOutlineDocumentText, HiOutlineBell, HiOutlineAcademicCap, HiOutlineTrophy, HiOutlineArrowRight } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axios';
import StatCard from '../../components/ui/StatCard';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/student/dashboard');
        setData(res.data.data);
      } catch {
        setData({
          profile: { matricNumber: 'UNILAG/2025/CSC/0001', departmentId: { name: 'Computer Science' }, level: 300, status: 'active' },
          stats: { totalCourses: 6, totalResults: 24, unreadNotifications: 3, cgpa: 4.32, classification: 'Second Class Upper' },
          recentResults: [
            { _id: '1', courseId: { title: 'Computer Science 301', code: 'CSC301', creditUnits: 3 }, totalScore: 78, letterGrade: 'A', gradePoint: 5.0, semesterId: { name: 'First Semester' }, sessionId: { name: '2025/2026' } },
            { _id: '2', courseId: { title: 'Data Structures', code: 'CSC203', creditUnits: 4 }, totalScore: 65, letterGrade: 'B', gradePoint: 4.0, semesterId: { name: 'First Semester' }, sessionId: { name: '2025/2026' } },
            { _id: '3', courseId: { title: 'Mathematics 201', code: 'MTH201', creditUnits: 3 }, totalScore: 54, letterGrade: 'C', gradePoint: 3.0, semesterId: { name: 'First Semester' }, sessionId: { name: '2025/2026' } },
            { _id: '4', courseId: { title: 'Physics 201', code: 'PHY201', creditUnits: 2 }, totalScore: 82, letterGrade: 'A', gradePoint: 5.0, semesterId: { name: 'First Semester' }, sessionId: { name: '2025/2026' } },
            { _id: '5', courseId: { title: 'English 101', code: 'ENG101', creditUnits: 2 }, totalScore: 71, letterGrade: 'A', gradePoint: 5.0, semesterId: { name: 'First Semester' }, sessionId: { name: '2025/2026' } }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSkeleton type="cards" />;

  const gradeColors = { A: '#10b981', B: '#3b82f6', C: '#f59e0b', D: '#f97316', E: '#ef4444', F: '#dc2626' };
  const cgpa = data?.stats?.cgpa || 0;
  const cgpaPercent = Math.min((cgpa / 5) * 100, 100);

  return (
    <div>
      {/* ── CGPA Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="card"
        style={{
          background: '#ffe17c', color: '#000', marginBottom: '1.5rem',
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      >
        <div className="student-cgpa-hero">
          {/* Left: Welcome + Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: 800, marginBottom: '0.25rem' }}>
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p style={{ fontSize: '0.8125rem', color: '#555', marginBottom: '1rem' }}>
              {data?.profile?.matricNumber} · {data?.profile?.departmentId?.name} · Level {data?.profile?.level}
            </p>

            {/* CGPA progress bar */}
            <div style={{ marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.375rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#555' }}>Cumulative GPA</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: "'Cabinet Grotesk', sans-serif", letterSpacing: '-0.025em' }}>{cgpa.toFixed(2)}<span style={{ fontSize: '0.75rem', color: '#555', fontWeight: 500 }}> / 5.0</span></span>
              </div>
              <div style={{ height: 10, background: '#fff', border: '2px solid #000', borderRadius: '9999px', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${cgpaPercent}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                  style={{ height: '100%', background: '#171e19', borderRadius: '9999px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HiOutlineTrophy size={16} style={{ color: '#000' }} />
              <span style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{data?.stats?.classification}</span>
            </div>
          </div>

          {/* Right: CGPA Circle */}
          <div className="cgpa-circle">
            <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: "'Cabinet Grotesk', sans-serif", color: '#000', lineHeight: 1 }}>
              {cgpa.toFixed(1)}
            </div>
            <div style={{ fontSize: '0.625rem', color: '#555', fontWeight: 700 }}>CGPA</div>
          </div>
        </div>
      </motion.div>

      {/* ── Stat Cards ── */}
      <div className="dashboard-stat-grid" style={{ marginBottom: '1.5rem' }}>
        <StatCard title="Registered Courses" value={data?.stats?.totalCourses || 0} icon={HiOutlineBookOpen} color="white" delay={0} />
        <StatCard title="Results Published" value={data?.stats?.totalResults || 0} icon={HiOutlineDocumentText} color="sage" delay={1} />
        <StatCard title="Notifications" value={data?.stats?.unreadNotifications || 0} icon={HiOutlineBell} color="yellow" delay={2} />
      </div>

      {/* ── Recent Results ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Recent Results</h3>
          <a href="/dashboard/results" style={{
            fontSize: '0.75rem', color: '#000', textDecoration: 'none', fontWeight: 700,
            background: '#ffe17c', border: '2px solid #000', borderRadius: '9999px',
            padding: '0.25rem 0.75rem', boxShadow: '2px 2px 0px #000',
            display: 'flex', alignItems: 'center', gap: '0.375rem'
          }}>
            View all <HiOutlineArrowRight size={12} />
          </a>
        </div>

        {/* Desktop table header - hidden on mobile */}
        <div className="result-table-header">
          <span style={{ flex: '0 0 52px' }}></span>
          <span style={{ flex: 1 }}>Course</span>
          <span style={{ width: 100, textAlign: 'center' }}>Score</span>
          <span style={{ width: 60, textAlign: 'center' }}>Grade</span>
          <span style={{ width: 60, textAlign: 'center' }}>GP</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {(data?.recentResults || []).map((result, i) => (
            <motion.div key={result._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.05 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem',
                border: '2px solid rgba(0,0,0,0.1)', borderRadius: 'var(--radius-sm)',
                transition: 'all 0.15s', flexWrap: 'wrap'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#000'; e.currentTarget.style.background = 'rgba(255,225,124,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; e.currentTarget.style.background = 'transparent'; }}
            >
              {/* Grade badge */}
              <div style={{
                width: 44, height: 44, borderRadius: 'var(--radius-sm)',
                background: result.letterGrade === 'A' ? '#ffe17c' : result.letterGrade === 'F' ? '#fee2e2' : '#f5f5f0',
                border: '2px solid #000', boxShadow: '2px 2px 0px #000',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '1rem', color: '#000', flexShrink: 0
              }}>
                {result.letterGrade}
              </div>

              {/* Course info */}
              <div style={{ flex: 1, minWidth: 120 }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{result.courseId?.code} — {result.courseId?.title}</div>
                <div style={{ fontSize: '0.6875rem', color: '#555', marginTop: '0.125rem' }}>{result.courseId?.creditUnits} CU · {result.semesterId?.name}</div>
              </div>

              {/* Score + GP */}
              <div className="result-row-stats">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.125rem', color: '#000', fontFamily: "'Cabinet Grotesk', sans-serif" }}>{result.totalScore}</div>
                  <div style={{ fontSize: '0.5625rem', color: '#555', fontWeight: 600, textTransform: 'uppercase' }}>Score</div>
                </div>
                <div style={{ width: 1, height: 28, background: 'rgba(0,0,0,0.1)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.125rem', color: '#000', fontFamily: "'Cabinet Grotesk', sans-serif" }}>{result.gradePoint}</div>
                  <div style={{ fontSize: '0.5625rem', color: '#555', fontWeight: 600, textTransform: 'uppercase' }}>GP</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default StudentDashboard;
