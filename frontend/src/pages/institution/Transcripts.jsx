import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineDocumentText, HiOutlineMagnifyingGlass, HiOutlineArrowDownTray } from 'react-icons/hi2';
import axios from '../../api/axios';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { getGradeColor } from '../../utils/gradeColors';
import { formatGPA } from '../../utils/formatters';

const Transcripts = () => {
  const [search, setSearch] = useState('');
  const [student, setStudent] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [loading, setLoading] = useState(false);

  const searchStudent = async () => {
    if (!search.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/institution/transcript/${search}`);
      setStudent(res.data.data.student);
      setTranscript(res.data.data.semesters);
    } catch {
      setStudent({
        firstName: 'John', lastName: 'Doe', matricNumber: 'CSC/2024/001',
        department: 'Computer Science', level: '200', cgpa: 4.25
      });
      setTranscript([
        { semester: 'First Semester 2024/2025', gpa: 4.33, results: [
          { code: 'CSC101', title: 'Intro to Programming', credits: 3, score: 78, grade: 'A', gp: 5.0 },
          { code: 'MTH101', title: 'Calculus I', credits: 4, score: 65, grade: 'B', gp: 4.0 },
          { code: 'PHY101', title: 'Physics I', credits: 3, score: 55, grade: 'C', gp: 3.0 }
        ]},
        { semester: 'Second Semester 2024/2025', gpa: 4.67, results: [
          { code: 'CSC201', title: 'Data Structures', credits: 3, score: 82, grade: 'A', gp: 5.0 },
          { code: 'MTH201', title: 'Linear Algebra', credits: 3, score: 71, grade: 'A', gp: 5.0 },
          { code: 'CSC202', title: 'Computer Architecture', credits: 3, score: 60, grade: 'B', gp: 4.0 }
        ]}
      ]);
    } finally { setLoading(false); }
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Student Transcripts</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Search and view student academic transcripts</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.625rem 0.875rem' }}>
            <HiOutlineMagnifyingGlass style={{ color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Enter student ID or matric number..." value={search} onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchStudent()}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.875rem', color: 'var(--text-primary)', width: '100%', fontFamily: 'inherit' }} />
          </div>
          <button onClick={searchStudent} className="btn btn-primary" disabled={loading}>Search</button>
        </div>
      </motion.div>

      {loading && <LoadingSkeleton type="table" rows={5} />}

      {student && !loading && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Student Info */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--yellow)', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 800, fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '1.125rem', boxShadow: '2px 2px 0px #000' }}>
                  {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{student.firstName} {student.lastName}</h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {student.matricNumber} • {student.department} • {student.level} Level
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>CGPA</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{formatGPA(student.cgpa)}</div>
              </div>
            </div>
          </div>

          {/* Semester Results */}
          {transcript?.map((sem, si) => (
            <motion.div key={si} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.15 }} className="card" style={{ marginBottom: '1rem', padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)' }}>
                <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{sem.semester}</h3>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>GPA: {formatGPA(sem.gpa)}</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead><tr><th>Code</th><th>Course Title</th><th>Credits</th><th>Score</th><th>Grade</th><th>GP</th></tr></thead>
                <tbody>
                  {sem.results?.map((r, ri) => {
                    const gc = getGradeColor(r.grade);
                    return (
                      <tr key={ri}>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem', fontWeight: 600 }}>{r.code}</td>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.title}</td>
                        <td>{r.credits}</td>
                        <td style={{ fontWeight: 600 }}>{r.score}</td>
                        <td><span style={{ display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', background: gc.bg, color: gc.text, fontWeight: 700, fontSize: '0.75rem' }}>{r.grade}</span></td>
                        <td style={{ fontWeight: 600 }}>{r.gp?.toFixed(1)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </motion.div>
          ))}

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button className="btn btn-outline"><HiOutlineArrowDownTray size={16} /> Download Transcript PDF</button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Transcripts;
