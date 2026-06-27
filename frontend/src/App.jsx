import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import DashboardLayout from './components/layout/DashboardLayout';

// Public pages
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import RegisterInstitution from './pages/auth/RegisterInstitution';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import StudentLogin from './pages/auth/StudentLogin';
import NotFound from './pages/NotFound';

// Role-specific dashboards
import InstitutionDashboard from './pages/institution/Dashboard';
import TeacherDashboard from './pages/teacher/Dashboard';
import StudentDashboard from './pages/student/Dashboard';

// Institution pages
import Students from './pages/institution/Students';
import StudentDetail from './pages/institution/StudentDetail';
import Teachers from './pages/institution/Teachers';
import Departments from './pages/institution/Departments';
import Courses from './pages/institution/Courses';
import Sessions from './pages/institution/Sessions';
import GradingScales from './pages/institution/GradingScales';
import ResultApproval from './pages/institution/ResultApproval';
import Broadsheet from './pages/institution/Broadsheet';
import Transcripts from './pages/institution/Transcripts';
import InstitutionNotifications from './pages/institution/Notifications';

// Teacher pages
import MyCourses from './pages/teacher/MyCourses';
import ResultEntry from './pages/teacher/ResultEntry';
import GradeBook from './pages/teacher/GradeBook';
import Analytics from './pages/teacher/Analytics';
import TeacherProfile from './pages/teacher/Profile';

// Student pages
import Results from './pages/student/Results';
import Transcript from './pages/student/Transcript';
import CourseRegistration from './pages/student/CourseRegistration';
import StudentNotifications from './pages/student/Notifications';
import StudentProfile from './pages/student/Profile';

// Shared pages
import Profile from './pages/shared/Profile';

import './index.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 5 * 60 * 1000 } }
});

// Role-based dashboard router
const RoleDashboard = () => {
  const { user } = useAuth();
  switch (user?.role) {
    case 'institution': return <InstitutionDashboard />;
    case 'teacher': return <TeacherDashboard />;
    case 'student': return <StudentDashboard />;
    default: return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<RegisterInstitution />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/student-login" element={<StudentLogin />} />
              
              {/* Protected dashboard routes */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<RoleDashboard />} />
                
                {/* Institution routes */}
                <Route path="students" element={<Students />} />
                <Route path="students/:id" element={<StudentDetail />} />
                <Route path="teachers" element={<Teachers />} />
                <Route path="departments" element={<Departments />} />
                <Route path="courses" element={<Courses />} />
                <Route path="sessions" element={<Sessions />} />
                <Route path="grading-scales" element={<GradingScales />} />
                <Route path="result-approval" element={<ResultApproval />} />
                <Route path="broadsheet" element={<Broadsheet />} />
                <Route path="transcripts" element={<Transcripts />} />
                
                {/* Teacher routes */}
                <Route path="my-courses" element={<MyCourses />} />
                <Route path="result-entry" element={<ResultEntry />} />
                <Route path="grade-book" element={<GradeBook />} />
                <Route path="analytics" element={<Analytics />} />
                
                {/* Student routes */}
                <Route path="results" element={<Results />} />
                <Route path="transcript" element={<Transcript />} />
                <Route path="course-registration" element={<CourseRegistration />} />
                
                {/* Common routes */}
                <Route path="notifications" element={<NotificationsRouter />} />
                <Route path="profile" element={<ProfileRouter />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Toaster position="top-right" toastOptions={{
            duration: 3000,
            style: {
              background: '#fff', color: '#000',
              border: '2px solid #000', borderRadius: '0.625rem',
              fontFamily: "'Satoshi', sans-serif", fontWeight: 700,
              fontSize: '0.875rem', boxShadow: '4px 4px 0px #000',
            },
            success: { iconTheme: { primary: '#000', secondary: '#ffe17c' } },
            error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
          }} />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

// Role-based routing for shared pages
const NotificationsRouter = () => {
  const { user } = useAuth();
  if (user?.role === 'institution') return <InstitutionNotifications />;
  if (user?.role === 'student') return <StudentNotifications />;
  return <InstitutionNotifications />;
};

const ProfileRouter = () => {
  const { user } = useAuth();
  if (user?.role === 'teacher') return <TeacherProfile />;
  if (user?.role === 'student') return <StudentProfile />;
  return <Profile />;
};

export default App;
