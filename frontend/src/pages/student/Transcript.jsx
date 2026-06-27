import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { HiOutlinePrinter, HiOutlineAcademicCap, HiOutlineTrophy } from 'react-icons/hi2';
import axios from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import { getGradeColor } from '../../utils/gradeColors';
import { formatGPA, formatDate, getClassification } from '../../utils/formatters';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

const Transcript = () => {
  const { theme } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();

  useEffect(() => {
    const fetchTranscript = async () => {
      try { const res = await axios.get('/api/student/transcript'); setData(res.data.data); }
      catch { setData(null); } finally { setLoading(false); }
    };
    fetchTranscript();
  }, []);

  const handlePrint = () => {
    const content = printRef.current;
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`<html><head><title>Academic Transcript</title><style>
      body { font-family: 'Inter', Arial, sans-serif; padding: 2rem; color: #0f172a; }
      h1, h2, h3 { margin: 0; } table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
      th, td { padding: 0.5rem 0.75rem; text-align: left; border: 1px solid #e2e8f0; font-size: 0.8rem; }
      th { background: #f1f5f9; font-weight: 700; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.05em; }
      .header { text-align: center; margin-bottom: 2rem; border-bottom: 2px solid #1e40af; padding-bottom: 1rem; }
      .semester { margin-bottom: 1.5rem; } .gpa { font-weight: 700; color: #1e40af; }
    </style></head><body>${content.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) return <LoadingSkeleton type="cards" />;

  if (!data) return (
    <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <HiOutlineAcademicCap size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
      <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No Transcript Available</h3>
      <p style={{ color: 'var(--text-muted)' }}>Your transcript will be available once you have approved results.</p>
    </div>
  );

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Academic Transcript</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Your complete academic history</p>
        </div>
        <button className="btn btn-primary" onClick={handlePrint}><HiOutlinePrinter size={18} /> Print Transcript</button>
      </motion.div>

      {/* CGPA Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="card" style={{
          background: 'var(--yellow)',
          color: '#000', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
        <div>
          <p style={{ color: '#555', fontSize: '0.8125rem', marginBottom: '0.25rem', fontWeight: 500 }}>Cumulative GPA</p>
          <div style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1, fontFamily: "'Cabinet Grotesk', sans-serif" }}>{formatGPA(data.cgpa)}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontFamily: "'Satoshi', sans-serif" }}>
            <HiOutlineTrophy size={16} />
            <span style={{ fontWeight: 700 }}>{data.classification}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right', fontFamily: "'Satoshi', sans-serif" }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{data.student?.name}</div>
          <div style={{ fontSize: '0.8125rem', color: '#333', fontWeight: 500 }}>{data.student?.matricNumber}</div>
          <div style={{ fontSize: '0.8125rem', color: '#333', fontWeight: 500 }}>{data.student?.department}</div>
        </div>
      </motion.div>

      {/* Printable Content */}
      <div ref={printRef}>
        <div className="header" style={{ display: 'none' }}>
          <h1>{data.institution?.name}</h1>
          <h3>ACADEMIC TRANSCRIPT</h3>
          <p>{data.student?.name} | {data.student?.matricNumber} | {data.student?.department}</p>
        </div>

        {data.semesters?.map((semester, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1 }}
            className="card semester" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{semester.session} — {semester.semester}</h3>
              <span className="badge badge-info" style={{ fontWeight: 700 }}>GPA: {formatGPA(semester.gpa)}</span>
            </div>
            <table className="data-table" style={{ margin: 0 }}>
              <thead><tr><th>Code</th><th>Title</th><th>CU</th><th>Grade</th><th>GP</th></tr></thead>
              <tbody>
                {semester.results?.map((r, j) => (
                  <tr key={j}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{r.code}</td>
                    <td>{r.title}</td>
                    <td>{r.creditUnits}</td>
                    <td><span style={{ ...getGradeColor(r.grade, theme), padding: '0.125rem 0.5rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700 }}>{r.grade}</span></td>
                    <td style={{ fontWeight: 600 }}>{r.gradePoint?.toFixed(1)}</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 700, background: 'var(--bg-primary)' }}>
                  <td colSpan="2" style={{ textAlign: 'right' }}>Semester Total</td>
                  <td>{semester.totalCreditUnits}</td>
                  <td colSpan="2" className="gpa" style={{ color: 'var(--primary)' }}>GPA: {formatGPA(semester.gpa)}</td>
                </tr>
              </tbody>
            </table>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Transcript;
