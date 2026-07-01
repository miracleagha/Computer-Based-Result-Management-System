import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlinePaperAirplane, HiOutlineArrowPath } from 'react-icons/hi2';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { getGradeColor } from '../../utils/gradeColors';
import { useTheme } from '../../context/ThemeContext';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

const ResultEntry = () => {
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(courseId || '');
  const [sessions, setSessions] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const [courseRes, sessRes, semRes] = await Promise.all([
          axios.get('/api/teacher/courses'),
          axios.get('/api/teacher/sessions'),
          axios.get('/api/teacher/semesters')
        ]);
        setCourses(courseRes.data.data);
        setSessions(sessRes.data.data);
        setSemesters(semRes.data.data);
      } catch {}
    };
    fetchCourses();
  }, []);

  const fetchStudents = async () => {
    if (!selectedCourse || !selectedSemester || !selectedSession) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/teacher/courses/${selectedCourse}/students?semesterId=${selectedSemester}&sessionId=${selectedSession}`);
      setStudents(res.data.data.map(s => ({
        ...s,
        caScore: s.result?.caScore ?? '',
        examScore: s.result?.examScore ?? '',
        totalScore: s.result?.totalScore ?? '',
        letterGrade: s.result?.letterGrade ?? '',
        resultId: s.result?._id
      })));
    } catch { setStudents([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchStudents(); }, [selectedCourse, selectedSemester, selectedSession]);

  const updateScore = (index, field, value) => {
    const numValue = value === '' ? '' : Math.max(0, Number(value));
    setStudents(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: numValue };
      if (numValue !== '' || updated[index][field === 'caScore' ? 'examScore' : 'caScore'] !== '') {
        const ca = Number(updated[index].caScore) || 0;
        const exam = Number(updated[index].examScore) || 0;
        updated[index].totalScore = ca + exam;
      }
      return updated;
    });
  };

  const handleSave = async () => {
    const resultsData = students.filter(s => s.caScore !== '' || s.examScore !== '').map(s => ({
      studentId: s.student._id, caScore: Number(s.caScore) || 0, examScore: Number(s.examScore) || 0
    }));
    if (resultsData.length === 0) { toast.error('No scores entered'); return; }
    setSaving(true);
    try {
      const res = await axios.post('/api/teacher/results', { results: resultsData, courseId: selectedCourse, semesterId: selectedSemester, sessionId: selectedSession });
      toast.success(res.data.message);
      fetchStudents();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  const handleSubmit = async () => {
    if (!confirm('Submit results for approval? You won\'t be able to edit after submission.')) return;
    try {
      const res = await axios.post(`/api/teacher/results/submit/${selectedCourse}`, { semesterId: selectedSemester, sessionId: selectedSession });
      toast.success(res.data.message);
      fetchStudents();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Result Entry</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Enter student results for your courses</p>
      </motion.div>

      {/* Selectors */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <select className="form-input form-select" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} style={{ width: 'auto', minWidth: 200 }}>
          <option value="">Select Course</option>
          {courses.map(c => <option key={c._id} value={c._id}>{c.code} — {c.title}</option>)}
        </select>
        <select className="form-input form-select" value={selectedSession} onChange={e => setSelectedSession(e.target.value)} style={{ width: 'auto', minWidth: 160 }}>
          <option value="">Select Session</option>
          {sessions.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
        <select className="form-input form-select" value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)} style={{ width: 'auto', minWidth: 160 }}>
          <option value="">Select Semester</option>
          {semesters.filter(s => !selectedSession || s.sessionId?._id === selectedSession || s.sessionId === selectedSession).map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
      </div>

      {!selectedCourse || !selectedSemester || !selectedSession ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Select a course, session, and semester to begin entering results.</div>
      ) : loading ? <LoadingSkeleton type="cards" /> : students.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No students enrolled in this course for the selected session/semester.</div>
      ) : (
        <>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>Student</th>
                    <th style={{ width: 100 }}>CA Score</th>
                    <th style={{ width: 100 }}>Exam Score</th>
                    <th style={{ width: 80 }}>Total</th>
                    <th style={{ width: 70 }}>Grade</th>
                    <th style={{ width: 80 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => (
                    <tr key={s.student._id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{s.student.firstName} {s.student.lastName}</td>
                      <td>
                        <input type="number" className="form-input" value={s.caScore} min="0" max="40"
                          onChange={e => updateScore(i, 'caScore', e.target.value)}
                          disabled={s.result?.status === 'submitted' || s.result?.status === 'approved'}
                          style={{ padding: '0.375rem 0.5rem', textAlign: 'center', width: '100%', background: s.caScore !== '' && Number(s.caScore) > 40 ? 'rgba(239,68,68,0.1)' : undefined }} />
                      </td>
                      <td>
                        <input type="number" className="form-input" value={s.examScore} min="0" max="60"
                          onChange={e => updateScore(i, 'examScore', e.target.value)}
                          disabled={s.result?.status === 'submitted' || s.result?.status === 'approved'}
                          style={{ padding: '0.375rem 0.5rem', textAlign: 'center', width: '100%', background: s.examScore !== '' && Number(s.examScore) > 60 ? 'rgba(239,68,68,0.1)' : undefined }} />
                      </td>
                      <td style={{ fontWeight: 700, textAlign: 'center' }}>{s.totalScore || '—'}</td>
                      <td>
                        {s.letterGrade ? (
                          <span style={{ ...getGradeColor(s.letterGrade, theme), padding: '0.125rem 0.5rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700 }}>{s.letterGrade}</span>
                        ) : '—'}
                      </td>
                      <td>{s.result?.status ? <span className={`badge badge-${s.result.status === 'draft' ? 'warning' : s.result.status === 'submitted' ? 'info' : 'success'}`}>{s.result.status}</span> : <span className="badge badge-neutral">New</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              <HiOutlineArrowPath size={16} /> {saving ? 'Saving...' : 'Save as Draft'}
            </button>
            <button className="btn btn-secondary" onClick={handleSubmit}>
              <HiOutlinePaperAirplane size={16} /> Submit for Approval
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ResultEntry;
