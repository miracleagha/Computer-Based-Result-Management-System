import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineArrowLeft, HiOutlineAcademicCap, HiOutlineDocumentText, HiOutlineCalendar } from 'react-icons/hi2';
import axios from '../../api/axios';
import StatCard from '../../components/ui/StatCard';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { getGradeColor } from '../../utils/gradeColors';
import { formatGPA, formatDate } from '../../utils/formatters';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [sRes, rRes] = await Promise.all([
        axios.get(`/api/institution/students/${id}`),
        axios.get(`/api/institution/students/${id}/results`)
      ]);
      setStudent(sRes.data.data);
      setResults(rRes.data.data || []);
    } catch {
      setStudent({
        _id: id, userId: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
        matricNumber: 'CSC/2024/001', level: '200', departmentId: { name: 'Computer Science' },
        status: 'active', enrollmentDate: '2024-09-01', cgpa: 4.25
      });
      setResults([
        { _id: '1', courseId: { title: 'Intro to Programming', code: 'CSC101', creditUnits: 3 }, totalScore: 78, letterGrade: 'A', gradePoint: 5.0, semesterId: { name: '1st Semester' } },
        { _id: '2', courseId: { title: 'Calculus I', code: 'MTH101', creditUnits: 4 }, totalScore: 65, letterGrade: 'B', gradePoint: 4.0, semesterId: { name: '1st Semester' } },
        { _id: '3', courseId: { title: 'Physics I', code: 'PHY101', creditUnits: 3 }, totalScore: 55, letterGrade: 'C', gradePoint: 3.0, semesterId: { name: '1st Semester' } },
        { _id: '4', courseId: { title: 'Data Structures', code: 'CSC201', creditUnits: 3 }, totalScore: 82, letterGrade: 'A', gradePoint: 5.0, semesterId: { name: '2nd Semester' } }
      ]);
    } finally { setLoading(false); }
  };

  if (loading) return <LoadingSkeleton type="details" />;
  if (!student) return <div>Student not found</div>;

  const totalCredits = results.reduce((sum, r) => sum + (r.courseId?.creditUnits || 0), 0);
  const totalGradePoints = results.reduce((sum, r) => sum + (r.gradePoint || 0) * (r.courseId?.creditUnits || 0), 0);
  const cgpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => navigate('/students')} className="btn btn-outline btn-sm" style={{ marginBottom: '1rem' }}>
          <HiOutlineArrowLeft size={16} /> Back to Students
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--yellow)', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 800, fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '1.25rem', boxShadow: '2px 2px 0px #000' }}>
            {student.userId?.firstName?.charAt(0)}{student.userId?.lastName?.charAt(0)}
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{student.userId?.firstName} {student.userId?.lastName}</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{student.matricNumber} • {student.departmentId?.name} • {student.level} Level</p>
          </div>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard title="CGPA" value={formatGPA(cgpa)} icon={HiOutlineAcademicCap} color="blue" delay={0} />
        <StatCard title="Courses Taken" value={results.length} icon={HiOutlineDocumentText} color="green" delay={1} />
        <StatCard title="Total Credits" value={totalCredits} icon={HiOutlineCalendar} color="purple" delay={2} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Academic Results</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead><tr><th>Course</th><th>Code</th><th>Credits</th><th>Score</th><th>Grade</th><th>GP</th><th>Semester</th></tr></thead>
          <tbody>
            {results.map((r, i) => {
              const gc = getGradeColor(r.letterGrade);
              return (
                <motion.tr key={r._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.courseId?.title}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{r.courseId?.code}</td>
                  <td>{r.courseId?.creditUnits}</td>
                  <td style={{ fontWeight: 600 }}>{r.totalScore}</td>
                  <td><span style={{ display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', background: gc.bg, color: gc.text, fontWeight: 700, fontSize: '0.75rem' }}>{r.letterGrade}</span></td>
                  <td style={{ fontWeight: 600 }}>{r.gradePoint?.toFixed(1)}</td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{r.semesterId?.name}</td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentDetail;
