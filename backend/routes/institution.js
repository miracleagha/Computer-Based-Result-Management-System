import express from 'express';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleAuth.js';
import {
  registerInstitution,
  getDashboard,
  createStudent, getStudents, updateStudent, deleteStudent, getStudent, getStudentResults,
  createTeacher, getTeachers, updateTeacher, deleteTeacher,
  createDepartment, getDepartments, updateDepartment, deleteDepartment,
  createCourse, getCourses, updateCourse, deleteCourse,
  createSession, getSessions, updateSession, deleteSession, activateSession, addSemesterToSession,
  createSemester, getSemesters, updateSemester, deleteSemester, activateSemester,
  getGradingScales, updateGradingScale, updateMyGradingScale,
  getResults, getPendingResults, approveResult, rejectResult, bulkApproveResults, bulkRejectResults,
  bulkUploadStudents, bulkUploadTeachers,
  getStudentTranscript, getBroadsheet
} from '../controllers/institutionController.js';

const router = express.Router();

// Public route for institution registration
router.post('/register', registerInstitution);

// Protected routes (institution role)
router.use(protect, authorize('institution'));

router.get('/dashboard', getDashboard);

// Students
router.route('/students').get(getStudents).post(createStudent);
router.route('/students/:id').get(getStudent).put(updateStudent).delete(deleteStudent);
router.get('/students/:id/results', getStudentResults);

// Teachers
router.route('/teachers').get(getTeachers).post(createTeacher);
router.route('/teachers/:id').put(updateTeacher).delete(deleteTeacher);

// Departments
router.route('/departments').get(getDepartments).post(createDepartment);
router.route('/departments/:id').put(updateDepartment).delete(deleteDepartment);

// Courses
router.route('/courses').get(getCourses).post(createCourse);
router.route('/courses/:id').put(updateCourse).delete(deleteCourse);

// Sessions
router.route('/sessions').get(getSessions).post(createSession);
router.route('/sessions/:id').put(updateSession).delete(deleteSession);
router.put('/sessions/:id/activate', activateSession);
router.post('/sessions/:sessionId/semesters', addSemesterToSession);

// Semesters
router.route('/semesters').get(getSemesters).post(createSemester);
router.route('/semesters/:id').put(updateSemester).delete(deleteSemester);
router.put('/semesters/:id/activate', activateSemester);

// Grading Scales
router.get('/grading-scales', getGradingScales);
router.put('/grading-scales/my', updateMyGradingScale);
router.put('/grading-scales/:id', updateGradingScale);

// Result Approval
router.get('/results', getResults);                     // ?status=submitted returns batches grouped by course+semester
router.get('/results/pending', getPendingResults);      // alias for legacy
router.put('/results/:id/approve', approveResult);
router.put('/results/:id/reject', rejectResult);
router.post('/results/bulk-approve', bulkApproveResults);
router.post('/results/bulk-reject', bulkRejectResults);

// Bulk Upload
router.post('/students/bulk', bulkUploadStudents);
router.post('/teachers/bulk', bulkUploadTeachers);

// Transcript & Broadsheet
router.get('/transcript/:studentId', getStudentTranscript);
router.get('/broadsheet/:courseId/:semesterId', getBroadsheet);

export default router;
