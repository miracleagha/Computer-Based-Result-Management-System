import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineCog6Tooth, HiOutlineShieldCheck, HiOutlineBell, HiOutlineCircleStack } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const Toggle = ({ checked, onChange }) => (
  <label style={{ position: 'relative', display: 'inline-block', width: 52, height: 28, cursor: 'pointer' }}>
    <input type="checkbox" checked={checked} onChange={onChange} style={{ opacity: 0, width: 0, height: 0 }} />
    <span style={{
      position: 'absolute', inset: 0,
      background: checked ? '#000' : '#ccc',
      border: '2px solid #000', borderRadius: 28,
      display: 'flex', alignItems: 'center',
      transition: 'background 0.2s',
    }}>
      <span style={{
        width: 20, height: 20,
        background: checked ? '#ffe17c' : '#fff',
        border: '2px solid #000', borderRadius: '50%',
        marginLeft: checked ? 26 : 2,
        transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        boxShadow: '1px 1px 0px #000',
      }} />
    </span>
  </label>
);

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [selfRegistration, setSelfRegistration] = useState(true);
  const [require2FA, setRequire2FA] = useState(false);
  const [notifications, setNotifications] = useState([true, true, true, false]);

  const tabs = [
    { id: 'general', label: 'General', icon: HiOutlineCog6Tooth },
    { id: 'security', label: 'Security', icon: HiOutlineShieldCheck },
    { id: 'notifications', label: 'Notifications', icon: HiOutlineBell },
    { id: 'backup', label: 'Backup', icon: HiOutlineCircleStack },
  ];

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem',
    border: '2px solid #000', borderRadius: '0.5rem',
    fontFamily: "'Satoshi', sans-serif", fontSize: '0.9rem', fontWeight: 500,
    color: '#000', background: '#fff', outline: 'none',
    boxShadow: '3px 3px 0px #000',
    transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  };

  const labelStyle = {
    display: 'block', fontFamily: "'Cabinet Grotesk', sans-serif",
    fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase',
    letterSpacing: '0.05em', color: '#000', marginBottom: '0.5rem',
  };

  return (
    <div style={{ fontFamily: "'Satoshi', sans-serif" }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <div style={{ width: 8, height: 32, background: '#b7c6c2', border: '2px solid #000', borderRadius: 2 }} />
          <h1 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '1.625rem', fontWeight: 800, color: '#000', letterSpacing: '-0.03em' }}>Settings</h1>
        </div>
        <p style={{ fontFamily: "'Satoshi', sans-serif", fontSize: '0.875rem', fontWeight: 500, color: '#555', marginLeft: '1.25rem', marginBottom: '1.75rem' }}>
          Configure platform-wide settings and policies
        </p>
      </motion.div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.625rem 1.25rem',
              border: '2px solid #000', borderRadius: '0.5rem',
              background: activeTab === tab.id ? '#000' : '#fff',
              color: activeTab === tab.id ? '#ffe17c' : '#000',
              fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '0.875rem', fontWeight: 800,
              cursor: 'pointer',
              boxShadow: activeTab === tab.id ? 'none' : '3px 3px 0px #000',
              transform: activeTab === tab.id ? 'translate(3px, 3px)' : 'translate(0, 0)',
              transition: 'all 0.15s',
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
        style={{ background: '#fff', border: '2px solid #000', borderRadius: '0.75rem', padding: '2rem', boxShadow: '4px 4px 0px #000' }}
      >
        {activeTab === 'general' && (
          <div>
            <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1.75rem', color: '#000' }}>General Settings</h3>
            <div style={{ display: 'grid', gap: '1.25rem', maxWidth: 520 }}>
              {[
                { label: 'Platform Name', defaultValue: 'Student Result Management System', type: 'text' },
                { label: 'Max CA Score', defaultValue: '40', type: 'number' },
                { label: 'Max Exam Score', defaultValue: '60', type: 'number' },
              ].map((f) => (
                <div key={f.label}>
                  <label style={labelStyle}>{f.label}</label>
                  <input type={f.type} defaultValue={f.defaultValue} style={inputStyle}
                    onFocus={e => { e.currentTarget.style.boxShadow = '5px 5px 0px #000'; e.currentTarget.style.transform = 'translate(-1px,-1px)'; }}
                    onBlur={e => { e.currentTarget.style.boxShadow = '3px 3px 0px #000'; e.currentTarget.style.transform = 'translate(0,0)'; }}
                  />
                </div>
              ))}
              <div>
                <label style={labelStyle}>Default Grading Scale</label>
                <select style={{ ...inputStyle, appearance: 'none', backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23000000' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em', paddingRight: '2.5rem', cursor: 'pointer' }}>
                  <option>5-Point Scale (A=5.0, B=4.0, ...)</option>
                  <option>4-Point Scale (A=4.0, B=3.0, ...)</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#f9f9f9', border: '2px solid #000', borderRadius: '0.5rem' }}>
                <div>
                  <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: '0.9rem', color: '#000' }}>Allow Institution Self-Registration</div>
                  <div style={{ fontFamily: "'Satoshi', sans-serif", fontSize: '0.8125rem', fontWeight: 500, color: '#666' }}>Institutions can register without admin approval</div>
                </div>
                <Toggle checked={selfRegistration} onChange={e => setSelfRegistration(e.target.checked)} />
              </div>
              <button className="btn btn-primary" onClick={() => toast.success('Settings saved!')} style={{ width: 'fit-content' }}>Save Changes</button>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div>
            <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1.75rem', color: '#000' }}>Security Settings</h3>
            <div style={{ display: 'grid', gap: '1.25rem', maxWidth: 520 }}>
              {[
                { label: 'Session Timeout (minutes)', defaultValue: '60', type: 'number' },
                { label: 'Max Login Attempts', defaultValue: '5', type: 'number' },
                { label: 'Password Min Length', defaultValue: '8', type: 'number' },
              ].map((f) => (
                <div key={f.label}>
                  <label style={labelStyle}>{f.label}</label>
                  <input type={f.type} defaultValue={f.defaultValue} style={inputStyle}
                    onFocus={e => { e.currentTarget.style.boxShadow = '5px 5px 0px #000'; e.currentTarget.style.transform = 'translate(-1px,-1px)'; }}
                    onBlur={e => { e.currentTarget.style.boxShadow = '3px 3px 0px #000'; e.currentTarget.style.transform = 'translate(0,0)'; }}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#f9f9f9', border: '2px solid #000', borderRadius: '0.5rem' }}>
                <div>
                  <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: '0.9rem', color: '#000' }}>Require 2FA for Admins</div>
                  <div style={{ fontFamily: "'Satoshi', sans-serif", fontSize: '0.8125rem', fontWeight: 500, color: '#666' }}>Two-factor authentication for admin accounts</div>
                </div>
                <Toggle checked={require2FA} onChange={e => setRequire2FA(e.target.checked)} />
              </div>
              <button className="btn btn-primary" onClick={() => toast.success('Security settings saved!')} style={{ width: 'fit-content' }}>Save Changes</button>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1.75rem', color: '#000' }}>Notification Settings</h3>
            <div style={{ display: 'grid', gap: '0.75rem', maxWidth: 520 }}>
              {['Email on new institution registration', 'Email on result approval', 'Email on account creation', 'System maintenance alerts'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#f9f9f9', border: '2px solid #000', borderRadius: '0.5rem', boxShadow: '2px 2px 0px #000' }}>
                  <span style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 600, fontSize: '0.9rem', color: '#000' }}>{item}</span>
                  <Toggle checked={notifications[i]} onChange={e => { const u = [...notifications]; u[i] = e.target.checked; setNotifications(u); }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'backup' && (
          <div>
            <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1.75rem', color: '#000' }}>Backup & Recovery</h3>
            <div style={{ display: 'grid', gap: '1rem', maxWidth: 520 }}>
              <div style={{ padding: '1.25rem', background: '#ffe17c', border: '2px solid #000', borderRadius: '0.625rem', boxShadow: '3px 3px 0px #000' }}>
                <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '0.8125rem', fontWeight: 800, color: '#000', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Last Backup</div>
                <div style={{ fontFamily: "'Satoshi', sans-serif", fontSize: '0.9375rem', fontWeight: 600, color: '#000' }}>June 14, 2026 at 12:00 AM (Automatic)</div>
              </div>
              <div>
                <label style={labelStyle}>Backup Frequency</label>
                <select style={{ ...inputStyle, appearance: 'none', backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23000000' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em', paddingRight: '2.5rem', cursor: 'pointer' }}>
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => toast.success('Backup started!')}>Create Backup Now</button>
                <button className="btn btn-outline" onClick={() => toast.success('Downloading...')}>Download Last Backup</button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Settings;
