import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineDocumentText, HiOutlineFunnel, HiOutlineXMark } from 'react-icons/hi2';
import axios from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import { getGradeColor } from '../../utils/gradeColors';
import { formatGPA } from '../../utils/formatters';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

const selectStyle = {
  padding: '0.6rem 2.25rem 0.6rem 0.875rem',
  border: '2px solid #000',
  borderRadius: '0.5rem',
  fontFamily: "'Satoshi',sans-serif",
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: '#000',
  background: '#fff',
  outline: 'none',
  cursor: 'pointer',
  boxShadow: '3px 3px 0px #000',
  transition: 'box-shadow 0.15s, transform 0.15s',
  appearance: 'none',
  WebkitAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 0.625rem center',
};

const Results = () => {
  const { theme } = useTheme();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [sessRes, semRes] = await Promise.all([
          axios.get('/api/student/sessions'),
          axios.get('/api/student/semesters?all=true')
        ]);
        setSessions(sessRes.data.data || []);
        setSemesters(semRes.data.data || []);
      } catch {
        setSessions([]);
        setSemesters([]);
      }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedSession) params.set('sessionId', selectedSession);
    if (selectedSemester) params.set('semesterId', selectedSemester);
    const fetchResults = async () => {
      try { const res = await axios.get(`/api/student/results?${params}`); setResults(res.data.data?.results || res.data.data || []); }
      catch { setResults([]); } finally { setLoading(false); }
    };
    fetchResults();
  }, [selectedSession, selectedSemester]);

  const clearFilters = () => { setSelectedSession(''); setSelectedSemester(''); };
  const hasFilters = selectedSession || selectedSemester;

  const totalCU = results.reduce((sum, r) => sum + (r.courseId?.creditUnits || 0), 0);
  const weightedGP = results.reduce((sum, r) => sum + ((r.gradePoint || 0) * (r.courseId?.creditUnits || 0)), 0);
  const gpa = totalCU > 0 ? weightedGP / totalCU : 0;
  const filteredSemesters = semesters.filter(s => !selectedSession || s.sessionId?._id === selectedSession || s.sessionId === selectedSession);

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>My Results</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>View your published semester results</p>
      </motion.div>

      {/* ── Filter Bar ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="card"
        style={{ marginBottom: '1.5rem', padding: '0.875rem 1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginRight: '0.25rem' }}>
          <HiOutlineFunnel size={16} style={{ color: '#555' }} />
          <span style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#555' }}>Filter</span>
        </div>

        {/* Session select */}
        <div style={{ position: 'relative' }}>
          <select
            value={selectedSession}
            onChange={e => { setSelectedSession(e.target.value); setSelectedSemester(''); }}
            style={selectStyle}
            onFocus={e => { e.target.style.boxShadow = '5px 5px 0px #000'; e.target.style.transform = 'translate(-1px,-1px)'; }}
            onBlur={e => { e.target.style.boxShadow = '3px 3px 0px #000'; e.target.style.transform = 'translate(0,0)'; }}
          >
            <option value="">All Sessions</option>
            {sessions.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>

        {/* Semester select */}
        <div style={{ position: 'relative' }}>
          <select
            value={selectedSemester}
            onChange={e => setSelectedSemester(e.target.value)}
            style={selectStyle}
            disabled={filteredSemesters.length === 0}
            onFocus={e => { e.target.style.boxShadow = '5px 5px 0px #000'; e.target.style.transform = 'translate(-1px,-1px)'; }}
            onBlur={e => { e.target.style.boxShadow = '3px 3px 0px #000'; e.target.style.transform = 'translate(0,0)'; }}
          >
            <option value="">All Semesters</option>
            {filteredSemesters.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>

        {/* Clear filters */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.5rem 0.75rem',
              border: '2px solid #000', borderRadius: '0.5rem',
              background: '#ffe17c', color: '#000',
              fontFamily: "'Satoshi',sans-serif", fontSize: '0.8rem', fontWeight: 700,
              cursor: 'pointer', boxShadow: '2px 2px 0px #000',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(1px,1px)'; e.currentTarget.style.boxShadow = '1px 1px 0px #000'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = '2px 2px 0px #000'; }}
          >
            <HiOutlineXMark size={14} /> Clear
          </button>
        )}

        {/* Active filter chips */}
        {hasFilters && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
            {selectedSession && (
              <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem', background: '#171e19', color: '#ffe17c', borderRadius: '9999px', fontWeight: 600, fontFamily: "'Satoshi',sans-serif" }}>
                {sessions.find(s => s._id === selectedSession)?.name}
              </span>
            )}
            {selectedSemester && (
              <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem', background: '#171e19', color: '#b7c6c2', borderRadius: '9999px', fontWeight: 600, fontFamily: "'Satoshi',sans-serif" }}>
                {semesters.find(s => s._id === selectedSemester)?.name}
              </span>
            )}
          </div>
        )}
      </motion.div>

      {/* GPA Summary */}
      {results.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'GPA', value: formatGPA(gpa), color: '#1e40af' },
            { label: 'Courses', value: results.length, color: '#059669' },
            { label: 'Credit Units', value: totalCU, color: '#7c3aed' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color, fontFamily: "'Cabinet Grotesk',sans-serif" }}>{value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.25rem' }}>{label}</div>
            </div>
          ))}
        </motion.div>
      )}

      {loading ? <LoadingSkeleton type="cards" /> : results.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <HiOutlineDocumentText size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No Results Yet</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            {hasFilters ? 'No results found for the selected filters.' : 'Your results will appear here once they are published.'}
          </p>
          {hasFilters && (
            <button onClick={clearFilters} className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }}>
              <HiOutlineXMark size={14} /> Clear Filters
            </button>
          )}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead><tr><th>Code</th><th>Course Title</th><th>CU</th><th>CA</th><th>Exam</th><th>Total</th><th>Grade</th><th>GP</th></tr></thead>
              <tbody>
                {results.map(r => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary)' }}>{r.courseId?.code}</td>
                    <td>{r.courseId?.title}</td>
                    <td>{r.courseId?.creditUnits}</td>
                    <td>{r.caScore}</td>
                    <td>{r.examScore}</td>
                    <td style={{ fontWeight: 700 }}>{r.totalScore}</td>
                    <td><span style={{ ...getGradeColor(r.letterGrade, theme), padding: '0.125rem 0.5rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700 }}>{r.letterGrade}</span></td>
                    <td style={{ fontWeight: 600 }}>{r.gradePoint?.toFixed(1)}</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 700, background: 'var(--bg-primary)' }}>
                  <td colSpan="2" style={{ textAlign: 'right' }}>Total / GPA</td>
                  <td>{totalCU}</td><td colSpan="3"></td>
                  <td colSpan="2" style={{ fontSize: '1rem', color: 'var(--primary)' }}>{formatGPA(gpa)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Results;
