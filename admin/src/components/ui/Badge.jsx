/* Neo-Brutalist Badge — 2px border, hard look, no soft rounded pills */
const statusMap = {
  active: 'success', approved: 'success', completed: 'success',
  pending: 'warning', draft: 'warning',
  submitted: 'info',
  rejected: 'danger', suspended: 'danger', expired: 'danger',
  inactive: 'neutral',
};

const Badge = ({ children, variant = 'neutral', size = 'sm', dot = false }) => {
  const autoVariant = typeof children === 'string'
    ? statusMap[children.toLowerCase()] || variant
    : variant;

  /* map variant → neo-brutalist color tokens */
  const styles = {
    success: { bg: '#dcfce7', color: '#166534', border: '#166534' },
    warning: { bg: '#ffe17c', color: '#000',    border: '#000'    },
    danger:  { bg: '#fee2e2', color: '#991b1b', border: '#991b1b' },
    info:    { bg: '#dbeafe', color: '#1e40af', border: '#1e40af' },
    neutral: { bg: '#b7c6c2', color: '#000',    border: '#000'    },
    dark:    { bg: '#171e19', color: '#ffe17c', border: '#000'    },
    yellow:  { bg: '#ffe17c', color: '#000',    border: '#000'    },
  };

  const s   = styles[autoVariant] || styles.neutral;
  const pad = size === 'xs' ? '0.125rem 0.5rem' : '0.2rem 0.625rem';
  const fs  = size === 'xs' ? '0.625rem' : '0.6875rem';

  const dotColors = {
    success: '#059669', warning: '#000', danger: '#dc2626',
    info: '#1e40af', neutral: '#555', dark: '#ffe17c', yellow: '#000',
  };

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      gap: dot ? '0.375rem' : 0,
      padding: pad, fontSize: fs, fontWeight: 700,
      fontFamily: "'Cabinet Grotesk',sans-serif",
      textTransform: 'uppercase', letterSpacing: '0.05em',
      background: s.bg, color: s.color,
      border: `2px solid ${s.border}`,
      borderRadius: '9999px',
    }}>
      {dot && (
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          backgroundColor: dotColors[autoVariant] || '#555', flexShrink: 0,
        }} />
      )}
      {children}
    </span>
  );
};

export default Badge;
