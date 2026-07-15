import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlinePlusCircle, HiOutlineTrash, HiOutlinePencilSquare } from 'react-icons/hi2';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

const defaultScales = [
  { grade: 'A', minScore: 70, maxScore: 100, gradePoint: 5.0, remark: 'Excellent' },
  { grade: 'B', minScore: 60, maxScore: 69, gradePoint: 4.0, remark: 'Very Good' },
  { grade: 'C', minScore: 50, maxScore: 59, gradePoint: 3.0, remark: 'Good' },
  { grade: 'D', minScore: 45, maxScore: 49, gradePoint: 2.0, remark: 'Fair' },
  { grade: 'E', minScore: 40, maxScore: 44, gradePoint: 1.0, remark: 'Pass' },
  { grade: 'F', minScore: 0, maxScore: 39, gradePoint: 0.0, remark: 'Fail' }
];

const GradingScales = () => {
  const [scales, setScales] = useState([]);
  const [scaleId, setScaleId] = useState(null); // track the document's _id for the PATCH call
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedScales, setEditedScales] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchScales(); }, []);

  const fetchScales = async () => {
    try {
      const res = await axios.get('/api/institution/grading-scales');
      // res.data.data is an array of GradingScale documents
      const docs = res.data.data;
      if (Array.isArray(docs) && docs.length > 0) {
        const doc = docs[0]; // each institution has one grading scale
        setScaleId(doc._id);
        setScales(doc.scales?.length > 0 ? doc.scales : defaultScales);
      } else {
        setScales(defaultScales);
      }
    } catch {
      setScales(defaultScales);
    } finally { setLoading(false); }
  };

  const startEditing = () => {
    setEditedScales([...scales]);
    setEditing(true);
  };

  const updateScale = (index, field, value) => {
    const updated = [...editedScales];
    updated[index] = { ...updated[index], [field]: field === 'grade' || field === 'remark' ? value : Number(value) };
    setEditedScales(updated);
  };

  const addRow = () => {
    setEditedScales([...editedScales, { grade: '', minScore: 0, maxScore: 0, gradePoint: 0, remark: '' }]);
  };

  const removeRow = (index) => {
    setEditedScales(editedScales.filter((_, i) => i !== index));
  };

  const saveScales = async () => {
    setSaving(true);
    try {
      // Use the convenience endpoint that doesn't require knowing the scale _id
      await axios.put('/api/institution/grading-scales/my', { scales: editedScales });
      toast.success('Grading scale updated');
      setScales(editedScales);
      setEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const gradeColorMap = {
    'A': '#10b981', 'B': '#3b82f6', 'C': '#f59e0b', 'D': '#f97316', 'E': '#ec4899', 'F': '#ef4444'
  };

  if (loading) return <LoadingSkeleton type="table" rows={6} />;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Grading Scales</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Configure how scores map to grades</p>
          </div>
          {!editing ? (
            <button onClick={startEditing} className="btn btn-primary btn-sm"><HiOutlinePencilSquare size={16} /> Edit Scale</button>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setEditing(false)} className="btn btn-outline btn-sm" disabled={saving}>Cancel</button>
              <button onClick={saveScales} className="btn btn-primary btn-sm" disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Grade</th>
              <th>Min Score</th>
              <th>Max Score</th>
              <th>Grade Point</th>
              <th>Remark</th>
              {editing && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {(editing ? editedScales : scales).map((scale, i) => (
              <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                <td>
                  {editing ? (
                    <input className="form-input" value={scale.grade} onChange={(e) => updateScale(i, 'grade', e.target.value)} style={{ width: 60, padding: '0.375rem' }} />
                  ) : (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 36, height: 36, borderRadius: '50%',
                      background: `${gradeColorMap[scale.grade] || '#94a3b8'}15`,
                      color: gradeColorMap[scale.grade] || '#94a3b8',
                      fontWeight: 800, fontSize: '0.875rem'
                    }}>
                      {scale.grade}
                    </span>
                  )}
                </td>
                <td>
                  {editing ? <input className="form-input" type="number" value={scale.minScore} onChange={(e) => updateScale(i, 'minScore', e.target.value)} style={{ width: 80, padding: '0.375rem' }} />
                  : <span style={{ fontWeight: 600 }}>{scale.minScore}</span>}
                </td>
                <td>
                  {editing ? <input className="form-input" type="number" value={scale.maxScore} onChange={(e) => updateScale(i, 'maxScore', e.target.value)} style={{ width: 80, padding: '0.375rem' }} />
                  : <span style={{ fontWeight: 600 }}>{scale.maxScore}</span>}
                </td>
                <td>
                  {editing ? <input className="form-input" type="number" step="0.1" value={scale.gradePoint} onChange={(e) => updateScale(i, 'gradePoint', e.target.value)} style={{ width: 80, padding: '0.375rem' }} />
                  : <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{scale.gradePoint.toFixed(1)}</span>}
                </td>
                <td>
                  {editing ? <input className="form-input" value={scale.remark} onChange={(e) => updateScale(i, 'remark', e.target.value)} style={{ width: 120, padding: '0.375rem' }} />
                  : <span className="badge badge-info">{scale.remark}</span>}
                </td>
                {editing && (
                  <td>
                    <button onClick={() => removeRow(i)} className="btn btn-sm btn-outline" style={{ padding: '0.25rem 0.5rem', color: 'var(--danger)' }}>
                      <HiOutlineTrash size={14} />
                    </button>
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
        </div>
        {editing && (
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)' }}>
            <button onClick={addRow} className="btn btn-outline btn-sm"><HiOutlinePlusCircle size={16} /> Add Grade Row</button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default GradingScales;
