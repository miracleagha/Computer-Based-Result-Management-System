import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineShieldCheck, HiOutlineChartBar, HiOutlineDocumentText,
  HiOutlineUserGroup, HiOutlineBookOpen, HiOutlineClipboardDocumentCheck,
  HiOutlineArrowRight, HiOutlineBuildingLibrary, HiOutlineSparkles,
  HiOutlineBolt, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineStar,
  HiOutlineAcademicCap, HiOutlineBars3, HiOutlineXMark,
} from 'react-icons/hi2';

/* ── animation ── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const brands = ['UNILAG','COVENANT','OAU','LASU','FUTA','UNIBEN','ABU','UI','UNN','FUOYE','EKSU','FUTA'];

const features = [
  { icon: HiOutlineShieldCheck,          title: 'Accurate Grading',     desc: 'Auto-computed grades with institution-specific scales. Zero manual errors.' },
  { icon: HiOutlineUserGroup,            title: 'Multi-Role Access',     desc: 'Dedicated dashboards for institutions, teachers, and students.' },
  { icon: HiOutlineChartBar,             title: 'Real-Time Analytics',   desc: 'Live performance analytics and GPA tracking at a glance.' },
  { icon: HiOutlineDocumentText,         title: 'Transcript Generation', desc: 'Official transcripts and broadsheets in one click.' },
  { icon: HiOutlineClipboardDocumentCheck,title: 'Approval Workflow',   desc: 'Teachers submit — institutions approve. Full audit trail included.' },
  { icon: HiOutlineBookOpen,             title: 'Course Management',     desc: 'Departments, courses, sessions, teachers and enrollments — all organized.' },
];

const steps = [
  { num: '01', title: 'Register Your Institution', desc: 'Sign up your university or college. An admin approves your account within 24 hours.', border: '#b7c6c2' },
  { num: '02', title: 'Set Up Courses & People',   desc: 'Create departments, add courses, register teachers and students. Credentials sent automatically.', border: '#ffe17c' },
  { num: '03', title: 'Publish Results',           desc: 'Teachers enter grades, submit for approval. Students see results instantly once approved.', border: '#ffffff' },
];

const personas = [
  { role: 'Institution Admin', bg: '#b7c6c2', textColor: '#000', icon: HiOutlineBuildingLibrary, desc: 'Manage your entire academic structure — departments, courses, teachers, students, grading scales, and result approval.' },
  { role: 'Teacher',           bg: '#ffe17c', textColor: '#000', shadow: true, icon: HiOutlineBookOpen, desc: 'View assigned courses, enter student grades in a spreadsheet-style interface, and submit for institutional approval.' },
  { role: 'Student',           bg: '#272727', textColor: '#fff', icon: HiOutlineAcademicCap, desc: 'Register for courses, view semester results with GPA, access your full transcript, and track academic progress.' },
];

const testimonials = [
  { name: 'Dr. Adewale Bello',   role: 'Registrar, UNILAG',              text: 'Result management went from 3 weeks to 3 days. Our students get their results faster and with zero errors.' },
  { name: 'Prof. Grace Okafor',  role: 'HOD Computer Science, OAU',      text: 'The grade entry interface is incredibly intuitive. My staff adopted it without any training at all.' },
  { name: 'Miracle Johnson',     role: 'Student, Covenant University',   text: 'I can check my results, GPA and full transcript from my phone. This is exactly what we needed.' },
];

/* ── Push Button component ── */
const PushBtn = ({ children, onClick, variant = 'black', size = 'md', style: extraStyle = {} }) => {
  const v = {
    black:  { bg: '#000',     color: '#fff', shadow: '#000' },
    yellow: { bg: '#ffe17c',  color: '#000', shadow: '#000' },
    white:  { bg: '#fff',     color: '#000', shadow: '#000' },
    sage:   { bg: '#b7c6c2',  color: '#000', shadow: '#000' },
  }[variant] || { bg: '#000', color: '#fff', shadow: '#000' };

  const pad = size === 'lg' ? '1rem 2rem' : size === 'sm' ? '0.5rem 1rem' : '0.875rem 1.75rem';
  const fs  = size === 'lg' ? '1rem' : size === 'sm' ? '0.8125rem' : '0.9375rem';
  const sh  = size === 'lg' ? '8px 8px 0px 0px' : '4px 4px 0px 0px';

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 4, y: 4, boxShadow: `2px 2px 0px 0px ${v.shadow}` }}
      whileTap={{ x: 8, y: 8, boxShadow: `0px 0px 0px 0px ${v.shadow}` }}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        padding: pad, background: v.bg, color: v.color,
        border: '2px solid #000', borderRadius: '0.75rem',
        fontFamily: "'Satoshi', sans-serif", fontSize: fs, fontWeight: 700,
        cursor: 'pointer', whiteSpace: 'nowrap',
        boxShadow: `${sh} ${v.shadow}`,
        transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        ...extraStyle,
      }}
    >
      {children}
    </motion.button>
  );
};

