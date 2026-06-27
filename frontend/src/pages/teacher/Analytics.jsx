import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineChartBar, HiOutlineAcademicCap } from 'react-icons/hi2';
import { Chart, registerables } from 'chart.js';
import axios from '../../api/axios';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import StatCard from '../../components/ui/StatCard';

Chart.register(...registerables);

const Analytics = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const barRef = useRef(null);
  const doughnutRef = useRef(null);
  const barChartRef = useRef(null);
  const doughnutChartRef = useRef(null);

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { if (selectedCourse) fetchAnalytics(); }, [selectedCourse]);
  useEffect(() => { if (analytics) renderCharts(); return () => { barChartRef.current?.destroy(); doughnutChartRef.current?.destroy(); }; }, [analytics]);

  const fetchCourses = async () => {
    try { const res = await axios.get('/api/teacher/courses'); setCourses(res.data.data || []); if (res.data.data?.[0]) setSelectedCourse(res.data.data[0]._id); }
    catch {
      const mockCourses = [{ _id: 'c1', title: 'Intro to Programming', code: 'CSC101' }, { _id: 'c2', title: 'Data Structures', code: 'CSC201' }];
      setCourses(mockCourses); setSelectedCourse('c1');
    } finally { setLoading(false); }
  };

  const fetchAnalytics = async () => {
    try { const res = await axios.get(`/api/teacher/analytics/${selectedCourse}`); setAnalytics(res.data.data); }
    catch {
      setAnalytics({
        totalStudents: 45, averageScore: 62.5, passRate: 86.7, highestScore: 95, lowestScore: 22,
        gradeDistribution: { A: 8, B: 12, C: 15, D: 6, E: 2, F: 2 },
        scoreRanges: { '0-39': 2, '40-49': 4, '50-59': 10, '60-69': 15, '70-79': 8, '80-100': 6 }
      });
    }
  };

  const renderCharts = () => {
    barChartRef.current?.destroy();
    doughnutChartRef.current?.destroy();

    if (barRef.current) {
      barChartRef.current = new Chart(barRef.current.getContext('2d'), {
        type: 'bar',
        data: {
          labels: Object.keys(analytics.scoreRanges || {}),
          datasets: [{
            label: 'Students',
            data: Object.values(analytics.scoreRanges || {}),
            backgroundColor: ['#171e19', '#272727', '#b7c6c2', '#ffe17c', '#e2e8f0', '#ffe17c'],
            borderRadius: 8, borderSkipped: false
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, border: { display: false } }, y: { grid: { color: 'rgba(148,163,184,0.08)' }, border: { display: false }, beginAtZero: true } } }
      });
    }

    if (doughnutRef.current) {
      doughnutChartRef.current = new Chart(doughnutRef.current.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: Object.keys(analytics.gradeDistribution || {}),
          datasets: [{
            data: Object.values(analytics.gradeDistribution || {}),
            backgroundColor: ['#ffe17c', '#b7c6c2', '#171e19', '#272727', '#ffffff', '#b7c6c2'],
            borderWidth: 0, hoverOffset: 8
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16, color: '#94a3b8', font: { size: 12 } } } } }
      });
    }
  };

  if (loading) return <LoadingSkeleton type="table" rows={5} />;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Performance Analytics</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Analyze class performance metrics</p>
          </div>
          <select className="form-input form-select" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} style={{ width: 'auto', minWidth: 250 }}>
            {courses.map(c => <option key={c._id} value={c._id}>{c.code} — {c.title}</option>)}
          </select>
        </div>
      </motion.div>

      {analytics && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <StatCard title="Total Students" value={analytics.totalStudents} icon={HiOutlineAcademicCap} color="blue" delay={0} />
            <StatCard title="Average Score" value={Math.round(analytics.averageScore)} icon={HiOutlineChartBar} color="green" delay={1} />
            <StatCard title="Pass Rate" value={`${analytics.passRate}%`} icon={HiOutlineChartBar} color="amber" delay={2} />
            <StatCard title="Highest Score" value={analytics.highestScore} icon={HiOutlineChartBar} color="purple" delay={3} />
          </div>

          <div className="grid-layout-15-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Score Distribution</h3>
              <div style={{ height: 280 }}><canvas ref={barRef} /></div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Grade Distribution</h3>
              <div style={{ height: 280 }}><canvas ref={doughnutRef} /></div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
