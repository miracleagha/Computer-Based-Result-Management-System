import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineChevronUp, HiOutlineChevronDown, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';

const DataTable = ({
  columns = [],
  data = [],
  pagination = null,
  onPageChange,
  onSort,
  sortField = '',
  sortOrder = 'asc',
  loading = false,
  emptyMessage = 'No data found',
  rowKey = '_id',
  onRowClick,
}) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  const handleSort = (field) => {
    if (!onSort) return;
    onSort(field, sortField === field && sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <HiOutlineChevronUp size={11} style={{ opacity: 0.3 }} />;
    return sortOrder === 'asc'
      ? <HiOutlineChevronUp size={11} style={{ color: '#000' }} />
      : <HiOutlineChevronDown size={11} style={{ color: '#000' }} />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#fff', border: '2px solid #000',
        borderRadius: '0.75rem', boxShadow: '4px 4px 0px #000',
        overflow: 'hidden',
      }}
    >
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  style={{ cursor: col.sortable ? 'pointer' : 'default', userSelect: 'none', width: col.width }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    {col.label}
                    {col.sortable && <SortIcon field={col.key} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length}
                    style={{ textAlign: 'center', padding: '3rem 1rem', fontFamily: "'Satoshi',sans-serif", fontWeight: 500, color: '#888' }}>
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row, i) => (
                  <motion.tr
                    key={row[rowKey] || i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.03 * i }}
                    onClick={() => onRowClick?.(row)}
                    onMouseEnter={() => setHoveredRow(row[rowKey])}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      cursor: onRowClick ? 'pointer' : 'default',
                      background: hoveredRow === row[rowKey] ? 'rgba(255,225,124,0.2)' : 'transparent',
                    }}
                  >
                    {columns.map((col) => (
                      <td key={col.key}>
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </td>
                    ))}
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {pagination && pagination.pages > 1 && (
        <div style={{
          padding: '1rem 1.5rem', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
          borderTop: '2px solid #000', background: '#f9f9f9',
          flexWrap: 'wrap', gap: '0.75rem',
        }}>
          <span style={{ fontFamily: "'Satoshi',sans-serif", fontSize: '0.8125rem', fontWeight: 500, color: '#555' }}>
            Page {pagination.page} of {pagination.pages} ({pagination.total} total)
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-sm btn-outline"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange?.(pagination.page - 1)}
            >
              <HiOutlineChevronLeft size={13} /> Previous
            </button>
            <button className="btn btn-sm btn-primary"
              disabled={pagination.page >= pagination.pages}
              onClick={() => onPageChange?.(pagination.page + 1)}
            >
              Next <HiOutlineChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DataTable;
