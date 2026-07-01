import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineBookOpen, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineTrash } from 'react-icons/hi2';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

const CourseRegistration = () => {
  const [availableCourses, setAvailableCourses] = useState([]);
  const [registeredCourses, setRegisteredCourses] = useState([]);
  const [activeSemester, setActiveSemester] = useState(null);
  const [semesterError, setSemesterError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setSemesterError(null);
    try {
      // Fetch registered first — it always succeeds if there's data, even when no active semester.
      const regRes = await axios.get('/api/student/courses/registered');
      setRegisteredCourses(regRes.data.data || []);
    } catch {
      setRegisteredCourses([]);
    }

    try {
      const availRes = await axios.get('/api/student/courses/available');
      setAvailableCourses(availRes.data.data?.courses || []);
      setActiveSemester(availRes.data.data?.semester || null);
    } catch (err) {
      setAvailableCourses([]);
      setActiveSemester(null);
      const msg = err.response?.data?.message;
      if (msg) setSemesterError(msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleCourse = (courseId) => {
    setSelectedCourses(prev => prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]);
  };

  const handleRegister = async () => {
    if (selectedCourses.length === 0) { toast.error('Select at least one course'); return; }
    setSubmitting(true);
    try {
      const res = await axios.post('/api/student/courses/register', { courseIds: selectedCourses });
      const { enrollments = [], errors = [] } = res.data.data || {};
      if (enrollments.length) toast.success(`${enrollments.length} course(s) registered`);
      if (errors.length) toast.error(`${errors.length} course(s) failed`);
      setSelectedCourses([]);
      await fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDrop = async (enrollmentId, courseCode) => {
    if (!window.confirm(`Drop ${courseCode}?`)) return;
    try {
      await axios.delete(`/api/student/enrollments/${enrollmentId}`);
      toast.success(`${courseCode} dropped`);
      await fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to drop course');
    }
  };

  const totalSelectedCredits = selectedCourses.reduce((sum, id) => {
    const course = availableCourses.find(c => c._id === id);
    return sum + (course?.creditUnits || 0);
  }, 0);

  const totalRegisteredCredits = registeredCourses.reduce((sum, r) => sum + (r.courseId?.creditUnits || 0), 0);

  if (loading) return <LoadingSkeleton type="table" rows={5} />;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Course Registration</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          {activeSemester
            ? `Register for ${activeSemester.name}${activeSemester.registrationDeadline ? ` · deadline ${new Date(activeSemester.registrationDeadline).toLocaleDateString()}` : ''}`
            : 'Register for available courses'}
        </p>
      </motion.div>

      {semesterError && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card"
          style={{ marginBottom: '1.5rem', background: '#fff5f5', border: '2px solid #dc2626', boxShadow: '2px 2px 0px #dc2626' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HiOutlineXCircle size={20} style={{ color: '#dc2626' }} />
            <span style={{ fontWeight: 700, color: '#7f1d1d' }}>{semesterError}</span>
          </div>
        </motion.div>
      )}

      {/* Current Registrations */}
      {registeredCourses.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Registered Courses</h3>
            <span className="badge badge-info">{totalRegisteredCredits} Credits</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {registeredCourses.map(r => (
              <div key={r._id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
                padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-sm)',
                background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                  <HiOutlineCheckCircle size={18} style={{ color: '#10b981', flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {r.courseId?.code} — {r.courseId?.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {r.courseId?.creditUnits} credits · {r.semesterId?.name || 'Current semester'}
                    </div>
                  </div>
                </div>
                <button onClick={() => handleDrop(r._id, r.courseId?.code)}
                  className="btn btn-sm btn-outline" title="Drop course"
                  style={{ padding: '0.375rem 0.625rem' }}>
                  <HiOutlineTrash size={14} />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Available Courses */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h3 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Available Courses</h3>
          {selectedCourses.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{selectedCourses.length} selected • {totalSelectedCredits} credits</span>
              <button onClick={handleRegister} disabled={submitting} className="btn btn-primary btn-sm">
                {submitting ? 'Registering…' : 'Register Selected'}
              </button>
            </div>
          )}
        </div>

        {availableCourses.length === 0 && !semesterError ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <HiOutlineBookOpen size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem' }} />
            <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No courses available</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Your institution hasn&apos;t published courses for your department/level yet.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {availableCourses.map((course, i) => {
              const isSelected = selectedCourses.includes(course._id);
              const isEnrolled = course.isEnrolled;
              return (
                <motion.div key={course._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  onClick={() => !isEnrolled && toggleCourse(course._id)}
                  className="card"
                  style={{
                    cursor: isEnrolled ? 'not-allowed' : 'pointer',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: isSelected ? 'rgba(59,130,246,0.04)' : 'var(--bg-card)',
                    opacity: isEnrolled ? 0.55 : 1,
                    transition: 'var(--transition)'
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)',
                        background: isEnrolled ? '#10b981' : isSelected ? 'var(--primary)' : 'var(--bg-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isEnrolled || isSelected
                          ? <HiOutlineCheckCircle size={20} style={{ color: '#fff' }} />
                          : <HiOutlineBookOpen size={18} style={{ color: 'var(--text-muted)' }} />}
                      </div>
                      <div>
                        <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{course.title}</h4>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{course.code}</p>
                      </div>
                    </div>
                    <span className="badge badge-info">{course.creditUnits} cr</span>
                  </div>
                  <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>{course.departmentId?.name}</span>
                    <span>•</span>
                    <span>{course.teacherId ? `${course.teacherId.firstName} ${course.teacherId.lastName}` : 'TBA'}</span>
                    {isEnrolled && <span style={{ marginLeft: 'auto', color: '#10b981', fontWeight: 700 }}>Registered</span>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CourseRegistration;
