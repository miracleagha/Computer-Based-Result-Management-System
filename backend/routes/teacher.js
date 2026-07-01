import express from 'express';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleAuth.js';
import {
  getDashboard,
  getMyCourses,
  getCourseStudents,
  enterResults,
  updateResult,
  submitResults,
  getCourseResults,
  getCourseAnalytics,
  updateProfile,
  bulkUploadResults,
  getSessions,
  getSemesters
} from '../controllers/teacherController.js';

const router = express.Router();

router.use(protect, authorize('teacher'));

router.get('/dashboard', getDashboard);
router.get('/courses', getMyCourses);
router.get('/courses/:courseId/students', getCourseStudents);
router.post('/results', enterResults);
router.put('/results/:id', updateResult);
router.post('/results/submit/:courseId', submitResults);
router.get('/results/:courseId', getCourseResults);
router.get('/analytics/:courseId', getCourseAnalytics);
router.put('/profile', updateProfile);
router.post('/results/bulk', bulkUploadResults);
router.get('/sessions', getSessions);
router.get('/semesters', getSemesters);

export default router;
