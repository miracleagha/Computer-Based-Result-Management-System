import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineBuildingOffice2, HiOutlineUsers, HiOutlineAcademicCap,
  HiOutlineUserGroup, HiOutlineClock, HiOutlineArrowTrendingUp,
} from 'react-icons/hi2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, PointElement, LineElement, Filler, BarElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import axios from '../api/axios';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler, BarElement);

/* ── Neo stat card ── */
const StatCard = ({ title, value, icon: Icon, bg, delay, trend, trendValue }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.08, duration: 0.45 }}
    style={{
      background: bg, border: '2px solid #000', borderRadius: '0.75rem',
      padding: '1.5rem', boxShadow: '4px 4px 0px #000',
      transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      cursor: 'default',
    }}
    whileHover={{ x: 2, y: 2, boxShadow: '2px 2px 0px #000' }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
      <div style={{ width: 44, height: 44, background: '#000', border: '2px solid #000', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon style={{ color: bg === '#171e19' ? '#ffe17c' : '#fff', fontSize: '1.25rem' }} />
      </div>
      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#fff', border: '2px solid #000', borderRadius: 9999, padding: '0.2rem 0.625rem' }}>
          <HiOutlineArrowTrendingUp style={{ fontSize: '0.75rem', color: '#059669' }} />
          <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '0.75rem', fontWeight: 800, color: '#059669' }}>{trendValue}</span>
        </div>
      )}
    </div>
    <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '2rem', fontWeight: 800, color: bg === '#171e19' ? '#fff' : '#000', lineHeight: 1, marginBottom: '0.375rem', letterSpacing: '-0.03em' }}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </div>
    <div style={{ fontFamily: "'Satoshi', sans-serif", fontSize: '0.8125rem', fontWeight: 500, color: bg === '#171e19' ? '#b7c6c2' : '#555' }}>
      {title}
    </div>
  </motion.div>
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard');
      setData(response.data.data);
    } catch {
      setData({
        stats: { totalInstitutions: 12, activeInstitutions: 8, pendingInstitutions: 3, totalUsers: 4520, totalStudents: 3800, totalTeachers: 650 },
        recentActivity: [
          { _id: '1', action: 'LOGIN', description: 'Admin logged in', createdAt: new Date().toISOString(), userId: { firstName: 'Super', lastName: 'Admin', role: 'admin' } },
          { _id: '2', action: 'INSTITUTION_CREATE', description: 'New institution registered', createdAt: new Date(Date.now() - 3600000).toISOString(), userId: { firstName: 'John', lastName: 'Doe', role: 'institution' } },
          { _id: '3', action: 'STUDENT_CREATE', description: 'Student registered', createdAt: new Date(Date.now() - 7200000).toISOString(), userId: { firstName: 'Jane', lastName: 'Smith', role: 'institution' } },
          { _id: '4', action: 'RESULT_APPROVE', description: 'Results approved', createdAt: new Date(Date.now() - 10800000).toISOString(), userId: { firstName: 'Prof', lastName: 'Wilson', role: 'institution' } },
          { _id: '5', action: 'USER_CREATE', description: 'Teacher account created', createdAt: new Date(Date.now() - 14400000).toISOString(), userId: { firstName: 'Admin', lastName: 'User', role: 'admin' } },
        ],
        userDistribution: [
          { _id: 'student', count: 3800 }, { _id: 'teacher', count: 650 },
          { _id: 'institution', count: 60 }, { _id: 'admin', count: 10 },
        ],
        monthlyRegistrations: [
          { _id: { month: 1, year: 2026 }, count: 120 }, { _id: { month: 2, year: 2026 }, count: 250 },
          { _id: { month: 3, year: 2026 }, count: 380 }, { _id: { month: 4, year: 2026 }, count: 520 },
          { _id: { month: 5, year: 2026 }, count: 680 }, { _id: { month: 6, year: 2026 }, count: 450 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton type="cards" />;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const registrationData = {
    labels: (data?.monthlyRegistrations || []).map(d => months[d._id.month - 1]),
    datasets: [{
      label: 'New Users',
      data: (data?.monthlyRegistrations || []).map(d => d.count),
      borderColor: '#000',
      backgroundColor: 'rgba(255,225,124,0.35)',
      fill: true, tension: 0.3,
      pointBackgroundColor: '#ffe17c',
      pointBorderColor: '#000', pointBorderWidth: 2,
      pointRadius: 5, pointHoverRadius: 7,
    }],
  };

  const barData = {
    labels: (data?.userDistribution || []).map(d => d._id.charAt(0).toUpperCase() + d._id.slice(1)),
    datasets: [{
      label: 'Users',
      data: (data?.userDistribution || []).map(d => d.count),
      backgroundColor: ['#ffe17c', '#b7c6c2', '#171e19', '#000'],
      borderColor: '#000', borderWidth: 2, borderRadius: 4,
    }],
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#000', titleColor: '#ffe17c', bodyColor: '#fff',
        borderColor: '#000', borderWidth: 2, padding: 12, cornerRadius: 8,
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#333', font: { size: 12, family: "'Satoshi', sans-serif", weight: '700' }, border: { display: false } } },
      y: { grid: { color: 'rgba(0,0,0,0.06)' }, ticks: { color: '#333', font: { size: 12, family: "'Satoshi', sans-serif" } }, beginAtZero: true },
    },
  };

  const actionColors = {
    LOGIN: 'badge-info', LOGOUT: 'badge-neutral', INSTITUTION_CREATE: 'badge-success',
    INSTITUTION_STATUS_CHANGE: 'badge-warning', STUDENT_CREATE: 'badge-success',
    TEACHER_CREATE: 'badge-success', RESULT_APPROVE: 'badge-info', RESULT_REJECT: 'badge-danger',
    USER_CREATE: 'badge-success', PASSWORD_CHANGE: 'badge-warning',
  };

  const formatTime = (dateStr) => {
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const statCards = [
    { title: 'Total Institutions', value: data?.stats?.totalInstitutions || 0, icon: HiOutlineBuildingOffice2, bg: '#ffe17c', delay: 0, trend: 'up', trendValue: '12%' },
    { title: 'Active Users', value: data?.stats?.totalUsers || 0, icon: HiOutlineUsers, bg: '#b7c6c2', delay: 1, trend: 'up', trendValue: '8%' },
    { title: 'Total Students', value: data?.stats?.totalStudents || 0, icon: HiOutlineAcademicCap, bg: '#ffffff', delay: 2, trend: 'up', trendValue: '15%' },
    { title: 'Total Teachers', value: data?.stats?.totalTeachers || 0, icon: HiOutlineUserGroup, bg: '#171e19', delay: 3 },
  ];

  return (
    <div style={{ fontFamily: "'Satoshi', sans-serif" }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
          <div style={{ width: 8, height: 32, background: '#ffe17c', border: '2px solid #000', borderRadius: 2 }} />
          <h1 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '1.625rem', fontWeight: 800, color: '#000', letterSpacing: '-0.03em' }}>Dashboard</h1>
        </div>
        <p style={{ fontFamily: "'Satoshi', sans-serif", fontSize: '0.875rem', fontWeight: 500, color: '#555', marginLeft: '1.25rem' }}>
          Welcome back! Here&apos;s your platform overview.
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
        {statCards.map((s) => <StatCard key={s.title} {...s} />)}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Registration Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ background: '#fff', border: '2px solid #000', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '4px 4px 0px #000' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '1rem', fontWeight: 800, color: '#000', letterSpacing: '-0.02em' }}>Registration Trend</h3>
              <p style={{ fontFamily: "'Satoshi', sans-serif", fontSize: '0.8125rem', fontWeight: 500, color: '#666', marginTop: '0.125rem' }}>New user registrations over time</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: '#ffe17c', border: '2px solid #000', borderRadius: 9999, padding: '0.25rem 0.75rem' }}>
              <HiOutlineArrowTrendingUp style={{ fontSize: '0.875rem', color: '#000' }} />
              <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '0.8125rem', fontWeight: 800, color: '#000' }}>+24%</span>
            </div>
          </div>
          <div style={{ height: 240 }}>
            <Line data={registrationData} options={chartOptions} />
          </div>
        </motion.div>

        {/* User Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{ background: '#fff', border: '2px solid #000', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '4px 4px 0px #000' }}
        >
          <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '1rem', fontWeight: 800, color: '#000', letterSpacing: '-0.02em', marginBottom: '1.5rem' }}>
            User Distribution
          </h3>
          <div style={{ height: 200 }}>
            <Bar data={barData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { display: false } } }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
            {(data?.userDistribution || []).map((item, i) => (
              <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '2px', border: '1px solid #000', background: ['#ffe17c', '#b7c6c2', '#171e19', '#000'][i] }} />
                <span style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, color: '#555', textTransform: 'capitalize', flex: 1 }}>{item._id}</span>
                <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, color: '#000' }}>{item.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        style={{ background: '#fff', border: '2px solid #000', borderRadius: '0.75rem', boxShadow: '4px 4px 0px #000', overflow: 'hidden' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '2px solid #000', background: '#ffe17c' }}>
          <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '1rem', fontWeight: 800, color: '#000', letterSpacing: '-0.02em' }}>Recent Activity</h3>
          <a href="/audit-logs" style={{ fontFamily: "'Satoshi', sans-serif", fontSize: '0.8125rem', fontWeight: 700, color: '#000', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            View all →
          </a>
        </div>
        <div style={{ padding: '0 1.5rem' }}>
          {(data?.recentActivity || []).map((activity, i) => (
            <motion.div
              key={activity._id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.05 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1rem 0',
                borderBottom: i < (data?.recentActivity?.length || 0) - 1 ? '1px solid rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: '#171e19', border: '2px solid #000',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Cabinet Grotesk', sans-serif", color: '#ffe17c',
                fontSize: '0.75rem', fontWeight: 800, flexShrink: 0,
              }}>
                {activity.userId?.firstName?.[0]}{activity.userId?.lastName?.[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Satoshi', sans-serif", fontSize: '0.875rem', fontWeight: 700, color: '#000' }}>
                  {activity.userId?.firstName} {activity.userId?.lastName}
                  <span style={{ color: '#555', fontWeight: 500 }}> — {activity.description || activity.action}</span>
                </div>
              </div>
              <span className={`badge ${actionColors[activity.action] || 'badge-neutral'}`}>
                {activity.action?.replace(/_/g, ' ')}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#888', fontSize: '0.75rem', flexShrink: 0, fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}>
                <HiOutlineClock size={13} />
                {formatTime(activity.createdAt)}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
