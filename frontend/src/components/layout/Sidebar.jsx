import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  HiOutlineHome, HiOutlineUserGroup, HiOutlineBookOpen,
  HiOutlineAcademicCap, HiOutlineCalendarDays, HiOutlineClipboardDocumentCheck,
  HiOutlineChartBar, HiOutlineChevronLeft, HiOutlineDocumentText, HiOutlineBell,
  HiOutlineTableCells, HiOutlineRectangleGroup, HiOutlineClipboardDocumentList,
  HiOutlineUser, HiOutlineBolt,
} from 'react-icons/hi2';

const roleNavItems = {
  institution: [
    { path: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
    { path: '/dashboard/students', icon: HiOutlineAcademicCap, label: 'Students' },
    { path: '/dashboard/teachers', icon: HiOutlineUserGroup, label: 'Teachers' },
    { path: '/dashboard/departments', icon: HiOutlineRectangleGroup, label: 'Departments' },
    { path: '/dashboard/courses', icon: HiOutlineBookOpen, label: 'Courses' },
    { path: '/dashboard/sessions', icon: HiOutlineCalendarDays, label: 'Sessions' },
    { path: '/dashboard/grading-scales', icon: HiOutlineTableCells, label: 'Grading Scales' },
    { path: '/dashboard/result-approval', icon: HiOutlineClipboardDocumentCheck, label: 'Result Approval' },
    { path: '/dashboard/broadsheet', icon: HiOutlineTableCells, label: 'Broadsheet' },
    { path: '/dashboard/transcripts', icon: HiOutlineDocumentText, label: 'Transcripts' },
    { path: '/dashboard/notifications', icon: HiOutlineBell, label: 'Notifications' },
  ],
  teacher: [
    { path: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
    { path: '/dashboard/my-courses', icon: HiOutlineBookOpen, label: 'My Courses' },
    { path: '/dashboard/result-entry', icon: HiOutlineClipboardDocumentList, label: 'Result Entry' },
    { path: '/dashboard/grade-book', icon: HiOutlineTableCells, label: 'Grade Book' },
    { path: '/dashboard/analytics', icon: HiOutlineChartBar, label: 'Analytics' },
    { path: '/dashboard/profile', icon: HiOutlineUser, label: 'Profile' },
  ],
  student: [
    { path: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
    { path: '/dashboard/results', icon: HiOutlineDocumentText, label: 'My Results' },
    { path: '/dashboard/transcript', icon: HiOutlineClipboardDocumentList, label: 'Transcript' },
    { path: '/dashboard/course-registration', icon: HiOutlineBookOpen, label: 'Course Registration' },
    { path: '/dashboard/notifications', icon: HiOutlineBell, label: 'Notifications' },
    { path: '/dashboard/profile', icon: HiOutlineUser, label: 'Profile' },
  ],
};

const roleLabels = { institution: 'Institution Panel', teacher: 'Teacher Portal', student: 'Student Portal' };

const Sidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const { user } = useAuth();
  const navItems = roleNavItems[user?.role] || [];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'fixed', left: 0, top: 0, bottom: 0,
        background: '#111611', borderRight: '2px solid #000',
        zIndex: 50, display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{
        padding: collapsed ? '1.25rem 0.75rem' : '1.25rem 1.25rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        borderBottom: '2px solid #000', minHeight: 72, background: '#171e19',
      }}>
        <div style={{
          width: 36, height: 36, flexShrink: 0,
          background: '#ffe17c', border: '2px solid #000', borderRadius: '0.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '2px 2px 0px #000',
        }}>
          <HiOutlineBolt style={{ color: '#000', fontSize: '1.1rem' }} />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
            >
              <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: '0.9375rem', color: '#fff', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                Result Manager
              </div>
              <div style={{ fontFamily: "'Satoshi', sans-serif", fontSize: '0.6875rem', color: '#b7c6c2', fontWeight: 500 }}>
                {roleLabels[user?.role]}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

          return (
            <NavLink
              key={item.path} to={item.path}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: collapsed ? '0.75rem' : '0.625rem 0.875rem',
                borderRadius: '0.5rem', textDecoration: 'none',
                color: isActive ? '#000' : '#b7c6c2',
                background: isActive ? '#ffe17c' : 'transparent',
                border: isActive ? '2px solid #000' : '2px solid transparent',
                boxShadow: isActive ? '3px 3px 0px #000' : 'none',
                transition: 'all 0.15s',
                justifyContent: collapsed ? 'center' : 'flex-start',
                fontFamily: "'Satoshi', sans-serif", fontSize: '0.875rem', fontWeight: isActive ? 700 : 500,
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(183,198,194,0.1)';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.border = '2px solid rgba(183,198,194,0.3)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#b7c6c2';
                  e.currentTarget.style.border = '2px solid transparent';
                }
              }}
            >
              <item.icon style={{ fontSize: '1.125rem', flexShrink: 0 }} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse button */}
      <div style={{ padding: '0.75rem', borderTop: '2px solid #000' }}>
        <button onClick={() => setCollapsed(!collapsed)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start', gap: '0.75rem',
            padding: '0.625rem 0.75rem', borderRadius: '0.5rem',
            background: 'transparent', border: '2px solid transparent',
            color: '#b7c6c2', cursor: 'pointer',
            fontFamily: "'Satoshi', sans-serif", fontSize: '0.8125rem', fontWeight: 500,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,225,124,0.1)'; e.currentTarget.style.color = '#ffe17c'; e.currentTarget.style.border = '2px solid rgba(255,225,124,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#b7c6c2'; e.currentTarget.style.border = '2px solid transparent'; }}
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <HiOutlineChevronLeft style={{ fontSize: '1.125rem' }} />
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Collapse</motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
