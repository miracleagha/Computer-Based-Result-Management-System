import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color = 'var(--primary)', trend, trendValue, delay = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const numValue = parseInt(value) || 0;
    if (numValue === 0) { setDisplayValue(0); return; }

    const duration = 1500;
    const steps = 60;
    const stepValue = numValue / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(stepValue * step), numValue);
      setDisplayValue(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const bgMap = {
    yellow:  '#ffe17c',
    sage:    '#b7c6c2',
    white:   '#ffffff',
    dark:    '#171e19',
    blue:    '#ffe17c',   // fallback → yellow
    green:   '#b7c6c2',
    amber:   '#ffffff',
    purple:  '#ffe17c',
    red:     '#ffffff',
  };

  const bg       = bgMap[color] || bgMap.yellow;
  const isDark   = bg === '#171e19';
  const textClr  = isDark ? '#fff' : '#000';
  const mutedClr = isDark ? '#b7c6c2' : '#555';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: delay * 0.08 }}
      whileHover={{ x: 2, y: 2, boxShadow: '2px 2px 0px #000' }}
      style={{
        background: bg,
        border: '2px solid #000',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        boxShadow: '4px 4px 0px #000',
        transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        cursor: 'default',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '1rem',
      }}
    >
      <div>
        <p style={{ fontSize: '0.8125rem', color: mutedClr, fontWeight: 500, marginBottom: '0.5rem' }}>
          {title}
        </p>
        <motion.h3
          key={displayValue}
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: textClr,
            lineHeight: 1.1,
            letterSpacing: '-0.025em'
          }}
        >
          {displayValue.toLocaleString()}
        </motion.h3>
        {trend && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            marginTop: '0.5rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: trend === 'up' ? '#10b981' : '#ef4444'
          }}>
            <span>{trend === 'up' ? '↑' : '↓'}</span>
            <span>{trendValue}</span>
            <span style={{ color: mutedClr, fontWeight: 400 }}>vs last month</span>
          </div>
        )}
      </div>

      <div style={{
        width: 44,
        height: 44,
        background: isDark ? '#ffe17c' : '#000',
        border: '2px solid #000',
        borderRadius: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '2px 2px 0px #000',
        flexShrink: 0
      }}>
        <Icon style={{ fontSize: '1.25rem', color: isDark ? '#000' : (bg === '#ffe17c' ? '#000' : '#fff') }} />
      </div>
    </motion.div>
  );
};

export default StatCard;
