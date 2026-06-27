import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineArrowTrendingUp, HiOutlineArrowTrendingDown } from 'react-icons/hi2';

/* Neo-Brutalist card backgrounds per variant */
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

const StatCard = ({ title, value, icon: Icon, color = 'yellow', trend, trendValue, delay = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    const numValue = parseInt(value) || 0;
    if (numValue === 0) { setDisplayValue(0); return; }
    const steps = 60;
    const stepValue = numValue / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setDisplayValue(Math.min(Math.round(stepValue * step), numValue));
      if (step >= steps) clearInterval(timer);
    }, 1500 / steps);
    return () => clearInterval(timer);
  }, [value]);

  const bg       = bgMap[color] || '#ffe17c';
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
        background: bg, border: '2px solid #000',
        borderRadius: '0.75rem', padding: '1.5rem',
        boxShadow: '4px 4px 0px #000',
        transition: 'all 0.2s cubic-bezier(0.175,0.885,0.32,1.275)',
        cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        {/* Icon */}
        <div style={{
          width: 44, height: 44, background: isDark ? '#ffe17c' : '#000',
          border: '2px solid #000', borderRadius: '0.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '2px 2px 0px #000',
        }}>
          <Icon style={{ fontSize: '1.25rem', color: isDark ? '#000' : (bg === '#ffe17c' ? '#000' : '#fff') }} />
        </div>

        {/* Trend pill */}
        {trend && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.25rem',
            background: '#fff', border: '2px solid #000', borderRadius: 9999,
            padding: '0.2rem 0.625rem',
          }}>
            {trend === 'up'
              ? <HiOutlineArrowTrendingUp style={{ fontSize: '0.75rem', color: '#059669' }} />
              : <HiOutlineArrowTrendingDown style={{ fontSize: '0.75rem', color: '#dc2626' }} />
            }
            <span style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '0.75rem', fontWeight: 800, color: trend === 'up' ? '#059669' : '#dc2626' }}>
              {trendValue}
            </span>
          </div>
        )}
      </div>

      {/* Value */}
      <div style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '2rem', fontWeight: 800, color: textClr, lineHeight: 1, marginBottom: '0.375rem', letterSpacing: '-0.03em' }}>
        {displayValue.toLocaleString()}
      </div>

      {/* Label */}
      <div style={{ fontFamily: "'Satoshi',sans-serif", fontSize: '0.8125rem', fontWeight: 500, color: mutedClr }}>
        {title}
      </div>
    </motion.div>
  );
};

export default StatCard;
