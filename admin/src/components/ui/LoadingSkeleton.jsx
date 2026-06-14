const LoadingSkeleton = ({ rows = 5, type = 'table' }) => {
  if (type === 'cards') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ background: '#fff', border: '2px solid #000', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '4px 4px 0px #000', height: 130 }}>
            <div className="skeleton" style={{ width: '60%', height: 14, marginBottom: 16 }} />
            <div className="skeleton" style={{ width: '45%', height: 36, marginBottom: 12 }} />
            <div className="skeleton" style={{ width: '70%', height: 12 }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', border: '2px solid #000', borderRadius: '0.75rem', boxShadow: '4px 4px 0px #000', overflow: 'hidden' }}>
      <div style={{ padding: '1rem 1.5rem', borderBottom: '2px solid #000', background: '#ffe17c' }}>
        <div className="skeleton" style={{ width: 180, height: 20 }} />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ padding: '1rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <div className="skeleton" style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ width: '50%', height: 14, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: '32%', height: 12 }} />
          </div>
          <div className="skeleton" style={{ width: 72, height: 26, borderRadius: 9999 }} />
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
