import { motion } from 'framer-motion';

const EmptyState = ({
  icon = '📭',
  title = 'No data found',
  description = 'There are no items to display at the moment.',
  action,
  actionLabel = 'Get Started',
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    style={{
      background: '#fff', border: '2px solid #000',
      borderRadius: '0.75rem', boxShadow: '4px 4px 0px #000',
      textAlign: 'center', padding: '4rem 2rem',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
    }}
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', damping: 14, delay: 0.2 }}
      style={{
        width: 72, height: 72, background: '#ffe17c',
        border: '2px solid #000', borderRadius: '0.75rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '2rem', lineHeight: 1, boxShadow: '4px 4px 0px #000',
      }}
    >
      {icon}
    </motion.div>

    <h3 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '1.125rem', fontWeight: 800, color: '#000', marginTop: '0.5rem', letterSpacing: '-0.02em' }}>
      {title}
    </h3>
    <p style={{ fontFamily: "'Satoshi',sans-serif", fontWeight: 500, color: '#666', fontSize: '0.9rem', maxWidth: 380, lineHeight: 1.6 }}>
      {description}
    </p>

    {action && (
      <motion.button
        whileHover={{ x: 2, y: 2, boxShadow: '2px 2px 0px #000' }}
        whileTap={{ x: 4, y: 4, boxShadow: '0px 0px 0px #000' }}
        onClick={action}
        style={{
          marginTop: '0.75rem', padding: '0.75rem 1.75rem',
          background: '#000', color: '#fff',
          border: '2px solid #000', borderRadius: '0.75rem',
          fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '0.9rem', fontWeight: 800,
          cursor: 'pointer', boxShadow: '4px 4px 0px #000',
          transition: 'all 0.2s cubic-bezier(0.175,0.885,0.32,1.275)',
        }}
      >
        {actionLabel}
      </motion.button>
    )}
  </motion.div>
);

export default EmptyState;