/* ══════════════════════════════════════════════════════ */
const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div style={{ fontFamily: "'Satoshi', sans-serif", overflowX: 'hidden', background: '#171e19' }}>

      {/* ══════ NAV ══════ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 72,
        background: '#ffe17c', borderBottom: '2px solid #000',
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.25rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: 38, height: 38, background: '#000', border: '2px solid #000', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <HiOutlineBolt style={{ color: '#ffe17c', fontSize: '1.2rem' }} />
            </div>
            <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-0.03em', color: '#000' }}>ResultManager</span>
          </div>

          {/* Desktop center links */}
          <div className="nav-links" style={{ gap: '2rem' }}>
            {['Features','How it Works','Roles','Pricing'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`}
                style={{ fontFamily:"'Satoshi',sans-serif", fontWeight:700, fontSize:'0.9375rem', color:'#000', textDecoration:'none' }}>
                {l}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="nav-cta" style={{ gap: '0.75rem', alignItems: 'center' }}>
            <a onClick={() => navigate('/student-login')} style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#000', textDecoration: 'none', cursor: 'pointer', borderBottom: '2px solid #000', paddingBottom: '1px' }}>
              🎓 Student Login
            </a>
            <PushBtn variant="white" size="sm" onClick={() => navigate('/login')}>Sign In</PushBtn>
            <PushBtn variant="black" size="sm" onClick={() => navigate('/register')}>Start Free Trial</PushBtn>
          </div>

          {/* Mobile hamburger */}
          <button className="nav-hamburger" onClick={() => setMobileNavOpen(true)}
            style={{ background: '#000', border: '2px solid #000', borderRadius: '0.5rem', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '3px 3px 0px #000' }}>
            <HiOutlineBars3 style={{ color: '#ffe17c', fontSize: '1.375rem' }} />
          </button>
        </div>
      </nav>

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200 }}
              onClick={() => setMobileNavOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, width: 280,
                background: '#ffe17c', borderLeft: '2px solid #000', zIndex: 201,
                display: 'flex', flexDirection: 'column', padding: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: '1.125rem' }}>Menu</span>
                <button onClick={() => setMobileNavOpen(false)}
                  style={{ background: '#000', border: '2px solid #000', borderRadius: '0.5rem', padding: '0.375rem', cursor: 'pointer', display: 'flex' }}>
                  <HiOutlineXMark style={{ color: '#ffe17c', fontSize: '1.25rem' }} />
                </button>
              </div>
              {['Features','How it Works','Roles','Pricing'].map(l => (
                <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`}
                  onClick={() => setMobileNavOpen(false)}
                  style={{ display: 'block', fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: '1.125rem', color: '#000', textDecoration: 'none', padding: '0.875rem 0', borderBottom: '2px solid rgba(0,0,0,0.12)' }}>
                  {l}
                </a>
              ))}
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <PushBtn variant="sage" onClick={() => { navigate('/student-login'); setMobileNavOpen(false); }} style={{ width: '100%', justifyContent: 'center' }}>🎓 Student Login</PushBtn>
                <PushBtn variant="white" onClick={() => { navigate('/login'); setMobileNavOpen(false); }} style={{ width: '100%', justifyContent: 'center' }}>Sign In</PushBtn>
                <PushBtn variant="black" onClick={() => { navigate('/register'); setMobileNavOpen(false); }} style={{ width: '100%', justifyContent: 'center' }}>Start Free Trial</PushBtn>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══════ HERO ══════ */}
      <section style={{
        paddingTop: 100, paddingBottom: 64, background: '#ffe17c',
        borderBottom: '2px solid #000', position: 'relative', overflow: 'hidden',
        backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.25rem' }}>
          <div className="hero-grid">
            {/* Left */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <motion.div custom={0} variants={fadeUp} style={{ marginBottom: '1.25rem' }}>
                <span style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', padding:'0.375rem 1rem', background:'#fff', border:'2px solid #000', borderRadius:9999, fontFamily:"'Satoshi',sans-serif", fontSize:'0.8125rem', fontWeight:700 }}>
                  <HiOutlineSparkles /> NEW: AI Grade Assistant 2.0
                </span>
              </motion.div>

              <motion.h1 custom={1} variants={fadeUp} style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontWeight:800, fontSize:'clamp(2.25rem,5.5vw,4.25rem)', lineHeight:1.05, letterSpacing:'-0.04em', color:'#000', marginBottom:'1.25rem' }}>
                Academic Results,{' '}
                <span style={{ WebkitTextStroke:'2px #000', WebkitTextFillColor:'transparent' }}>Simplified</span>
              </motion.h1>

              <motion.p custom={2} variants={fadeUp} style={{ fontFamily:"'Satoshi',sans-serif", fontWeight:500, fontSize:'1.0625rem', color:'#1a1a1a', lineHeight:1.7, marginBottom:'1.75rem', maxWidth:460 }}>
                A comprehensive platform for managing student results with precision. Every step automated and audited.
              </motion.p>

              <motion.div custom={3} variants={fadeUp} className="cta-group" style={{ display:'flex', gap:'0.875rem', flexWrap:'wrap' }}>
                <PushBtn variant="black" size="lg" onClick={() => navigate('/register')}>
                  Register Institution <HiOutlineArrowRight />
                </PushBtn>
                <PushBtn variant="white" size="lg" onClick={() => navigate('/login')}>Sign In →</PushBtn>
                <PushBtn variant="sage" size="lg" onClick={() => navigate('/student-login')}>
                  <HiOutlineAcademicCap /> Student Login
                </PushBtn>
              </motion.div>

              <motion.div custom={4} variants={fadeUp} className="stats-row" style={{ display:'flex', gap:'2rem', marginTop:'2rem', flexWrap:'wrap' }}>
                {[{val:'99.9%',lbl:'Grade Accuracy'},{val:'10x',lbl:'Faster Processing'},{val:'100%',lbl:'Data Security'}].map(s => (
                  <div key={s.lbl}>
                    <div style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontSize:'1.875rem', fontWeight:800, color:'#000' }}>{s.val}</div>
                    <div style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'0.8125rem', fontWeight:500, color:'#444' }}>{s.lbl}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — Browser Mockup */}
            <motion.div className="hero-mockup"
              initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.3, duration:0.6 }}
              style={{ background:'#fff', border:'2px solid #000', borderRadius:'1rem', boxShadow:'12px 12px 0px #000', overflow:'hidden' }}
            >
              <div style={{ background:'#000', padding:'0.75rem 1rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <div style={{ width:12, height:12, borderRadius:'50%', background:'#ff5f57' }} />
                <div style={{ width:12, height:12, borderRadius:'50%', background:'#febc2e' }} />
                <div style={{ width:12, height:12, borderRadius:'50%', background:'#28c840' }} />
                <div style={{ flex:1, background:'#1a1a1a', borderRadius:4, height:24, marginLeft:8, display:'flex', alignItems:'center', paddingLeft:8 }}>
                  <span style={{ color:'#9ca3af', fontSize:'0.75rem', fontFamily:'monospace' }}>resultmanager.app/dashboard</span>
                </div>
              </div>
              <div style={{ padding:'1.25rem', background:'#f9f9f9' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.625rem', marginBottom:'0.625rem' }}>
                  {[{lbl:'Total Students',val:'3,842',bg:'#ffe17c'},{lbl:'Active Teachers',val:'284',bg:'#b7c6c2'},{lbl:'Results Processed',val:'12,490',bg:'#fff'},{lbl:'Avg GPA',val:'3.45',bg:'#171e19',color:'#fff'}].map(c => (
                    <div key={c.lbl} style={{ background:c.bg, border:'2px solid #000', borderRadius:'0.5rem', padding:'0.625rem', boxShadow:'3px 3px 0px #000' }}>
                      <div style={{ fontSize:'0.5625rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:c.color||'#555', fontFamily:"'Cabinet Grotesk',sans-serif" }}>{c.lbl}</div>
                      <div style={{ fontSize:'1.25rem', fontWeight:800, color:c.color||'#000', fontFamily:"'Cabinet Grotesk',sans-serif", marginTop:2 }}>{c.val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background:'#fff', border:'2px solid #000', borderRadius:'0.5rem', padding:'0.75rem', boxShadow:'3px 3px 0px #000' }}>
                  <div style={{ fontSize:'0.625rem', fontWeight:800, color:'#000', marginBottom:'0.5rem', fontFamily:"'Cabinet Grotesk',sans-serif", textTransform:'uppercase', letterSpacing:'0.05em' }}>Registrations by Month</div>
                  <div style={{ display:'flex', alignItems:'flex-end', gap:'0.25rem', height:52 }}>
                    {[40,65,80,55,90,72,95,60,85,70,88,100].map((h,i) => (
                      <div key={i} style={{ flex:1, background:i%3===0?'#ffe17c':i%3===1?'#b7c6c2':'#171e19', border:'1px solid #000', borderRadius:'2px 2px 0 0', height:`${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════ MARQUEE ══════ */}
      <div style={{ background:'#171e19', borderBottom:'2px solid #000', padding:'1.125rem 0', overflow:'hidden' }}>
        <motion.div
          animate={{ x: [0, -2400] }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          style={{ display:'flex', gap:'3rem', alignItems:'center', whiteSpace:'nowrap', width:'max-content' }}
        >
          {[...brands,...brands,...brands,...brands].map((b,i) => (
            <span key={i} style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontWeight:800, fontSize:'1rem', color:'#b7c6c2', opacity:0.5, letterSpacing:'0.1em' }}>{b}</span>
          ))}
        </motion.div>
      </div>

      {/* ══════ PROBLEM vs SOLUTION ══════ */}
      <section id="features" style={{ background:'#fff', padding:'72px 0', borderBottom:'2px solid #000' }} className="section-pad">
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 1.25rem' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once:true }} variants={fadeUp} style={{ textAlign:'center', marginBottom:'2.5rem' }}>
            <h2 style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontSize:'clamp(1.625rem,3.5vw,2.375rem)', fontWeight:800, letterSpacing:'-0.03em', color:'#000' }}>
              The Old Way vs. The Right Way
            </h2>
          </motion.div>
          <div className="grid-2">
            {/* Problem */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once:true }} custom={0} variants={fadeUp}
              style={{ background:'#f4f4f5', border:'2px dashed #9ca3af', borderRadius:'1.25rem', padding:'1.75rem', opacity:0.8 }}>
              <div style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontWeight:800, fontSize:'1.125rem', marginBottom:'1.25rem', color:'#555' }}>😩 Without ResultManager</div>
              {['Manual spreadsheet errors cause grade disputes','Weeks of delays before results are published','No audit trail for grade changes','Students chase staff for transcripts','Lost result sheets and missing records'].map((item,i) => (
                <div key={i} style={{ display:'flex', gap:'0.625rem', alignItems:'flex-start', marginBottom:'0.625rem' }}>
                  <HiOutlineXCircle style={{ color:'#dc2626', flexShrink:0, marginTop:2, fontSize:'1.125rem' }} />
                  <span style={{ fontFamily:"'Satoshi',sans-serif", fontWeight:500, color:'#555', fontSize:'0.9375rem' }}>{item}</span>
                </div>
              ))}
            </motion.div>
            {/* Solution */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once:true }} custom={1} variants={fadeUp}
              style={{ background:'#ffe17c', border:'2px solid #000', borderRadius:'1.25rem', padding:'1.75rem', boxShadow:'8px 8px 0px #000' }}>
              <div style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontWeight:800, fontSize:'1.125rem', marginBottom:'1.25rem', color:'#000' }}>✅ With ResultManager</div>
              {['Auto-computed grades with zero manual errors','Results published same day as approval','Complete audit trail for every grade change','Students access transcripts instantly online','All records encrypted and backed up in the cloud'].map((item,i) => (
                <div key={i} style={{ display:'flex', gap:'0.625rem', alignItems:'flex-start', marginBottom:'0.625rem' }}>
                  <HiOutlineCheckCircle style={{ color:'#059669', flexShrink:0, marginTop:2, fontSize:'1.125rem' }} />
                  <span style={{ fontFamily:"'Satoshi',sans-serif", fontWeight:500, color:'#000', fontSize:'0.9375rem' }}>{item}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════ FEATURES GRID ══════ */}
      <section style={{
        background:'#ffe17c', borderBottom:'2px solid #000', borderTop:'2px solid #000', padding:'72px 0',
        backgroundImage:'radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)',
        backgroundSize:'32px 32px',
      }} className="section-pad">
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 1.25rem' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once:true }} variants={fadeUp} style={{ textAlign:'center', marginBottom:'2.5rem' }}>
            <h2 style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontSize:'clamp(1.625rem,3.5vw,2.375rem)', fontWeight:800, letterSpacing:'-0.03em', color:'#000', marginBottom:'0.75rem' }}>
              Everything You Need to Manage Results
            </h2>
            <p style={{ fontFamily:"'Satoshi',sans-serif", fontWeight:500, color:'#333', maxWidth:520, margin:'0 auto', lineHeight:1.6 }}>
              Built for educational institutions of all sizes.
            </p>
          </motion.div>
          <div className="grid-3">
            {features.map((f,i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once:true }} custom={i} variants={fadeUp}
                style={{ background:'#fff', border:'2px solid #000', borderRadius:'0.75rem', padding:'1.625rem', boxShadow:'4px 4px 0px #000', transition:'all 0.2s cubic-bezier(0.175,0.885,0.32,1.275)', cursor:'default' }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translate(2px,2px)';e.currentTarget.style.boxShadow='2px 2px 0px #000';}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translate(0,0)';e.currentTarget.style.boxShadow='4px 4px 0px #000';}}
              >
                <div style={{ width:48, height:48, background:'#b7c6c2', border:'2px solid #000', borderRadius:'0.5rem', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1rem', transition:'background 0.2s' }}
                  onMouseEnter={e=>{e.currentTarget.style.background='#ffe17c';}}
                  onMouseLeave={e=>{e.currentTarget.style.background='#b7c6c2';}}
                >
                  <f.icon style={{ fontSize:'1.375rem', color:'#000' }} />
                </div>
                <h3 style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontSize:'1.0625rem', fontWeight:800, color:'#000', marginBottom:'0.5rem', letterSpacing:'-0.02em' }}>{f.title}</h3>
                <p style={{ fontFamily:"'Satoshi',sans-serif", fontWeight:500, color:'#444', fontSize:'0.9375rem', lineHeight:1.6, margin:0 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ HOW IT WORKS ══════ */}
      <section id="how-it-works" style={{ background:'#171e19', padding:'72px 0', borderBottom:'2px solid #000' }} className="section-pad">
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 1.25rem' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once:true }} variants={fadeUp} style={{ textAlign:'center', marginBottom:'3rem' }}>
            <h2 style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontSize:'clamp(1.625rem,3.5vw,2.375rem)', fontWeight:800, letterSpacing:'-0.03em', color:'#fff', marginBottom:'0.75rem' }}>
              Get Started in 3 Simple Steps
            </h2>
            <p style={{ fontFamily:"'Satoshi',sans-serif", fontWeight:500, color:'#b7c6c2', maxWidth:440, margin:'0 auto' }}>
              From registration to result publication in minutes, not weeks.
            </p>
          </motion.div>
          <div className="steps-grid">
            {/* Horizontal connector — desktop only */}
            <div className="steps-connector" style={{ position:'absolute', top:44, left:'16.5%', right:'16.5%', height:2, background:'#272727', zIndex:0 }} />
            {steps.map((step,i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once:true }} custom={i} variants={fadeUp}
                style={{ textAlign:'center', padding:'2rem 1.5rem', background:'#1e2820', border:'2px solid #444', borderRadius:'1rem', position:'relative', zIndex:1 }}>
                <div style={{ width:68, height:68, borderRadius:'50%', margin:'0 auto 1.25rem', background:'#171e19', border:`4px solid ${step.border}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontSize:'1.125rem', fontWeight:800, color:step.border }}>{step.num}</span>
                </div>
                <h3 style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontSize:'1.0625rem', fontWeight:800, color:'#fff', marginBottom:'0.625rem', letterSpacing:'-0.02em' }}>{step.title}</h3>
                <p style={{ fontFamily:"'Satoshi',sans-serif", fontWeight:500, color:'#b7c6c2', fontSize:'0.9375rem', lineHeight:1.65, margin:0 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ PERSONAS ══════ */}
      <section id="roles" style={{ background:'#fff', padding:'72px 0', borderBottom:'2px solid #000' }} className="section-pad">
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 1.25rem' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once:true }} variants={fadeUp} style={{ textAlign:'center', marginBottom:'2.5rem' }}>
            <h2 style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontSize:'clamp(1.625rem,3.5vw,2.375rem)', fontWeight:800, letterSpacing:'-0.03em', color:'#000', marginBottom:'0.75rem' }}>
              Built for Every Role
            </h2>
            <p style={{ fontFamily:"'Satoshi',sans-serif", fontWeight:500, color:'#555', maxWidth:440, margin:'0 auto' }}>
              Each user sees exactly what they need. Powered by role-based access control.
            </p>
          </motion.div>
          <div className="grid-3">
            {personas.map((p,i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once:true }} custom={i} variants={fadeUp}
                style={{ background:p.bg, border:'2px solid #000', borderRadius:'1rem', padding:'1.75rem', boxShadow:p.shadow?'8px 8px 0px #000':'4px 4px 0px #000', transition:'all 0.2s cubic-bezier(0.175,0.885,0.32,1.275)' }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translate(2px,2px)';e.currentTarget.style.boxShadow=p.shadow?'4px 4px 0px #000':'2px 2px 0px #000';}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translate(0,0)';e.currentTarget.style.boxShadow=p.shadow?'8px 8px 0px #000':'4px 4px 0px #000';}}
              >
                <div style={{ display:'inline-flex', padding:'0.25rem 0.75rem', background:'#fff', border:'2px solid #000', borderRadius:9999, marginBottom:'1rem' }}>
                  <span style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'0.75rem', fontWeight:700, color:'#000' }}>{p.role}</span>
                </div>
                <div style={{ width:48, height:48, background:p.textColor==='#fff'?'#272727':'#fff', border:'2px solid #000', borderRadius:'0.5rem', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'0.875rem' }}>
                  <p.icon style={{ fontSize:'1.375rem', color:p.textColor==='#fff'?'#ffe17c':'#000' }} />
                </div>
                <p style={{ fontFamily:"'Satoshi',sans-serif", fontWeight:500, color:p.textColor, fontSize:'0.9375rem', lineHeight:1.65, margin:0 }}>{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ TESTIMONIALS ══════ */}
      <section style={{ background:'#b7c6c2', padding:'72px 0', borderBottom:'2px solid #000' }} className="section-pad">
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 1.25rem' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once:true }} variants={fadeUp} style={{ textAlign:'center', marginBottom:'2.5rem' }}>
            <h2 style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontSize:'clamp(1.625rem,3.5vw,2.375rem)', fontWeight:800, letterSpacing:'-0.03em', color:'#000' }}>
              Trusted Across Institutions
            </h2>
          </motion.div>
          <div className="grid-3">
            {testimonials.map((t,i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once:true }} custom={i} variants={fadeUp}
                style={{ background:'#fff', border:'2px solid #000', borderRadius:'4px 24px 4px 24px', padding:'1.75rem', boxShadow:'4px 4px 0px #000', transition:'all 0.2s' }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translate(2px,2px)';e.currentTarget.style.boxShadow='2px 2px 0px #000';}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translate(0,0)';e.currentTarget.style.boxShadow='4px 4px 0px #000';}}
              >
                <div style={{ display:'flex', gap:'0.25rem', marginBottom:'0.875rem' }}>
                  {[...Array(5)].map((_,s) => (
                    <HiOutlineStar key={s} style={{ color:'#ffbc2e', fontSize:'1rem', fill:'#ffbc2e' }} />
                  ))}
                </div>
                <p style={{ fontFamily:"'Satoshi',sans-serif", fontWeight:500, color:'#1a1a1a', fontSize:'0.9375rem', lineHeight:1.65, marginBottom:'1.125rem' }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontWeight:800, color:'#000', fontSize:'0.9375rem' }}>{t.name}</div>
                <div style={{ fontFamily:"'Satoshi',sans-serif", fontWeight:500, color:'#555', fontSize:'0.8125rem' }}>{t.role}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ FINAL CTA ══════ */}
      <section style={{
        background:'#ffe17c', padding:'88px 0', borderBottom:'2px solid #000',
        backgroundImage:'radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)',
        backgroundSize:'32px 32px',
      }} className="section-pad">
        <div style={{ maxWidth:760, margin:'0 auto', padding:'0 1.25rem', textAlign:'center' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once:true }} variants={fadeUp}>
            <h2 style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontSize:'clamp(1.875rem,4.5vw,3.25rem)', fontWeight:800, letterSpacing:'-0.04em', color:'#000', marginBottom:'1rem', lineHeight:1.1 }}>
              Ready to Transform Your<br />Result Management?
            </h2>
            <p style={{ fontFamily:"'Satoshi',sans-serif", fontWeight:500, fontSize:'1.0625rem', color:'#333', marginBottom:'2rem', lineHeight:1.6 }}>
              Join institutions already using ResultManager for efficient, accurate, and transparent academic result processing.
            </p>
            <div className="cta-group" style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
              <PushBtn variant="black" size="lg" onClick={() => navigate('/register')}>
                Get Started Free <HiOutlineArrowRight />
              </PushBtn>
              <PushBtn variant="white" size="lg" onClick={() => navigate('/login')}>Sign In to Dashboard</PushBtn>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════ FOOTER ══════ */}
      <footer style={{ background:'#171e19', padding:'3.5rem 1.25rem 2rem' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div className="footer-grid" style={{ marginBottom:'2.5rem' }}>
            {/* Brand */}
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', marginBottom:'0.875rem' }}>
                <div style={{ width:36, height:36, background:'#000', border:'2px solid #ffe17c', borderRadius:'0.5rem', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <HiOutlineBolt style={{ color:'#ffe17c', fontSize:'1.125rem' }} />
                </div>
                <span style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontWeight:800, fontSize:'1rem', color:'#fff' }}>ResultManager</span>
              </div>
              <p style={{ fontFamily:"'Satoshi',sans-serif", fontWeight:500, color:'#b7c6c2', fontSize:'0.875rem', lineHeight:1.65, maxWidth:240 }}>
                Comprehensive academic result management for universities and colleges across Africa.
              </p>
              <div style={{ display:'flex', gap:'0.5rem', marginTop:'1rem' }}>
                {['X','LI','FB','IG'].map(s => (
                  <div key={s} style={{ width:34, height:34, background:'#272727', border:'1px solid #444', borderRadius:'0.375rem', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all 0.15s' }}
                    onMouseEnter={e=>{e.currentTarget.style.background='#ffe17c';e.currentTarget.style.border='1px solid #000';}}
                    onMouseLeave={e=>{e.currentTarget.style.background='#272727';e.currentTarget.style.border='1px solid #444';}}>
                    <span style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontSize:'0.625rem', fontWeight:800, color:'#fff' }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Link columns */}
            {[
              { head:'Product', links:['Features','Pricing','Changelog','Roadmap'] },
              { head:'Company', links:['About','Blog','Careers','Press'] },
              { head:'Support', links:['Documentation','Help Center','Contact','Status'] },
            ].map(col => (
              <div key={col.head}>
                <div style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontWeight:800, fontSize:'0.8125rem', color:'#fff', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.875rem' }}>{col.head}</div>
                {col.links.map(l => (
                  <a key={l} href="#" style={{ display:'block', fontFamily:"'Satoshi',sans-serif", fontWeight:500, color:'#b7c6c2', fontSize:'0.875rem', marginBottom:'0.5rem', textDecoration:'none', transition:'color 0.15s' }}
                    onMouseEnter={e=>e.currentTarget.style.color='#ffe17c'}
                    onMouseLeave={e=>e.currentTarget.style.color='#b7c6c2'}
                  >{l}</a>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop:'1px solid #272727', paddingTop:'1.25rem', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'0.75rem' }}>
            <p style={{ fontFamily:"'Satoshi',sans-serif", fontWeight:500, color:'#475569', fontSize:'0.8125rem' }}>
              © {new Date().getFullYear()} Student Result Management System. All rights reserved.
            </p>
            <div style={{ display:'flex', gap:'1.25rem' }}>
              {['Privacy','Terms','Cookies'].map(l => (
                <a key={l} href="#" style={{ fontFamily:"'Satoshi',sans-serif", color:'#475569', fontSize:'0.8125rem', textDecoration:'none' }}>{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
