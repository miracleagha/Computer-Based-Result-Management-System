import { useState } from 'react';
import { HiOutlineMagnifyingGlass, HiOutlineXMark } from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';

const SearchBar = ({
  placeholder = 'Search…',
  value = '',
  onChange,
  onSearch,
  filters = [],
  activeFilter = '',
  onFilterChange,
  rightContent,
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>

      {/* Search input */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        background: '#fff',
        border: `2px solid ${focused ? '#000' : '#ccc'}`,
        borderRadius: '0.5rem',
        padding: '0.5rem 0.875rem',
        boxShadow: focused ? '4px 4px 0px #000' : '2px 2px 0px #ccc',
        transition: 'all 0.2s cubic-bezier(0.175,0.885,0.32,1.275)',
        transform: focused ? 'translate(-1px,-1px)' : 'translate(0,0)',
        flex: 1, minWidth: 180, maxWidth: 320,
      }}>
        <HiOutlineMagnifyingGlass style={{ color: '#000', flexShrink: 0, fontSize: '1.0625rem' }} />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch?.()}
          style={{
            border: 'none', outline: 'none', background: 'transparent',
            fontFamily: "'Satoshi',sans-serif", fontSize: '0.875rem', fontWeight: 500,
            color: '#000', width: '100%',
          }}
        />
        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => { onChange?.(''); onSearch?.(); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', display: 'flex', padding: 0 }}
            >
              <HiOutlineXMark size={15} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Filter pills */}
      {filters.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
          {filters.map((filter) => {
            const isActive = activeFilter === filter.value;
            return (
              <button
                key={filter.value}
                onClick={() => onFilterChange?.(isActive ? '' : filter.value)}
                style={{
                  padding: '0.3rem 0.875rem',
                  border: '2px solid #000',
                  borderRadius: '0.5rem',
                  fontFamily: "'Cabinet Grotesk',sans-serif",
                  fontSize: '0.75rem', fontWeight: 800,
                  cursor: 'pointer',
                  background: isActive ? '#000' : '#fff',
                  color: isActive ? '#ffe17c' : '#000',
                  boxShadow: isActive ? 'none' : '2px 2px 0px #000',
                  transform: isActive ? 'translate(2px,2px)' : 'translate(0,0)',
                  transition: 'all 0.15s',
                }}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      )}

      {rightContent && <div style={{ marginLeft: 'auto' }}>{rightContent}</div>}
    </div>
  );
};

export default SearchBar;
