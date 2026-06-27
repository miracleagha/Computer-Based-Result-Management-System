import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineBookOpen, HiOutlineUserGroup, HiOutlinePencilSquare } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

const MyCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try { const res = await axios.get('/api/teacher/courses'); setCourses(res.data.data); }
      catch { setCourses([]); } finally { setLoading(false); }
    };
    fetchCourses();
  }, []);

  if (loading) return <LoadingSkeleton type="cards" />;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>My Courses</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>View and manage your assigned courses</p>
      </motion.div>

      {courses.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <HiOutlineBookOpen size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No courses assigned</h3>
          <p style={{ color: 'var(--text-muted)' }}>Contact your institution to get courses assigned to you.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {courses.map((course, i) => (
            <motion.div key={course._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="card" style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/result-entry?courseId=${course._id}`)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: 50, height: 50, borderRadius: 'var(--radius-sm)', background: 'var(--yellow)', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', color: '#000', boxShadow: '2px 2px 0px #000', flexShrink: 0 }}>
                  {course.code?.substring(0, 3)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{course.code}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{course.title}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                <span>{course.creditUnits} CU</span>
                <span>•</span>
                <span>Level {course.level}</span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <HiOutlineUserGroup size={14} /> {course.enrolledStudents || 0} students
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); navigate(`/result-entry?courseId=${course._id}`); }}>
                  <HiOutlinePencilSquare size={14} /> Enter Results
                </button>
                <button className="btn btn-outline btn-sm" onClick={(e) => { e.stopPropagation(); navigate(`/grade-book?courseId=${course._id}`); }}>
                  Grade Book
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
